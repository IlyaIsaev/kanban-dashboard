import { atom, computed, withSearchParams } from "@reatom/core";
import { matchesTaskSearch } from "./task";
import { tasks } from "./tasks";

export const TASK_SEARCH_QUERY_PARAM = "q" as const;

export const taskSearchQuery = atom("", "taskSearchQuery").extend(
  withSearchParams(TASK_SEARCH_QUERY_PARAM, {
    serialize: (value) => (value === "" ? undefined : value),
    replace: true,
  }),
);

export const visibleTasks = computed(() => {
  const query = taskSearchQuery();

  return tasks().filter((task) => matchesTaskSearch({ task, query }));
}, "visibleTasks");
