import { readFile, access, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Prisma } from "~/generated/prisma/client";
import { getBlogs } from "@/lib/get-blogs";
import { McpAuthContext } from "../auth";
import { ToolDefinition, CallToolResult } from "../protocol";

const CONTENT_ROOT = path.join(process.cwd(), "content", "blogs");

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

export const BLOG_TOOLS: ToolDefinition[] = [
  {
    name: "list_blogs",
    description:
      "List published blog articles from the portfolio with titles, slugs, descriptions, tags, reading time, view counts, and timestamps. Supports keyword search and optional inclusion of pending drafts.",
    requiredScope: "read",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Optional keyword search query filtering by title, description, or tags.",
        },
        includeDrafts: {
          type: "boolean",
          description:
            "If true, includes pending blog drafts from the review queue and flags published articles that have active AI revision drafts.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_blog",
    description:
      "Get a published blog post by its URL slug, including raw MDX content, parsed frontmatter metadata, and view statistics.",
    requiredScope: "read",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The unique URL slug of the blog post (e.g. 'my-first-contribution-to-googles-gemini-cli').",
        },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "create_blog_draft",
    description:
      "Create a draft for a blog post to be reviewed in the admin panel before publishing. If 'targetSlug' is provided, it creates an AI revision draft targeting an existing published post.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        targetSlug: {
          type: "string",
          description:
            "Optional slug of an existing published blog post to revise. If provided, the admin panel displays a diff comparison modal.",
        },
        slug: {
          type: "string",
          description:
            "Proposed URL slug for the blog post. If omitted, will be generated automatically from the title.",
        },
        title: {
          type: "string",
          description: "The main title of the blog post.",
        },
        description: {
          type: "string",
          description: "Brief summary or abstract of the article (used in previews and SEO).",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "List of topical tags (e.g. ['TypeScript', 'Next.js', 'AI', 'Architecture']).",
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
            "Full article body written in MDX/Markdown. Can use components like <Callout>, <Cards>, <Steps>, <Template>, <User>, and Shiki code blocks.",
        },
      },
      required: ["title", "content"],
      additionalProperties: false,
    },
  },
  {
    name: "patch_blog_draft",
    description:
      "Partially update an existing blog draft by ID (PATCH mode). Only provided fields will be merged into the draft JSON data. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the blog draft to patch.",
        },
        targetSlug: {
          type: "string",
          description: "Slug of the published post being revised (or empty to convert to standalone draft).",
        },
        slug: {
          type: "string",
          description: "URL slug of the article.",
        },
        title: {
          type: "string",
          description: "Blog post title.",
        },
        description: {
          type: "string",
          description: "Article summary.",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Topical tags.",
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
          description: "Updated MDX article body.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "put_blog_draft",
    description:
      "Completely replace an existing blog draft's content (PUT mode). Replaces all draft fields with provided values. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the blog draft to replace.",
        },
        targetSlug: {
          type: "string",
          description: "Optional slug of an existing published blog post being revised.",
        },
        slug: {
          type: "string",
          description: "URL slug of the article.",
        },
        title: {
          type: "string",
          description: "Blog post title.",
        },
        description: {
          type: "string",
          description: "Article summary.",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Topical tags.",
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
          description: "Full MDX body of the blog post.",
        },
      },
      required: ["id", "title", "content"],
      additionalProperties: false,
    },
  },
];

