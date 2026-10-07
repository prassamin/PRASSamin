"use client";

import React from "react";
import { Calendar as CalendarImpl, cn } from "@heroui/react";

export interface CalendarProps extends React.ComponentProps<
  typeof CalendarImpl
> {
  "aria-label"?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  className,
  "aria-label": ariaLabel = "Choose date",
  ...props
}) => {
  return (
    <CalendarImpl
      aria-label={ariaLabel}
      className={cn(
        "[&_th]:text-muted-foreground! [[data-slot='date-picker-popover']:has(&)]:bg-muted/50! [[data-slot='date-picker-popover']:has(&)]:backdrop-blur-2xl",
        className,
      )}
      {...props}
    >
      <CalendarImpl.Header>
        <CalendarImpl.YearPickerTrigger>
          <CalendarImpl.YearPickerTriggerHeading />
          <CalendarImpl.YearPickerTriggerIndicator />
        </CalendarImpl.YearPickerTrigger>
        <CalendarImpl.NavButton slot="previous" />
        <CalendarImpl.NavButton slot="next" />
      </CalendarImpl.Header>
      <CalendarImpl.Grid>
        <CalendarImpl.GridHeader>
          {(day) => (
            <CalendarImpl.HeaderCell key={day}>{day}</CalendarImpl.HeaderCell>
          )}
        </CalendarImpl.GridHeader>
        <CalendarImpl.GridBody>
          {(date) => (
            <CalendarImpl.Cell
              key={date.toString()}
              date={date}
              className="text-foreground rounded-xl text-[13px] data-[selected='true']:text-accent-foreground data-[selected='true']:font-semibold data-[disabled='true']:opacity-25 data-[outside-month='true']:opacity-25"
            />
          )}
        </CalendarImpl.GridBody>
      </CalendarImpl.Grid>
      <CalendarImpl.YearPickerGrid>
        <CalendarImpl.YearPickerGridBody>
          {({ year }) => <CalendarImpl.YearPickerCell key={year} year={year} />}
        </CalendarImpl.YearPickerGridBody>
      </CalendarImpl.YearPickerGrid>
    </CalendarImpl>
  );
};
