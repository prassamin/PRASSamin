"use client";

import React from "react";
import { EducationType } from "@/types";
import { LuGraduationCap, LuPlus } from "react-icons/lu";
import { Button, Card, toast } from "@heroui/react";
import { EducationCard } from "./components/education-card";
import { useMdxStudio } from "@/mdx-studio";
import { EducationForm, EducationFormData } from "./components/education-form";
import { useRouter } from "@/hooks/use-router";
import { useConfirm } from "@/providers/confirm-provider";
import {
  createEducationAction,
  updateEducationAction,
  deleteEducationAction,
} from "./actions";

interface AdminEduViewProps {
  educations: EducationType[];
}

function safeFormatDateForInput(val: any): string {
  if (!val || val === "Present") return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime()) || d.getTime() === 0) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export const AdminEduView: React.FC<AdminEduViewProps> = ({ educations }) => {
  const router = useRouter();
  const { openStudio } = useMdxStudio();
  const { confirm } = useConfirm();

  const handleSave = async (
    id: number | null,
    meta: EducationFormData,
    mdx: string,
  ) => {
    if (!meta.school?.trim()) {
      throw new Error("Institution / School name is required.");
    }
    if (!meta.degree?.trim()) {
      throw new Error("Degree / Qualification is required.");
    }
    if (!meta.field?.trim()) {
      throw new Error("Field of study is required.");
    }
    if (!meta.start || isNaN(new Date(meta.start).getTime())) {
      throw new Error("Please select a valid start date.");
    }

    let endDate: Date | null = null;
    if (!meta.isCurrent && meta.end && meta.end !== "Present") {
      const parsedEnd = new Date(meta.end);
      if (isNaN(parsedEnd.getTime())) {
        throw new Error("Please select a valid end date.");
      }
      endDate = parsedEnd;
    }

    const payload = {
      school: meta.school.trim(),
      degree: meta.degree.trim(),
      field: meta.field.trim(),
      start: new Date(meta.start),
      end: endDate,
      description: mdx?.trim() || "",
    };

    if (id) {
      await updateEducationAction(id, payload);
      toast.success(`Updated "${payload.degree}" successfully.`);
    } else {
      await createEducationAction(payload);
      toast.success(`Added "${payload.degree}" successfully.`);
    }

    router.refresh();
  };

  const handleOpenCreate = () => {
    let currentMeta: EducationFormData = {
      school: "",
      degree: "",
      field: "",
      start: "",
      end: "",
      isCurrent: false,
    };

    openStudio({
      title: "Education Studio",
      documentName: "New Credential",
      initialMdx: "",
      informationSlot: (
        <EducationForm
          initialData={currentMeta}
          onChange={(next) => {
            currentMeta = next;
          }}
        />
      ),
      onSave: async (compiledMdx) => {
        await handleSave(null, currentMeta, compiledMdx);
      },
    });
  };

  const handleOpenEdit = (edu: EducationType) => {
    let currentMeta: EducationFormData = {
      school: edu.school || "",
      degree: edu.degree || "",
      field: edu.field || "",
      start: safeFormatDateForInput(edu.start),
      end: safeFormatDateForInput(edu.end),
      isCurrent:
        !edu.end ||
        String(edu.end).toLowerCase() === "present" ||
        (!isNaN(new Date(edu.end).getTime()) &&
          new Date(edu.end).getTime() === 0),
    };

    openStudio({
      title: "Education Studio",
      documentName: edu.degree,
      initialMdx: edu.description || "",
      informationSlot: (
        <EducationForm
          initialData={currentMeta}
          onChange={(next) => {
            currentMeta = next;
          }}
        />
      ),
      onSave: async (compiledMdx) => {
        await handleSave(edu.id, currentMeta, compiledMdx);
      },
    });
  };

  const handleDelete = async (education: EducationType) => {
    try {
      await deleteEducationAction(education.id);
      toast.success(`Deleted "${education.degree}" successfully.`);
      router.refresh();
    } catch (err: any) {
      console.error("Delete education error:", err);
      toast.danger(err.message || "Failed to delete education entry.");
      throw err;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-rethink text-white tracking-tight">
            Educations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 leading-relaxed">
            Manage your academic background, degrees, certifications, and
            institutional achievements.
          </p>
        </div>

        {/* Primary Action Button (Launches Fullscreen Universal Studio) */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Button
            type="button"
            onClick={handleOpenCreate}
            className="bg-accent text-neutral-950 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Add Education</span>
          </Button>
        </div>
      </div>

      {/* Education Cards List */}
      {educations.length === 0 ? (
        /* Empty State */
        <Card className="bg-muted/30 border border-white/8 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
            <LuGraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white font-rethink">
            No education records yet
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 max-w-sm mx-auto leading-relaxed">
            Add your university degrees, diplomas, or vocational training to
            display on your portfolio.
          </p>
          <Button
            type="button"
            onClick={handleOpenCreate}
            className="mt-6 bg-accent text-neutral-950 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Add First Education</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {educations.map((edu) => (
            <EducationCard
              key={edu.id}
              education={edu}
              onEdit={(item) => handleOpenEdit(item)}
              onDelete={(item) => {
                confirm({
                  isDanger: true,
                  title: `Delete ${item.degree}?`,
                  description: `Are you sure you want to delete this education entry at ${item.school}? This action cannot be undone.`,
                  confirmText: "Delete",
                  onConfirm: async () => {
                    await handleDelete(item);
                  },
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEduView;
