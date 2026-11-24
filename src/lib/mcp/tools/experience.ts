import { db } from "@/lib/db";
import { Prisma } from "~/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { McpAuthContext } from "../auth";
import { ToolDefinition, CallToolResult } from "../protocol";

/**
 * Normalizes MDX markdown text to guarantee clean AST parsing by MDX Studio:
 * 1. Ensures every markdown heading (####) has an empty newline before and after it.
 * 2. Normalizes multiple empty lines down to a clean double newline (\n\n).
 */
export function normalizeMdxDescription(mdx: string): string {
  if (!mdx || typeof mdx !== "string") return "";

  return mdx
    .replace(/\r\n/g, "\n")
    // Ensure an empty line BEFORE any heading (e.g. text\n#### -> text\n\n####)
    .replace(/(^|[^\n])\n(#{1,6}[ \t]+[^\n]+)/g, "$1\n\n$2")
    // Ensure an empty line AFTER any heading (e.g. #### Title\n- Item -> #### Title\n\n- Item)
    .replace(/(#{1,6}[ \t]+[^\n]+)\n([^\n#])/g, "$1\n\n$2")
    // Clean up excessive blank lines (3+ down to 2)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const EXPERIENCE_TOOLS: ToolDefinition[] = [
  {
    name: "list_experiences",
    description:
      "List all work and professional experience entries from the portfolio (companies, roles, locations, dates, URLs, logos, and descriptions).",
    requiredScope: "read",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_experience",
    description: "Get detailed information for a specific experience entry by its numeric ID.",
    requiredScope: "read",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Numeric ID of the experience record to retrieve.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "create_experience_draft",
    description:
      "Create a draft for a work experience entry to be reviewed in the admin panel before publishing. If 'targetId' is provided, it creates an AI revision draft targeting an existing published experience, enabling line-by-line diff review (red/green) with PR-style Accept/Reject controls. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        targetId: {
          type: "number",
          description:
            "Optional numeric ID of an existing published experience entry to revise. If provided, the admin panel displays a diff comparison modal.",
        },
        company: {
          type: "string",
          description: "Company or organization name (e.g. 'Google', 'Vercel', 'Acme Corp').",
        },
        role: {
          type: "string",
          description: "Job title or position (e.g. 'Senior Full-Stack Engineer', 'Founding Engineer').",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format (e.g. '2022-03-01').",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present' / omitted if currently working there.",
        },
        location: {
          type: "string",
          description: "Job location or workplace mode (e.g. 'San Francisco, CA (Remote)', 'New York, NY', 'Remote').",
        },
        companyUrl: {
          type: "string",
          description: "Official website URL of the company (e.g. 'https://example.com').",
        },
        companyLogo: {
          type: "string",
          description: "Logo image URL for the company.",
        },
        description: {
          type: "string",
          description:
            "Markdown/MDX description. CRITICAL: Every heading (#### Title) MUST be followed by an empty line (\\n\\n) before any bullet list (- item) or text. No headings larger than level 4 (####).",
        },
      },
      required: ["company", "role", "start"],
      additionalProperties: false,
    },
  },
  {
    name: "patch_experience_draft",
    description:
      "Partially update an experience draft by ID (PATCH mode). Only provided fields will be merged into the draft JSON data. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the experience draft to patch.",
        },
        company: {
          type: "string",
          description: "Company or organization name.",
        },
        role: {
          type: "string",
          description: "Job title or position.",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format.",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present' / null if currently working there.",
        },
        location: {
          type: "string",
          description: "Location or remote status.",
        },
        companyUrl: {
          type: "string",
          description: "Company website URL.",
        },
        companyLogo: {
          type: "string",
          description: "Company logo URL.",
        },
        description: {
          type: "string",
          description: "Markdown description.",
        },
        targetId: {
          type: "number",
          description: "Optional numeric ID of an existing published experience to target as a revision.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "put_experience_draft",
    description:
      "Completely replace an existing experience draft's content (PUT mode). Replaces all draft fields with provided values. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the experience draft to replace.",
        },
        company: {
          type: "string",
          description: "Company or organization name.",
        },
        role: {
          type: "string",
          description: "Job title or position.",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format.",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present' / omitted if currently employed.",
        },
        location: {
          type: "string",
          description: "Location or remote status.",
        },
        companyUrl: {
          type: "string",
          description: "Company website URL.",
        },
        companyLogo: {
          type: "string",
          description: "Company logo URL.",
        },
        description: {
          type: "string",
          description: "Markdown description.",
        },
        targetId: {
          type: "number",
          description: "Optional numeric ID of an existing published experience entry to revise.",
        },
      },
      required: ["id", "company", "role", "start"],
      additionalProperties: false,
    },
  },
  {
    name: "create_experience",
    description:
      "Directly create and publish a new experience record in the portfolio. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        company: {
          type: "string",
          description: "Company or organization name.",
        },
        role: {
          type: "string",
          description: "Job title or position.",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format (e.g. '2022-01-01').",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present' / omitted if currently working there.",
        },
        location: {
          type: "string",
          description: "Location (e.g. 'San Francisco, CA (Remote)').",
        },
        companyUrl: {
          type: "string",
          description: "Company website URL.",
        },
        companyLogo: {
          type: "string",
          description: "Company logo URL.",
        },
        description: {
          type: "string",
          description: "Markdown description of responsibilities and achievements.",
        },
      },
      required: ["company", "role", "start"],
      additionalProperties: false,
    },
  },
  {
    name: "update_experience",
    description: "Directly update an existing published experience record by ID. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Numeric ID of the experience record to update.",
        },
        company: {
          type: "string",
          description: "Company name.",
        },
        role: {
          type: "string",
          description: "Role or position.",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format.",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present' / null if currently employed.",
        },
        location: {
          type: "string",
          description: "Location.",
        },
        companyUrl: {
          type: "string",
          description: "Company website URL.",
        },
        companyLogo: {
          type: "string",
          description: "Company logo URL.",
        },
        description: {
          type: "string",
          description: "Markdown description.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "delete_experience",
    description: "Delete an experience entry by ID. Requires write scope.",
    requiredScope: "write",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Numeric ID of the experience record to delete.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
];

