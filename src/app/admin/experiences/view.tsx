"use client";

import React, { useState } from "react";
import { ExperienceType } from "@/types";
import {
  LuBriefcase,
  LuPlus,
  LuBuilding2,
  LuMapPin,
  LuGlobe,
  LuCalendar,
} from "react-icons/lu";
import { Button, Card, toast } from "@heroui/react";
import { ExperienceCard } from "./components/experience-card";
import { useMdxStudio } from "@/mdx-studio";
import {
  ExperienceForm,
  ExperienceFormData,
} from "./components/experience-form";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/providers/confirm-provider";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
  deleteExperienceDraftAction,
} from "./actions";
import {
  RevisionDiffModal,
  DiffMetadataProperty,
} from "@/components/revision-diff-modal";

export interface ExperienceDraftData {
  targetId?: number;
  company?: string;
  role?: string;
  start?: string;
  end?: string | null;
  location?: string | null;
  companyUrl?: string | null;
  companyLogo?: string | null;
  description?: string;
}

export interface ExperienceDraftItem {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data: ExperienceDraftData;
}

interface AdminExpViewProps {
  experiences: ExperienceType[];
  drafts?: ExperienceDraftItem[];
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

export const AdminExpView: React.FC<AdminExpViewProps> = ({
  experiences,
  drafts = [],
}) => {
  const router = useRouter();
  const { openStudio } = useMdxStudio();
  const { confirm } = useConfirm();

  // Enable real-time sync for experience drafts
  useRealtimeSync({
    type: "experience",
    intervalMs: 3000,
  });

  // State for line-by-line diff modal
  const [diffTarget, setDiffTarget] = useState<{
    published: ExperienceType;
    draft: ExperienceDraftItem;
  } | null>(null);

  // State for reviewing standalone new draft modal
  const [newDraftTarget, setNewDraftTarget] =
    useState<ExperienceDraftItem | null>(null);

  // Split drafts into:
  // 1. Revision drafts (has targetId matching a published experience)
  // 2. Standalone new drafts (no targetId)
  const revisionDraftsByTargetId = new Map<number, ExperienceDraftItem>();
  const standaloneDrafts: ExperienceDraftItem[] = [];

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
    meta: ExperienceFormData,
    mdx: string,
    associatedDraftId?: string,
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

    // Clean up draft if this was published from a draft
    if (associatedDraftId) {
      try {
        await deleteExperienceDraftAction(associatedDraftId);
      } catch {
        // non-blocking
      }
    }

    router.refresh();
  };

