import { Button } from "@base-ui/react/button";
import { ScrollArea } from "@base-ui/react/scroll-area";
import {
  DragDropProvider,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/react";
import { css, cx } from "@emotion/css";
import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { groupBy, orderBy } from "es-toolkit/fp";
import type { SVGProps } from "react";
import { useState } from "react";
import GhostIcon from "@/common/icons/bxs-ghost.svg";
import HappyIcon from "@/common/icons/bxs-happy-alt.svg";
import SmileIcon from "@/common/icons/bxs-smile.svg";
import UpsideDownIcon from "@/common/icons/bxs-upside-down.svg";
import {
  COLOR_ACCENT,
  COLOR_OVERLAY,
  COLOR_SURFACE_STRONG,
  FONT_SIZE_COLUMN_TITLE,
  FONT_SIZE_SMALL,
  GAP_COLUMN_TITLE,
  GAP_COLUMNS,
  GAP_TASKS,
  LETTER_SPACING_COLUMN_TITLE,
  LINE_HEIGHT_COLUMN_TITLE,
  PADDING_COLUMN,
  RADIUS_COLUMN,
  TEXT_BOLD,
  TEXT_REGULAR,
} from "@/common/theme/tokens";
import {
  type MoveTaskInput,
  type Task,
  type TaskType,
  taskTypeSchema,
} from "../model/task";
import { visibleTasks } from "../model/taskSearch";
import { tasks } from "../model/tasks";
import { TASK_DRAG_TYPE, TaskCard, TaskCreateCard } from "./TaskCard";

type ColumnIcon = (props: SVGProps<SVGSVGElement>) => JSX.Element;

type BoardColumn = (typeof BOARD_COLUMNS)[number];

type TaskColumnProps = {
  readonly column: BoardColumn;
  readonly tasks: readonly Task[];
};

const BOARD_COLUMNS = [
  { type: "todo", title: "To Do", Icon: HappyIcon },
  { type: "in_progress", title: "In Progress", Icon: SmileIcon },
  { type: "review", title: "Review", Icon: UpsideDownIcon },
  { type: "done", title: "Done", Icon: GhostIcon },
] satisfies readonly {
  readonly type: TaskType;
  readonly title: string;
  readonly Icon: ColumnIcon;
}[];

const groupTasksByType = groupBy((task: Task) => task.type);

const orderColumnTasks = orderBy<Task>(["startDay"], ["desc"]);

const boardClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gridTemplateRows: "minmax(0, 1fr)",
  alignItems: "start",
  gap: GAP_COLUMNS,
  flex: 1,
  minWidth: 0,
  minHeight: 0,
});

const columnClass = css({
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  gap: GAP_COLUMN_TITLE,
  minWidth: 0,
  minHeight: 0,
  height: "fit-content",
  maxHeight: "100%",
  overflow: "hidden",
  padding: PADDING_COLUMN,
  borderRadius: RADIUS_COLUMN,
  border: "1px solid transparent",
  background: COLOR_OVERLAY,
});

const columnDropTargetClass = css({
  borderColor: COLOR_ACCENT,
});

const columnHeaderClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "0.35rem 0.5rem",
  flexShrink: 0,
  minWidth: 0,
});

const columnTitleGroupClass = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  minWidth: 0,
});

const columnIconClass = css({
  display: "block",
  width: "1.25rem",
  height: "1.25rem",
  flexShrink: 0,
  color: TEXT_BOLD,
});

const columnTitleClass = css({
  minWidth: 0,
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: FONT_SIZE_COLUMN_TITLE,
  fontWeight: 700,
  lineHeight: LINE_HEIGHT_COLUMN_TITLE,
  letterSpacing: LETTER_SPACING_COLUMN_TITLE,
  color: TEXT_BOLD,
});

const addTaskButtonClass = css({
  flexShrink: 0,
  margin: 0,
  padding: 0,
  border: "none",
  background: "none",
  fontFamily: "inherit",
  fontSize: FONT_SIZE_SMALL,
  color: TEXT_REGULAR,
  cursor: "pointer",
  "&:hover, &:focus-visible": {
    color: COLOR_ACCENT,
  },
  "&:focus-visible": {
    outline: `1px solid ${COLOR_ACCENT}`,
    outlineOffset: 1,
  },
});

const SCROLL_FADE_SIZE = "2.5rem" as const;

