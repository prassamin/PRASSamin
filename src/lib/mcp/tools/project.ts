import { readFile, access, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Prisma } from "~/generated/prisma/client";
import { getProjects } from "@/lib/get-projects";
import { McpAuthContext } from "../auth";
import { ToolDefinition, CallToolResult } from "../protocol";

const CONTENT_ROOT = path.join(process.cwd(), "content", "projects");

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export const PROJECT_TOOLS: ToolDefinition[] = [
  {
    name: "list_projects",
    description:
      "List published projects from the portfolio with titles, slugs, categories, tools, links, view counts, and timestamps. Supports keyword search and optional inclusion of pending drafts.",
    requiredScope: "read",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Optional keyword search query filtering by title, description, category, or tools.",
        },
        includeDrafts: {
          type: "boolean",
          description:
            "If true, includes pending project drafts from the review queue and flags published projects that have active AI revision drafts.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_project",
    description:
      "Get a published project showcase by its URL slug, including raw MDX content, parsed frontmatter metadata, and view statistics.",
    requiredScope: "read",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The unique URL slug of the project (e.g. 'envdrop', 'prettyshot').",
        },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "create_project_draft",
    description:
      "Create a draft for a project showcase to be reviewed in the admin panel before publishing. If 'targetSlug' is provided, it creates an AI revision draft targeting an existing published project.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        targetSlug: {
          type: "string",
          description:
            "Optional slug of an existing published project to revise. If provided, the admin panel displays a diff comparison modal.",
        },
        slug: {
          type: "string",
          description:
            "Proposed URL slug for the project. If omitted, will be generated automatically from the title.",
        },
        title: {
          type: "string",
          description: "The main title of the project showcase.",
        },
        description: {
          type: "string",
          description: "Brief summary or abstract of the project (used in previews and SEO).",
        },
        category: {
          type: "string",
          description: "Category of the project (e.g. 'Security', 'Open Source', 'Fullstack', 'AI', 'Developer Tools').",
        },
        tools: {
          type: "array",
          items: { type: "string" },
          description: "List of technologies/tools used (e.g. ['Nextjs', 'Typescript', 'Tailwindcss', 'Redis']).",
        },
        github: {
          type: "string",
          description: "GitHub repository URL.",
        },
        live: {
          type: "string",
          description: "Live demonstration or production URL.",
        },
        thumbnail: {
          type: "string",
          description: "Cover thumbnail image URL.",
        },
        banner: {
          type: "string",
          description: "Wide header banner image URL (optional).",
        },
        content: {
          type: "string",
          description:
            "Full project case study written in MDX/Markdown. Can use components like <Callout>, <Cards>, <Card>, <Steps>, <Tabs>, and Shiki code blocks.",
        },
      },
      required: ["title", "content"],
      additionalProperties: false,
    },
  },
  {
    name: "patch_project_draft",
    description:
      "Partially update an existing project draft by ID (PATCH mode). Only provided fields will be merged into the draft JSON data. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the project draft to patch.",
        },
        targetSlug: {
          type: "string",
          description: "Slug of the published project being revised (or empty to convert to standalone draft).",
        },
        slug: {
          type: "string",
          description: "URL slug of the project.",
        },
        title: {
          type: "string",
          description: "Project title.",
        },
        description: {
          type: "string",
          description: "Project summary.",
        },
        category: {
          type: "string",
          description: "Project category.",
        },
        tools: {
          type: "array",
          items: { type: "string" },
          description: "List of technologies/tools used.",
        },
        github: {
          type: "string",
          description: "GitHub repository URL.",
        },
        live: {
          type: "string",
          description: "Live demonstration URL.",
        },
        thumbnail: {
          type: "string",
          description: "Thumbnail image URL.",
        },
        banner: {
          type: "string",
          description: "Banner image URL.",
        },
        content: {
          type: "string",
          description: "Updated MDX project body.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "put_project_draft",
    description:
      "Completely replace an existing project draft's content (PUT mode). Replaces all draft fields with provided values. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the project draft to replace.",
        },
        targetSlug: {
          type: "string",
          description: "Optional slug of an existing published project being revised.",
        },
        slug: {
          type: "string",
          description: "URL slug of the project.",
        },
        title: {
          type: "string",
          description: "Project title.",
        },
        description: {
          type: "string",
          description: "Project summary.",
        },
        category: {
          type: "string",
          description: "Project category.",
        },
        tools: {
          type: "array",
          items: { type: "string" },
          description: "Technologies used.",
        },
        github: {
          type: "string",
          description: "GitHub repository URL.",
        },
        live: {
          type: "string",
          description: "Live URL.",
        },
        thumbnail: {
          type: "string",
          description: "Thumbnail image URL.",
        },
        banner: {
          type: "string",
          description: "Banner image URL.",
        },
        content: {
          type: "string",
          description: "Full MDX body of the project case study.",
        },
      },
      required: ["id", "title", "content"],
      additionalProperties: false,
    },
  },
];

