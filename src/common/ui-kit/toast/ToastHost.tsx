import { Toast } from "@base-ui/react/toast";
import { css, cx } from "@emotion/css";
import type { ReactNode } from "react";
import CrossIcon from "@/common/icons/cross.svg";
import {
  COLOR_ACCENT,
  COLOR_OVERLAY,
  COLOR_SURFACE,
  COLOR_SURFACE_STRONG,
  FONT_FAMILY,
  FONT_SIZE_SMALL,
  RADIUS_CARD,
  RADIUS_FIELD,
  TEXT_BOLD,
  TEXT_REGULAR,
} from "@/common/theme/tokens";
import { type ToastData, toastManager } from "./toastManager";

export type ToastHostProps = {
  readonly children: ReactNode;
};

const viewportClass = css({
  boxSizing: "border-box",
  position: "fixed",
  zIndex: 1100,
  top: "auto",
  right: "1rem",
  bottom: "1rem",
  left: "auto",
  width: "calc(100vw - 2rem)",
  margin: 0,
  fontFamily: FONT_FAMILY,
  outline: "none",
  "&:focus-visible": {
    outline: `1px solid ${COLOR_ACCENT}`,
    outlineOffset: 1,
  },
  "@media (min-width: 500px)": {
    right: "2rem",
    bottom: "2rem",
    width: "22.5rem",
  },
});

const toastClass = css({
  "--gap": "0.75rem",
  "--peek": "0.75rem",
  "--scale": "calc(max(0, 1 - (var(--toast-index) * 0.1)))",
  "--shrink": "calc(1 - var(--scale))",
  "--height": "var(--toast-frontmost-height, var(--toast-height))",
  "--offset-y":
    "calc(var(--toast-offset-y) * -1 + (var(--toast-index) * var(--gap) * -1) + var(--toast-swipe-movement-y))",
  boxSizing: "border-box",
  position: "absolute",
  right: 0,
  bottom: 0,
  left: "auto",
  zIndex: "calc(1000 - var(--toast-index))",
  width: "100%",
  height: "var(--height)",
  margin: 0,
  border: `1px solid ${COLOR_SURFACE_STRONG}`,
  borderRadius: RADIUS_CARD,
  background: COLOR_OVERLAY,
  color: TEXT_BOLD,
  boxShadow: `0 0.25rem 0.75rem ${COLOR_OVERLAY}`,
  transformOrigin: "bottom center",
  userSelect: "none",
  cursor: "default",
  transition:
    "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s, height 0.15s",
  transform:
    "translateX(var(--toast-swipe-movement-x)) translateY(calc(var(--toast-swipe-movement-y) - (var(--toast-index) * var(--peek)) - (var(--shrink) * var(--height)))) scale(var(--scale))",
  "&[data-expanded]": {
    height: "var(--toast-height)",
    transform:
      "translateX(var(--toast-swipe-movement-x)) translateY(var(--offset-y))",
  },
  "&[data-starting-style], &[data-ending-style]": {
    transform: "translateY(150%)",
  },
  "&[data-limited]": {
    opacity: 0,
  },
  "&[data-ending-style]": {
    opacity: 0,
    "&[data-swipe-direction='up']": {
      transform: "translateY(calc(var(--toast-swipe-movement-y) - 150%))",
    },
    "&[data-swipe-direction='left']": {
      transform:
        "translateX(calc(var(--toast-swipe-movement-x) - 150%)) translateY(var(--offset-y))",
    },
    "&[data-swipe-direction='right']": {
      transform:
        "translateX(calc(var(--toast-swipe-movement-x) + 150%)) translateY(var(--offset-y))",
    },
    "&[data-swipe-direction='down']": {
      transform: "translateY(calc(var(--toast-swipe-movement-y) + 150%))",
    },
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    height: "calc(var(--gap) + 1px)",
  },
  "&:focus-visible": {
    outline: `1px solid ${COLOR_ACCENT}`,
    outlineOffset: 1,
  },
});

const contentClass = css({
  boxSizing: "border-box",
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  padding: "0.75rem",
  overflow: "hidden",
  transition: "opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
  "&[data-behind]": {
    opacity: 0,
  },
  "&[data-expanded]": {
    opacity: 1,
  },
});

const textClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  minWidth: 0,
  flex: 1,
});

const titleClass = css({
  margin: 0,
  fontSize: FONT_SIZE_SMALL,
  fontWeight: 700,
  lineHeight: 1.3,
  color: TEXT_BOLD,
});

const descriptionClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  margin: 0,
  minWidth: 0,
  maxWidth: "100%",
  fontSize: FONT_SIZE_SMALL,
  lineHeight: 1.3,
  color: TEXT_REGULAR,
});

const descriptionLineClass = css({
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const closeClass = css({
  boxSizing: "border-box",
  display: "flex",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  width: "1.75rem",
  height: "1.75rem",
  padding: 0,
  border: `1px solid ${COLOR_SURFACE_STRONG}`,
  borderRadius: RADIUS_FIELD,
  background: COLOR_SURFACE,
  color: TEXT_REGULAR,
  appearance: "none",
  cursor: "pointer",
  "&:hover, &:focus-visible": {
    borderColor: COLOR_ACCENT,
    color: TEXT_BOLD,
  },
  "&:focus-visible": {
    outline: `1px solid ${COLOR_ACCENT}`,
    outlineOffset: 1,
  },
});

const closeIconClass = css({
  display: "block",
  width: "1rem",
  height: "1rem",
  flexShrink: 0,
  pointerEvents: "none",
});

const withUniqueLineKeys = (
  lines: readonly string[],
): readonly { readonly key: string; readonly line: string }[] => {
  const seen = new Map<string, number>();

  return lines.map((line) => {
    const occurrence = seen.get(line) ?? 0;
    seen.set(line, occurrence + 1);

    return { key: `${line}:${occurrence}`, line };
  });
};

function ToastList() {
  const { toasts } = Toast.useToastManager<ToastData>();

  return toasts.map((toast) => {
    const descriptionLines = toast.data?.descriptionLines;

    return (
      <Toast.Root key={toast.id} toast={toast} className={toastClass}>
        <Toast.Content className={contentClass}>
          <div className={textClass}>
            <Toast.Title className={titleClass} />
            {descriptionLines === undefined ? (
              <Toast.Description
                className={cx(descriptionClass, descriptionLineClass)}
              />
            ) : (
              <Toast.Description className={descriptionClass}>
                {withUniqueLineKeys(descriptionLines).map(({ key, line }) => (
                  <span key={key} className={descriptionLineClass}>
                    {line}
                  </span>
                ))}
              </Toast.Description>
            )}
          </div>
          <Toast.Close className={closeClass} aria-label="Закрыть">
            <CrossIcon
              className={closeIconClass}
              aria-hidden="true"
              focusable="false"
            />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    );
  });
}

export function ToastHost({ children }: ToastHostProps) {
  return (
    <Toast.Provider toastManager={toastManager}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className={viewportClass}>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
