"use client";

import React, { useState } from "react";
import { useMdxStudio } from "@/mdx-studio";
import {
  LuBriefcase,
  LuBuilding2,
  LuArrowRight,
  LuLink,
  LuMapPin,
  LuImage,
  LuX,
} from "react-icons/lu";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@heroui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { ImagePicker } from "@/components/ImagePicker";

export interface ExperienceFormData {
  company: string;
  role: string;
  start: string;
  end: string;
  isCurrent: boolean;
  companyUrl?: string;
  companyLogo?: string;
  location?: string;
}

interface ExperienceFormProps {
  initialData?: ExperienceFormData;
  onChange?: (data: ExperienceFormData) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  initialData,
  onChange,
}) => {
  const { goToTab } = useMdxStudio();

  const [form, setForm] = useState<ExperienceFormData>(() => ({
    company: initialData?.company || "",
    role: initialData?.role || "",
    start: initialData?.start || "",
    end: initialData?.end || "",
    isCurrent: initialData?.isCurrent ?? false,
    companyUrl: initialData?.companyUrl || "",
    companyLogo: initialData?.companyLogo || "",
    location: initialData?.location || "",
  }));

  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);

  const updateField = <K extends keyof ExperienceFormData>(
    key: K,
    val: ExperienceFormData[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "isCurrent" && val === true) {
        next.end = "";
      }
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
              <span>Work Experience</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1 leading-relaxed">
              Fill in your company details and timeline
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Company / Organization <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <LuBuilding2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                placeholder="e.g. Google, Stripe, Vercel"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Job Title / Position <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <LuBriefcase className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                placeholder="e.g. Senior Software Engineer, Lead Designer"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
                required
              />
            </div>
          </div>

          {/* Company Logo */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLogoPickerOpen(true)}
                className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.03] transition-colors hover:border-accent/40 hover:bg-white/[0.05] cursor-pointer"
                aria-label="Pick company logo"
              >
                {form.companyLogo ? (
                  <>
                    <img
                      src={form.companyLogo}
                      alt="Company logo"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                      <LuImage className="w-4 h-4 text-white" />
                    </span>
                  </>
                ) : (
                  <LuImage className="w-4 h-4 text-neutral-500" />
                )}
              </button>
              <div className="flex-1 space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300 font-inter">
                  Company Logo
                </label>
                <div className="relative">
                  <LuLink className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={form.companyUrl}
                    onChange={(e) => updateField("companyUrl", e.target.value)}
                    placeholder="https://company.com"
                    className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Location
            </label>
            <div className="relative">
              <LuMapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. United States, Remote"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <DatePicker
              name="start-date"
              aria-label="Start Date"
              isRequired
              value={form.start}
              onValueChange={(val) => updateField("start", val)}
              onChange={(date) =>
                updateField("start", date ? date.toString() : "")
              }
            >
              <Label className="block text-xs font-medium text-neutral-300 font-inter">
                Start Date
              </Label>
            </DatePicker>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <DatePicker
              name="end-date"
              aria-label="End Date"
              isDisabled={form.isCurrent}
              value={form.isCurrent ? "" : form.end}
              onValueChange={(val) => updateField("end", val)}
              onChange={(date) =>
                updateField("end", date ? date.toString() : "")
              }
            >
              <Label className="block text-xs font-medium text-neutral-300 font-inter">
                End Date
              </Label>
            </DatePicker>
          </div>

          {/* Is Current Checkbox */}
          <div className="sm:col-span-2 pt-1">
            <Checkbox
              isSelected={form.isCurrent}
              onChange={(v) => updateField("isCurrent", v)}
            >
              I currently work here in this role
            </Checkbox>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-end border-t border-white/[0.08] pt-5">
          <button
            type="button"
            onClick={() => goToTab("builder")}
            className="px-5 py-2.5 rounded-xl bg-accent text-neutral-950 font-medium text-xs hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20 active:scale-95"
          >
            <span>Continue</span>
            <LuArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Picker Modal */}
      <ImagePicker
        isOpen={isLogoPickerOpen}
        onClose={() => setIsLogoPickerOpen(false)}
        onSelectImage={(imageData) => {
          updateField("companyLogo", imageData.src);
          setIsLogoPickerOpen(false);
        }}
      />
    </div>
  );
};

export default ExperienceForm;
