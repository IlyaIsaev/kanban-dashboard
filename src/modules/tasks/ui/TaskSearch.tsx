import { Input } from "@base-ui/react/input";
import { css } from "@emotion/css";
import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { useCallback, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import SearchIcon from "@/common/icons/search.svg";
import {
  COLOR_ACCENT,
  COLOR_SURFACE,
  FONT_SIZE_SMALL,
  RADIUS_PILL,
  SEARCH_WIDTH,
  TEXT_BOLD,
  TEXT_REGULAR,
} from "@/common/theme/tokens";
import { taskSearchQuery } from "../model/taskSearch";

const SEARCH_DEBOUNCE_MS = 300 as const;
const COLOR_ACCENT_50 = "rgba(1, 132, 207, 0.5)" as const;

const searchClass = css({
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  width: SEARCH_WIDTH,
  maxWidth: "100%",
  height: "2.5rem",
  padding: "0 1rem",
  flexShrink: 0,
  border: "1px solid transparent",
  borderRadius: RADIUS_PILL,
  background: COLOR_SURFACE,
  color: TEXT_REGULAR,
  transition: "border-color 300ms ease-in-out, box-shadow 300ms ease-in-out",
  "&:hover, &:focus-within": {
    borderColor: COLOR_ACCENT,
  },
  "&:focus-within": {
    boxShadow: `0 0 0 4px ${COLOR_ACCENT_50}`,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

const searchIconClass = css({
  display: "block",
  width: "1.5rem",
  height: "1.5rem",
  flexShrink: 0,
});

const searchInputClass = css({
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  padding: 0,
  border: "none",
  background: "transparent",
  color: TEXT_BOLD,
  fontFamily: "inherit",
  fontSize: FONT_SIZE_SMALL,
  outline: "none",
  "&::placeholder": {
    color: TEXT_REGULAR,
  },
  "&::-webkit-search-decoration, &::-webkit-search-cancel-button": {
    appearance: "none",
  },
});

export const TaskSearch = reatomComponent(() => {
  const committed = taskSearchQuery();
  const [draft, setDraft] = useState(committed);

  const setQuery = useCallback((value: string) => {
    wrap(() => {
      taskSearchQuery.set(value);
    })();
  }, []);

  const commitQuery = useDebounceCallback(setQuery, SEARCH_DEBOUNCE_MS);

  return (
    <div className={searchClass}>
      <SearchIcon
        className={searchIconClass}
        aria-hidden="true"
        focusable="false"
      />
      <Input
        className={searchInputClass}
        type="search"
        value={draft}
        placeholder="поиск..."
        aria-label="Поиск задач"
        autoComplete="off"
        onValueChange={(value) => {
          setDraft(value);
          commitQuery(value);
        }}
      />
    </div>
  );
}, "TaskSearch");
