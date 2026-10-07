"use client";

import * as React from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { cn } from "@heroui/react";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type ObjectOption = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
};

export type SegmentedControlOption = string | ObjectOption;

type NormalizedOption<T extends string> = {
  label: React.ReactNode;
  value: T;
  disabled?: boolean;
};

/**
 * Type-level slugification.
 *
 * Examples:
 * "Multiple Mode"       -> "multiple-mode"
 * "Open Source Projects" -> "open-source-projects"
 * "Single / Multiple"   -> "single-multiple"
 */

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Letter =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

type AlphaNumeric = Letter | Uppercase<Letter> | Digit;

type IsAlphaNumeric<C extends string> = C extends AlphaNumeric ? true : false;

type Slugify<
  S extends string,
  Output extends string = "",
  SeparatorPending extends boolean = false,
> = string extends S
  ? string
  : S extends `${infer Char}${infer Rest}`
    ? IsAlphaNumeric<Char> extends true
      ? Slugify<
          Rest,
          `${Output}${SeparatorPending extends true
            ? Output extends ""
              ? ""
              : "-"
            : ""}${Lowercase<Char>}`,
          false
        >
      : Slugify<Rest, Output, Output extends "" ? false : true>
    : Output;

/** Extracts the value type from a string or object option. */
type OptionValue<O> = O extends string
  ? Slugify<O>
  : O extends { value: infer V extends string }
    ? V
    : never;

type BaseProps<O extends readonly SegmentedControlOption[]> = {
  options: O;
  disabled?: boolean;
  required?: boolean;
  loop?: boolean;
  fullWidth?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
  classNames?: {
    root?: string;
    list?: string;
    option?: string;
    indicator?: string;
  };
  size?: "sm" | "md" | "lg";
  onValueChange?: (value: OptionValue<O[number]>) => void;
};

export type ControlledSegmentedControlProps<
  O extends readonly SegmentedControlOption[],
> = BaseProps<O> & {
  value: OptionValue<O[number]>;
  defaultValue?: never;
};

export type UncontrolledSegmentedControlProps<
  O extends readonly SegmentedControlOption[],
> = BaseProps<O> & {
  value?: undefined;
  defaultValue?: OptionValue<O[number]>;
};

export type SegmentedControlProps<
  O extends readonly SegmentedControlOption[] =
    readonly SegmentedControlOption[],
> = ControlledSegmentedControlProps<O> | UncontrolledSegmentedControlProps<O>;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const SIZE_CLASSES = {
  sm: {
    root: "rounded-lg p-0.5",
    option: "rounded-md px-2.5 py-1 text-xs",
  },
  md: {
    root: "rounded-xl p-0.5",
    option: "rounded-lg px-3 py-1.5 text-xs",
  },
  lg: {
    root: "rounded-xl p-1",
    option: "rounded-lg px-4 py-2 text-sm",
  },
} as const;

/**
 * Converts a string into a lowercase, hyphen-separated slug.
 *
 * "Multiple Mode"        -> "multiple-mode"
 * "Open Source Projects" -> "open-source-projects"
 * "Single / Multiple"    -> "single-multiple"
 */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeOptions<const O extends readonly SegmentedControlOption[]>(
  options: O,
): NormalizedOption<OptionValue<O[number]>>[] {
  return options.map((option) => {
    if (typeof option !== "string") {
      return option;
    }

    return {
      label: option,
      value: slugify(option),
    };
  }) as NormalizedOption<OptionValue<O[number]>>[];
}

