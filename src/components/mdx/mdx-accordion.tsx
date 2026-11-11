"use client";

import React, {
  createContext,
  useContext,
  useState,
  useId,
  useCallback,
} from "react";
import { LuChevronDown as ChevronDown } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@heroui/react";

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (id: string) => void;
  isMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface MdxAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  allowMultiple?: boolean;
  defaultValue?: string | string[];
  children?: React.ReactNode;
}

export const MdxAccordion = ({
  children,
  className,
  type,
  allowMultiple,
  defaultValue,
  ...props
}: MdxAccordionProps) => {
  const isMultiple =
    type !== undefined
      ? type === "multiple"
      : allowMultiple !== undefined
        ? Boolean(allowMultiple)
        : true;

  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (defaultValue) {
      const initial = Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue];
      return isMultiple ? initial : initial.slice(0, 1);
    }
    return [];
  });

  // If switched to single mode dynamically, collapse to at most 1 item
  React.useEffect(() => {
    if (!isMultiple && openItems.length > 1) {
      setOpenItems((prev) => (prev.length > 0 ? [prev[0]] : []));
    }
  }, [isMultiple, openItems.length]);

  const toggleItem = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const isOpen = prev.includes(id);
        if (isMultiple) {
          return isOpen ? prev.filter((i) => i !== id) : [...prev, id];
        } else {
          return isOpen ? [] : [id];
        }
      });
    },
    [isMultiple],
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, isMultiple }}>
      <div
        className={cn("my-6 space-y-3 w-full max-w-none", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export interface MdxAccordionItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: React.ReactNode;
  id?: string;
  value?: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

export const MdxAccordionItem = ({
  title,
  children,
  id,
  value,
  defaultOpen = false,
  className,
  ...props
}: MdxAccordionItemProps) => {
  const autoId = useId();
  const itemId = id || value || (typeof title === "string" ? title : autoId);

  const context = useContext(AccordionContext);
  const [localOpen, setLocalOpen] = useState(defaultOpen);

  const isOpen = context ? context.openItems.includes(itemId) : localOpen;

  const handleToggle = () => {
    if (context) {
      context.toggleItem(itemId);
    } else {
      setLocalOpen((prev) => !prev);
    }
  };

  return (
    <div
      className={cn(
        "group rounded-2xl border transition-all duration-300 overflow-hidden",
        isOpen
          ? "border-accent/40 bg-accent/2 shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_15px_rgba(112,255,195,0.06)]"
          : "border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/3.5",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="not-prose w-full flex items-center justify-between gap-4 px-5 py-4 text-left select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <span
          className={cn(
            "font-rethink text-sm sm:text-base font-semibold tracking-tight transition-colors",
            isOpen ? "text-white" : "text-white/85 group-hover:text-white",
          )}
        >
          {title}
        </span>

        {/* Circular indicator pill */}
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
            isOpen
              ? "bg-accent/15 text-accent rotate-180 ring-1 ring-accent/30"
              : "bg-white/5 text-neutral-400 group-hover:bg-white/10 group-hover:text-white",
          )}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="accordion-content-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 text-sm text-neutral-300 font-inter leading-relaxed border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Compound compatibility mappings to handle legacy or alternative subcomponents
Object.assign(MdxAccordion, {
  Item: MdxAccordionItem,
  Heading: ({ children }: any) => <>{children}</>,
  Trigger: ({ children }: any) => <>{children}</>,
  Indicator: () => null,
  Panel: ({ children }: any) => <>{children}</>,
  Body: ({ children }: any) => <>{children}</>,
});

export default MdxAccordion;
