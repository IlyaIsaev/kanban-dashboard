import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@base-ui/react/button";
import { css, cx } from "@emotion/css";
import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import TrashIcon from "@/common/icons/trash.svg";
import {
  actionIconClass,
  buttonHoverMotionClass,
  iconActionClass,
  iconActionDangerClass,
} from "@/common/theme/controls";
import {
  COLOR_ACCENT,
  COLOR_DANGER,
  COLOR_DANGER_STRONG,
  COLOR_OVERLAY,
  COLOR_SURFACE,
  COLOR_SURFACE_STRONG,
  FONT_SIZE_BODY,
  FONT_SIZE_SMALL,
  RADIUS_CARD,
  RADIUS_FIELD,
  TEXT_BOLD,
  TEXT_REGULAR,
} from "@/common/theme/tokens";
import { tasks } from "../model/tasks";
import { showTaskToast } from "../model/taskToast";

export type TaskDeleteButtonProps = {
  readonly taskId: number;
};

const backdropClass = css({
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: COLOR_OVERLAY,
});

const popupClass = css({
  boxSizing: "border-box",
  position: "fixed",
  top: "50%",
  left: "50%",
  zIndex: 1001,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  width: "24rem",
  maxWidth: "calc(100% - 3rem)",
  padding: "1rem",
  border: `1px solid ${COLOR_SURFACE_STRONG}`,
  borderRadius: RADIUS_CARD,
  background: COLOR_OVERLAY,
  color: TEXT_BOLD,
  transform: "translate(-50%, -50%)",
});

const titleClass = css({
  margin: 0,
  fontSize: FONT_SIZE_BODY,
  fontWeight: 700,
  color: TEXT_BOLD,
});

const descriptionClass = css({
  margin: 0,
  fontSize: FONT_SIZE_SMALL,
  color: TEXT_REGULAR,
});

const actionsClass = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
});

const dialogButtonClass = css({
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "2rem",
  padding: "0 0.75rem",
  border: `1px solid ${COLOR_SURFACE_STRONG}`,
  borderRadius: RADIUS_FIELD,
  background: COLOR_SURFACE,
  color: TEXT_BOLD,
  fontFamily: "inherit",
  fontSize: FONT_SIZE_SMALL,
  cursor: "pointer",
  "&:hover, &:focus-visible": {
    borderColor: COLOR_ACCENT,
  },
  "&:focus-visible": {
    outline: `1px solid ${COLOR_ACCENT}`,
    outlineOffset: 1,
  },
});

const dialogDangerButtonClass = css({
  color: COLOR_DANGER,
  borderColor: COLOR_DANGER,
  "&:hover, &:active, &:focus-visible": {
    color: COLOR_DANGER_STRONG,
    borderColor: COLOR_DANGER_STRONG,
  },
});

export const TaskDeleteButton = reatomComponent(
  ({ taskId }: TaskDeleteButtonProps) => (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        render={
          <Button
            className={cx(iconActionClass, iconActionDangerClass)}
            data-task-action=""
          />
        }
        aria-label="Удалить задачу"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <TrashIcon
          className={actionIconClass}
          aria-hidden="true"
          focusable="false"
        />
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={backdropClass} />
        <AlertDialog.Popup className={popupClass}>
          <AlertDialog.Title className={titleClass}>
            Удалить задачу?
          </AlertDialog.Title>
          <AlertDialog.Description className={descriptionClass}>
            Это действие нельзя отменить.
          </AlertDialog.Description>
          <div className={actionsClass}>
            <AlertDialog.Close
              render={
                <Button
                  className={cx(dialogButtonClass, buttonHoverMotionClass)}
                />
              }
            >
              Отмена
            </AlertDialog.Close>
            <AlertDialog.Close
              render={
                <Button
                  className={cx(
                    dialogButtonClass,
                    dialogDangerButtonClass,
                    buttonHoverMotionClass,
                  )}
                />
              }
              onClick={wrap(() => {
                const task = tasks().find((item) => item.id === taskId);

                tasks.removeById(taskId);

                if (task === undefined) {
                  return;
                }

                showTaskToast({
                  kind: "delete",
                  text: task.text,
                });
              })}
            >
              Удалить
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  ),
  "TaskDeleteButton",
);