function isSelectable<T extends string>(option: NormalizedOption<T>): boolean {
  return !option.disabled;
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export function SegmentedControl<
  const O extends readonly SegmentedControlOption[],
>(props: SegmentedControlProps<O>) {
  type Value = OptionValue<O[number]>;

  const {
    options,
    disabled = false,
    required = false,
    loop = true,
    fullWidth = false,
    name,
    id,
    className,
    classNames,
    size = "md",
    onValueChange,
  } = props;

  const isControlled = props.value !== undefined;

  const normalizedOptions = React.useMemo(
    () => normalizeOptions(options),
    [options],
  );

  const [internalValue, setInternalValue] = React.useState<Value | undefined>(
    () => {
      if (props.defaultValue !== undefined) {
        return props.defaultValue;
      }

      return normalizedOptions.find(isSelectable)?.value;
    },
  );

  const value: Value | undefined = isControlled ? props.value : internalValue;

  const generatedId = React.useId();
  const groupId = id ?? generatedId;
  const shouldReduceMotion = useReducedMotion();

  const buttonRefs = React.useRef(new Map<Value, HTMLButtonElement>());

  const enabledOptions = React.useMemo(
    () => normalizedOptions.filter(isSelectable),
    [normalizedOptions],
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === value && isSelectable(option),
  );

  const activeValue = selectedOption?.value;
  const hasSelection = activeValue !== undefined;

  /* Keep uncontrolled selection valid when options change. */
  React.useEffect(() => {
    if (isControlled) return;

    const currentIsValid = normalizedOptions.some(
      (option) => option.value === internalValue && isSelectable(option),
    );

    if (currentIsValid) return;

    setInternalValue(normalizedOptions.find(isSelectable)?.value);
  }, [isControlled, normalizedOptions, internalValue]);

  const selectValue = React.useCallback(
    (nextValue: Value) => {
      if (disabled) return;

      const option = normalizedOptions.find((item) => item.value === nextValue);

      if (!option || !isSelectable(option)) return;

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      if (nextValue !== value) {
        onValueChange?.(nextValue);
      }
    },
    [disabled, isControlled, normalizedOptions, onValueChange, value],
  );

  const focusOption = React.useCallback(
    (nextValue: Value) => {
      buttonRefs.current.get(nextValue)?.focus();
      selectValue(nextValue);
    },
    [selectValue],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, currentValue: Value) => {
      if (disabled || enabledOptions.length === 0) return;

      const currentIndex = enabledOptions.findIndex(
        (option) => option.value === currentValue,
      );

      if (currentIndex === -1) return;

      let nextIndex: number;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextIndex =
            currentIndex + 1 >= enabledOptions.length
              ? loop
                ? 0
                : currentIndex
              : currentIndex + 1;
          break;

        case "ArrowLeft":
        case "ArrowUp":
          nextIndex =
            currentIndex - 1 < 0
              ? loop
                ? enabledOptions.length - 1
                : currentIndex
              : currentIndex - 1;
          break;

        case "Home":
          nextIndex = 0;
          break;

        case "End":
          nextIndex = enabledOptions.length - 1;
          break;

        default:
          return;
      }

      event.preventDefault();

      const nextOption = enabledOptions[nextIndex];

      if (nextOption) {
        focusOption(nextOption.value);
      }
    },
    [disabled, enabledOptions, focusOption, loop],
  );

  const sizes = SIZE_CLASSES[size];

  return (
    <MotionConfig reducedMotion="user">
      <div
        id={groupId}
        role="radiogroup"
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        aria-disabled={disabled || undefined}
        aria-required={required || undefined}
        className={cn(
          "inline-flex min-w-0 items-center",
          "overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "border border-white/2 bg-white/[0.04]",
          sizes.root,
          fullWidth && "flex w-full",
          disabled && "cursor-not-allowed opacity-50",
          className,
          classNames?.root,
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-0.5",
            fullWidth && "w-full",
            classNames?.list,
          )}
        >
          {normalizedOptions.map((option) => {
            const isSelected = option.value === activeValue;
            const isDisabled = disabled || !!option.disabled;

            return (
              <button
                key={option.value}
                ref={(node) => {
                  if (node) {
                    buttonRefs.current.set(option.value, node);
                  } else {
                    buttonRefs.current.delete(option.value);
                  }
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={isDisabled || undefined}
                tabIndex={
                  isSelected
                    ? 0
                    : !hasSelection && enabledOptions[0]?.value === option.value
                      ? 0
                      : -1
                }
                disabled={isDisabled}
                onClick={() => selectValue(option.value)}
                onKeyDown={(event) => handleKeyDown(event, option.value)}
                className={cn(
                  "relative isolate flex shrink-0 items-center justify-center",
                  "select-none whitespace-nowrap font-medium outline-none",
                  "transition-colors duration-150",
                  "focus-visible:ring-2 focus-visible:ring-white/40",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                  "disabled:pointer-events-none disabled:cursor-not-allowed",
                  sizes.option,
                  fullWidth && "flex-1",
                  isSelected
                    ? "text-white"
                    : "text-neutral-400 hover:text-white",
                  classNames?.option,
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId={`${groupId}-indicator`}
                    aria-hidden="true"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 400,
                            damping: 38,
                          }
                    }
                    className={cn(
                      "absolute inset-0 -z-10 rounded-[inherit]",
                      "bg-white/[0.12] shadow-[0_1px_2px_rgba(0,0,0,0.18)]",
                      classNames?.indicator,
                    )}
                  />
                )}

                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>

        {name && (
          <input
            type="hidden"
            name={name}
            value={value ?? ""}
            disabled={disabled}
          />
        )}
      </div>
    </MotionConfig>
  );
}

SegmentedControl.displayName = "SegmentedControl";
