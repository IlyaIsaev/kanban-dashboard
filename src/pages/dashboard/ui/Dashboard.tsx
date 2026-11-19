import { css, injectGlobal } from "@emotion/css";
import boardBgJpeg from "@/common/assets/board-bg.jpg";
import boardBgAvif from "@/common/assets/board-bg.jpg?as=avif";
import boardBgWebp from "@/common/assets/board-bg.jpg?as=webp";
import {
  FONT_FAMILY,
  FONT_SIZE_BODY,
  FONT_SIZE_TITLE,
  GAP_SEARCH_BOARD,
  LINE_HEIGHT_BODY,
  TEXT_BOLD,
} from "@/common/theme/tokens";
import { TaskSearch, Tasks } from "@/modules/tasks";

const boardBgImageSet = `image-set(url("${boardBgAvif}") type("image/avif"), url("${boardBgWebp}") type("image/webp"), url("${boardBgJpeg}") type("image/jpeg"))`;

injectGlobal({
  html: {
    backgroundImage: `url(${boardBgJpeg})`,
    "@supports (background-image: image-set(url('x') type('image/jpeg')))": {
      backgroundImage: boardBgImageSet,
    },
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
});

const mainClass = css({
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  height: "100%",
  minWidth: 0,
  overflow: "hidden",
  padding: "2rem clamp(0.75rem, 2.2vw, 2.5rem) 1.5rem",
  fontFamily: FONT_FAMILY,
  fontSize: FONT_SIZE_BODY,
  lineHeight: LINE_HEIGHT_BODY,
  color: TEXT_BOLD,
});

const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  flexShrink: 0,
  marginBottom: GAP_SEARCH_BOARD,
});

const titleClass = css({
  margin: 0,
  fontSize: FONT_SIZE_TITLE,
  fontWeight: 700,
  lineHeight: 1.2,
  color: TEXT_BOLD,
});

export function Dashboard() {
  return (
    <main className={mainClass}>
      <header className={headerClass}>
        <h1 className={titleClass}>Your tasks</h1>
        <TaskSearch />
      </header>
      <Tasks />
    </main>
  );
}
