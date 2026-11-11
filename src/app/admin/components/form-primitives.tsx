"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuX, LuRefreshCw, LuSearch, LuCheck } from "react-icons/lu";
import { ImagePicker } from "@/components/ImagePicker";
import { stacks, getStack } from "@/lib/stacks";
import { cn } from "@heroui/react";

/* ────────────────────────────────────────────────────────────────
 * TagInput — chip-based tag/tool input
 * ──────────────────────────────────────────────────────────────── */

const MAX_TAG_LENGTH = 48;

export const TagInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [tags, setTags] = useState<string[]>(() =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const [input, setInput] = useState("");

  const commit = (next: string[]) => {
    const clean = Array.from(new Set(next));
    setTags(clean);
    onChange(clean.join(", "));
  };

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,/g, "").slice(0, MAX_TAG_LENGTH);
    if (!tag) return;
    if (tags.includes(tag)) return;
    commit([...tags, tag]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      commit(tags.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const parts = e.clipboardData
      .getData("text")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) {
      commit([...tags, ...parts]);
      setInput("");
    }
  };

  return (
    <div className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-xl bg-foreground/4 border border-foreground/6 px-3 py-2 transition-colors focus-within:border-accent/60">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-neutral-300 shadow-sm transition-colors hover:border-white/20"
        >
          {tag}
          <button
            type="button"
            onClick={() => commit(tags.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="rounded-lg p-0.5 -mr-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
          >
            <LuX className="w-3 h-3" />
          </button>
        </span>
      ))}

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          addTag(input);
          setInput("");
        }}
        placeholder={tags.length === 0 ? "Add + press Enter" : ""}
        className="min-w-24 w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-neutral-500 outline-none py-1"
      />
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
 * StackPicker — tool input backed by the stacks registry
 * ──────────────────────────────────────────────────────────────── */

