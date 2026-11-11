"use client";

import React, { useState } from "react";
import { useMdxStudio } from "@/mdx-studio";
import { LuSchool, LuArrowRight } from "react-icons/lu";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@heroui/react";
import { Checkbox } from "@/components/ui/checkbox";

export interface EducationFormData {
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  isCurrent: boolean;
}

interface EducationFormProps {
  initialData?: EducationFormData;
  onChange?: (data: EducationFormData) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  initialData,
  onChange,
}) => {
  const { goToTab } = useMdxStudio();

  const [form, setForm] = useState<EducationFormData>(() => ({
    school: initialData?.school || "",
    degree: initialData?.degree || "",
    field: initialData?.field || "",
    start: initialData?.start || "",
    end: initialData?.end || "",
    isCurrent: initialData?.isCurrent ?? false,
  }));

  const updateField = <K extends keyof EducationFormData>(
    key: K,
    val: EducationFormData[K],
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
        <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-rethink text-foreground tracking-tight flex items-center gap-2.5">
              <span>Academic Credential</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1 leading-relaxed">
              Fill in your degree details and timeline
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* School */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Institution / University <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <LuSchool className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={form.school}
                onChange={(e) => updateField("school", e.target.value)}
                placeholder="e.g. Uttara University, Harvard, MIT"
                className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
                required
              />
            </div>
          </div>

          {/* Degree */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Degree / Qualification <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={form.degree}
              onChange={(e) => updateField("degree", e.target.value)}
              placeholder="e.g. Bachelor of Science, Diploma"
              className="w-full h-10 px-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
              required
            />
          </div>

          {/* Field of Study */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 font-inter">
              Field of Study / Major <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={form.field}
              onChange={(e) => updateField("field", e.target.value)}
              placeholder="e.g. Computer Science, Software Eng."
              className="w-full h-10 px-3.5 rounded-xl bg-foreground/4 border border-foreground/6 text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 transition-colors"
              required
            />
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
              I am currently studying here
            </Checkbox>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-end border-t border-white/8 pt-5">
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
    </div>
  );
};

export default EducationForm;
