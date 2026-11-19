import { Button } from "@base-ui/react/button";
import { useDraggable } from "@dnd-kit/react";
import { css, cx } from "@emotion/css";
import { useState } from "react";
import EditIcon from "@/common/icons/edit.svg";
import {
  actionIconClass,
  iconActionClass,
  iconActionEditClass,
} from "@/common/theme/controls";
import {
  COLOR_ACCENT,
  COLOR_DANGER,
  COLOR_SURFACE,
  FONT_SIZE_BODY,
  GAP_TASK_ROWS,
  LINE_HEIGHT_BODY,
  RADIUS_TASK,
  TEXT_BOLD,
  TEXT_REGULAR,
} from "@/common/theme/tokens";
import {
  canEditTask,
  formatTaskDay,
  isTaskOverdue,
  type Task,
} from "../model/task";
import { TaskDeleteButton } from "./TaskDeleteButton";
import { TaskEditForm } from "./TaskEditForm";

export const TASK_DRAG_TYPE = "task" as const;

export type TaskCardProps = {
  readonly task: Task;
};

export type TaskCreateCardProps = {
  readonly onClose: () => void;
};

const cardItemClass = css({
  width: "100%",
  minWidth: 0,
});

const cardClass = css({
  position: "relative",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: GAP_TASK_ROWS,
  width: "100%",
  minWidth: 0,
  padding: "1rem",
  border: "1px solid transparent",
  borderRadius: RADIUS_TASK,
  background: COLOR_SURFACE,
  flexShrink: 0,
  cursor: "grab",
  touchAction: "none",
  userSelect: "none",
  transition: "border-color 300ms ease-in-out",
  "&:hover": {
    borderColor: COLOR_ACCENT,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
  "&:hover [data-task-action], &:focus-within [data-task-action]": {
    opacity: 1,
  },
});

const cardDraggingClass = css({
  opacity: 0.9,
  "&[popover], &[data-dnd-dragging]": {
    background: COLOR_SURFACE,
  },
});

const cardEditingClass = css({
  cursor: "default",
  touchAction: "auto",
  userSelect: "auto",
  borderColor: COLOR_ACCENT,
});

const cardActionsClass = css({
  position: "absolute",
  top: "0.5rem",
  right: "0.5rem",
  display: "flex",
  gap: "0.125rem",
});

const cardRowClass = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: "0.15rem 0.4rem",
  margin: 0,
  minWidth: 0,
  fontSize: FONT_SIZE_BODY,
  lineHeight: LINE_HEIGHT_BODY,
});

const cardLabelClass = css({
  color: TEXT_REGULAR,
  flex: "0 1 auto",
  maxWidth: "100%",
  overflowWrap: "break-word",
});

const cardValueClass = css({
  color: TEXT_BOLD,
  fontWeight: 700,
  flex: "1 1 6.5rem",
  minWidth: 0,
  overflowWrap: "break-word",
});

const overdueEndDayClass = css({
  color: COLOR_DANGER,
});

export function TaskCreateCard({ onClose }: TaskCreateCardProps) {
  return (
    <li className={cardItemClass}>
      <article className={cx(cardClass, cardEditingClass)}>
        <TaskEditForm mode="create" onClose={onClose} />
      </article>
    </li>
  );
}

export function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const { ref, isDragSource } = useDraggable({
    id: task.id,
    type: TASK_DRAG_TYPE,
    disabled: isEditing,
  });

  const isOverdue = isTaskOverdue({ task, now: Date.now() });
  const canEdit = canEditTask(task);
  const showEditor = canEdit && isEditing;

  return (
    <li className={cardItemClass}>
      <article
        ref={ref}
        className={cx(
          cardClass,
          isDragSource && cardDraggingClass,
          showEditor && cardEditingClass,
        )}
      >
        {showEditor ? (
          <TaskEditForm
            mode="edit"
            task={task}
            onClose={() => {
              setIsEditing(false);
            }}
          />
        ) : (
          <>
            <div className={cardActionsClass}>
              {canEdit ? (
                <Button
                  className={cx(iconActionClass, iconActionEditClass)}
                  data-task-action=""
                  aria-label="Редактировать задачу"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  <EditIcon
                    className={actionIconClass}
                    aria-hidden="true"
                    focusable="false"
                  />
                </Button>
              ) : null}
              <TaskDeleteButton taskId={task.id} />
            </div>
            <p className={cardRowClass}>
              <span className={cardLabelClass}>Начало:</span>
              <span className={cardValueClass}>
                {formatTaskDay(task.startDay)}
              </span>
            </p>
            <p className={cardRowClass}>
              <span className={cardLabelClass}>Окончание:</span>
              <span
                className={cx(cardValueClass, isOverdue && overdueEndDayClass)}
              >
                {formatTaskDay(task.endDay)}
              </span>
            </p>
            <p className={cardRowClass}>
              <span className={cardLabelClass}>Описание:</span>
              <span className={cardValueClass}>{task.text}</span>
            </p>
          </>
        )}
      </article>
    </li>
  );
}
