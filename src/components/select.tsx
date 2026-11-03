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
import { LuCheck, LuChevronDown } from "react-icons/lu";

export interface SelectOption {
  id?: string | number;
  value?: string | number;
  label?: React.ReactNode;
  name?: string;
  textValue?: string;
  disabled?: boolean;
  startContent?: React.ReactNode;
}

export interface SelectProps {
  label?: React.ReactNode;
  placeholder?: string;
  value?: any;
  defaultValue?: any;
  onChange?: (value: any) => void;
  onValueChange?: (value: string) => void;
  options?: Array<SelectOption | string>;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  fullWidth?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  name?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  startContent?: React.ReactNode;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
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
  fullWidth = true,
  isRequired,
  isDisabled,
  name,
  description,
  errorMessage,
  startContent,
  children,
}) => {
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string" || typeof opt === "number") {
        return {
          id: String(opt),
          value: String(opt),
          label: String(opt),
          textValue: String(opt),
          disabled: false,
          startContent: undefined,
        };
      }
      const val =
        opt.value !== undefined ? String(opt.value) : String(opt.id ?? "");
      const labelText = opt.label ?? opt.name ?? val;
      const textVal =
        opt.textValue ?? (typeof labelText === "string" ? labelText : val);

      return {
        id: val,
        value: val,
        label: labelText,
        textValue: textVal,
        disabled: opt.disabled ?? false,
        startContent: opt.startContent,
      };
    });
  }, [options]);

  const handleChange = (selected: any) => {
    onChange?.(selected);
    if (onValueChange && selected !== null && selected !== undefined) {
      onValueChange(String(selected));
    }
  };

  const controlledProps = value !== undefined ? { value } : {};
  const defaultProps = defaultValue !== undefined ? { defaultValue } : {};

  return (
    <HeroSelect
      name={name}
      placeholder={placeholder}
      className={cn(
        "w-full",
        isRequired && "[&_[data-slot=label]]:after:text-accent!",
        className,
      )}
      onChange={handleChange}
      isRequired={isRequired}
      isDisabled={isDisabled}
      {...defaultProps}
      {...controlledProps}
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
                className="px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.08] focus:bg-white/[0.08] focus:text-white data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent font-medium flex items-center justify-between gap-2 cursor-pointer transition-colors outline-none select-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.startContent && (
                    <span className="shrink-0">{opt.startContent}</span>
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>
                <ListBox.ItemIndicator></ListBox.ItemIndicator>
              </ListBox.Item>
            ))}
        </ListBox>
      </HeroSelect.Popover>
    </HeroSelect>
  );
};

export default Select;