const MAX_SUGGESTIONS = 30;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const ALL_TOOLS = Object.entries(stacks)
  .map(([key, stack]) => ({
    key,
    name: stack.name,
    icon: stack.icon,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const StackPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Close only when clicking outside the whole picker (not on internal blur).
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const tools = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const commit = (next: string[]) => {
    onChange(Array.from(new Set(next)).join(", "));
  };

  const addTool = (raw: string) => {
    const tool = raw.trim().replace(/,/g, "").slice(0, MAX_TAG_LENGTH);
    if (!tool) return;
    const existing = new Set(tools.map((t) => norm(t)));
    if (!existing.has(norm(tool))) {
      commit([...tools, tool]);
    }
    setInput("");
    setHighlight(0);
    inputRef.current?.focus();
  };

  const removeTool = (name: string) => {
    commit(tools.filter((t) => norm(t) !== norm(name)));
  };

  const isSelected = (name: string) =>
    tools.some((t) => norm(t) === norm(name));

  const toggle = (name: string) => {
    if (isSelected(name)) {
      removeTool(name);
    } else {
      addTool(name);
    }
  };

  const q = norm(input);

  const visible = useMemo(() => {
    const list = ALL_TOOLS.filter(
      ({ key, name }) => !q || norm(name).includes(q) || norm(key).includes(q),
    );
    return q ? list.slice(0, MAX_SUGGESTIONS) : list;
  }, [q]);

  const safeHighlight = Math.min(highlight, Math.max(visible.length - 1, 0));

  useEffect(() => {
    itemRefs.current[safeHighlight]?.scrollIntoView({ block: "nearest" });
  }, [safeHighlight, visible.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(visible.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = visible[safeHighlight];
      if (target) {
        toggle(target.name);
      } else {
        addTool(input);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Backspace" && !input && tools.length > 0) {
      commit(tools.slice(0, -1));
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={cn(
          "flex min-h-11 w-full flex-wrap items-center gap-2 rounded-xl bg-foreground/4 border border-foreground/6 px-2 py-2 transition-colors focus-within:border-accent/60",
          open && "border-accent/40",
        )}
      >
        <AnimatePresence initial={false}>
          {tools.map((tool) => {
            const stack = getStack(tool);
            return (
              <motion.span
                key={tool}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 py-1 pr-1 pl-1.5 text-[11px] font-medium text-neutral-300 shadow-sm transition-colors hover:border-white/20"
              >
                {stack ? (
                  <stack.icon size={13} className="shrink-0" />
                ) : (
                  <span className="w-3 h-3 rounded-lg bg-white/10 grid place-items-center">
                    <LuSearch className="w-2 h-2 text-neutral-500" />
                  </span>
                )}
                <span className="max-w-36 truncate" title={tool}>
                  {tool}
                </span>
                <button
                  type="button"
                  onClick={() => removeTool(tool)}
                  aria-label={`Remove ${tool}`}
                  className="rounded-lg p-0.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                >
                  <LuX className="w-3 h-3" />
                </button>
              </motion.span>
            );
          })}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={tools.length === 0 ? "Browse or type to search…" : ""}
          className="min-w-24 w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-neutral-500 outline-none py-1"
        />

        {input ? (
          <button
            type="button"
            onClick={() => {
              setInput("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded-lg p-1 text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            <LuX className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: "top center" }}
            className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-white/5 bg-muted backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/6">
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
                {q
                  ? `${visible.length} match${visible.length === 1 ? "" : "es"}`
                  : `${ALL_TOOLS.length} tools`}
              </span>
            </div>

            {visible.length === 0 ? (
              <div className="px-4 py-7 text-center">
                <p className="text-xs text-neutral-300">
                  No registry tools match “{input}”
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Press Enter to add it as a custom tool
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap p-3 gap-2 max-h-64 overflow-y-auto">
                {visible.map((s, i) => {
                  const selected = isSelected(s.name);
                  return (
                    <button
                      key={s.key}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(s.name)}
                      className={cn(
                        "relative flex flex-col justify-center items-center gap-2.5 rounded-lg border size-22 transition-colors cursor-pointer min-w-0",
                        selected
                          ? "border-accent/40 bg-accent/10"
                          : "border-transparent hover:border-white/10 hover:bg-white/5",
                      )}
                    >
                      <s.icon size={24} className="shrink-0" />
                      <span
                        className="w-full truncate text-center text-[10px] leading-tight text-neutral-400"
                        title={s.name}
                      >
                        {s.name}
                      </span>
                      {selected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 520,
                            damping: 24,
                          }}
                          className="absolute -top-1 -right-1 grid place-items-center w-3.5 h-3.5 rounded-full bg-accent text-neutral-950 shadow"
                        >
                          <LuCheck className="w-2.5 h-2.5" strokeWidth={3.5} />
                        </motion.span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
 * ImageSelectField — self-contained picker tile
 * ──────────────────────────────────────────────────────────────── */

export const ImageSelectField: React.FC<{
  label: string;
  hint: string;
  recommended: string;
  aspect?: string;
  value: string;
  onChange: (src: string) => void;
}> = ({
  label,
  hint,
  recommended,
  aspect = "aspect-video",
  value,
  onChange,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-neutral-300 font-inter">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LuX className="w-3 h-3" /> Remove
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border text-center transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
          aspect,
          value
            ? "border-white/8 bg-foreground/4"
            : "border-dashed border-foreground/10 bg-linear-to-br from-foreground/3 to-transparent hover:border-accent/50 hover:from-accent/6",
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={`${label} preview`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-medium text-white border border-white/10">
                <LuRefreshCw className="w-3 h-3" /> Change
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3">
            <p className="text-xs font-medium text-neutral-300">{hint}</p>
            <p className="text-[10px] text-neutral-500">{recommended}</p>
          </div>
        )}
      </button>

      <ImagePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentSrc={value || undefined}
        onSelectImage={({ src }) => onChange(src)}
      />
    </div>
  );
};
