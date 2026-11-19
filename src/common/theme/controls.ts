import { css, cx } from "@emotion/css";
import {
  COLOR_ACCENT,
  COLOR_DANGER_STRONG,
  COLOR_SURFACE_MUTED,
  COLOR_SURFACE_STRONG,
  FONT_SIZE_SMALL,
  RADIUS_FIELD,
  RADIUS_PILL,
  TEXT_BOLD,
  TEXT_REGULAR,
} from "./tokens";

export const buttonHoverMotionClass = css({
  transition:
    "color 150ms ease, background-color 150ms ease, border-color 150ms ease, transform 150ms ease, opacity 150ms ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:hover": {
      transform: "none",
    },
  },
});

export const iconActionClass = cx(
  css({
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    height: "1.75rem",
    padding: 0,
    border: "none",
    borderRadius: RADIUS_FIELD,
    background: "transparent",
    color: TEXT_REGULAR,
    appearance: "none",
    cursor: "pointer",
    opacity: 0,
    "&:focus-visible": {
      opacity: 1,
      outline: `1px solid ${COLOR_ACCENT}`,
      outlineOffset: 1,
    },
  }),
  buttonHoverMotionClass,
);

export const iconActionEditClass = css({
  "&:hover, &:active, &:focus-visible": {
    color: COLOR_ACCENT,
    "& path": {
      fill: "currentColor",
      fillOpacity: 1,
    },
  },
});

export const iconActionDangerClass = css({
  "&:hover, &:active, &:focus-visible": {
    color: COLOR_DANGER_STRONG,
    "& path": {
      fill: "currentColor",
      fillOpacity: 1,
    },
  },
});

export const actionIconClass = css({
  display: "block",
  width: "1.125rem",
  height: "1.125rem",
  flexShrink: 0,
  pointerEvents: "none",
});

export const roundIconButtonClass = cx(
  css({
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.5rem",
    height: "2.5rem",
    padding: 0,
    border: "none",
    borderRadius: RADIUS_PILL,
    background: COLOR_SURFACE_MUTED,
    color: TEXT_REGULAR,
    appearance: "none",
    cursor: "pointer",
    "&:hover, &:active": {
      background: COLOR_SURFACE_STRONG,
    },
    "&:focus-visible": {
      outline: `1px solid ${COLOR_ACCENT}`,
      outlineOffset: 1,
    },
  }),
  buttonHoverMotionClass,
);

export const roundIconButtonConfirmClass = css({
  color: COLOR_ACCENT,
});

export const roundIconClass = css({
  display: "block",
  width: "1.5rem",
  height: "1.5rem",
  flexShrink: 0,
  pointerEvents: "none",
});

export const fieldInputClass = css({
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  height: "1.375rem",
  padding: "0 0.625rem",
  border: `1px solid ${COLOR_SURFACE_MUTED}`,
  borderRadius: "0.25rem",
  background: COLOR_SURFACE_MUTED,
  color: TEXT_BOLD,
  fontFamily: "inherit",
  fontSize: FONT_SIZE_SMALL,
  lineHeight: "1.25rem",
  "&::placeholder": {
    color: TEXT_REGULAR,
  },
  "&:hover": {
    borderColor: COLOR_ACCENT,
  },
  "&:focus": {
    outline: "none",
    borderColor: COLOR_ACCENT,
  },
});
