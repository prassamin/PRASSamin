"use client";

import React, { useState, useRef, useEffect } from "react";
import { LuBookOpen, LuPlus, LuSparkles } from "react-icons/lu";
import { Button, Card, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { stringify } from "yaml";
import matter from "gray-matter";
import { useMdxStudio } from "@/mdx-studio";
import { useConfirm } from "@/providers/confirm-provider";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { QueryBlogs } from "@/lib/get-blogs";
import {
  getBlogFileAction,
  publishBlogDraftAction,
  deleteBlogDraftAction,
} from "./actions";
import { BlogCard } from "./components/blog-card";
import { BlogForm, BlogFormData } from "./components/blog-form";
import { BlogSaveModal } from "./components/blog-save-modal";
import { RevisionDiffModal } from "@/components/revision-diff-modal";

export interface BlogDraftData {
  targetSlug?: string;
  slug?: string;
  title?: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
  banner?: string;
  content?: string;
}

export interface BlogDraftItem {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data: BlogDraftData;
}

interface BlogsViewProps {
  blogs: QueryBlogs["blogs"];
  drafts?: BlogDraftItem[];
}

const EMPTY_META: BlogFormData = {
  title: "",
  description: "",
  tags: "",
  thumbnail: "",
  banner: "",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const BlogsView: React.FC<BlogsViewProps> = ({
  blogs,
  drafts = [],
}) => {
  const router = useRouter();
  const { openStudio } = useMdxStudio();
  const { confirm } = useConfirm();
  const [meta, setMeta] = useState<BlogFormData>(EMPTY_META);

  // Enable real-time sync for blog drafts
  useRealtimeSync({
    type: "blog",
    intervalMs: 3000,
  });

  // State for revision diff modal
  const [diffTarget, setDiffTarget] = useState<{
    publishedBlog: QueryBlogs["blogs"][number];
    publishedRawMdx: string;
    draft: BlogDraftItem;
  } | null>(null);

  // State for standalone draft publish / copy modal
  const [publishModalDraft, setPublishModalDraft] =
    useState<BlogDraftItem | null>(null);

  // Split drafts into revision drafts vs standalone drafts
  const revisionDraftsByTargetSlug = new Map<string, BlogDraftItem>();
  const standaloneDrafts: BlogDraftItem[] = [];

  for (const draft of drafts) {
    const targetSlug = draft.data?.targetSlug;
    if (typeof targetSlug === "string" && targetSlug.trim().length > 0) {
      revisionDraftsByTargetSlug.set(targetSlug.trim(), draft);
    } else {
      standaloneDrafts.push(draft);
    }
  }

  // Always-current mirror for the studio's getMetadata ref (avoids stale
  // closure captured when the studio was opened).
  const metaRef = useRef(meta);
  metaRef.current = meta;

  // Defer studio launch until after reset/state has rendered, so the info
  // slot / save button capture fresh state on every open.
  const [pendingOpen, setPendingOpen] = useState<
    | { kind: "new" }
    | { kind: "edit"; file: string; meta: BlogFormData; body: string }
    | null
  >(null);

  /**
   * Frontmatter-safe text: collapse line breaks/tabs into a single space and
   * trim. Applied on export so awkward raw input can never produce invalid
   * YAML (e.g. stray newlines or trailing spaces).
   */
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
      const tags = current.tags
        .split(",")
        .map((s) => sanitizeMetaText(s))
        .filter(Boolean);

      const result: Record<string, any> = {
        title: sanitizeMetaText(current.title),
      };
      if (sanitizeMetaText(current.description)) {
        result.description = sanitizeMetaText(current.description);
      }
      if (tags.length) {
        result.tags = tags;
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
        : "blog-post";

    // Seed the live ref + UI state before launching.
    metaRef.current = initialMeta;
    setMeta(initialMeta);

    openStudio({
      title: "Blog Studio",
      documentName:
        pendingOpen.kind === "edit" && initialMeta.title
          ? initialMeta.title
          : "New Blog Post",
      initialMdx: initialBody,
      includeMetadata: true,
      initialMetadata: buildMeta(),
      getMetadata: buildMeta,
      onMetadataChange: (newMeta) => {
        const next: BlogFormData = {
          title:
            newMeta.title !== undefined
              ? String(newMeta.title)
              : metaRef.current.title,
          description:
            newMeta.description !== undefined
              ? String(newMeta.description)
              : metaRef.current.description,
          tags:
            newMeta.tags !== undefined
              ? Array.isArray(newMeta.tags)
                ? newMeta.tags.join(", ")
                : String(newMeta.tags)
              : metaRef.current.tags,
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
                latest.tags
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean).length >= 1
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
        <BlogForm
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

  const handleWriteBlog = () => {
    setPendingOpen({ kind: "new" });
  };

  const handleEditBlog = async (
    blog: QueryBlogs["blogs"][number],
    onLoading?: (loading: boolean) => void,
  ) => {
    onLoading?.(true);

    const file = blog.slug ? `${blog.slug}.mdx` : "";
    if (!file) {
      toast.danger("Could not determine blog file.");
      return;
    }

    const res = await getBlogFileAction(file);
    if (!res.success || !res.content) {
      toast.danger(res.error || "Failed to load blog file.");
      return;
    }

    const parsed = matter(res.content);
    const data = parsed.data as Record<string, any>;

    const editMeta: BlogFormData = {
      title: typeof data.title === "string" ? data.title : "",
      description: typeof data.description === "string" ? data.description : "",
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
      thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : "",
      banner: typeof data.banner === "string" ? data.banner : "",
    };

    onLoading?.(false);
    setPendingOpen({ kind: "edit", file, meta: editMeta, body: parsed.content });
  };

  const handleReviewRevision = async (blog: QueryBlogs["blogs"][number]) => {
    if (!blog.slug) return;
    const draft = revisionDraftsByTargetSlug.get(blog.slug);
    if (!draft) return;

    const res = await getBlogFileAction(`${blog.slug}.mdx`);
    if (!res.success || !res.content) {
      toast.danger(res.error || "Failed to load original blog file.");
      return;
    }

    setDiffTarget({
      publishedBlog: blog,
      publishedRawMdx: res.content,
      draft,
    });
  };

  const handlePublishDraft = (draft: BlogDraftItem) => {
    setPublishModalDraft(draft);
  };

  const handleDismissDraft = async (draftId: string) => {
    try {
      await deleteBlogDraftAction(draftId);
      toast.success("Draft dismissed from review queue.");
      router.refresh();
    } catch {
      toast.danger("Failed to dismiss draft.");
    }
  };

  const handleDeleteDraft = (draft: BlogDraftItem) => {
    confirm({
      title: "Discard Draft?",
      description: `Draft "${draft.data.title || "Untitled"}" will be permanently deleted.`,
      isDanger: true,
      confirmText: "Discard",
      onConfirm: async () => {
        try {
          await deleteBlogDraftAction(draft.id);
          toast.success("Draft discarded.");
          router.refresh();
        } catch {
          toast.danger("Failed to delete draft.");
        }
      },
    });
  };

  const handleAcceptRevision = async (customContent?: string) => {
    if (!diffTarget) return;
    try {
      await publishBlogDraftAction(diffTarget.draft.id, {
        slug: diffTarget.publishedBlog.slug,
        content: customContent,
      });
      toast.success(
        `Merged AI changes into "${diffTarget.publishedBlog.slug}.mdx".`,
      );
      setDiffTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.danger(err?.message || "Failed to apply changes.");
      throw err;
    }
  };

  const handleDiscardRevision = async () => {
    if (!diffTarget) return;
    try {
      await deleteBlogDraftAction(diffTarget.draft.id);
      toast.success("Revision draft discarded.");
      setDiffTarget(null);
      router.refresh();
    } catch {
      toast.danger("Failed to discard revision.");
    }
  };

  const handleOpenStudioForDraft = (draft: BlogDraftItem) => {
    const data = draft.data || {};
    const draftMeta: BlogFormData = {
      title: data.title || "",
      description: data.description || "",
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
      thumbnail: data.thumbnail || "",
      banner: data.banner || "",
    };

    setPendingOpen({
      kind: "edit",
      file: `${data.slug || "blog-draft"}.mdx`,
      meta: draftMeta,
      body: data.content || "",
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-rethink text-white tracking-tight">
            Blogs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 leading-relaxed">
            Manage your articles, stories, and technical write-ups.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Button
            type="button"
            onClick={handleWriteBlog}
            className="bg-accent text-neutral-950 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Write</span>
          </Button>
        </div>
      </div>

      {/* Standalone Drafts */}
      <div className="space-y-4">
        {standaloneDrafts.length > 0 && (
          <div className="space-y-4">
            {standaloneDrafts.map((draft) => {
              const data = draft.data || {};
              const dummyBlog: QueryBlogs["blogs"][number] = {
                title: data.title || "Untitled Draft",
                description: data.description || "",
                thumbnail: data.thumbnail || "/assets/blog-placeholder.webp",
                slug: data.slug || "",
                tags: Array.isArray(data.tags) ? data.tags : [],
                createdAt: draft.createdAt,
                updatedAt: draft.updatedAt,
                url: "",
              };

              return (
                <BlogCard
                  key={draft.id}
                  blog={dummyBlog}
                  isDraft={true}
                  onEdit={() => handleOpenStudioForDraft(draft)}
                  onPublishDraft={() => handlePublishDraft(draft)}
                  onDeleteDraft={() => handleDeleteDraft(draft)}
                />
              );
            })}
          </div>
        )}

        {/* Published Blog Cards List */}
        <div className="space-y-4">
          {blogs.length === 0 ? (
            <Card className="bg-muted/30 border border-white/8 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <LuBookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white font-rethink">
                No blog posts yet
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 max-w-sm mx-auto leading-relaxed">
                Write your first article and it will show up here.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.slug || blog.title}
                  blog={blog}
                  hasRevisionDraft={Boolean(
                    blog.slug && revisionDraftsByTargetSlug.has(blog.slug),
                  )}
                  onEdit={handleEditBlog}
                  onReviewRevision={() => handleReviewRevision(blog)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revision Myers Diff Modal */}
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

          const desc =
            data.description !== undefined
              ? data.description
              : oldMeta.description;
          if (desc) frontmatter.description = String(desc).trim();

          const tags = data.tags !== undefined ? data.tags : oldMeta.tags;
          if (Array.isArray(tags) && tags.length > 0) {
            frontmatter.tags = tags.map((t) => String(t).trim()).filter(Boolean);
          }

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
            title={`Review Changes · content/blogs/${diffTarget.publishedBlog.slug}.mdx`}
            subtitle="Review the proposed edits below. All changes are accepted by default; click “Revert” on any line to preserve the published text."
            oldText={diffTarget.publishedRawMdx.trim()}
            newText={draftFullMdx.trim()}
            diffSectionTitle={`${diffTarget.publishedBlog.slug}.mdx`}
            allowCopyMdx={true}
            downloadFilename={`${diffTarget.publishedBlog.slug}.mdx`}
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
                file: `${diffTarget.publishedBlog.slug}.mdx`,
                meta: {
                  title: typeof data.title === "string" ? data.title : "",
                  description:
                    typeof data.description === "string"
                      ? data.description
                      : "",
                  tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
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
        const rawSlug = data.targetSlug || data.slug || data.title || "blog-post";
        const slug = slugify(rawSlug) || "blog-post";

        const now = new Date().toISOString();
        const frontmatter: Record<string, unknown> = {
          title: String(data.title || "Untitled Article").trim(),
        };

        if (data.description) frontmatter.description = String(data.description).trim();
        if (Array.isArray(data.tags) && data.tags.length > 0) {
          frontmatter.tags = data.tags.map((t) => String(t).trim()).filter(Boolean);
        }
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
            title={`Review Draft · content/blogs/${slug}.mdx`}
            subtitle="Review the proposed content for this new article. You can copy the MDX, edit it in Studio, discard it, or publish."
            headingTitle="Proposed New Article"
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
                const res = await publishBlogDraftAction(publishModalDraft.id, {
                  slug,
                  content: body,
                });
                if (res.savedToDisk) {
                  toast.success(`Published and saved to content/blogs/${slug}.mdx`);
                } else {
                  toast.success(
                    `Draft marked published! On serverless production, copy the MDX into content/blogs/${slug}.mdx and commit to Git.`,
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
                const res = await publishBlogDraftAction(publishModalDraft.id, {
                  slug,
                  content: parsed.content,
                });
                if (res.savedToDisk) {
                  toast.success(`Published and saved to content/blogs/${slug}.mdx`);
                } else {
                  toast.success(
                    `Draft marked published! On serverless production, copy the MDX into content/blogs/${slug}.mdx and commit to Git.`,
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
                await deleteBlogDraftAction(publishModalDraft.id);
                toast.success("Draft discarded.");
                setPublishModalDraft(null);
                router.refresh();
              } catch {
                toast.danger("Failed to discard draft.");
              }
            }}
            onEditInStudio={(customMdx) => {
              const parsed = matter(customMdx);
              const parsedData = parsed.data as Record<string, any>;
              setPendingOpen({
                kind: "edit",
                file: `${slug}.mdx`,
                meta: {
                  title:
                    typeof parsedData.title === "string"
                      ? parsedData.title
                      : (data.title || ""),
                  description:
                    typeof parsedData.description === "string"
                      ? parsedData.description
                      : (data.description || ""),
                  tags: Array.isArray(parsedData.tags)
                    ? parsedData.tags.join(", ")
                    : (Array.isArray(data.tags) ? data.tags.join(", ") : ""),
                  thumbnail:
                    typeof parsedData.thumbnail === "string"
                      ? parsedData.thumbnail
                      : (data.thumbnail || ""),
                  banner:
                    typeof parsedData.banner === "string"
                      ? parsedData.banner
                      : (data.banner || ""),
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

export default BlogsView;
