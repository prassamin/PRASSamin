"use client";

import React, { useState, useRef, useEffect } from "react";
import { LuFolderOpen, LuPlus } from "react-icons/lu";
import { Button, Card, toast } from "@heroui/react";
import { stringify } from "yaml";
import matter from "gray-matter";
import { useMdxStudio } from "@/mdx-studio";
import { QueryProjects } from "@/lib/get-projects";
import { getProjectFileAction } from "./actions";
import { ProjectCard } from "./components/project-card";
import { ProjectForm, ProjectFormData } from "./components/project-form";
import { BlogSaveModal } from "../blogs/components/blog-save-modal";

interface ProjectsViewProps {
  projects: QueryProjects["projects"];
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

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects }) => {
  const { openStudio } = useMdxStudio();
  const [meta, setMeta] = useState<ProjectFormData>(EMPTY_META);

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
      const links: Record<string, string> = {};
      if (sanitizeMetaText(current.github)) {
        links.github = sanitizeMetaText(current.github);
      }
      if (sanitizeMetaText(current.live)) {
        links.live = sanitizeMetaText(current.live);
      }
      if (Object.keys(links).length) {
        result.links = links;
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
                latest.category.trim().length > 0
              );
            }}
            buildDocument={(body) => {
              const yaml = stringify(buildMeta(), YAML_OPTIONS);
              return `---\n${yaml}---\n\n${body}`;
            }}
          />
        );
      },
      informationSlot: (
        <ProjectForm initialData={initialMeta} onChange={setMeta} />
      ),
      onSave: async () => {},
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
    onLoading?.(true)
    const file = project.slug ? `${project.slug}.mdx` : "";
    if (!file) {
      toast.danger("Could not determine project file.");
      return;
    }

    const res = await getProjectFileAction(file);
    if (!res.success || !res.content) {
      toast.danger(res.error || "Failed to load project file.");
      return;
    }

    const parsed = matter(res.content);
    const data = parsed.data as Record<string, any>;

    const editMeta: ProjectFormData = {
      title: typeof data.title === "string" ? data.title : "",
      description: typeof data.description === "string" ? data.description : "",
      category: typeof data.category === "string" ? data.category : "",
      tools: Array.isArray(data.tools) ? data.tools.join(", ") : "",
      github: typeof data.links?.github === "string" ? data.links.github : "",
      live: typeof data.links?.live === "string" ? data.links.live : "",
      thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : "",
      banner: typeof data.banner === "string" ? data.banner : "",
    };

    onLoading?.(false)
    setPendingOpen({
      kind: "edit",
      file,
      meta: editMeta,
      body: parsed.content,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-rethink text-white tracking-tight">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 leading-relaxed">
            Manage your builds, tools, and side projects.
          </p>
        </div>

        <div className="flex items-center gap-2 self-center shrink-0">
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

      {/* Project Cards Grid */}
      {projects.length === 0 ? (
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
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.slug || project.title}
              project={project}
              onEdit={handleEditProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
