"use client";

import React, { useState, useRef, useEffect } from "react";
import { LuFolderOpen, LuPlus, LuSparkles } from "react-icons/lu";
import { Button, Card, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { stringify } from "yaml";
import matter from "gray-matter";
import { useMdxStudio } from "@/mdx-studio";
import { useConfirm } from "@/providers/confirm-provider";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { QueryProjects } from "@/lib/get-projects";
import {
  getProjectFileAction,
  publishProjectDraftAction,
  deleteProjectDraftAction,
} from "./actions";
import { ProjectCard } from "./components/project-card";
import { ProjectForm, ProjectFormData } from "./components/project-form";
import { BlogSaveModal } from "../blogs/components/blog-save-modal";
import { RevisionDiffModal } from "@/components/revision-diff-modal";

export interface ProjectDraftData {
  targetSlug?: string;
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  tools?: string[];
  github?: string;
  live?: string;
  thumbnail?: string;
  banner?: string;
  content?: string;
}

export interface ProjectDraftItem {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data: ProjectDraftData;
}

interface ProjectsViewProps {
  projects: QueryProjects["projects"];
  drafts?: ProjectDraftItem[];
}

const EMPTY_META: ProjectFormData = {
  title: "",
  description: "",
  category: "",
  tools: "",
  github: "",
  live: "",
  thumbnail: "",
  banner: "",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  drafts = [],
}) => {
  const router = useRouter();
  const { openStudio } = useMdxStudio();
  const { confirm } = useConfirm();
  const [meta, setMeta] = useState<ProjectFormData>(EMPTY_META);

  // Enable real-time sync for project drafts
  useRealtimeSync({
    type: "project",
    intervalMs: 3000,
  });

  // State for revision diff modal
  const [diffTarget, setDiffTarget] = useState<{
    publishedProject: QueryProjects["projects"][number];
    publishedRawMdx: string;
    draft: ProjectDraftItem;
  } | null>(null);

  // State for standalone draft publish / copy modal
  const [publishModalDraft, setPublishModalDraft] =
    useState<ProjectDraftItem | null>(null);

  // Split drafts into revision drafts vs standalone drafts
  const revisionDraftsByTargetSlug = new Map<string, ProjectDraftItem>();
  const standaloneDrafts: ProjectDraftItem[] = [];

  for (const draft of drafts) {
    const targetSlug = draft.data?.targetSlug;
    if (typeof targetSlug === "string" && targetSlug.trim().length > 0) {
      revisionDraftsByTargetSlug.set(targetSlug.trim(), draft);
    } else {
      standaloneDrafts.push(draft);
    }
  }

  const metaRef = useRef(meta);
  metaRef.current = meta;

  const [pendingOpen, setPendingOpen] = useState<
    | { kind: "new" }
    | { kind: "edit"; file: string; meta: ProjectFormData; body: string }
    | null
  >(null);

  const sanitizeMetaText = (v: string) =>
    v
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

  const YAML_OPTIONS = {
    lineWidth: 80,
    defaultStringType: "QUOTE_DOUBLE" as const,
    defaultKeyType: "PLAIN" as const,
  };

  useEffect(() => {
    if (!pendingOpen) return;

    const buildMeta = (): Record<string, any> => {
      const now = new Date().toISOString();
      const current = metaRef.current;
      const tools = current.tools
        .split(",")
        .map((s) => sanitizeMetaText(s))
        .filter(Boolean);

      const result: Record<string, any> = {
        title: sanitizeMetaText(current.title),
        category: sanitizeMetaText(current.category),
      };
      if (sanitizeMetaText(current.description)) {
        result.description = sanitizeMetaText(current.description);
      }
      if (tools.length) {
        result.tools = tools;
      }
      if (sanitizeMetaText(current.github)) {
        result.github = sanitizeMetaText(current.github);
      }
      if (sanitizeMetaText(current.live)) {
        result.live = sanitizeMetaText(current.live);
      }
      if (sanitizeMetaText(current.thumbnail)) {
        result.thumbnail = sanitizeMetaText(current.thumbnail);
      }
      if (sanitizeMetaText(current.banner)) {
        result.banner = sanitizeMetaText(current.banner);
      }
      result.createdAt = now;
      result.updatedAt = now;
      return result;
    };

    const initialMeta =
      pendingOpen.kind === "edit" ? pendingOpen.meta : EMPTY_META;
    const initialBody = pendingOpen.kind === "edit" ? pendingOpen.body : "";
    const baseName =
      pendingOpen.kind === "edit"
        ? pendingOpen.file.replace(/\.mdx?$/, "")
        : "project";

    metaRef.current = initialMeta;
    setMeta(initialMeta);

    openStudio({
      title: "Project Studio",
      documentName:
        pendingOpen.kind === "edit" && initialMeta.title
          ? initialMeta.title
          : "New Project",
      initialMdx: initialBody,
      includeMetadata: true,
      initialMetadata: buildMeta(),
      getMetadata: buildMeta,
      onMetadataChange: (newMeta) => {
        const next: ProjectFormData = {
          title:
            newMeta.title !== undefined
              ? String(newMeta.title)
              : metaRef.current.title,
          description:
            newMeta.description !== undefined
              ? String(newMeta.description)
              : metaRef.current.description,
          category:
            newMeta.category !== undefined
              ? String(newMeta.category)
              : metaRef.current.category,
          tools:
            newMeta.tools !== undefined
              ? Array.isArray(newMeta.tools)
                ? newMeta.tools.join(", ")
                : String(newMeta.tools)
              : metaRef.current.tools,
          github:
            newMeta.github !== undefined
              ? String(newMeta.github)
              : metaRef.current.github,
          live:
            newMeta.live !== undefined
              ? String(newMeta.live)
              : metaRef.current.live,
          thumbnail:
            newMeta.thumbnail !== undefined
              ? String(newMeta.thumbnail)
              : metaRef.current.thumbnail,
          banner:
            newMeta.banner !== undefined
              ? String(newMeta.banner)
              : metaRef.current.banner,
        };
        metaRef.current = next;
        setMeta(next);
      },
      saveButton: (controller) => {
        const current = metaRef.current;

        return (
          <BlogSaveModal
            controller={controller}
            filename={slugify(current.title) || baseName}
            isValid={() => {
              const latest = metaRef.current;
              return (
                latest.title.trim().length > 0 &&
                latest.category.trim().length > 0
              );
            }}
            buildDocument={(body) => {
              const hasFm = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(body);
              if (hasFm) return body;
              const fm =
                controller?.frontmatter ||
                `---\n${stringify(buildMeta(), YAML_OPTIONS)}---`;
              return `${fm}\n\n${body}`;
            }}
          />
        );
      },
      informationSlot: (
        <ProjectForm
          initialData={initialMeta}
          onChange={(next) => {
            metaRef.current = next;
            setMeta(next);
          }}
        />
      ),
      onSave: async () => { },
    });

    setPendingOpen(null);
  }, [pendingOpen, openStudio]);

  const handleWriteProject = () => {
    setPendingOpen({ kind: "new" });
  };

  const handleEditProject = async (
    project: QueryProjects["projects"][number],
    onLoading?: (loading: boolean) => void,
  ) => {
    onLoading?.(true);
    const file = project.slug ? `${project.slug}.mdx` : "";
    if (!file) {
      toast.danger("Could not determine project file.");
      onLoading?.(false);
      return;
    }

    const res = await getProjectFileAction(file);
    if (!res.success || !res.content) {
      toast.danger(res.error || "Failed to load project file.");
      onLoading?.(false);
      return;
    }

    const parsed = matter(res.content);
    const data = parsed.data as Record<string, any>;

    const editMeta: ProjectFormData = {
      title: typeof data.title === "string" ? data.title : "",
      description: typeof data.description === "string" ? data.description : "",
      category: typeof data.category === "string" ? data.category : "",
      tools: Array.isArray(data.tools) ? data.tools.join(", ") : "",
      github:
        typeof data?.github === "string"
          ? data.github
          : typeof data?.links?.github === "string"
            ? data.links.github
            : "",
      live:
        typeof data?.live === "string"
          ? data.live
          : typeof data?.links?.live === "string"
            ? data.links.live
            : "",
      thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : "",
      banner: typeof data.banner === "string" ? data.banner : "",
    };

    onLoading?.(false);
    setPendingOpen({
      kind: "edit",
      file,
      meta: editMeta,
      body: parsed.content,
    });
  };

  const handleOpenStudioForDraft = (draft: ProjectDraftItem) => {
    const data = draft.data || {};
    const draftMeta: ProjectFormData = {
      title: data.title || "",
      description: data.description || "",
      category: data.category || "",
      tools: Array.isArray(data.tools) ? data.tools.join(", ") : "",
      github: data.github || "",
      live: data.live || "",
      thumbnail: data.thumbnail || "",
      banner: data.banner || "",
    };

    setPendingOpen({
      kind: "edit",
      file: `${data.slug || "project-draft"}.mdx`,
      meta: draftMeta,
      body: data.content || "",
    });
  };

  const handleReviewRevision = async (
    project: QueryProjects["projects"][number],
  ) => {
    if (!project.slug) return;
    const draft = revisionDraftsByTargetSlug.get(project.slug);
    if (!draft) return;

    const file = `${project.slug}.mdx`;
    const res = await getProjectFileAction(file);
    if (!res.success || !res.content) {
      toast.danger(res.error || "Failed to load published project MDX for diff.");
      return;
    }

    setDiffTarget({
      publishedProject: project,
      publishedRawMdx: res.content,
      draft,
    });
  };

  const handleDeleteDraft = async (draft: ProjectDraftItem) => {
    const title = draft.data?.title || "this draft";
    const ok = await confirm({
      title: "Discard Draft",
      description: `Are you sure you want to discard "${title}"? This action cannot be undone.`,
      confirmText: "Discard Draft",
      isDanger: true,
    });

    if (!ok) return;

    try {
      await deleteProjectDraftAction(draft.id);
      toast.success("Draft discarded successfully.");
      router.refresh();
    } catch (err: any) {
      toast.danger(err?.message || "Failed to discard draft.");
    }
  };

  const handlePublishDraft = (draft: ProjectDraftItem) => {
    setPublishModalDraft(draft);
  };

  const handleAcceptRevision = async (fullMdx: string) => {
    if (!diffTarget) return;

    try {
      const parsed = matter(fullMdx);
      const res = await publishProjectDraftAction(diffTarget.draft.id, {
        slug: diffTarget.publishedProject.slug,
        content: parsed.content,
      });

      if (res.savedToDisk) {
        toast.success(
          `Revision merged and saved to content/projects/${diffTarget.publishedProject.slug}.mdx`,
        );
      } else {
        toast.success(
          `Revision approved! On serverless production, copy the MDX into content/projects/${diffTarget.publishedProject.slug}.mdx and commit to Git.`,
        );
      }

      setDiffTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.danger(err?.message || "Failed to publish revision.");
    }
  };

  const handleDiscardRevision = async () => {
    if (!diffTarget) return;
    const ok = await confirm({
      title: "Discard Revision Draft",
      description: `Discard proposed revisions for "${diffTarget.publishedProject.title}"?`,
      confirmText: "Discard",
      isDanger: true,
    });

    if (!ok) return;

    try {
      await deleteProjectDraftAction(diffTarget.draft.id);
      toast.success("Revision draft discarded.");
      setDiffTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.danger(err?.message || "Failed to discard revision.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-rethink text-white tracking-tight">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 leading-relaxed">
            Manage your builds, tools, and side projects.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Button
            type="button"
            onClick={handleWriteProject}
            className="bg-accent text-neutral-950 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Write</span>
          </Button>
        </div>
      </div>

      {/* Standalone AI Project Drafts */}
      <div className="space-y-4">
        {standaloneDrafts.length > 0 && (
          <div className="space-y-4">
            {standaloneDrafts.map((draft) => {
              const data = draft.data || {};
              const dummyProject: QueryProjects["projects"][number] = {
                title: data.title || "Untitled Project Draft",
                description: data.description || "",
                category: data.category || "",
                tools: Array.isArray(data.tools) ? data.tools : [],
                thumbnail: data.thumbnail || "",
                github: data.github || "",
                live: data.live || "",
                slug: data.slug || "",
                createdAt: draft.createdAt,
                updatedAt: draft.updatedAt,
                url: "",
              };

              return (
                <ProjectCard
                  key={draft.id}
                  project={dummyProject}
                  isDraft={true}
                  onEdit={() => handleOpenStudioForDraft(draft)}
                  onPublishDraft={() => handlePublishDraft(draft)}
                  onDeleteDraft={() => handleDeleteDraft(draft)}
                />
              );
            })}
          </div>
        )}

        {/* Published Project Cards Grid */}
        <div className="space-y-4">
          {projects.length === 0 && standaloneDrafts.length === 0 ? (
            <Card className="bg-muted/30 border border-white/8 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <LuFolderOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white font-rethink">
                No projects yet
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 max-w-sm mx-auto leading-relaxed">
                Write your first project and it will show up here.
              </p>
            </Card>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.slug || project.title}
                project={project}
                hasRevisionDraft={Boolean(
                  project.slug && revisionDraftsByTargetSlug.has(project.slug),
                )}
                onEdit={handleEditProject}
                onReviewRevision={() => handleReviewRevision(project)}
              />
            ))
          )}
        </div>
      </div>

      {/* Revision Diff Modal */}
      {diffTarget && (() => {
        const draftFullMdx = (() => {
          const data = diffTarget.draft.data || {};
          if (
            typeof data.content === "string" &&
            /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(data.content)
          ) {
            return data.content;
          }

          let oldMeta: Record<string, any> = {};
          try {
            oldMeta = matter(diffTarget.publishedRawMdx).data || {};
          } catch {
            oldMeta = {};
          }

          const frontmatter: Record<string, unknown> = {
            title: String(
              data.title !== undefined ? data.title : (oldMeta.title || ""),
            ).trim(),
          };

          const cat =
            data.category !== undefined ? data.category : oldMeta.category;
          if (cat) frontmatter.category = String(cat).trim();

          const desc =
            data.description !== undefined
              ? data.description
              : oldMeta.description;
          if (desc) frontmatter.description = String(desc).trim();

          const tools = data.tools !== undefined ? data.tools : oldMeta.tools;
          if (Array.isArray(tools) && tools.length > 0) {
            frontmatter.tools = tools.map((t) => String(t).trim()).filter(Boolean);
          }

          const github =
            data.github !== undefined ? data.github : oldMeta.github;
          if (github) frontmatter.github = String(github).trim();

          const live = data.live !== undefined ? data.live : oldMeta.live;
          if (live) frontmatter.live = String(live).trim();

          const thumbnail =
            data.thumbnail !== undefined ? data.thumbnail : oldMeta.thumbnail;
          if (thumbnail) frontmatter.thumbnail = String(thumbnail).trim();

          const banner =
            data.banner !== undefined ? data.banner : oldMeta.banner;
          if (banner) frontmatter.banner = String(banner).trim();

          frontmatter.createdAt = oldMeta.createdAt || new Date().toISOString();
          frontmatter.updatedAt = new Date().toISOString();

          const body = String(data.content || "").trim();
          return `---\n${stringify(frontmatter, YAML_OPTIONS)}---\n\n${body}\n`;
        })();

        return (
          <RevisionDiffModal
            isOpen={true}
            onClose={() => setDiffTarget(null)}
            title={`Review Changes · content/projects/${diffTarget.publishedProject.slug}.mdx`}
            subtitle="Review the proposed edits below. All changes are accepted by default; click “Revert” on any line to preserve the published text."
            oldText={diffTarget.publishedRawMdx.trim()}
            newText={draftFullMdx.trim()}
            diffSectionTitle={`${diffTarget.publishedProject.slug}.mdx`}
            allowCopyMdx={true}
            downloadFilename={`${diffTarget.publishedProject.slug}.mdx`}
            onAcceptAll={() => handleAcceptRevision(draftFullMdx)}
            onAcceptCustom={(finalFullMdx) =>
              handleAcceptRevision(finalFullMdx)
            }
            onRejectAll={handleDiscardRevision}
            onEditInStudio={(fullMdx) => {
              const parsed = matter(fullMdx);
              const data = parsed.data as Record<string, any>;
              setPendingOpen({
                kind: "edit",
                file: `${diffTarget.publishedProject.slug}.mdx`,
                meta: {
                  title: typeof data.title === "string" ? data.title : "",
                  description:
                    typeof data.description === "string"
                      ? data.description
                      : "",
                  category:
                    typeof data.category === "string" ? data.category : "",
                  tools: Array.isArray(data.tools) ? data.tools.join(", ") : "",
                  github:
                    typeof data?.github === "string"
                      ? data.github
                      : typeof data?.links?.github === "string"
                        ? data.links.github
                        : "",
                  live:
                    typeof data?.live === "string"
                      ? data.live
                      : typeof data?.links?.live === "string"
                        ? data.links.live
                        : "",
                  thumbnail:
                    typeof data.thumbnail === "string" ? data.thumbnail : "",
                  banner: typeof data.banner === "string" ? data.banner : "",
                },
                body: parsed.content,
              });
              setDiffTarget(null);
            }}
          />
        );
      })()}

      {/* Standalone New Draft Review / Publish Modal */}
      {publishModalDraft && (() => {
        const data = publishModalDraft.data || {};
        const rawSlug = data.targetSlug || data.slug || data.title || "project-showcase";
        const slug = slugify(rawSlug) || "project-showcase";

        const now = new Date().toISOString();
        const frontmatter: Record<string, unknown> = {
          title: String(data.title || "Untitled Project").trim(),
        };

        if (data.category) frontmatter.category = String(data.category).trim();
        if (data.description) frontmatter.description = String(data.description).trim();
        if (Array.isArray(data.tools) && data.tools.length > 0) {
          frontmatter.tools = data.tools.map((t) => String(t).trim()).filter(Boolean);
        }
        if (data.github) frontmatter.github = String(data.github).trim();
        if (data.live) frontmatter.live = String(data.live).trim();
        if (data.thumbnail) frontmatter.thumbnail = String(data.thumbnail).trim();
        if (data.banner) frontmatter.banner = String(data.banner).trim();

        frontmatter.createdAt = publishModalDraft.createdAt || now;
        frontmatter.updatedAt = now;

        const body = String(data.content || "").trim();
        const fullMdx = `---\n${stringify(frontmatter, YAML_OPTIONS)}---\n\n${body}\n`;

        return (
          <RevisionDiffModal
            isOpen={true}
            onClose={() => setPublishModalDraft(null)}
            title={`Review Draft · content/projects/${slug}.mdx`}
            subtitle="Review the proposed content for this project showcase. You can copy the MDX, edit it in Studio, discard it, or publish."
            headingTitle="Proposed Project Showcase"
            oldText=""
            newText={fullMdx.trim()}
            diffSectionTitle={`${slug}.mdx`}
            allowCopyMdx={true}
            downloadFilename={`${slug}.mdx`}
            acceptLabel="Publish Draft"
            rejectLabel="Discard Draft"
            hideRevertButton={true}
            onAcceptAll={async () => {
              try {
                const res = await publishProjectDraftAction(publishModalDraft.id, {
                  slug,
                  content: body,
                });
                if (res.savedToDisk) {
                  toast.success(`Published and saved to content/projects/${slug}.mdx`);
                } else {
                  toast.success(
                    `Draft marked published! On serverless production, copy the MDX into content/projects/${slug}.mdx and commit to Git.`,
                  );
                }
                setPublishModalDraft(null);
                router.refresh();
              } catch (err: any) {
                toast.danger(err?.message || "Failed to publish draft.");
              }
            }}
            onAcceptCustom={async (finalFullMdx) => {
              try {
                const parsed = matter(finalFullMdx);
                const res = await publishProjectDraftAction(publishModalDraft.id, {
                  slug,
                  content: parsed.content,
                });
                if (res.savedToDisk) {
                  toast.success(`Published and saved to content/projects/${slug}.mdx`);
                } else {
                  toast.success(
                    `Draft marked published! On serverless production, copy the MDX into content/projects/${slug}.mdx and commit to Git.`,
                  );
                }
                setPublishModalDraft(null);
                router.refresh();
              } catch (err: any) {
                toast.danger(err?.message || "Failed to publish draft.");
              }
            }}
            onRejectAll={async () => {
              try {
                await deleteProjectDraftAction(publishModalDraft.id);
                toast.success("Draft discarded.");
                setPublishModalDraft(null);
                router.refresh();
              } catch (err: any) {
                toast.danger(err?.message || "Failed to discard draft.");
              }
            }}
            onEditInStudio={(fullMdx) => {
              const parsed = matter(fullMdx);
              const d = parsed.data as Record<string, any>;
              setPendingOpen({
                kind: "edit",
                file: `${slug}.mdx`,
                meta: {
                  title: typeof d.title === "string" ? d.title : "",
                  description: typeof d.description === "string" ? d.description : "",
                  category: typeof d.category === "string" ? d.category : "",
                  tools: Array.isArray(d.tools) ? d.tools.join(", ") : "",
                  github: typeof d?.github === "string" ? d.github : "",
                  live: typeof d?.live === "string" ? d.live : "",
                  thumbnail: typeof d.thumbnail === "string" ? d.thumbnail : "",
                  banner: typeof d.banner === "string" ? d.banner : "",
                },
                body: parsed.content,
              });
              setPublishModalDraft(null);
            }}
          />
        );
      })()}
    </div>
  );
};

export default ProjectsView;
