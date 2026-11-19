import { reatomForm } from "@reatom/core";
import * as z from "zod";
import {
  type AddTodoTaskInput,
  formatTaskDay,
  parseTaskDay,
  type Task,
  type UpdateTaskInput,
} from "./task";
import { showTaskToast } from "./taskToast";

const EMPTY_TEXT_ERROR = "Введите описание" as const;
const END_BEFORE_START_ERROR =
  "Дата окончания не может быть раньше даты начала" as const;

const taskDaySchema = z.string().transform((input, ctx) => {
  const parsed = parseTaskDay(input);

  if (!parsed.ok) {
    ctx.addIssue(parsed.error);

    return z.NEVER;
  }

  return parsed.value;
});

const taskDraftSchema = z
  .object({
    startDay: taskDaySchema,
    endDay: taskDaySchema,
    text: z.string().trim().min(1, EMPTY_TEXT_ERROR),
  })
  .refine((draft) => draft.endDay >= draft.startDay, {
    path: ["endDay"],
    message: END_BEFORE_START_ERROR,
  });

export type ReatomTaskEditFormInput = {
  readonly name: string;
  readonly onClose: () => void;
  readonly store: {
    readonly updateById: (input: UpdateTaskInput) => void;
    readonly addTodo: (input: AddTodoTaskInput) => void;
  };
} & (
  | { readonly mode: "edit"; readonly task: Task }
  | { readonly mode: "create" }
);

export const reatomTaskEditForm = (input: ReatomTaskEditFormInput) =>
  reatomForm(
    {
      startDay: input.mode === "edit" ? formatTaskDay(input.task.startDay) : "",
      endDay: input.mode === "edit" ? formatTaskDay(input.task.endDay) : "",
      text: input.mode === "edit" ? input.task.text : "",
    },
    {
      name: input.name,
      schema: taskDraftSchema,
      validateOnBlur: false,
      validateOnChange: false,
      keepErrorOnChange: false,
      resetOnSubmit: false,
      onSubmit: (values) => {
        if (input.mode === "edit") {
          input.store.updateById({
            taskId: input.task.id,
            startDay: values.startDay,
            endDay: values.endDay,
            text: values.text,
          });

          showTaskToast({
            kind: "edit",
            before: {
              startDay: input.task.startDay,
              endDay: input.task.endDay,
              text: input.task.text,
            },
            after: {
              startDay: values.startDay,
              endDay: values.endDay,
              text: values.text,
            },
          });

          input.onClose();

          return;
        }

        input.store.addTodo({
          startDay: values.startDay,
          endDay: values.endDay,
          text: values.text,
        });

        showTaskToast({
          kind: "create",
          text: values.text,
        });

        input.onClose();
      },
    },
  );
