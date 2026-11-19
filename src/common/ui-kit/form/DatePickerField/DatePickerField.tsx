import { DatePicker } from "@cloudflare/kumo/components/date-picker";
import { Popover } from "@cloudflare/kumo/components/popover";
import { css } from "@emotion/css";
import { InputMask, type MaskOptions } from "@react-input/mask";
import { type KeyboardEvent, useRef, useState } from "react";
import { fieldInputClass } from "@/common/theme/controls";
import {
  COLOR_ACCENT,
  COLOR_OVERLAY,
  COLOR_SURFACE_STRONG,
  RADIUS_CARD,
  TEXT_BOLD,
} from "@/common/theme/tokens";

export type DatePickerFieldProps = {
  readonly value: string;
  readonly "aria-label": string;
  readonly placeholder?: string;
  readonly parseDate: (value: string) => Date | undefined;
  readonly formatDate: (date: Date) => string;
  readonly onValueChange: (value: string) => void;
  readonly onBlur: () => void;
  readonly onFocus: () => void;
};

const DATE_INPUT_MASK = {
  mask: "dd.mm.yyyy",
  replacement: { d: /\d/, m: /\d/, y: /\d/ },
} as const satisfies MaskOptions;

const fieldClass = css({
  minWidth: 0,
  width: "100%",
});

const popupClass = css({
  padding: "0.75rem",
  borderRadius: RADIUS_CARD,
  background: COLOR_OVERLAY,
  color: TEXT_BOLD,
  border: `1px solid ${COLOR_SURFACE_STRONG}`,
  "--color-kumo-brand": COLOR_ACCENT,
  "--color-kumo-brand-hover": COLOR_ACCENT,
  "--color-kumo-focus": COLOR_ACCENT,
});

export function DatePickerField({
  value,
  placeholder,
  parseDate,
  formatDate,
  onValueChange,
  onBlur,
  onFocus,
  "aria-label": ariaLabel,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLInputElement | null>(null);

  const selected = parseDate(value);

  return (
    <div className={fieldClass}>
      <InputMask
        mask={DATE_INPUT_MASK.mask}
        replacement={DATE_INPUT_MASK.replacement}
        ref={anchorRef}
        className={fieldInputClass}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        inputMode="numeric"
        spellCheck={false}
        aria-label={ariaLabel}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        onFocus={() => {
          setIsOpen(true);

          onFocus();
        }}
        onBlur={onBlur}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Escape" && isOpen) {
            event.stopPropagation();

            setIsOpen(false);
          }
        }}
      />
      <Popover.Root
        open={isOpen}
        modal={false}
        onOpenChange={(open, eventDetails) => {
          if (
            !open &&
            eventDetails.reason === "outside-press" &&
            eventDetails.event.target instanceof Node &&
            anchorRef.current?.contains(eventDetails.event.target)
          ) {
            eventDetails.cancel();

            return;
          }

          setIsOpen(open);

          if (!open && eventDetails.reason === "escape-key") {
            eventDetails.event.stopPropagation();
          }
        }}
      >
        <Popover.Portal>
          <Popover.Positioner
            side="bottom"
            align="start"
            positionMethod="fixed"
            anchor={anchorRef}
          >
            <Popover.Popup
              className={popupClass}
              initialFocus={false}
              finalFocus={false}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
            >
              <DatePicker
                mode="single"
                selected={selected}
                defaultMonth={selected}
                onChange={(date: Date | undefined) => {
                  if (date === undefined) {
                    return;
                  }

                  onValueChange(formatDate(date));

                  setIsOpen(false);
                }}
              />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
