declare module "*.svg" {
  import type { SVGProps } from "react";

  const Svg: (props: SVGProps<SVGSVGElement>) => JSX.Element;

  export default Svg;
}

declare module "*.jpg" {
  const src: string;

  export default src;
}

declare module "*.jpg?as=avif" {
  const src: string;

  export default src;
}

declare module "*.jpg?as=webp" {
  const src: string;

  export default src;
}

declare module "*.jpeg" {
  const src: string;

  export default src;
}

declare module "*.png" {
  const src: string;

  export default src;
}

declare module "*.webp" {
  const src: string;

  export default src;
}