export async function handleExperienceTool(
  toolName: string,
  args: Record<string, unknown> = {},
  auth: McpAuthContext,
): Promise<CallToolResult> {
  const hasWrite = auth.scopes.includes("write");

  switch (toolName) {
    case "list_experiences": {
      const records = await db.experience.findMany({
        orderBy: { start: "desc" },
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(records, null, 2),
          },
        ],
      };
    }

    case "get_experience": {
      const id = Number(args.id);
      if (!id || isNaN(id)) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid or missing 'id' argument." }],
        };
      }
      const record = await db.experience.findUnique({
        where: { id },
      });
      if (!record) {
        return {
          isError: true,
          content: [{ type: "text", text: `Experience entry with ID ${id} not found.` }],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(record, null, 2),
          },
        ],
      };
    }

    case "create_experience_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to create drafts." }],
        };
      }
      const targetId = args.targetId !== undefined && args.targetId !== null ? Number(args.targetId) : undefined;
      const company = String(args.company || "").trim();
      const role = String(args.role || "").trim();
      const start = String(args.start || "").trim();
      const end = args.end ? String(args.end).trim() : null;
      const location = args.location ? String(args.location).trim() : null;
      const companyUrl = args.companyUrl ? String(args.companyUrl).trim() : null;
      const companyLogo = args.companyLogo ? String(args.companyLogo).trim() : null;
      const description = normalizeMdxDescription(args.description ? String(args.description).trim() : "");

      if (!company || !role || !start) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required fields: company, role, start." }],
        };
      }

      const startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        return {
          isError: true,
          content: [{ type: "text", text: `Invalid start date: "${start}". Expected YYYY-MM-DD or ISO string.` }],
        };
      }

      if (end && end.toLowerCase() !== "present") {
        const endDate = new Date(end);
        if (isNaN(endDate.getTime())) {
          return {
            isError: true,
            content: [{ type: "text", text: `Invalid end date: "${end}". Expected YYYY-MM-DD, ISO string, or 'Present'.` }],
          };
        }
      }

      if (targetId !== undefined && (!targetId || isNaN(targetId))) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid 'targetId'. Expected a numeric experience ID." }],
        };
      }

      if (targetId) {
        const existingTarget = await db.experience.findUnique({ where: { id: targetId } });
        if (!existingTarget) {
          return {
            isError: true,
            content: [{ type: "text", text: `Target published experience entry with ID ${targetId} not found.` }],
          };
        }
      }

      const draftPayload: Record<string, unknown> = {
        company,
        role,
        start,
        end,
        location,
        companyUrl,
        companyLogo,
        description,
      };

      if (targetId) {
        draftPayload.targetId = targetId;
      }

      const draft = await db.draft.create({
        data: {
          type: "experience",
          status: "draft",
          data: draftPayload as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/experiences");

      const successMsg = targetId
        ? `Revision draft created successfully with ID: ${draft.id} targeting published Experience #${targetId}. It is ready for line-by-line diff review in the admin panel.`
        : `Experience draft created successfully with ID: ${draft.id}. It can now be reviewed in the admin panel.`;

      return {
        content: [
          {
            type: "text",
            text: successMsg,
          },
        ],
      };
    }

    case "patch_experience_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to patch drafts." }],
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
      if (!existing || existing.type !== "experience") {
        return {
          isError: true,
          content: [{ type: "text", text: `Experience draft with ID '${id}' not found.` }],
        };
      }

      const currentData = (existing.data as Record<string, unknown>) || {};
      const updatedData: Record<string, unknown> = { ...currentData };

      if (args.company !== undefined) updatedData.company = String(args.company).trim();
      if (args.role !== undefined) updatedData.role = String(args.role).trim();
      if (args.start !== undefined) {
        const startDate = new Date(String(args.start));
        if (isNaN(startDate.getTime())) {
          return {
            isError: true,
            content: [{ type: "text", text: `Invalid start date: "${args.start}". Expected YYYY-MM-DD or ISO string.` }],
          };
        }
        updatedData.start = String(args.start).trim();
      }
      if (args.end !== undefined) {
        if (args.end && String(args.end).toLowerCase() !== "present") {
          const endDate = new Date(String(args.end));
          if (isNaN(endDate.getTime())) {
            return {
              isError: true,
              content: [{ type: "text", text: `Invalid end date: "${args.end}". Expected YYYY-MM-DD, ISO string, or 'Present'.` }],
            };
          }
          updatedData.end = String(args.end).trim();
        } else {
          updatedData.end = args.end ? "Present" : null;
        }
      }
      if (args.location !== undefined) updatedData.location = args.location ? String(args.location).trim() : null;
      if (args.companyUrl !== undefined) updatedData.companyUrl = args.companyUrl ? String(args.companyUrl).trim() : null;
      if (args.companyLogo !== undefined) updatedData.companyLogo = args.companyLogo ? String(args.companyLogo).trim() : null;
      if (args.targetId !== undefined) {
        updatedData.targetId = args.targetId ? Number(args.targetId) : undefined;
      }
      if (args.description !== undefined) {
        updatedData.description = normalizeMdxDescription(String(args.description).trim());
      }

      const updated = await db.draft.update({
        where: { id },
        data: {
          data: updatedData as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/experiences");

      return {
        content: [
          {
            type: "text",
            text: `Experience draft '${id}' patched successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "put_experience_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to update drafts." }],
        };
      }

      const id = typeof args.id === "string" ? args.id.trim() : "";
      if (!id) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required 'id' argument." }],
        };
      }

      const company = String(args.company || "").trim();
      const role = String(args.role || "").trim();
      const start = String(args.start || "").trim();
      const end = args.end ? String(args.end).trim() : null;
      const location = args.location ? String(args.location).trim() : null;
      const companyUrl = args.companyUrl ? String(args.companyUrl).trim() : null;
      const companyLogo = args.companyLogo ? String(args.companyLogo).trim() : null;
      const targetId = args.targetId !== undefined && args.targetId !== null ? Number(args.targetId) : undefined;
      const description = normalizeMdxDescription(args.description ? String(args.description).trim() : "");

      if (!company || !role || !start) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required fields: company, role, start." }],
        };
      }

      const startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        return {
          isError: true,
          content: [{ type: "text", text: `Invalid start date: "${start}". Expected YYYY-MM-DD or ISO string.` }],
        };
      }

      if (end && end.toLowerCase() !== "present") {
        const endDate = new Date(end);
        if (isNaN(endDate.getTime())) {
          return {
            isError: true,
            content: [{ type: "text", text: `Invalid end date: "${end}". Expected YYYY-MM-DD, ISO string, or 'Present'.` }],
          };
        }
      }

      const existing = await db.draft.findUnique({ where: { id } });
      if (!existing || existing.type !== "experience") {
        return {
          isError: true,
          content: [{ type: "text", text: `Experience draft with ID '${id}' not found.` }],
        };
      }

      const putPayload: Record<string, unknown> = {
        company,
        role,
        start,
        end,
        location,
        companyUrl,
        companyLogo,
        description,
      };
      if (targetId) putPayload.targetId = targetId;

      const updated = await db.draft.update({
        where: { id },
        data: {
          data: putPayload as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/experiences");

      return {
        content: [
          {
            type: "text",
            text: `Experience draft '${id}' replaced (PUT) successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "create_experience": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to create experience records." }],
        };
      }

      const company = String(args.company || "").trim();
      const role = String(args.role || "").trim();
      const startStr = String(args.start || "").trim();
      const endStr = args.end ? String(args.end).trim() : null;
      const location = args.location ? String(args.location).trim() : null;
      const companyUrl = args.companyUrl ? String(args.companyUrl).trim() : null;
      const companyLogo = args.companyLogo ? String(args.companyLogo).trim() : null;
      const description = normalizeMdxDescription(args.description ? String(args.description).trim() : "");

      if (!company || !role || !startStr) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required fields: company, role, start." }],
        };
      }

      const startDate = new Date(startStr);
      if (isNaN(startDate.getTime())) {
        return {
          isError: true,
          content: [{ type: "text", text: `Invalid start date: "${startStr}". Expected YYYY-MM-DD or ISO string.` }],
        };
      }

      let endDate: Date | null = null;
      if (endStr && endStr.toLowerCase() !== "present") {
        const parsedEnd = new Date(endStr);
        if (isNaN(parsedEnd.getTime())) {
          return {
            isError: true,
            content: [{ type: "text", text: `Invalid end date: "${endStr}". Expected YYYY-MM-DD or ISO string.` }],
          };
        }
        endDate = parsedEnd;
      }

      const created = await db.experience.create({
        data: {
          company,
          role,
          start: startDate,
          end: endDate,
          location,
          companyUrl,
          companyLogo,
          description,
        },
      });

      revalidatePath("/admin/experiences");
      revalidatePath("/about");

      return {
        content: [
          {
            type: "text",
            text: `Experience record created successfully:\n${JSON.stringify(created, null, 2)}`,
          },
        ],
      };
    }

    case "update_experience": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to update experience records." }],
        };
      }

      const id = Number(args.id);
      if (!id || isNaN(id)) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid or missing 'id' argument." }],
        };
      }

      const existing = await db.experience.findUnique({ where: { id } });
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Experience record with ID ${id} not found.` }],
        };
      }

      const dataToUpdate: Prisma.ExperienceUpdateInput = {};

      if (args.company !== undefined) dataToUpdate.company = String(args.company).trim();
      if (args.role !== undefined) dataToUpdate.role = String(args.role).trim();
      if (args.location !== undefined) dataToUpdate.location = args.location ? String(args.location).trim() : null;
      if (args.companyUrl !== undefined) dataToUpdate.companyUrl = args.companyUrl ? String(args.companyUrl).trim() : null;
      if (args.companyLogo !== undefined) dataToUpdate.companyLogo = args.companyLogo ? String(args.companyLogo).trim() : null;

      if (args.start !== undefined) {
        const startDate = new Date(String(args.start));
        if (isNaN(startDate.getTime())) {
          return {
            isError: true,
            content: [{ type: "text", text: `Invalid start date: "${args.start}".` }],
          };
        }
        dataToUpdate.start = startDate;
      }

      if (args.end !== undefined) {
        if (!args.end || String(args.end).toLowerCase() === "present") {
          dataToUpdate.end = null;
        } else {
          const endDate = new Date(String(args.end));
          if (isNaN(endDate.getTime())) {
            return {
              isError: true,
              content: [{ type: "text", text: `Invalid end date: "${args.end}".` }],
            };
          }
          dataToUpdate.end = endDate;
        }
      }

      if (args.description !== undefined) {
        dataToUpdate.description = normalizeMdxDescription(String(args.description).trim());
      }

      const updated = await db.experience.update({
        where: { id },
        data: dataToUpdate,
      });

      revalidatePath("/admin/experiences");
      revalidatePath("/about");

      return {
        content: [
          {
            type: "text",
            text: `Experience record #${id} updated successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "delete_experience": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to delete experience records." }],
        };
      }

      const id = Number(args.id);
      if (!id || isNaN(id)) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid or missing 'id' argument." }],
        };
      }

      const existing = await db.experience.findUnique({ where: { id } });
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Experience record with ID ${id} not found.` }],
        };
      }

      await db.experience.delete({ where: { id } });

      revalidatePath("/admin/experiences");
      revalidatePath("/about");

      return {
        content: [
          {
            type: "text",
            text: `Experience record #${id} (${existing.role} at ${existing.company}) deleted successfully.`,
          },
        ],
      };
    }

    default:
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown experience tool: ${toolName}` }],
      };
  }
}
