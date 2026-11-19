const path = require("node:path");
const { ChromaSubsampling, ResizeFit, Transformer } = require("@napi-rs/image");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MinimizerPlugin = require("minimizer-webpack-plugin");
const webpack = require("webpack");

const BOARD_BG_RESIZE = { width: 1920, fit: ResizeFit.Inside };

const toPublicPath = (value) => (value.endsWith("/") ? value : `${value}/`);

const replaceExtension = (name, extension) => {
  const suffix = /[?#]/.exec(name);
  const bare = suffix ? name.slice(0, suffix.index) : name;
  const rest = suffix ? name.slice(suffix.index) : "";
  const dot = bare.lastIndexOf(".");

  return `${dot > bare.lastIndexOf("/") ? bare.slice(0, dot) : bare}.${extension}${rest}`;
};

const napiRsImageGenerate = async (input, _sourceMap, options = {}) => {
  const [[name, code]] = Object.entries(input);
  const encodeOptions = options.encodeOptions ?? {};
  const formats = Object.keys(encodeOptions);
  const asMatch = /[?&]as=([^&]+)/.exec(name);
  const format =
    asMatch?.[1] ?? (formats.length === 1 ? formats[0] : undefined);

  if (format !== "avif" && format !== "webp") {
    return {
      code,
      errors: [
        new Error(
          `napiRsImageGenerate: unsupported format '${format ?? ""}' for '${name}'`,
        ),
      ],
    };
  }

  const bytes = Buffer.isBuffer(code) ? code : Buffer.from(code);
  const transformer = new Transformer(bytes);
  const resize = options.resize;

  if (resize && typeof resize.width === "number") {
    transformer.resize(resize);
  }

  const formatOptions = encodeOptions[format] ?? {};

  try {
    const encoded =
      format === "avif"
        ? await transformer.avif(formatOptions)
        : await transformer.webp(formatOptions.quality);

    return {
      code: encoded,
      filename: replaceExtension(name, format),
    };
  } catch (error) {
    return {
      code,
      errors: [error],
    };
  }
};

napiRsImageGenerate.supportsBinary = () => true;
napiRsImageGenerate.supportsWorker = () => false;

const imageGeneratePlugin = new MinimizerPlugin({
  test: /\.(png|jpe?g)(\?.*)?$/i,
  minify: [],
  generate: {
    avif: {
      implementation: napiRsImageGenerate,
      options: {
        resize: BOARD_BG_RESIZE,
        encodeOptions: {
          avif: {
            quality: 50,
            speed: 4,
            chromaSubsampling: ChromaSubsampling.Yuv420,
          },
        },
      },
    },
    webp: {
      implementation: napiRsImageGenerate,
      options: {
        resize: BOARD_BG_RESIZE,
        encodeOptions: {
          webp: { quality: 80 },
        },
      },
    },
  },
});

const imageMinifyPlugin = new MinimizerPlugin({
  test: /\.jpe?g(\?.*)?$/i,
  minify: {
    implementation: MinimizerPlugin.napiRsImageMinify,
    options: {
      resize: BOARD_BG_RESIZE,
      encodeOptions: {
        jpeg: { quality: 80 },
      },
    },
  },
});

module.exports = (_env, argv) => {
  const mode = argv.mode === "production" ? "production" : "development";
  const publicPath = toPublicPath(process.env.PUBLIC_PATH || "/");

  return {
    mode,
    entry: "./src/index.tsx",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      publicPath,
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                icon: true,
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|webp|avif)$/i,
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    optimization: {
      minimizer: ["...", imageMinifyPlugin],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
      new webpack.DefinePlugin({
        "process.env.PUBLIC_PATH": JSON.stringify(publicPath),
      }),
      imageGeneratePlugin,
    ],
    devServer: {
      port: 8080,
      hot: true,
      historyApiFallback: true,
    },
  };
};