  const handleOpenDraftReview = (draft: ExperienceDraftItem) => {
    const data = draft.data || {};
    let currentMeta: ExperienceFormData = {
      company: data.company || "",
      role: data.role || "",
      start: safeFormatDateForInput(data.start),
      end: safeFormatDateForInput(data.end),
      isCurrent: !data.end || String(data.end).toLowerCase() === "present",
      companyUrl: data.companyUrl || "",
      companyLogo: data.companyLogo || "",
      location: data.location || "",
    };

    openStudio({
      title: "Review Experience Draft",
      documentName: `${currentMeta.role || "Draft"} @ ${currentMeta.company || "Company"}`,
      initialMdx: data.description || "",
      informationSlot: (
        <ExperienceForm
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

  const handleDeleteDraft = async (draft: ExperienceDraftItem) => {
    try {
      await deleteExperienceDraftAction(draft.id);
      toast.success("Draft discarded.");
      router.refresh();
    } catch (err: any) {
      console.error("Delete draft error:", err);
      toast.danger(err.message || "Failed to delete draft.");
    }
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

  const handleAcceptRevision = async (
    targetExp: ExperienceType,
    draft: ExperienceDraftItem,
    customDescription?: string,
  ) => {
    try {
      const data = draft.data || {};
      const company = (data.company || targetExp.company).trim();
      const role = (data.role || targetExp.role).trim();
      const start = data.start ? new Date(data.start) : targetExp.start;

      let end: Date | null = null;
      if (data.end !== undefined) {
        if (data.end && data.end !== "Present") {
          const parsed = new Date(data.end);
          if (!isNaN(parsed.getTime())) end = parsed;
        }
      } else if (targetExp.end) {
        end = new Date(targetExp.end);
      }

      const location =
        data.location !== undefined ? data.location : targetExp.location;
      const companyUrl =
        data.companyUrl !== undefined ? data.companyUrl : targetExp.companyUrl;
      const companyLogo =
        data.companyLogo !== undefined ? data.companyLogo : targetExp.companyLogo;

      const description =
        customDescription !== undefined
          ? customDescription
          : (data.description !== undefined
              ? data.description
              : targetExp.description) || "";

      await updateExperienceAction(targetExp.id, {
        company,
        role,
        start,
        end,
        location,
        companyUrl,
        companyLogo,
        description,
      });

      await deleteExperienceDraftAction(draft.id);
      toast.success(`Accepted AI changes for "${role}" at ${company}.`);
      router.refresh();
    } catch (err: any) {
      console.error("Failed to accept revision draft:", err);
      toast.danger(err.message || "Failed to apply changes.");
      throw err;
    }
  };

  const handleOpenStudioForRevision = (
    targetExp: ExperienceType,
    draft: ExperienceDraftItem,
    overrideDescription?: string,
  ) => {
    const data = draft.data || {};
    let currentMeta: ExperienceFormData = {
      company: data.company ?? targetExp.company,
      role: data.role ?? targetExp.role,
      start: safeFormatDateForInput(data.start ?? targetExp.start),
      end: safeFormatDateForInput(data.end ?? targetExp.end),
      isCurrent:
        data.end === null ||
        data.end === "Present" ||
        (!data.end && !targetExp.end),
      companyUrl: data.companyUrl ?? targetExp.companyUrl ?? "",
      companyLogo: data.companyLogo ?? targetExp.companyLogo ?? "",
      location: data.location ?? targetExp.location ?? "",
    };

    const initialMdx =
      overrideDescription !== undefined
        ? overrideDescription
        : data.description !== undefined
          ? data.description
          : targetExp.description || "";

    openStudio({
      title: "Review & Edit AI Revision",
      documentName: `${currentMeta.role} @ ${currentMeta.company}`,
      initialMdx,
      informationSlot: (
        <ExperienceForm
          initialData={currentMeta}
          onChange={(next) => {
            currentMeta = next;
          }}
        />
      ),
      onSave: async (compiledMdx) => {
        await handleSave(targetExp.id, currentMeta, compiledMdx, draft.id);
      },
    });
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
      {experiences.length === 0 && drafts.length === 0 ? (
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
          {/* Standalone drafts (brand new items) rendered at top with amber draft indicator */}
          {standaloneDrafts.map((draft) => {
            const data = draft.data || {};
            const startStr = data.start ? String(data.start).split("T")[0] : "";
            const endStr = data.end ? String(data.end).split("T")[0] : "Present";
            const draftExp: ExperienceType = {
              id: -1, // sentinel
              company: data.company || "Untitled Company",
              role: data.role || "Untitled Role",
              location: data.location || undefined,
              companyUrl: data.companyUrl || undefined,
              companyLogo: data.companyLogo || undefined,
              description: data.description || "",
              period: startStr ? `${startStr} — ${endStr}` : "Draft",
              start: data.start ? new Date(data.start) : new Date(),
              end: data.end ? new Date(data.end) : undefined,
              created_at: new Date(draft.createdAt),
              updated_at: new Date(draft.updatedAt),
            };

            return (
              <ExperienceCard
                key={`draft-${draft.id}`}
                experience={draftExp}
                isDraft={true}
                onEdit={() => setNewDraftTarget(draft)}
                onDelete={() => {
                  confirm({
                    isDanger: true,
                    title: `Discard Draft?`,
                    description: `Are you sure you want to discard the draft for "${draftExp.role}" at ${draftExp.company}?`,
                    confirmText: "Discard",
                    onConfirm: async () => {
                      await handleDeleteDraft(draft);
                    },
                  });
                }}
              />
            );
          })}

          {/* Published experience records with AI Revision Detection */}
          {experiences.map((exp) => {
            const revisionDraft = revisionDraftsByTargetId.get(exp.id);

            return (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                isDraft={false}
                hasRevisionDraft={Boolean(revisionDraft)}
                onReviewRevision={() => {
                  if (revisionDraft) {
                    setDiffTarget({ published: exp, draft: revisionDraft });
                  }
                }}
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
            );
          })}
        </div>
      )}

      {/* GitHub PR/Cursor-style Side-by-Side Line Diff Review Modal */}
      {diffTarget && (() => {
        const pub = diffTarget.published;
        const draftData = diffTarget.draft.data || {};
        const oldStart = pub.start
          ? new Date(pub.start).toISOString().split("T")[0]
          : "";
        const newStart = draftData.start ?? oldStart;
        const oldEnd = pub.end
          ? new Date(pub.end).toISOString().split("T")[0]
          : "Present";
        const newEnd =
          draftData.end === null
            ? "Present"
            : (draftData.end !== undefined ? draftData.end : oldEnd);

        const metadataProperties: DiffMetadataProperty[] = [
          {
            label: "Role",
            icon: <LuBriefcase className="size-3.5" />,
            oldValue: pub.role || "",
            newValue: draftData.role ?? (pub.role || ""),
          },
          {
            label: "Company",
            icon: <LuBuilding2 className="size-3.5" />,
            oldValue: pub.company || "",
            newValue: draftData.company ?? (pub.company || ""),
          },
          {
            label: "Location",
            icon: <LuMapPin className="size-3.5" />,
            oldValue: pub.location || "",
            newValue: draftData.location ?? (pub.location || ""),
          },
          {
            label: "Website",
            icon: <LuGlobe className="size-3.5" />,
            oldValue: pub.companyUrl || "",
            newValue: draftData.companyUrl ?? (pub.companyUrl || ""),
          },
          {
            label: "Timeline",
            icon: <LuCalendar className="size-3.5" />,
            oldValue: `${oldStart} — ${oldEnd}`,
            newValue: `${newStart} — ${newEnd}`,
          },
        ];

        return (
          <RevisionDiffModal
            isOpen={Boolean(diffTarget)}
            onClose={() => setDiffTarget(null)}
            title={`Review Changes · #${pub.id} ${pub.role} at ${pub.company}`}
            headerIcon={<LuBriefcase className="size-3.5" />}
            oldText={pub.description || ""}
            newText={draftData.description ?? (pub.description || "")}
            diffSectionTitle="Responsibilities & Achievements"
            metadataProperties={metadataProperties}
            onAcceptAll={async () => {
              await handleAcceptRevision(diffTarget.published, diffTarget.draft);
            }}
            onAcceptCustom={async (compiledDescription) => {
              await handleAcceptRevision(
                diffTarget.published,
                diffTarget.draft,
                compiledDescription,
              );
            }}
            onRejectAll={async () => {
              await handleDeleteDraft(diffTarget.draft);
            }}
            onEditInStudio={(currentDescription) => {
              handleOpenStudioForRevision(
                diffTarget.published,
                diffTarget.draft,
                currentDescription,
              );
            }}
          />
        );
      })()}

      {/* Standalone New Draft Review Modal */}
      {newDraftTarget && (() => {
        const draftData = newDraftTarget.data || {};
        const startStr = draftData.start
          ? String(draftData.start).split("T")[0]
          : "";
        const endStr = draftData.end
          ? String(draftData.end).split("T")[0]
          : "Present";

        const metadataProperties: DiffMetadataProperty[] = [
          {
            label: "Role",
            icon: <LuBriefcase className="size-3.5" />,
            oldValue: "",
            newValue: draftData.role || "Untitled Role",
          },
          {
            label: "Company",
            icon: <LuBuilding2 className="size-3.5" />,
            oldValue: "",
            newValue: draftData.company || "Untitled Company",
          },
          {
            label: "Location",
            icon: <LuMapPin className="size-3.5" />,
            oldValue: "",
            newValue: draftData.location || "",
          },
          {
            label: "Website",
            icon: <LuGlobe className="size-3.5" />,
            oldValue: "",
            newValue: draftData.companyUrl || "",
          },
          {
            label: "Timeline",
            icon: <LuCalendar className="size-3.5" />,
            oldValue: "",
            newValue: startStr ? `${startStr} — ${endStr}` : "Present",
          },
        ];

        return (
          <RevisionDiffModal
            isOpen={Boolean(newDraftTarget)}
            onClose={() => setNewDraftTarget(null)}
            title={`Review Draft · ${draftData.role || "New Experience"}`}
            headingTitle="Proposed New Experience"
            subtitle="Review the proposed details for this new experience record. You can accept and add it to your portfolio, edit in Studio, or discard it."
            headerIcon={<LuBriefcase className="size-3.5" />}
            oldText=""
            newText={draftData.description || ""}
            diffSectionTitle="Responsibilities & Achievements"
            metadataProperties={metadataProperties}
            acceptLabel="Accept & Add"
            rejectLabel="Discard Draft"
            hideRevertButton={true}
            onAcceptAll={async () => {
              let parsedEnd: Date | null = null;
              if (
                draftData.end &&
                String(draftData.end).toLowerCase() !== "present"
              ) {
                parsedEnd = new Date(draftData.end);
              }
              await createExperienceAction({
                company: (draftData.company || "Untitled Company").trim(),
                role: (draftData.role || "Untitled Role").trim(),
                location: draftData.location?.trim() || undefined,
                companyUrl: draftData.companyUrl?.trim() || undefined,
                companyLogo: draftData.companyLogo?.trim() || undefined,
                start: draftData.start ? new Date(draftData.start) : new Date(),
                end: parsedEnd,
                description: draftData.description?.trim() || "",
              });
              await deleteExperienceDraftAction(newDraftTarget.id);
              toast.success(
                `Added "${draftData.role || "Experience"}" successfully.`,
              );
              setNewDraftTarget(null);
              router.refresh();
            }}
            onAcceptCustom={async (compiledDescription) => {
              let parsedEnd: Date | null = null;
              if (
                draftData.end &&
                String(draftData.end).toLowerCase() !== "present"
              ) {
                parsedEnd = new Date(draftData.end);
              }
              await createExperienceAction({
                company: (draftData.company || "Untitled Company").trim(),
                role: (draftData.role || "Untitled Role").trim(),
                location: draftData.location?.trim() || undefined,
                companyUrl: draftData.companyUrl?.trim() || undefined,
                companyLogo: draftData.companyLogo?.trim() || undefined,
                start: draftData.start ? new Date(draftData.start) : new Date(),
                end: parsedEnd,
                description: compiledDescription.trim(),
              });
              await deleteExperienceDraftAction(newDraftTarget.id);
              toast.success(
                `Added "${draftData.role || "Experience"}" successfully.`,
              );
              setNewDraftTarget(null);
              router.refresh();
            }}
            onRejectAll={async () => {
              await handleDeleteDraft(newDraftTarget);
              setNewDraftTarget(null);
            }}
            onEditInStudio={() => {
              handleOpenDraftReview(newDraftTarget);
              setNewDraftTarget(null);
            }}
          />
        );
      })()}
    </div>
  );
};

export default AdminExpView;
