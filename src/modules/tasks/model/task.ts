import * as z from "zod";
import { err, ok, type Result } from "@/common/utils/result";

export const taskTypeSchema = z.enum(["todo", "in_progress", "review", "done"]);

export const taskSchema = z
  .object({
    id: z.int(),
    type: taskTypeSchema,
    startDay: z.int(),
    endDay: z.int(),
    text: z.string(),
  })
  .readonly();

export const tasksSchema = z.array(taskSchema).readonly();

export type TaskType = z.infer<typeof taskTypeSchema>;
export type Task = z.infer<typeof taskSchema>;

export type MoveTaskInput = {
  readonly taskId: number;
  readonly type: TaskType;
};

export type UpdateTaskInput = {
  readonly taskId: number;
  readonly startDay: number;
  readonly endDay: number;
  readonly text: string;
};

export type AddTodoTaskInput = {
  readonly startDay: number;
  readonly endDay: number;
  readonly text: string;
};

const TASK_DAY_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;

const INVALID_DAY_FORMAT_ERROR = "Введите дату в формате ДД.ММ.ГГГГ" as const;
const INVALID_DAY_ERROR = "Некорректная дата" as const;

const formatUtcDayPart = (value: number): string =>
  value.toString().padStart(2, "0");

export const formatTaskDay = (day: number): string => {
  const date = new Date(day);

  return `${formatUtcDayPart(date.getUTCDate())}.${formatUtcDayPart(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
};

export const parseTaskDay = (input: string): Result<number, string> => {
  const match = TASK_DAY_PATTERN.exec(input.trim());

  if (match === null) {
    return err(INVALID_DAY_FORMAT_ERROR);
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return err(INVALID_DAY_ERROR);
  }

  return ok(timestamp);
};

export const parseTasks = (
  input: unknown,
): Result<readonly Task[], z.ZodError> => {
  const parsed = tasksSchema.safeParse(input);

  if (!parsed.success) {
    return err(parsed.error);
  }

  return ok(parsed.data);
};

export const moveTaskToType = ({
  tasks,
  taskId,
  type,
}: MoveTaskInput & {
  readonly tasks: readonly Task[];
}): readonly Task[] => {
  const current = tasks.find((task) => task.id === taskId);

  if (current === undefined || current.type === type) {
    return tasks;
  }

  return tasks.map((task) => (task.id === taskId ? { ...task, type } : task));
};

export const removeTaskById = ({
  tasks,
  taskId,
}: {
  readonly tasks: readonly Task[];
  readonly taskId: number;
}): readonly Task[] => {
  if (tasks.every((task) => task.id !== taskId)) {
    return tasks;
  }

  return tasks.filter((task) => task.id !== taskId);
};

const nextTaskId = (tasks: readonly Task[]): number =>
  tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;

export const addTodoTask = ({
  tasks,
  startDay,
  endDay,
  text,
}: AddTodoTaskInput & {
  readonly tasks: readonly Task[];
}): readonly Task[] => [
  ...tasks,
  {
    id: nextTaskId(tasks),
    type: "todo",
    startDay,
    endDay,
    text,
  },
];

export const canEditTask = (task: Task): boolean => task.type === "todo";

export const updateTaskById = ({
  tasks,
  taskId,
  startDay,
  endDay,
  text,
}: UpdateTaskInput & {
  readonly tasks: readonly Task[];
}): readonly Task[] => {
  const current = tasks.find((task) => task.id === taskId);

  if (current === undefined || !canEditTask(current)) {
    return tasks;
  }

  if (
    current.startDay === startDay &&
    current.endDay === endDay &&
    current.text === text
  ) {
    return tasks;
  }

  return tasks.map((task) =>
    task.id === taskId ? { ...task, startDay, endDay, text } : task,
  );
};

const startOfUtcDay = (timestamp: number): number => {
  const date = new Date(timestamp);

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const isTaskOverdue = ({
  task,
  now,
}: {
  readonly task: Task;
  readonly now: number;
}): boolean => {
  if (task.type === "done") {
    return false;
  }

  return startOfUtcDay(task.endDay) < startOfUtcDay(now);
};

export const matchesTaskSearch = ({
  task,
  query,
}: {
  readonly task: Task;
  readonly query: string;
}): boolean => {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return true;
  }

  if (task.text.toLowerCase().includes(trimmed.toLowerCase())) {
    return true;
  }

  const parsedDay = parseTaskDay(trimmed);

  if (!parsedDay.ok) {
    return false;
  }

  return (
    startOfUtcDay(task.startDay) === parsedDay.value ||
    startOfUtcDay(task.endDay) === parsedDay.value
  );
};
