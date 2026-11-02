"use client";

import React from "react";
import { Calendar, DateField, DatePicker, Label } from "@heroui/react";
import { parseDate, type DateValue } from "@internationalized/date";

export interface HeroDateFieldProps {
  value?: string;
  onChange: (dateStr: string) => void;
  label?: string;
  isDisabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

export const HeroDateField: React.FC<HeroDateFieldProps> = ({
  value,
  onChange,
  label = "Date",
  isDisabled = false,
  className = "",
  showLabel = false,
}) => {
  // Safe date parsing to DateValue or null
  const parsedValue: DateValue | null = React.useMemo(() => {
    if (!value) return null;
    try {
      const dateOnly = String(value).split("T")[0];
      return parseDate(dateOnly);
    } catch {
      return null;
    }
  }, [value]);

  return (
    <DatePicker
      className={`w-full ${className}`}
      name="date"
      value={parsedValue}
      onChange={(date) => {
        onChange(date ? date.toString() : "");
      }}
      isDisabled={isDisabled}
      aria-label={label}
    >
      {showLabel && (
        <Label className="text-xs font-medium text-neutral-300 font-inter">
          {label}
        </Label>
      )}
      <DateField.Group fullWidth>
        <DateField.Input>
          {(segment) => (
            <DateField.Segment segment={segment} key={segment.type} />
          )}
        </DateField.Input>
        <DateField.Suffix className="mr-0">
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover className="z-50 rounded-2xl bg-neutral-900/95 border border-white/10 p-3 shadow-2xl backdrop-blur-2xl">
        <Calendar aria-label={label} className="text-white">
          <Calendar.Header className="flex items-center justify-between pb-3">
            <Calendar.YearPickerTrigger className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer">
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <div className="flex items-center gap-1">
              <Calendar.NavButton
                slot="previous"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              />
              <Calendar.NavButton
                slot="next"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              />
            </div>
          </Calendar.Header>
          <Calendar.Grid className="w-full border-collapse">
            <Calendar.GridHeader>
              {(day) => (
                <Calendar.HeaderCell
                  key={day}
                  className="text-[11px] font-mono text-neutral-500 p-1.5 text-center"
                >
                  {day}
                </Calendar.HeaderCell>
              )}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => (
                <Calendar.Cell
                  date={date}
                  key={date.toString()}
                  className="p-1.5 text-xs text-center rounded-lg hover:bg-white/10 cursor-pointer data-[selected=true]:bg-accent data-[selected=true]:text-neutral-950 font-medium transition-colors"
                />
              )}
            </Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid className="w-full">
            <Calendar.YearPickerGridBody>
              {({ year }) => (
                <Calendar.YearPickerCell
                  year={year}
                  key={year}
                  className="p-2 text-xs text-center rounded-lg hover:bg-white/10 cursor-pointer data-[selected=true]:bg-accent data-[selected=true]:text-neutral-950 transition-colors"
                />
              )}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
};
