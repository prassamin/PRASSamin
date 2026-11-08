"use client";

import React from "react";
import { ExperienceType } from "@/types";
import { LuBriefcase, LuPlus } from "react-icons/lu";
import { Button, Card, toast } from "@heroui/react";
import { ExperienceCard } from "./components/experience-card";
import { useMdxStudio } from "@/mdx-studio";
import {
  ExperienceForm,
  ExperienceFormData,
} from "./components/experience-form";
import { useRouter } from "@/hooks/useRouter";
import { useConfirm } from "@/providers/ConfirmProvider";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "./actions";

interface AdminExpViewProps {
  experiences: ExperienceType[];
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

export const AdminExpView: React.FC<AdminExpViewProps> = ({ experiences }) => {
  const router = useRouter();
  const { openStudio } = useMdxStudio();
  const { confirm } = useConfirm();

  const handleSave = async (
    id: number | null,
    meta: ExperienceFormData,
    mdx: string,
  ) => {
    if (!meta.company?.trim()) {
      throw new Error("Company / Organization name is required.");
    }
    if (!meta.role?.trim()) {
      throw new Error("Job role / Position is required.");
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
      company: meta.company.trim(),
      role: meta.role.trim(),
      start: new Date(meta.start),
      end: endDate,
      description: mdx?.trim() || "",
      companyUrl: meta.companyUrl?.trim() || null,
      companyLogo: meta.companyLogo?.trim() || null,
      location: meta.location?.trim() || null,
    };

    if (id) {
      await updateExperienceAction(id, payload);
      toast.success(`Updated "${payload.role}" successfully.`);
    } else {
      await createExperienceAction(payload);
      toast.success(`Added "${payload.role}" successfully.`);
    }

    router.refresh();
  };

  const handleOpenCreate = () => {
    let currentMeta: ExperienceFormData = {
      company: "",
      role: "",
      start: "",
      end: "",
      isCurrent: false,
      companyUrl: "",
      companyLogo: "",
      location: "",
    };

    openStudio({
      title: "Experience Studio",
      documentName: "New Position",
      initialMdx: "",
      informationSlot: (
        <ExperienceForm
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

  const handleOpenEdit = (exp: ExperienceType) => {
    let currentMeta: ExperienceFormData = {
      company: exp.company || "",
      role: exp.role || "",
      start: safeFormatDateForInput(exp.start),
      end: safeFormatDateForInput(exp.end),
      isCurrent:
        !exp.end ||
        String(exp.end).toLowerCase() === "present" ||
        (!isNaN(new Date(exp.end).getTime()) &&
          new Date(exp.end).getTime() === 0),
      companyUrl: exp.companyUrl || "",
      companyLogo: exp.companyLogo || "",
      location: exp.location || "",
    };

    openStudio({
      title: "Experience Studio",
      documentName: `${exp.role} @ ${exp.company}`,
      initialMdx: exp.description || "",
      informationSlot: (
        <ExperienceForm
          initialData={currentMeta}
          onChange={(next) => {
            currentMeta = next;
          }}
        />
      ),
      onSave: async (compiledMdx) => {
        await handleSave(exp.id, currentMeta, compiledMdx);
      },
    });
  };

  const handleDelete = async (experience: ExperienceType) => {
    try {
      await deleteExperienceAction(experience.id);
      toast.success(`Deleted "${experience.role}" successfully.`);
      router.refresh();
    } catch (err: any) {
      console.error("Delete experience error:", err);
      toast.danger(err.message || "Failed to delete experience entry.");
      throw err;
    }
  };

  return (
      <div className="space-y-6 sm:space-y-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-rethink text-white tracking-tight">
              Experiences
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 leading-relaxed">
              Manage your professional work history, roles, engineering
              achievements, and company contributions.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <Button
              type="button"
              onClick={handleOpenCreate}
              className="bg-accent text-neutral-950 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LuPlus className="w-4 h-4" />
              <span>Add Experience</span>
            </Button>
          </div>
        </div>

        {/* Experience Cards List */}
        {experiences.length === 0 ? (
          /* Empty State */
          <Card className="bg-muted/30 border border-white/8 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
              <LuBriefcase className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white font-rethink">
              No experience records yet
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 max-w-sm mx-auto leading-relaxed">
              Add your professional roles, engineering positions, or freelancing
              history to display on your portfolio.
            </p>
            <Button
              type="button"
              onClick={handleOpenCreate}
              className="mt-6 bg-accent text-neutral-950 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LuPlus className="w-4 h-4" />
              <span>Add First Experience</span>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onEdit={(item) => handleOpenEdit(item)}
                onDelete={(item) => {
                  confirm({
                    isDanger: true,
                    title: `Delete ${item.role}?`,
                    description: `Are you sure you want to delete this position at ${item.company}? This action cannot be undone.`,
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

export default AdminExpView;
