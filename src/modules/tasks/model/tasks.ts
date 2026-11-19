import { atom, withLocalStorage } from "@reatom/core";
import seedJson from "../../../../tasks.json";
import {
  type AddTodoTaskInput,
  addTodoTask,
  type MoveTaskInput,
  moveTaskToType,
  parseTasks,
  removeTaskById,
  type UpdateTaskInput,
  updateTaskById,
} from "./task";

const TASKS_STORAGE_KEY = "tasks" as const;

const seedResult = parseTasks(seedJson);

if (!seedResult.ok) {
  throw seedResult.error;
}

const seedTasks = seedResult.value;

const tasksFromSnapshot = (snapshot: unknown) => {
  const parsed = parseTasks(snapshot);

  if (!parsed.ok) {
    return seedTasks;
  }

  return parsed.value;
};

export const tasks = atom(seedTasks, "tasks").extend(
  withLocalStorage({
    key: TASKS_STORAGE_KEY,
    fromSnapshot: tasksFromSnapshot,
  }),
  (target) => ({
    moveToType: (input: MoveTaskInput): void => {
      target.set((current) =>
        moveTaskToType({
          tasks: current,
          taskId: input.taskId,
          type: input.type,
        }),
      );
    },
    removeById: (taskId: number): void => {
      target.set((current) => removeTaskById({ tasks: current, taskId }));
    },
    updateById: (input: UpdateTaskInput): void => {
      target.set((current) =>
        updateTaskById({
          tasks: current,
          taskId: input.taskId,
          startDay: input.startDay,
          endDay: input.endDay,
          text: input.text,
        }),
      );
    },
    addTodo: (input: AddTodoTaskInput): void => {
      target.set((current) =>
        addTodoTask({
          tasks: current,
          startDay: input.startDay,
          endDay: input.endDay,
          text: input.text,
        }),
      );
    },
  }),
);
