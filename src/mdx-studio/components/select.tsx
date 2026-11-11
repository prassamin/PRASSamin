"use client";

import React from "react";
import { Select as SelectImpl, ListBox, ListBoxItem } from "@heroui/react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  isDisabled = false,
  className = "",
}) => {
  return (
    <SelectImpl.Root
      selectedKey={value ? String(value) : undefined}
      onSelectionChange={(key) => {
        if (key !== null && key !== undefined) {
          onChange(String(key));
        }
      }}
      isDisabled={isDisabled}
      className={`w-full ${className}`}
      placeholder={placeholder}
    >
      <SelectImpl.Trigger className="w-full justify-between rounded-xl bg-white/4 border border-white/10 px-3.5 py-2 text-xs text-white hover:bg-white/8 transition-colors focus:border-accent">
        <SelectImpl.Value />
        <SelectImpl.Indicator className="text-neutral-400" />
      </SelectImpl.Trigger>
      <SelectImpl.Popover
        className="z-50 min-w-(--trigger-width) max-h-60 overflow-y-auto overscroll-contain rounded-xl bg-neutral-900 border border-white/10 p-1 shadow-2xl backdrop-blur-xl touch-pan-y"
        style={{ maxHeight: "240px" }}
      >
        <ListBox className="outline-none space-y-0.5">
          {options.map((opt) => (
            <ListBoxItem
              key={opt.value}
              id={opt.value}
              textValue={opt.label}
              className="px-3 py-2 text-xs rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 cursor-pointer outline-none transition-colors data-[selected=true]:text-accent data-[selected=true]:bg-accent/10"
            >
              {opt.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </SelectImpl.Popover>
    </SelectImpl.Root>
  );
};
