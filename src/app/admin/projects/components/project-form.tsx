"use client";

import React, { useState } from "react";
import { useMdxStudio } from "@/mdx-studio";
import { LuFolderOpen, LuArrowRight } from "react-icons/lu";
import {
  ImageSelectField,
  StackPicker,
} from "@/app/admin/components/form-primitives";
import { cn } from "@heroui/react";

export interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  tools: string; // comma-separated string in the model
  github: string;
  live: string;
  thumbnail: string;
  banner: string;
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onChange?: (data: ProjectFormData) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onChange,
}) => {
  const { goToTab } = useMdxStudio();

  const [form, setForm] = useState<ProjectFormData>(() => ({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    tools: initialData?.tools || "",
    github: initialData?.github || "",
    live: initialData?.live || "",
    thumbnail: initialData?.thumbnail || "",
    banner: initialData?.banner || "",
  }));

  const [errors, setErrors] = useState<{ title?: string; category?: string }>(
    {},
  );

  const updateField = <K extends keyof ProjectFormData>(
    key: K,
    val: ProjectFormData[K],
  ) => {
    const next = { ...form, [key]: val };
    setForm(next);
    onChange?.(next);
    if (key === "title" || key === "category") {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleContinue = () => {
    const nextErrors: { title?: string; category?: string } = {};
    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }
    if (!form.category.trim()) {
      nextErrors.category = "Category is required.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      goToTab("builder");
    }
  };

  const inputClass = cn(
    "w-full h-10 px-3.5 rounded-xl bg-foreground/4 border text-xs text-foreground placeholder:text-neutral-500 focus:outline-none transition-colors",
  );

  return (
    <div className="w-full my-auto flex flex-col items-center justify-start relative">
      <div className="w-full max-w-2xl mx-auto rounded-2xl bg-muted/40 backdrop-blur-2xl border border-foreground/6 p-6 sm:p-7 flex flex-col gap-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold font-rethink text-foreground tracking-tight">
                Project Metadata
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1 leading-relaxed">
                Step 1 of 2 — set up the project before writing the content
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
              placeholder="e.g. EnvDrop"
              className={cn(
                inputClass,
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

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Category <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="e.g. Security, Developer Tool"
              className={cn(
                inputClass,
                errors.category
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-foreground/6 focus:border-accent/60",
              )}
            />
            {errors.category && (
              <p className="text-[11px] text-red-400 font-inter mt-1">
                {errors.category}
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
              placeholder="Short summary shown on cards"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors resize-none"
            />
          </div>

          {/* Tools */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Tools
            </label>
            <StackPicker
              value={form.tools}
              onChange={(tools) => updateField("tools", tools)}
            />
            <p className="text-[10px] text-neutral-500 font-inter">
              Click a tool to toggle it — search or type a custom one + Enter
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300 font-inter">
                GitHub link
              </label>
              <input
                type="url"
                value={form.github}
                onChange={(e) => updateField("github", e.target.value)}
                placeholder="https://github.com/…"
                className={cn(
                  inputClass,
                  "border-foreground/6 focus:border-accent/60",
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300 font-inter">
                Live link
              </label>
              <input
                type="url"
                value={form.live}
                onChange={(e) => updateField("live", e.target.value)}
                placeholder="https://…"
                className={cn(
                  inputClass,
                  "border-foreground/6 focus:border-accent/60",
                )}
              />
            </div>
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
            <ImageSelectField
              label="Thumbnail"
              hint="Add thumbnail"
              recommended="Recommended size 16:9"
              value={form.thumbnail}
              onChange={(src) => updateField("thumbnail", src)}
            />
            <ImageSelectField
              label="Banner"
              hint="Add banner"
              recommended="Recommended size 3:1"
              value={form.banner}
              onChange={(src) => updateField("banner", src)}
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
    </div>
  );
};

export default ProjectForm;
