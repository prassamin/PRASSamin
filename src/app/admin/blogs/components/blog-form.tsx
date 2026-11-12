"use client";

import React, { useState } from "react";
import { useMdxStudio } from "@/mdx-studio";
import { LuArrowRight, LuX, LuRefreshCw } from "react-icons/lu";
import { ImagePicker } from "@/components/image-picker";
import { cn } from "@heroui/react";

export interface BlogFormData {
  title: string;
  description: string;
  tags: string; // comma-separated string in the model
  thumbnail: string;
  banner: string;
}

type PickerTarget = Extract<keyof BlogFormData, "thumbnail" | "banner"> | null;

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
  onChange?: (data: BlogFormData) => void;
}

const MAX_TAG_LENGTH = 48;

const TagInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (tags: string) => void;
}) => {
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
    const pasted = e.clipboardData.getData("text");
    const parts = pasted
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
        placeholder={tags.length === 0 ? "Add tags… press Enter" : ""}
        className="min-w-24 w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-neutral-500 outline-none py-1"
      />
    </div>
  );
};

export const BlogForm: React.FC<BlogFormProps> = ({
  initialData,
  onChange,
}) => {
  const { goToTab } = useMdxStudio();

  const [form, setForm] = useState<BlogFormData>(() => ({
    title: initialData?.title || "",
    description: initialData?.description || "",
    tags: initialData?.tags || "",
    thumbnail: initialData?.thumbnail || "",
    banner: initialData?.banner || "",
  }));

  const [errors, setErrors] = useState<{ title?: string; tags?: string }>({});

  const [pickerFor, setPickerFor] = useState<PickerTarget>(null);

  const updateField = <K extends keyof BlogFormData>(
    key: K,
    val: BlogFormData[K],
  ) => {
    const next = { ...form, [key]: val };
    setForm(next);
    onChange?.(next);
    if (key === "title" || key === "tags") {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const tagCount = form.tags
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean).length;

  const handleContinue = () => {
    const nextErrors: { title?: string; tags?: string } = {};
    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }
    if (tagCount < 1) {
      nextErrors.tags = "Add at least one tag.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      goToTab("builder");
    }
  };

  const ImageField = ({
    target,
    label,
    hint,
    recommended,
    aspect,
  }: {
    target: NonNullable<PickerTarget>;
    label: string;
    hint: string;
    recommended: string;
    aspect: string;
  }) => {
    const value = form[target];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-neutral-300 font-inter">
            {label}
          </label>
          {value && (
            <button
              type="button"
              onClick={() => updateField(target, "")}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LuX className="w-3 h-3" /> Remove
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPickerFor(target)}
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
      </div>
    );
  };

  return (
    <div className="w-full my-auto flex flex-col items-center justify-start relative">
      <div className="w-full max-w-2xl mx-auto rounded-2xl bg-muted/40 backdrop-blur-2xl border border-foreground/6 p-6 sm:p-7 flex flex-col gap-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-2xl font-bold font-rethink text-foreground tracking-tight">
              Blog Metadata
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1 leading-relaxed">
              Step 1 of 2 — set up the post before writing the content
            </p>
          </div>
        </div>

        {/* Section: Basics */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Basics
            </span>
            <span className="h-px flex-1 bg-white/6" />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. How I built a secret-sharing tool"
              className={cn(
                "w-full h-10 px-3.5 rounded-xl bg-foreground/4 border text-xs text-foreground placeholder:text-neutral-500 focus:outline-none transition-colors",
                errors.title
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-foreground/6 focus:border-accent/60",
              )}
            />
            {errors.title && (
              <p className="text-[11px] text-red-400 font-inter mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Short summary shown on cards and in search"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Tags <span className="text-accent">*</span>
            </label>
            <div
              className={cn(
                "rounded-xl transition-colors",
                errors.tags && "ring-1 ring-red-500/50",
              )}
            >
              <TagInput
                value={form.tags}
                onChange={(tags) => updateField("tags", tags)}
              />
            </div>
            {errors.tags && (
              <p className="text-[11px] text-red-400 font-inter mt-1">
                {errors.tags}
              </p>
            )}
          </div>
        </div>

        {/* Section: Media */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Media
            </span>
            <span className="h-px flex-1 bg-white/6" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thumbnail */}
            <ImageField
              target="thumbnail"
              label="Thumbnail"
              hint="Add thumbnail"
              recommended="Recommended size 16:9"
              aspect="aspect-video"
            />

            {/* Banner */}
            <ImageField
              target="banner"
              label="Banner"
              hint="Add banner"
              recommended="Recommended size 3:1"
              aspect="aspect-video"
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-end gap-2 border-t border-white/8 pt-5">
          <button
            type="button"
            onClick={handleContinue}
            className="px-5 py-2.5 rounded-xl bg-accent text-neutral-950 font-medium text-xs hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20 active:scale-95"
          >
            <span>Continue</span>
            <LuArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image picker — shared for thumbnail & banner */}
      <ImagePicker
        isOpen={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        currentSrc={pickerFor ? form[pickerFor] : undefined}
        onSelectImage={({ src }) => {
          if (pickerFor) {
            updateField(pickerFor, src);
          }
        }}
      />
    </div>
  );
};

export default BlogForm;