const scrollFadeMask = `linear-gradient(to bottom, transparent 0, black min(${SCROLL_FADE_SIZE}, var(--scroll-area-overflow-y-start)), black calc(100% - min(${SCROLL_FADE_SIZE}, var(--scroll-area-overflow-y-end, ${SCROLL_FADE_SIZE}))), transparent 100%)`;

const scrollAreaClass = css({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
});

const viewportClass = css({
  minWidth: 0,
  minHeight: 0,
  height: "100%",
  overflowX: "hidden",
  outline: "none",
  WebkitMaskImage: scrollFadeMask,
  WebkitMaskRepeat: "no-repeat",
  maskImage: scrollFadeMask,
  maskRepeat: "no-repeat",
  "&:focus-visible": {
    outline: `1px solid ${COLOR_ACCENT}`,
    outlineOffset: -1,
  },
});

const scrollContentClass = css({
  boxSizing: "border-box",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
});

const columnListClass = css({
  display: "flex",
  flexDirection: "column",
  gap: GAP_TASKS,
  margin: 0,
  padding: 0,
  listStyle: "none",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
});

const scrollbarClass = css({
  display: "flex",
  justifyContent: "center",
  width: "0.5rem",
  margin: "1px",
  backgroundColor: COLOR_SURFACE_STRONG,
  opacity: 0,
  transition: "opacity 150ms",
  pointerEvents: "none",
  "&[data-scrolling]": {
    transitionDuration: "0ms",
  },
  "&[data-hovering], &[data-scrolling]": {
    opacity: 1,
    pointerEvents: "auto",
  },
});

const thumbClass = css({
  width: "100%",
  borderRadius: "999px",
  backgroundColor: TEXT_REGULAR,
});

const resolveMoveFromDragEnd = (event: DragEndEvent): MoveTaskInput | null => {
  if (event.canceled) {
    return null;
  }

  const sourceId = event.operation.source?.id;
  const targetId = event.operation.target?.id;

  if (typeof sourceId !== "number") {
    return null;
  }

  const parsedType = taskTypeSchema.safeParse(targetId);

  if (!parsedType.success) {
    return null;
  }

  return { taskId: sourceId, type: parsedType.data };
};

function TaskColumn({ column, tasks: columnTasks }: TaskColumnProps) {
  const [isCreating, setIsCreating] = useState(false);

  const { ref, isDropTarget } = useDroppable({
    id: column.type,
    accept: TASK_DRAG_TYPE,
  });

  const canCreate = column.type === "todo";
  const { Icon } = column;

  return (
    <section
      ref={ref}
      className={cx(columnClass, isDropTarget && columnDropTargetClass)}
    >
      <div className={columnHeaderClass}>
        <div className={columnTitleGroupClass}>
          <Icon
            className={columnIconClass}
            aria-hidden="true"
            focusable="false"
          />
          <h2 className={columnTitleClass}>{column.title}</h2>
        </div>
        {canCreate ? (
          <Button
            className={addTaskButtonClass}
            type="button"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={() => {
              setIsCreating(true);
            }}
          >
            + Добавить
          </Button>
        ) : null}
      </div>
      <ScrollArea.Root className={scrollAreaClass}>
        <ScrollArea.Viewport
          className={viewportClass}
          style={{ overflowX: "hidden" }}
        >
          <ScrollArea.Content
            className={scrollContentClass}
            style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
          >
            <ul className={columnListClass}>
              {canCreate && isCreating ? (
                <TaskCreateCard
                  onClose={() => {
                    setIsCreating(false);
                  }}
                />
              ) : null}
              {orderColumnTasks(columnTasks).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </ul>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className={scrollbarClass}>
          <ScrollArea.Thumb className={thumbClass} />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </section>
  );
}

export const Tasks = reatomComponent(() => {
  const grouped = groupTasksByType(visibleTasks());

  return (
    <DragDropProvider
      onDragEnd={wrap((event: DragEndEvent) => {
        const move = resolveMoveFromDragEnd(event);

        if (move === null) {
          return;
        }

        tasks.moveToType(move);
      })}
    >
      <div className={boardClass}>
        {BOARD_COLUMNS.map((column) => (
          <TaskColumn
            key={column.type}
            column={column}
            tasks={grouped[column.type] ?? []}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}, "Tasks");
