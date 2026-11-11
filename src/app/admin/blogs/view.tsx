"use client";

import React, { useState, useRef, useEffect } from "react";
import { LuBookOpen, LuPlus } from "react-icons/lu";
import { Button, Card, toast } from "@heroui/react";
import { stringify } from "yaml";
import matter from "gray-matter";
import { useMdxStudio } from "@/mdx-studio";
import { QueryBlogs } from "@/lib/get-blogs";
import { getBlogFileAction } from "./actions";
import { BlogCard } from "./components/blog-card";
import { BlogForm, BlogFormData } from "./components/blog-form";
import { BlogSaveModal } from "./components/blog-save-modal";

interface BlogsViewProps {
  blogs: QueryBlogs["blogs"];
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

export const BlogsView: React.FC<BlogsViewProps> = ({ blogs }) => {
  const { openStudio } = useMdxStudio();
  const [meta, setMeta] = useState<BlogFormData>(EMPTY_META);

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
      getMetadata: buildMeta,
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
              const yaml = stringify(buildMeta(), YAML_OPTIONS);
              return `---\n${yaml}---\n\n${body}`;
            }}
          />
        );
      },
      informationSlot: <BlogForm initialData={initialMeta} onChange={setMeta} />,
      onSave: async () => {},
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

      {/* Blog Cards List */}
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
              onEdit={handleEditBlog}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsView;
