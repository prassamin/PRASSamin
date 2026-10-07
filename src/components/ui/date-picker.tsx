"use client";

import React, { useMemo } from "react";
import {
  DatePicker as DatePickerImpl,
  DateField,
  Label,
  cn,
} from "@heroui/react";
import { parseDate, type DateValue } from "@internationalized/date";
import { Calendar } from "./calendar";

function parseDateValue(
  val: DateValue | string | null | undefined,
): DateValue | null | undefined {
  if (val === undefined) return undefined;
  if (val === null || val === "") return null;
  if (typeof val === "string") {
    try {
      const clean = val.split("T")[0].trim();
      return clean ? parseDate(clean) : null;
    } catch {
      return null;
    }
  }
  return val;
}

export interface DatePickerProps extends Omit<
  React.ComponentProps<typeof DatePickerImpl>,
  "value" | "defaultValue" | "onChange"
> {
  value?: DateValue | string | null;
  defaultValue?: DateValue | string | null;
  onChange?: (value: DateValue | null) => void;
  onValueChange?: (value: string) => void;
  label?: React.ReactNode;
  startContent?: React.ReactNode;
  children?: React.ReactNode;
}

export const DatePicker = ({
  value,
  defaultValue,
  onChange,
  onValueChange,
  label,
  startContent,
  className,
  children,
  isRequired,
  ...props
}: DatePickerProps) => {
  const parsedValue = useMemo(() => parseDateValue(value), [value]);
  const parsedDefaultValue = useMemo(
    () => parseDateValue(defaultValue),
    [defaultValue],
  );

  const handleChange = (date: DateValue | null) => {
    onChange?.(date);
    onValueChange?.(date ? date.toString() : "");
  };

  const controlledProps = value !== undefined ? { value: parsedValue } : {};
  const defaultProps =
    defaultValue !== undefined ? { defaultValue: parsedDefaultValue } : {};

  return (
    <DatePickerImpl
      className={cn(
        "w-full",
        isRequired && "[&_[data-slot=label]]:after:text-accent!",
        className,
      )}
      onChange={handleChange}
      isRequired={isRequired}
      {...defaultProps}
      {...controlledProps}
      {...props}
    >
      {label && !children && (
        <Label className="block text-xs font-medium text-neutral-300 font-inter">
          {label} {isRequired && <span className="text-accent">*</span>}
        </Label>
      )}
      {children}
      <DateField.Group
        fullWidth
        className="rounded-xl bg-foreground/4 border border-foreground/6 h-10 pl-2 pr-1 transition-all duration-200 focus-within:ring-0! focus-within:border-accent/50! shadow-xl"
      >
        {startContent && <DateField.Prefix>{startContent}</DateField.Prefix>}
        <DateField.Input className="text-[13px] font-inter pl-0">
          {(segment) => (
            <DateField.Segment
              key={segment.type}
              segment={segment}
              className="text-foreground focus:bg-accent/35 focus:text-accent focus:font-medium px-1 py-0.5 rounded-md transition-all duration-200 data-[type='literal']:text-muted-foreground data-[placeholder=true]:text-muted-foreground"
            />
          )}
        </DateField.Input>
        <DateField.Suffix className="mr-0">
          <DatePickerImpl.Trigger
            className={
              "text-muted-foreground hover:text-foreground hover:bg-foreground/10 p-1.5 rounded-md transition-all duration-200"
            }
          >
            <DatePickerImpl.TriggerIndicator className="text-inherit" />
          </DatePickerImpl.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePickerImpl.Popover
        className={cn("z-50 p-4 border shadow-2xl shadow-background")}
      >
        <Calendar />
      </DatePickerImpl.Popover>
    </DatePickerImpl>
  );
};
