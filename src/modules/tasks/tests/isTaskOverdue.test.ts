import { describe, expect, it } from "@jest/globals";
import { isTaskOverdue, type Task, type TaskType } from "../model/task";

const PREVIOUS_UTC_DAY = Date.UTC(2026, 0, 9);
const TODAY_UTC = Date.UTC(2026, 0, 10);
const NEXT_UTC_DAY = Date.UTC(2026, 0, 11);

const createTask = ({
  type,
  endDay,
}: {
  readonly type: TaskType;
  readonly endDay: number;
}): Task => ({
  id: 1,
  type,
  startDay: Date.UTC(2026, 0, 1),
  endDay,
  text: "Task",
});

describe("isTaskOverdue", () => {
  it("should return false when the task is done even if endDay is in the past", () => {
    const task = createTask({ type: "done", endDay: PREVIOUS_UTC_DAY });

    expect(isTaskOverdue({ task, now: TODAY_UTC })).toBe(false);
  });

  it.each(["todo", "in_progress", "review"] as const)(
    "should return true when a %s task ended on a previous UTC day",
    (type) => {
      const task = createTask({ type, endDay: PREVIOUS_UTC_DAY });

      expect(isTaskOverdue({ task, now: TODAY_UTC })).toBe(true);
    },
  );

  it("should return false when endDay is earlier on the same UTC day as now", () => {
    const task = createTask({
      type: "todo",
      endDay: Date.UTC(2026, 0, 10, 1),
    });

    expect(isTaskOverdue({ task, now: Date.UTC(2026, 0, 10, 23) })).toBe(false);
  });

  it("should return false when endDay is after today", () => {
    const task = createTask({ type: "todo", endDay: NEXT_UTC_DAY });

    expect(isTaskOverdue({ task, now: TODAY_UTC })).toBe(false);
  });

  it("should return true when endDay is the previous UTC day and now is just after midnight", () => {
    const task = createTask({
      type: "todo",
      endDay: Date.UTC(2026, 0, 9, 23, 59, 59),
    });

    expect(isTaskOverdue({ task, now: Date.UTC(2026, 0, 10, 0, 0, 1) })).toBe(
      true,
    );
  });
});
