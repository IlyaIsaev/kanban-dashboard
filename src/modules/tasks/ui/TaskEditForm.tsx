import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { Input } from "@base-ui/react/input";
import { css, cx } from "@emotion/css";
import { wrap } from "@reatom/core";
import { bindField, reatomFactoryComponent } from "@reatom/react";
import { type KeyboardEvent, useEffect, useRef } from "react";
import CheckIcon from "@/common/icons/check.svg";
import CrossIcon from "@/common/icons/cross.svg";
import {
  fieldInputClass,
  roundIconButtonClass,
  roundIconButtonConfirmClass,
  roundIconClass,
} from "@/common/theme/controls";
import { COLOR_DANGER, TEXT_REGULAR } from "@/common/theme/tokens";
import { DatePickerField } from "@/common/ui-kit/form/DatePickerField";
import { formatTaskDay, parseTaskDay, type Task } from "../model/task";
import { reatomTaskEditForm } from "../model/taskEditForm";
import { tasks } from "../model/tasks";

export type TaskEditFormProps = {
  readonly onClose: () => void;
} & (
  | { readonly mode: "edit"; readonly task: Task }
  | { readonly mode: "create" }
);

const editFormClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const editFieldClass = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  columnGap: "0.4rem",
  rowGap: "0.15rem",
  margin: 0,
  minWidth: 0,
  "& > :nth-child(2)": {
    flex: "1 1 6.5rem",
    minWidth: 0,
  },
});

const editLabelClass = css({
  color: TEXT_REGULAR,
});

const fieldErrorClass = css({
  flexBasis: "100%",
  margin: 0,
  fontSize: "0.75rem",
  color: COLOR_DANGER,
  overflowWrap: "break-word",
});

const editActionsClass = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
  marginTop: "0.25rem",
});

const TASK_DAY_PLACEHOLDER = "ДД.ММ.ГГГГ" as const;

const formatPickedDate = (date: Date): string =>
  formatTaskDay(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const localDateFromUtcDay = (day: number): Date => {
  const date = new Date(day);

  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const parseTaskDayInput = (value: string): Date | undefined => {
  const parsed = parseTaskDay(value);

  if (!parsed.ok) {
    return undefined;
  }

  return localDateFromUtcDay(parsed.value);
};

export const TaskEditForm = reatomFactoryComponent<TaskEditFormProps>(
  (initProps, { name }) => {
    const form = reatomTaskEditForm({
      ...initProps,
      store: tasks,
      name:
        initProps.mode === "edit"
          ? `${name}.${initProps.task.id}`
          : `${name}.create`,
    });

    return ({ onClose }) => {
      const textInputRef = useRef<HTMLInputElement | null>(null);
      const startDay = bindField(form.fields.startDay);
      const endDay = bindField(form.fields.endDay);
      const text = bindField(form.fields.text);

      useEffect(() => {
        textInputRef.current?.focus();
      }, []);

      return (
        <Form
          className={editFormClass}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onKeyDown={wrap((event: KeyboardEvent<HTMLFormElement>) => {
            event.stopPropagation();

            if (event.nativeEvent.isComposing || event.repeat) {
              return;
            }

            if (event.key === "Escape") {
              event.preventDefault();

              onClose();

              return;
            }

            if (event.key === "Enter") {
              if (
                event.target instanceof HTMLElement &&
                event.target.closest('[data-kumo-part="popup"]')
              ) {
                return;
              }

              event.preventDefault();

              event.currentTarget.requestSubmit();
            }
          })}
          onFormSubmit={wrap(() => {
            void form.submit().catch(() => {});
          })}
        >
          <Field.Root name="startDay" className={editFieldClass}>
            <Field.Label className={editLabelClass}>Начало:</Field.Label>
            <DatePickerField
              value={startDay.value}
              placeholder={TASK_DAY_PLACEHOLDER}
              parseDate={parseTaskDayInput}
              formatDate={formatPickedDate}
              aria-label="Начало"
              onValueChange={startDay.onChange}
              onBlur={startDay.onBlur}
              onFocus={startDay.onFocus}
            />
            {startDay.error !== undefined ? (
              <Field.Error className={fieldErrorClass} match={true}>
                {startDay.error}
              </Field.Error>
            ) : null}
          </Field.Root>
          <Field.Root name="endDay" className={editFieldClass}>
            <Field.Label className={editLabelClass}>Окончание:</Field.Label>
            <DatePickerField
              value={endDay.value}
              placeholder={TASK_DAY_PLACEHOLDER}
              parseDate={parseTaskDayInput}
              formatDate={formatPickedDate}
              aria-label="Окончание"
              onValueChange={endDay.onChange}
              onBlur={endDay.onBlur}
              onFocus={endDay.onFocus}
            />
            {endDay.error !== undefined ? (
              <Field.Error className={fieldErrorClass} match={true}>
                {endDay.error}
              </Field.Error>
            ) : null}
          </Field.Root>
          <Field.Root name="text" className={editFieldClass}>
            <Field.Label className={editLabelClass}>Описание:</Field.Label>
            <Input
              ref={textInputRef}
              className={fieldInputClass}
              value={text.value}
              aria-label="Описание"
              onValueChange={text.onChange}
              onBlur={text.onBlur}
              onFocus={text.onFocus}
            />
            {text.error !== undefined ? (
              <Field.Error className={fieldErrorClass} match={true}>
                {text.error}
              </Field.Error>
            ) : null}
          </Field.Root>
          <div className={editActionsClass}>
            <Button
              className={roundIconButtonClass}
              type="button"
              aria-label="Отменить"
              onClick={wrap(onClose)}
            >
              <CrossIcon
                className={roundIconClass}
                aria-hidden="true"
                focusable="false"
              />
            </Button>
            <Button
              className={cx(roundIconButtonClass, roundIconButtonConfirmClass)}
              type="submit"
              aria-label="Сохранить"
            >
              <CheckIcon
                className={roundIconClass}
                aria-hidden="true"
                focusable="false"
              />
            </Button>
          </div>
        </Form>
      );
    };
  },
  "TaskEditForm",
);