export async function handleBlogTool(
  toolName: string,
  args: Record<string, unknown> = {},
  auth: McpAuthContext,
): Promise<CallToolResult> {
  const hasWrite = auth.scopes.includes("write");

  switch (toolName) {
    case "list_blogs": {
      const rawSearch = typeof args.search === "string" ? args.search.trim() : "";
      const searchLower = rawSearch.toLowerCase();
      const includeDrafts = Boolean(args.includeDrafts);

      let publishedBlogs: any[] = [];

      try {
        const result = await getBlogs({ limit: "all", search: rawSearch || undefined });
        publishedBlogs = result.blogs
          .filter((b) => b.slug && b.slug !== "index")
          .map((b) => ({
            ...b,
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
            const blogItem = {
              slug,
              title: parsed.data.title || slug,
              description: parsed.data.description || "",
              tags: parsed.data.tags || [],
              thumbnail:
                parsed.data.thumbnail || "/assets/blog-placeholder.webp",
              createdAt: parsed.data.createdAt,
              updatedAt: parsed.data.updatedAt,
              views: 0,
              isDraft: false,
            };

            if (searchLower) {
              const matchesTitle = blogItem.title.toLowerCase().includes(searchLower);
              const matchesDesc = blogItem.description.toLowerCase().includes(searchLower);
              const matchesTags = Array.isArray(blogItem.tags) && blogItem.tags.some((t: string) => String(t).toLowerCase().includes(searchLower));
              const matchesSlug = slug.toLowerCase().includes(searchLower);
              if (!matchesTitle && !matchesDesc && !matchesTags && !matchesSlug) {
                continue;
              }
            }

            publishedBlogs.push(blogItem);
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
              text: JSON.stringify(publishedBlogs, null, 2),
            },
          ],
        };
      }

      // Fetch pending blog drafts
      let drafts: any[] = [];
      try {
        drafts = await db.draft.findMany({
          where: { type: "blog" },
          orderBy: { updatedAt: "desc" },
        });
      } catch {
        // If DB is offline, continue with publishedBlogs
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
            title: data.title || "Untitled Draft",
            description: data.description || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            thumbnail: data.thumbnail || "/assets/blog-placeholder.webp",
            banner: data.banner || "",
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            isDraft: true,
            status: d.status,
          };

          if (searchLower) {
            const matchesTitle = draftItem.title.toLowerCase().includes(searchLower);
            const matchesDesc = draftItem.description.toLowerCase().includes(searchLower);
            const matchesTags = draftItem.tags.some((t: string) => String(t).toLowerCase().includes(searchLower));
            const matchesSlug = draftItem.slug.toLowerCase().includes(searchLower);
            if (!matchesTitle && !matchesDesc && !matchesTags && !matchesSlug) {
              continue;
            }
          }

          standaloneDrafts.push(draftItem);
        }
      }

      // Annotate published blogs with revision drafts info
      const annotatedPublished = publishedBlogs.map((b) => {
        const rev = b.slug ? revisionDraftsByTarget.get(b.slug) : null;
        if (rev) {
          return {
            ...b,
            hasRevisionDraft: true,
            revisionDraftId: rev.id,
          };
        }
        return {
          ...b,
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

    case "get_blog": {
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
          content: [{ type: "text", text: `Blog post with slug '${slug}' not found on disk.` }],
        };
      }

      const fileContent = await readFile(filePath, "utf8");
      const parsed = matter(fileContent);

      let totalViews = 0;
      try {
        const stats = await db.blogStat.findUnique({
          where: { slug },
          select: { totalViews: true },
        });
        totalViews = stats?.totalViews || 0;
      } catch {
        // Fallback to 0 if stats table is offline
      }

      const responsePayload = {
        slug,
        frontmatter: parsed.data,
        body: parsed.content,
        views: totalViews,
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

    case "create_blog_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to create blog drafts." }],
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
      const slug = sanitizeSlug(rawSlug) || "blog-post";

      const targetSlug = args.targetSlug ? sanitizeSlug(String(args.targetSlug)) : undefined;
      if (targetSlug) {
        const targetPath = path.join(CONTENT_ROOT, `${targetSlug}.mdx`);
        if (!(await fileExists(targetPath))) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Target blog post with slug '${targetSlug}' does not exist on disk to revise.`,
              },
            ],
          };
        }
      }

      const tags = Array.isArray(args.tags)
        ? args.tags.map((t) => String(t).trim()).filter(Boolean)
        : [];
      const description = args.description ? String(args.description).trim() : "";
      const thumbnail = args.thumbnail ? String(args.thumbnail).trim() : "";
      const banner = args.banner ? String(args.banner).trim() : "";

      const draftPayload: Record<string, unknown> = {
        slug,
        title,
        description,
        tags,
        thumbnail,
        banner,
        content,
      };

      if (targetSlug) {
        draftPayload.targetSlug = targetSlug;
      }

      const draft = await db.draft.create({
        data: {
          type: "blog",
          status: "draft",
          data: draftPayload as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/blogs");

      const successMsg = targetSlug
        ? `Revision draft created successfully with ID: ${draft.id} targeting published article '${targetSlug}'. It is ready for line-by-line diff review in the admin panel.`
        : `Blog draft created successfully with ID: ${draft.id} for '${title}'. It can now be reviewed in the admin panel.`;

      return {
        content: [
          {
            type: "text",
            text: successMsg,
          },
        ],
      };
    }

    case "patch_blog_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to patch blog drafts." }],
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
      if (!existing || existing.type !== "blog") {
        return {
          isError: true,
          content: [{ type: "text", text: `Blog draft with ID '${id}' not found.` }],
        };
      }

      const currentData = (existing.data as Record<string, unknown>) || {};
      const updatedData: Record<string, unknown> = { ...currentData };

      if (args.title !== undefined) updatedData.title = String(args.title).trim();
      if (args.description !== undefined) updatedData.description = String(args.description).trim();
      if (args.content !== undefined) updatedData.content = String(args.content).trim();
      if (args.slug !== undefined) updatedData.slug = sanitizeSlug(String(args.slug));
      if (args.thumbnail !== undefined) updatedData.thumbnail = String(args.thumbnail).trim();
      if (args.banner !== undefined) updatedData.banner = String(args.banner).trim();
      if (args.tags !== undefined) {
        updatedData.tags = Array.isArray(args.tags)
          ? args.tags.map((t) => String(t).trim()).filter(Boolean)
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

      revalidatePath("/admin/blogs");

      return {
        content: [
          {
            type: "text",
            text: `Blog draft '${id}' patched successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "put_blog_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to update blog drafts." }],
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
      if (!existing || existing.type !== "blog") {
        return {
          isError: true,
          content: [{ type: "text", text: `Blog draft with ID '${id}' not found.` }],
        };
      }

      const rawSlug = args.slug ? String(args.slug) : title;
      const slug = sanitizeSlug(rawSlug) || "blog-post";
      const targetSlug = args.targetSlug ? sanitizeSlug(String(args.targetSlug)) : undefined;

      const putPayload: Record<string, unknown> = {
        slug,
        title,
        description: args.description ? String(args.description).trim() : "",
        tags: Array.isArray(args.tags)
          ? args.tags.map((t) => String(t).trim()).filter(Boolean)
          : [],
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

      revalidatePath("/admin/blogs");

      return {
        content: [
          {
            type: "text",
            text: `Blog draft '${id}' replaced (PUT) successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    default:
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown blog tool: ${toolName}` }],
      };
  }
}
