"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useMdxStudio } from "@/mdx-studio";
import { ImagePicker } from "@/components/image-picker";
import {
  LuUser,
  LuBriefcase,
  LuCamera,
  LuPencil,
  LuTrash2,
  LuLink,
  LuArrowRight,
  LuFolderOpen,
  LuUpload,
} from "react-icons/lu";
import { Spinner, toast } from "@heroui/react";
import { TestimonialCategoryType } from "@/types";
import { cn } from "@heroui/react";

export interface TestimonialFormData {
  name: string;
  role: string;
  category: TestimonialCategoryType;
  avatar: string;
}

interface TestimonialFormProps {
  initialData?: TestimonialFormData;
  onChange?: (data: TestimonialFormData) => void;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  initialData,
  onChange,
}) => {
  const { goToTab } = useMdxStudio();

  const [form, setForm] = useState<TestimonialFormData>(() => ({
    name: initialData?.name || "",
    role: initialData?.role || "",
    category: initialData?.category || "SOFTWARE_ENGINEER",
    avatar: initialData?.avatar || "",
  }));

  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);

  const updateField = <K extends keyof TestimonialFormData>(
    key: K,
    val: TestimonialFormData[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      onChange?.(next);
      return next;
    });
  };

  return (
    <div className="w-full my-auto flex flex-col items-center justify-start relative">
      <div className="w-full max-w-2xl mx-auto rounded-2xl bg-muted/40 backdrop-blur-2xl border border-foreground/6 p-6 sm:p-7 flex flex-col gap-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-rethink text-foreground tracking-tight flex items-center gap-2.5">
              <span>Testimonial Details</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1 leading-relaxed">
              Fill in client profile, affiliation, and category details
            </p>
          </div>
        </div>

        {/* Elegant Client Avatar Section */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-300 font-inter">
            Client Avatar <span className="text-accent">*</span>
          </label>

          <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/50 p-4 sm:p-5 hover:border-white/[0.14] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              {/* Interactive Avatar Frame */}
              <div className="relative group/avatar shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsImagePickerOpen(true)}
                  className={cn(
                    "relative w-20 h-20 rounded-2xl overflow-hidden border transition-all cursor-pointer shadow-md flex items-center justify-center outline-none",
                    form.avatar
                      ? "border-white/15 bg-neutral-950 hover:border-accent/60"
                      : "border-dashed border-white/20 bg-white/[0.02] hover:border-accent/50 hover:bg-white/[0.04]",
                  )}
                  title={
                    form.avatar
                      ? "Click to change avatar"
                      : "Click to select or drop image"
                  }
                >
                  {form.avatar ? (
                    <>
                      <Image
                        src={form.avatar}
                        alt="Avatar preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                      />
                      <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-xs gap-1">
                        <LuPencil className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-medium tracking-tight text-white/90">
                          Change
                        </span>
                      </div>
                    </>
                  ) : isUploading ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 text-accent p-2">
                      <Spinner size="sm" color="current" />
                      <span className="text-[10px] font-mono font-medium">
                        {uploadPercent}%
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 group-hover/avatar:text-neutral-200 transition-colors gap-1.5">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover/avatar:bg-accent/15 transition-colors">
                        <LuCamera className="w-4 h-4 text-neutral-400 group-hover/avatar:text-accent transition-colors" />
                      </div>
                      <span className="text-[10px] font-medium text-neutral-400 group-hover/avatar:text-neutral-200">
                        Upload
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* Info & Action Controls */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2.5">
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">
                    {form.avatar ? "Avatar Selected" : "Profile Picture"}
                  </h4>
                  <p className="text-xs text-neutral-400 font-inter mt-0.5">
                    {form.avatar ? (
                      <span className="font-mono text-[11px] text-neutral-400 truncate block max-w-sm sm:max-w-md">
                        {form.avatar}
                      </span>
                    ) : (
                      "Upload a square avatar or select from library. JPG, PNG or WebP (max 5MB)."
                    )}
                  </p>
                </div>

                {/* Clean Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImagePickerOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-xs font-medium text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
                  >
                    <LuFolderOpen className="w-3.5 h-3.5 text-accent" />
                    <span>Choose from Library</span>
                  </button>

                  {form.avatar ? (
                    <button
                      type="button"
                      onClick={() => updateField("avatar", "")}
                      className="px-2.5 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                      title="Remove avatar"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput((prev) => !prev)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 active:scale-95",
                        showUrlInput
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-neutral-400 hover:text-white",
                      )}
                      title="Paste URL directly"
                    >
                      <LuLink className="w-3.5 h-3.5" />
                      <span>URL</span>
                    </button>
                  )}
                </div>

                {/* Collapsible URL Input */}
                {showUrlInput && !form.avatar && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="relative flex-1">
                      <LuLink className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={form.avatar}
                        onChange={(e) => updateField("avatar", e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full h-8 pl-8 pr-3 rounded-lg bg-neutral-800/80 border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-accent font-mono"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Client / Reviewer Name <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <LuUser className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Anton Osika"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Role & Company <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <LuBriefcase className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                placeholder="e.g. Founder at Lovable"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Continue to Quote Action */}
        <div className="flex items-center justify-end pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => goToTab("builder")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-neutral-950 font-semibold text-xs hover:bg-accent/90 transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <span>Continue</span>
            <LuArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Picker Modal */}
      <ImagePicker
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentSrc={form.avatar}
        onSelectImage={(imageData) => {
          updateField("avatar", imageData.src);
          setIsImagePickerOpen(false);
        }}
        uploadLocation="pras/portfolio/testimonials"
      />
    </div>
  );
};
