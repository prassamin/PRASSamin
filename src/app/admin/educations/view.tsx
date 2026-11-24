"use client";

import React, { useState } from "react";
import { EducationType } from "@/types";
import { LuGraduationCap, LuPlus } from "react-icons/lu";
import { Button, Card, toast } from "@heroui/react";
import { EducationCard } from "./components/education-card";
import { useMdxStudio } from "@/mdx-studio";
import { EducationForm, EducationFormData } from "./components/education-form";
import { useRouter } from "@/hooks/use-router";
import { useConfirm } from "@/providers/confirm-provider";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import {
  createEducationAction,
  updateEducationAction,
  deleteEducationAction,
  deleteEducationDraftAction,
} from "./actions";
import { EducationDiffModal, EducationDraftData } from "./components/education-diff-modal";

export interface EducationDraftItem {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data: EducationDraftData;
}

interface AdminEduViewProps {
  educations: EducationType[];
  drafts?: EducationDraftItem[];
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

export const AdminEduView: React.FC<AdminEduViewProps> = ({
  educations,
  drafts = [],
}) => {
  const router = useRouter();
  const { openStudio } = useMdxStudio();
  const { confirm } = useConfirm();

  // Enable real-time sync for education drafts
  useRealtimeSync({
    type: "education",
    intervalMs: 3000,
    toastMessage: false
  });

  // State for line-by-line diff modal
  const [diffTarget, setDiffTarget] = useState<{
    published: EducationType;
    draft: EducationDraftItem;
  } | null>(null);

  // Split drafts into:
  // 1. Revision drafts (has targetId matching a published education)
  // 2. Standalone new drafts (no targetId)
  const revisionDraftsByTargetId = new Map<number, EducationDraftItem>();
  const standaloneDrafts: EducationDraftItem[] = [];

  for (const draft of drafts) {
    const targetId = draft.data?.targetId;
    if (typeof targetId === "number" && targetId > 0) {
      revisionDraftsByTargetId.set(targetId, draft);
    } else {
      standaloneDrafts.push(draft);
    }
  }

  const handleSave = async (
    id: number | null,
    meta: EducationFormData,
    mdx: string,
    associatedDraftId?: string,
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

    // Clean up draft if this was published from a draft
    if (associatedDraftId) {
      try {
        await deleteEducationDraftAction(associatedDraftId);
      } catch {
        // non-blocking
      }
    }

    router.refresh();
  };

  const handleOpenDraftReview = (draft: EducationDraftItem) => {
    const data = draft.data || {};
    let currentMeta: EducationFormData = {
      school: data.school || "",
      degree: data.degree || "",
      field: data.field || "",
      start: safeFormatDateForInput(data.start),
      end: safeFormatDateForInput(data.end),
      isCurrent: !data.end || String(data.end).toLowerCase() === "present",
    };

    openStudio({
      title: "Review Education Draft",
      documentName: currentMeta.degree || "Draft Review",
      initialMdx: data.description || "",
      informationSlot: (
        <EducationForm
          initialData={currentMeta}
          onChange={(next) => {
            currentMeta = next;
          }}
        />
      ),
      onSave: async (compiledMdx) => {
        await handleSave(null, currentMeta, compiledMdx, draft.id);
      },
    });
  };

  const handleDeleteDraft = async (draft: EducationDraftItem) => {
    try {
      await deleteEducationDraftAction(draft.id);
      toast.success("Draft discarded.");
      router.refresh();
    } catch (err: any) {
      console.error("Delete draft error:", err);
      toast.danger(err.message || "Failed to delete draft.");
    }
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

  const handleAcceptRevision = async (
    targetEdu: EducationType,
    draft: EducationDraftItem,
    customDescription?: string,
  ) => {
    try {
      const data = draft.data || {};
      const school = (data.school || targetEdu.school).trim();
      const degree = (data.degree || targetEdu.degree).trim();
      const field = (data.field || targetEdu.field).trim();
      const start = data.start ? new Date(data.start) : targetEdu.start;

      let end: Date | null = null;
      if (data.end !== undefined) {
        if (data.end && data.end !== "Present") {
          const parsed = new Date(data.end);
          if (!isNaN(parsed.getTime())) end = parsed;
        }
      } else if (targetEdu.end) {
        end = new Date(targetEdu.end);
      }

      const description =
        customDescription !== undefined
          ? customDescription
          : (data.description !== undefined
              ? data.description
              : targetEdu.description) || "";

      await updateEducationAction(targetEdu.id, {
        school,
        degree,
        field,
        start,
        end,
        description,
      });

      await deleteEducationDraftAction(draft.id);
      toast.success(`Accepted AI changes for "${degree}".`);
      router.refresh();
    } catch (err: any) {
      console.error("Failed to accept revision draft:", err);
      toast.danger(err.message || "Failed to apply changes.");
      throw err;
    }
  };

  const handleOpenStudioForRevision = (
    targetEdu: EducationType,
    draft: EducationDraftItem,
    overrideDescription?: string,
  ) => {
    const data = draft.data || {};
    let currentMeta: EducationFormData = {
      school: data.school ?? targetEdu.school,
      degree: data.degree ?? targetEdu.degree,
      field: data.field ?? targetEdu.field,
      start: safeFormatDateForInput(data.start ?? targetEdu.start),
      end: safeFormatDateForInput(data.end ?? targetEdu.end),
      isCurrent:
        data.end === null ||
        data.end === "Present" ||
        (!data.end && !targetEdu.end),
    };

    const initialMdx =
      overrideDescription !== undefined
        ? overrideDescription
        : data.description !== undefined
          ? data.description
          : targetEdu.description || "";

    openStudio({
      title: "Review & Edit AI Revision",
      documentName: currentMeta.degree,
      initialMdx,
      informationSlot: (
        <EducationForm
          initialData={currentMeta}
          onChange={(next) => {
            currentMeta = next;
          }}
        />
      ),
      onSave: async (compiledMdx) => {
        await handleSave(targetEdu.id, currentMeta, compiledMdx, draft.id);
      },
    });
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
      {educations.length === 0 && drafts.length === 0 ? (
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
          {/* Standalone drafts (brand new items) rendered at top with amber draft indicator */}
          {standaloneDrafts.map((draft) => {
            const data = draft.data || {};
            const startStr = data.start ? String(data.start).split("T")[0] : "";
            const endStr = data.end ? String(data.end).split("T")[0] : "Present";
            const draftEdu: EducationType = {
              id: -1, // sentinel
              school: data.school || "Untitled Institution",
              degree: data.degree || "Untitled Degree",
              field: data.field || "",
              description: data.description || "",
              period: startStr ? `${startStr} — ${endStr}` : "Draft",
              start: data.start ? new Date(data.start) : new Date(),
              end: data.end ? new Date(data.end) : undefined,
              created_at: new Date(draft.createdAt),
              updated_at: new Date(draft.updatedAt),
            };

            return (
              <EducationCard
                key={`draft-${draft.id}`}
                education={draftEdu}
                isDraft={true}
                onEdit={() => handleOpenDraftReview(draft)}
                onDelete={() => {
                  confirm({
                    isDanger: true,
                    title: `Discard Draft?`,
                    description: `Are you sure you want to discard the draft for ${draftEdu.degree} at ${draftEdu.school}?`,
                    confirmText: "Discard",
                    onConfirm: async () => {
                      await handleDeleteDraft(draft);
                    },
                  });
                }}
              />
            );
          })}

          {/* Published education records with AI Revision Detection */}
          {educations.map((edu) => {
            const revisionDraft = revisionDraftsByTargetId.get(edu.id);

            return (
              <EducationCard
                key={edu.id}
                education={edu}
                isDraft={false}
                hasRevisionDraft={Boolean(revisionDraft)}
                onReviewRevision={() => {
                  if (revisionDraft) {
                    setDiffTarget({ published: edu, draft: revisionDraft });
                  }
                }}
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
            );
          })}
        </div>
      )}

      {/* Line-by-Line Visual Diff Review Modal with Granular Segment Accept */}
      {diffTarget && (
        <EducationDiffModal
          isOpen={Boolean(diffTarget)}
          onClose={() => setDiffTarget(null)}
          published={diffTarget.published}
          draftId={diffTarget.draft.id}
          draftData={diffTarget.draft.data}
          onAcceptAll={async () => {
            await handleAcceptRevision(diffTarget.published, diffTarget.draft);
          }}
          onAcceptCustom={async (customDescription) => {
            await handleAcceptRevision(
              diffTarget.published,
              diffTarget.draft,
              customDescription,
            );
          }}
          onRejectAll={async () => {
            await handleDeleteDraft(diffTarget.draft);
          }}
          onEditInStudio={(currentDesc) => {
            handleOpenStudioForRevision(
              diffTarget.published,
              diffTarget.draft,
              currentDesc,
            );
          }}
        />
      )}
    </div>
  );
};

export default AdminEduView;
