import { toastManager } from "@/common/ui-kit/toast/toastManager";
import { formatTaskDay, type Task } from "./task";

type TaskToastEditFields = Pick<Task, "startDay" | "endDay" | "text">;

export type TaskToastEvent =
  | { readonly kind: "create"; readonly text: string }
  | { readonly kind: "delete"; readonly text: string }
  | {
      readonly kind: "edit";
      readonly before: TaskToastEditFields;
      readonly after: TaskToastEditFields;
    };

export type TaskToastCopy = {
  readonly title: string;
  readonly descriptionLines: readonly string[];
};

const TASK_CREATED_TITLE = "Задача создана" as const;
const TASK_DELETED_TITLE = "Задача удалена" as const;
const TASK_EDITED_TITLE = "Задача изменена" as const;
const FIELD_LABEL = "Поле" as const;
const BEFORE_LABEL = "До" as const;
const AFTER_LABEL = "После" as const;

const TASK_EDIT_FIELDS = ["startDay", "endDay", "text"] as const;

const TASK_EDIT_FIELD_LABELS = {
  startDay: "Начало",
  endDay: "Окончание",
  text: "Описание",
} as const;

const formatTaskEditFieldValue = (
  field: (typeof TASK_EDIT_FIELDS)[number],
  fields: TaskToastEditFields,
): string => {
  if (field === "text") {
    return fields.text;
  }

  return formatTaskDay(fields[field]);
};

const getEditDescriptionLines = (
  before: TaskToastEditFields,
  after: TaskToastEditFields,
): readonly string[] =>
  TASK_EDIT_FIELDS.flatMap((field) => {
    const beforeValue = formatTaskEditFieldValue(field, before);
    const afterValue = formatTaskEditFieldValue(field, after);

    if (beforeValue === afterValue) {
      return [];
    }

    return [
      `${FIELD_LABEL}: ${TASK_EDIT_FIELD_LABELS[field]}`,
      `${BEFORE_LABEL}: ${beforeValue}`,
      `${AFTER_LABEL}: ${afterValue}`,
    ];
  });

export const getTaskToastCopy = (event: TaskToastEvent): TaskToastCopy => {
  if (event.kind === "create") {
    return {
      title: TASK_CREATED_TITLE,
      descriptionLines: [event.text],
    };
  }

  if (event.kind === "delete") {
    return {
      title: TASK_DELETED_TITLE,
      descriptionLines: [event.text],
    };
  }

  return {
    title: TASK_EDITED_TITLE,
    descriptionLines: getEditDescriptionLines(event.before, event.after),
  };
};

export const showTaskToast = (event: TaskToastEvent): void => {
  const copy = getTaskToastCopy(event);

  if (copy.descriptionLines.length === 0) {
    return;
  }

  toastManager.add({
    title: copy.title,
    description: copy.descriptionLines.join("\n"),
    data: { descriptionLines: copy.descriptionLines },
  });
};