export async function handleProjectTool(
  toolName: string,
  args: Record<string, unknown> = {},
  auth: McpAuthContext,
): Promise<CallToolResult> {
  const hasWrite = auth.scopes.includes("write");

  switch (toolName) {
    case "list_projects": {
      const rawSearch = typeof args.search === "string" ? args.search.trim() : "";
      const searchLower = rawSearch.toLowerCase();
      const includeDrafts = Boolean(args.includeDrafts);

      let publishedProjects: any[] = [];

      try {
        const result = await getProjects({ limit: "all", search: rawSearch || undefined });
        publishedProjects = result.projects
          .filter((p) => p.slug && p.slug !== "index")
          .map((p) => ({
            ...p,
            isDraft: false,
          }));
      } catch {
        // Fallback to disk scan if database stats are unreachable
        const files = await readdir(CONTENT_ROOT);
        const mdxFiles = files.filter(
          (f) => f.endsWith(".mdx") && f !== "index.mdx",
        );
        for (const file of mdxFiles) {
          try {
            const raw = await readFile(path.join(CONTENT_ROOT, file), "utf8");
            const parsed = matter(raw);
            const slug = file.replace(/\.mdx$/, "");
            const projectItem = {
              slug,
              title: parsed.data.title || slug,
              description: parsed.data.description || "",
              category: parsed.data.category || "",
              tools: parsed.data.tools || [],
              github: parsed.data.github || "",
              live: parsed.data.live || "",
              thumbnail: parsed.data.thumbnail || "",
              banner: parsed.data.banner || "",
              createdAt: parsed.data.createdAt,
              updatedAt: parsed.data.updatedAt,
              views: 0,
              isDraft: false,
            };

            if (searchLower) {
              const matchesTitle = projectItem.title.toLowerCase().includes(searchLower);
              const matchesDesc = projectItem.description.toLowerCase().includes(searchLower);
              const matchesCategory = projectItem.category.toLowerCase().includes(searchLower);
              const matchesTools = Array.isArray(projectItem.tools) && projectItem.tools.some((t: string) => String(t).toLowerCase().includes(searchLower));
              const matchesSlug = slug.toLowerCase().includes(searchLower);
              if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesTools && !matchesSlug) {
                continue;
              }
            }

            publishedProjects.push(projectItem);
          } catch {
            // Ignore unreadable files
          }
        }
      }

      if (!includeDrafts) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(publishedProjects, null, 2),
            },
          ],
        };
      }

      // Fetch pending project drafts
      let drafts: any[] = [];
      try {
        drafts = await db.draft.findMany({
          where: { type: "project" },
          orderBy: { updatedAt: "desc" },
        });
      } catch {
        // If DB is offline, continue with publishedProjects
      }

      const revisionDraftsByTarget = new Map<string, any>();
      const standaloneDrafts: any[] = [];

      for (const d of drafts) {
        const data = (d.data as Record<string, any>) || {};
        const targetSlug = data.targetSlug;
        if (typeof targetSlug === "string" && targetSlug.trim().length > 0) {
          revisionDraftsByTarget.set(targetSlug.trim(), d);
        } else {
          const draftItem = {
            id: d.id,
            slug: data.slug || "",
            title: data.title || "Untitled Project Draft",
            description: data.description || "",
            category: data.category || "",
            tools: Array.isArray(data.tools) ? data.tools : [],
            github: data.github || "",
            live: data.live || "",
            thumbnail: data.thumbnail || "",
            banner: data.banner || "",
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            isDraft: true,
            status: d.status,
          };

          if (searchLower) {
            const matchesTitle = draftItem.title.toLowerCase().includes(searchLower);
            const matchesDesc = draftItem.description.toLowerCase().includes(searchLower);
            const matchesCategory = draftItem.category.toLowerCase().includes(searchLower);
            const matchesTools = draftItem.tools.some((t: string) => String(t).toLowerCase().includes(searchLower));
            const matchesSlug = draftItem.slug.toLowerCase().includes(searchLower);
            if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesTools && !matchesSlug) {
              continue;
            }
          }

          standaloneDrafts.push(draftItem);
        }
      }

      // Annotate published projects with revision drafts info
      const annotatedPublished = publishedProjects.map((p) => {
        const rev = p.slug ? revisionDraftsByTarget.get(p.slug) : null;
        if (rev) {
          return {
            ...p,
            hasRevisionDraft: true,
            revisionDraftId: rev.id,
          };
        }
        return {
          ...p,
          hasRevisionDraft: false,
        };
      });

      const combined = [
        ...standaloneDrafts,
        ...annotatedPublished,
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(combined, null, 2),
          },
        ],
      };
    }

    case "get_project": {
      const rawSlug = String(args.slug || "").trim();
      const slug = sanitizeSlug(rawSlug);
      if (!slug) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid or missing 'slug' argument." }],
        };
      }

      const filePath = path.join(CONTENT_ROOT, `${slug}.mdx`);
      if (!(await fileExists(filePath))) {
        return {
          isError: true,
          content: [{ type: "text", text: `Project showcase with slug '${slug}' not found on disk.` }],
        };
      }

      const fileContent = await readFile(filePath, "utf8");
      const parsed = matter(fileContent);

      let totalViews = 0;
      try {
        const stats = await db.projectStat.findUnique({
          where: { slug },
          select: { totalViews: true },
        });
        totalViews = stats?.totalViews || 0;
      } catch {
        // Fallback to 0 if stats table is offline
      }

      // Check for active revision draft
      let activeDraft: any = null;
      try {
        const draft = await db.draft.findFirst({
          where: {
            type: "project",
            OR: [
              { data: { path: ["targetSlug"], equals: slug } },
              { data: { path: ["slug"], equals: slug } },
            ],
          },
        });
        if (draft) {
          activeDraft = {
            id: draft.id,
            status: draft.status,
            updatedAt: draft.updatedAt,
          };
        }
      } catch {
        // Ignore DB draft query error
      }

      const responsePayload = {
        slug,
        frontmatter: parsed.data,
        body: parsed.content,
        views: totalViews,
        activeDraft,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(responsePayload, null, 2),
          },
        ],
      };
    }

    case "create_project_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to create project drafts." }],
        };
      }

      const title = String(args.title || "").trim();
      const content = String(args.content || "").trim();
      if (!title || !content) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required fields: title, content." }],
        };
      }

      const rawSlug = args.slug ? String(args.slug) : title;
      const slug = sanitizeSlug(rawSlug) || "project-showcase";

      const targetSlug = args.targetSlug ? sanitizeSlug(String(args.targetSlug)) : undefined;
      if (targetSlug) {
        const targetPath = path.join(CONTENT_ROOT, `${targetSlug}.mdx`);
        if (!(await fileExists(targetPath))) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Target project with slug '${targetSlug}' does not exist on disk to revise.`,
              },
            ],
          };
        }
      }

      const category = args.category ? String(args.category).trim() : "";
      const tools = Array.isArray(args.tools)
        ? args.tools.map((t) => String(t).trim()).filter(Boolean)
        : [];
      const description = args.description ? String(args.description).trim() : "";
      const github = args.github ? String(args.github).trim() : "";
      const live = args.live ? String(args.live).trim() : "";
      const thumbnail = args.thumbnail ? String(args.thumbnail).trim() : "";
      const banner = args.banner ? String(args.banner).trim() : "";

      const draftPayload: Record<string, unknown> = {
        slug,
        title,
        description,
        category,
        tools,
        github,
        live,
        thumbnail,
        banner,
        content,
      };

      if (targetSlug) {
        draftPayload.targetSlug = targetSlug;
      }

      const draft = await db.draft.create({
        data: {
          type: "project",
          status: "draft",
          data: draftPayload as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/projects");

      const successMsg = targetSlug
        ? `Revision draft created successfully with ID: ${draft.id} targeting published project '${targetSlug}'. It is ready for line-by-line diff review in the admin panel.`
        : `Project draft created successfully with ID: ${draft.id} for '${title}'. It can now be reviewed in the admin panel.`;

      return {
        content: [
          {
            type: "text",
            text: successMsg,
          },
        ],
      };
    }

    case "patch_project_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to patch project drafts." }],
        };
      }

      const id = typeof args.id === "string" ? args.id.trim() : "";
      if (!id) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required 'id' argument." }],
        };
      }

      const existing = await db.draft.findUnique({ where: { id } });
      if (!existing || existing.type !== "project") {
        return {
          isError: true,
          content: [{ type: "text", text: `Project draft with ID '${id}' not found.` }],
        };
      }

      const currentData = (existing.data as Record<string, unknown>) || {};
      const updatedData: Record<string, unknown> = { ...currentData };

      if (args.title !== undefined) updatedData.title = String(args.title).trim();
      if (args.description !== undefined) updatedData.description = String(args.description).trim();
      if (args.category !== undefined) updatedData.category = String(args.category).trim();
      if (args.content !== undefined) updatedData.content = String(args.content).trim();
      if (args.slug !== undefined) updatedData.slug = sanitizeSlug(String(args.slug));
      if (args.github !== undefined) updatedData.github = String(args.github).trim();
      if (args.live !== undefined) updatedData.live = String(args.live).trim();
      if (args.thumbnail !== undefined) updatedData.thumbnail = String(args.thumbnail).trim();
      if (args.banner !== undefined) updatedData.banner = String(args.banner).trim();
      if (args.tools !== undefined) {
        updatedData.tools = Array.isArray(args.tools)
          ? args.tools.map((t) => String(t).trim()).filter(Boolean)
          : [];
      }
      if (args.targetSlug !== undefined) {
        const rawTarget = String(args.targetSlug).trim();
        updatedData.targetSlug = rawTarget ? sanitizeSlug(rawTarget) : undefined;
      }

      const updated = await db.draft.update({
        where: { id },
        data: {
          data: updatedData as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/projects");

      return {
        content: [
          {
            type: "text",
            text: `Project draft '${id}' patched successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "put_project_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to update project drafts." }],
        };
      }

      const id = typeof args.id === "string" ? args.id.trim() : "";
      if (!id) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required 'id' argument." }],
        };
      }

      const title = String(args.title || "").trim();
      const content = String(args.content || "").trim();
      if (!title || !content) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required fields: title, content." }],
        };
      }

      const existing = await db.draft.findUnique({ where: { id } });
      if (!existing || existing.type !== "project") {
        return {
          isError: true,
          content: [{ type: "text", text: `Project draft with ID '${id}' not found.` }],
        };
      }

      const rawSlug = args.slug ? String(args.slug) : title;
      const slug = sanitizeSlug(rawSlug) || "project-showcase";
      const targetSlug = args.targetSlug ? sanitizeSlug(String(args.targetSlug)) : undefined;

      const putPayload: Record<string, unknown> = {
        slug,
        title,
        description: args.description ? String(args.description).trim() : "",
        category: args.category ? String(args.category).trim() : "",
        tools: Array.isArray(args.tools)
          ? args.tools.map((t) => String(t).trim()).filter(Boolean)
          : [],
        github: args.github ? String(args.github).trim() : "",
        live: args.live ? String(args.live).trim() : "",
        thumbnail: args.thumbnail ? String(args.thumbnail).trim() : "",
        banner: args.banner ? String(args.banner).trim() : "",
        content,
      };
      if (targetSlug) putPayload.targetSlug = targetSlug;

      const updated = await db.draft.update({
        where: { id },
        data: {
          data: putPayload as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/projects");

      return {
        content: [
          {
            type: "text",
            text: `Project draft '${id}' replaced (PUT) successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    default:
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown project tool: ${toolName}` }],
      };
  }
}
