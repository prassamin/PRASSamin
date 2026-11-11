"use client";

import React, { useMemo } from "react";
import {
  Select as HeroSelect,
  Label,
  ListBox,
  Description,
  FieldError,
  cn,
} from "@heroui/react";
import { LuChevronDown } from "react-icons/lu";

export interface SelectOption<T extends string | number> {
  id?: string | number;
  value?: T;
  label?: React.ReactNode;
  name?: string;
  textValue?: string;
  disabled?: boolean;
  startContent?: React.ReactNode;
}

export interface SelectProps<T extends string | number> {
  label?: React.ReactNode;
  placeholder?: string;

  value?: T;
  defaultValue?: T;

  onChange?: (value: T | null) => void;
  onValueChange?: (value: string) => void;

  options?: Array<SelectOption<T> | T>;

  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;

  isRequired?: boolean;
  isDisabled?: boolean;

  name?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  startContent?: React.ReactNode;
  children?: React.ReactNode;
}

export const Select = <T extends string | number = string>({
  label,
  placeholder = "Select one",
  value,
  defaultValue,
  onChange,
  onValueChange,
  options = [],
  className,
  triggerClassName,
  popoverClassName,
  isRequired,
  isDisabled,
  name,
  description,
  errorMessage,
  startContent,
  children,
}: SelectProps<T>) => {
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string" || typeof opt === "number") {
        return {
          id: String(opt),
          value: opt,
          label: String(opt),
          textValue: String(opt),
          disabled: false,
          startContent: undefined,
        };
      }

      const optionValue = opt.value !== undefined ? opt.value : (opt.id as T);

      const labelText = opt.label ?? opt.name ?? String(optionValue);

      return {
        id: String(optionValue),
        value: optionValue,
        label: labelText,
        textValue:
          opt.textValue ??
          (typeof labelText === "string" ? labelText : String(optionValue)),
        disabled: opt.disabled ?? false,
        startContent: opt.startContent,
      };
    });
  }, [options]);

  const handleChange = (selected: string | number | null) => {
    if (selected === null || selected === undefined) {
      onChange?.(null);
      return;
    }

    const selectedOption = normalizedOptions.find(
      (opt) => opt.id === String(selected),
    );

    if (!selectedOption) return;

    onChange?.(selectedOption.value);
    onValueChange?.(String(selectedOption.value));
  };

  const selectedValue = value !== undefined ? String(value) : undefined;

  const selectedDefaultValue =
    defaultValue !== undefined ? String(defaultValue) : undefined;

  return (
    <HeroSelect
      name={name}
      placeholder={placeholder}
      className={cn(
        "w-full",
        isRequired && "**:data-[slot=label]:after:text-accent!",
        className,
      )}
      onChange={handleChange}
      isRequired={isRequired}
      isDisabled={isDisabled}
      {...(selectedDefaultValue !== undefined
        ? { defaultValue: selectedDefaultValue }
        : {})}
      {...(selectedValue !== undefined ? { value: selectedValue } : {})}
    >
      {label && (
        <Label className="block text-xs font-medium text-neutral-300 font-inter mb-1.5">
          {label}
        </Label>
      )}

      <HeroSelect.Trigger
        className={cn(
          "w-full h-10 px-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground hover:border-foreground/10 focus:border-accent/60 transition-colors flex items-center justify-between shadow-xs outline-none cursor-pointer data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed",
          triggerClassName,
        )}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {startContent && (
            <span className="shrink-0 text-neutral-400">{startContent}</span>
          )}

          <HeroSelect.Value className="text-xs text-foreground truncate block font-inter" />
        </div>

        <HeroSelect.Indicator className="text-neutral-400 shrink-0 ml-2">
          <LuChevronDown className="w-3.5 h-3.5" />
        </HeroSelect.Indicator>
      </HeroSelect.Trigger>

      {description && (
        <Description className="text-[11px] text-neutral-400 font-inter mt-1">
          {description}
        </Description>
      )}

      {errorMessage && (
        <FieldError className="text-[11px] text-rose-400 font-inter mt-1">
          {errorMessage}
        </FieldError>
      )}

      <HeroSelect.Popover
        className={cn(
          "z-50 border shadow-2xl shadow-background bg-muted/50 backdrop-blur-2xl",
          popoverClassName,
        )}
      >
        <ListBox className="outline-none space-y-0.5">
          {children ||
            normalizedOptions.map((opt) => (
              <ListBox.Item
                key={opt.id}
                id={opt.id}
                textValue={opt.textValue}
                isDisabled={opt.disabled}
                className="px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/8 focus:bg-white/8 focus:text-white data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent font-medium flex items-center justify-between gap-2 cursor-pointer ring-offset-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.startContent && (
                    <span className="shrink-0">{opt.startContent}</span>
                  )}

                  <span className="truncate">{opt.label}</span>
                </div>

                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
        </ListBox>
      </HeroSelect.Popover>
    </HeroSelect>
  );
};

export default Select;
