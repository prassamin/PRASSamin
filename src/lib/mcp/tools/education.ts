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

export const EDUCATION_TOOLS: ToolDefinition[] = [
  {
    name: "list_educations",
    description:
      "List all education history entries from the portfolio (degrees, universities, fields of study, dates, and descriptions).",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_education",
    description: "Get detailed information for a specific education entry by its numeric ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Numeric ID of the education record to retrieve.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "create_education_draft",
    description:
      "Create a draft for an education entry to be reviewed in the admin panel before publishing. If 'targetId' is provided, it creates a revision draft on an existing published education record, enabling line-by-line diff review (red/green) with Accept/Reject controls. Requires write scope.",
    inputSchema: {
      type: "object",
      properties: {
        targetId: {
          type: "number",
          description:
            "Optional numeric ID of an existing published education entry to revise. If provided, the admin panel displays a diff comparison modal.",
        },
        school: {
          type: "string",
          description: "Institution or school name (e.g. 'University of Dhaka').",
        },
        degree: {
          type: "string",
          description: "Degree or qualification (e.g. 'Bachelor of Science').",
        },
        field: {
          type: "string",
          description: "Field or major of study (e.g. 'Computer Science & Engineering').",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format (e.g. '2020-01-01').",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present' / omitted if currently enrolled.",
        },
        description: {
          type: "string",
          description:
            "Markdown description. CRITICAL: Every heading (#### Title) MUST be followed by an empty line (\\n\\n) before any bullet list (- item) or text. No headings larger than level 4 (####).",
        },
      },
      required: ["school", "degree", "field", "start"],
      additionalProperties: false,
    },
  },
  {
    name: "patch_education_draft",
    description:
      "Partially update an education draft by ID (PATCH mode). Only provided fields will be merged into the draft. Requires write scope.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Draft ID (CUID) of the education draft to update.",
        },
        school: {
          type: "string",
          description: "Institution or school name.",
        },
        degree: {
          type: "string",
          description: "Degree or qualification.",
        },
        field: {
          type: "string",
          description: "Field of study.",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format.",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present'.",
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
    name: "put_education_draft",
    description:
      "Completely replace an education draft's content by ID (PUT mode). Requires write scope and all required fields.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Draft ID (CUID) of the education draft to overwrite.",
        },
        school: {
          type: "string",
          description: "Institution or school name.",
        },
        degree: {
          type: "string",
          description: "Degree or qualification.",
        },
        field: {
          type: "string",
          description: "Field of study.",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format.",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present'.",
        },
        description: {
          type: "string",
          description: "Markdown description.",
        },
      },
      required: ["id", "school", "degree", "field", "start"],
      additionalProperties: false,
    },
  },
  {
    name: "create_education",
    description:
      "Directly create a published education record in the database. Requires write scope.",
    inputSchema: {
      type: "object",
      properties: {
        school: {
          type: "string",
          description: "Institution or school name.",
        },
        degree: {
          type: "string",
          description: "Degree or qualification.",
        },
        field: {
          type: "string",
          description: "Field of study.",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format.",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present' / omitted if currently enrolled.",
        },
        description: {
          type: "string",
          description: "Markdown description.",
        },
      },
      required: ["school", "degree", "field", "start"],
      additionalProperties: false,
    },
  },
  {
    name: "update_education",
    description: "Update an existing education entry by ID. Requires write scope.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Numeric ID of the education record to update.",
        },
        school: {
          type: "string",
          description: "Institution or school name.",
        },
        degree: {
          type: "string",
          description: "Degree or qualification.",
        },
        field: {
          type: "string",
          description: "Field of study.",
        },
        start: {
          type: "string",
          description: "Start date in ISO or YYYY-MM-DD format.",
        },
        end: {
          type: "string",
          description: "End date in ISO or YYYY-MM-DD format, or 'Present' / null if currently enrolled.",
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
    name: "delete_education",
    description: "Delete an education entry by ID. Requires write scope.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Numeric ID of the education record to delete.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
];

export async function handleEducationTool(
  toolName: string,
  args: Record<string, unknown> = {},
  auth: McpAuthContext,
): Promise<CallToolResult> {
  const hasWrite = auth.scopes.includes("write");

  switch (toolName) {
    case "list_educations": {
      const records = await db.education.findMany({
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

    case "get_education": {
      const id = Number(args.id);
      if (!id || isNaN(id)) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid or missing 'id' argument." }],
        };
      }
      const record = await db.education.findUnique({
        where: { id },
      });
      if (!record) {
        return {
          isError: true,
          content: [{ type: "text", text: `Education entry with ID ${id} not found.` }],
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

    case "create_education_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to create drafts." }],
        };
      }
      const targetId = args.targetId !== undefined && args.targetId !== null ? Number(args.targetId) : undefined;
      const school = String(args.school || "").trim();
      const degree = String(args.degree || "").trim();
      const field = String(args.field || "").trim();
      const start = String(args.start || "").trim();
      const end = args.end ? String(args.end).trim() : null;
      const description = normalizeMdxDescription(args.description ? String(args.description).trim() : "");

      if (!school || !degree || !field || !start) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required fields: school, degree, field, start." }],
        };
      }

      if (targetId !== undefined && (!targetId || isNaN(targetId))) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid 'targetId'. Expected a numeric education ID." }],
        };
      }

      if (targetId) {
        const existingTarget = await db.education.findUnique({ where: { id: targetId } });
        if (!existingTarget) {
          return {
            isError: true,
            content: [{ type: "text", text: `Target published education entry with ID ${targetId} not found.` }],
          };
        }
      }

      const draftPayload: Record<string, unknown> = {
        school,
        degree,
        field,
        start,
        end,
        description,
      };

      if (targetId) {
        draftPayload.targetId = targetId;
      }

      const draft = await db.draft.create({
        data: {
          type: "education",
          status: "draft",
          data: draftPayload as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/educations");

      const successMsg = targetId
        ? `Revision draft created successfully with ID: ${draft.id} targeting published Education #${targetId}. It is ready for line-by-line diff review in the admin panel.`
        : `Education draft created successfully with ID: ${draft.id}. It can now be reviewed in the admin panel.`;

      return {
        content: [
          {
            type: "text",
            text: successMsg,
          },
        ],
      };
    }

    case "patch_education_draft": {
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
      if (!existing || existing.type !== "education") {
        return {
          isError: true,
          content: [{ type: "text", text: `Education draft with ID '${id}' not found.` }],
        };
      }

      const existingData =
        existing.data && typeof existing.data === "object" && !Array.isArray(existing.data)
          ? (existing.data as Record<string, unknown>)
          : {};

      const patch: Record<string, unknown> = {};
      if (typeof args.school === "string") patch.school = args.school.trim();
      if (typeof args.degree === "string") patch.degree = args.degree.trim();
      if (typeof args.field === "string") patch.field = args.field.trim();
      if (typeof args.start === "string") patch.start = args.start.trim();
      if (args.end !== undefined) {
        patch.end = args.end ? String(args.end).trim() : null;
      }
      if (typeof args.description === "string") patch.description = normalizeMdxDescription(args.description.trim());

      const updated = await db.draft.update({
        where: { id },
        data: {
          data: {
            ...existingData,
            ...patch,
          } as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/admin/educations");

      return {
        content: [
          {
            type: "text",
            text: `Education draft '${id}' patched successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "put_education_draft": {
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

      const school = String(args.school || "").trim();
      const degree = String(args.degree || "").trim();
      const field = String(args.field || "").trim();
      const start = String(args.start || "").trim();
      const end = args.end ? String(args.end).trim() : null;
      const description = normalizeMdxDescription(args.description ? String(args.description).trim() : "");

      if (!school || !degree || !field || !start) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required fields: school, degree, field, start." }],
        };
      }

      const existing = await db.draft.findUnique({ where: { id } });
      if (!existing || existing.type !== "education") {
        return {
          isError: true,
          content: [{ type: "text", text: `Education draft with ID '${id}' not found.` }],
        };
      }

      const updated = await db.draft.update({
        where: { id },
        data: {
          data: {
            school,
            degree,
            field,
            start,
            end,
            description,
          },
        },
      });

      revalidatePath("/admin/educations");

      return {
        content: [
          {
            type: "text",
            text: `Education draft '${id}' replaced (PUT) successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "create_education": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to create education records." }],
        };
      }

      const school = String(args.school || "").trim();
      const degree = String(args.degree || "").trim();
      const field = String(args.field || "").trim();
      const startStr = String(args.start || "").trim();
      const endStr = args.end ? String(args.end).trim() : null;
      const description = normalizeMdxDescription(args.description ? String(args.description).trim() : "");

      if (!school || !degree || !field || !startStr) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required fields: school, degree, field, start." }],
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
        if (!isNaN(parsedEnd.getTime())) {
          endDate = parsedEnd;
        }
      }

      const created = await db.education.create({
        data: {
          school,
          degree,
          field,
          start: startDate,
          end: endDate,
          description,
        },
      });

      revalidatePath("/admin/educations");
      revalidatePath("/about");

      return {
        content: [
          {
            type: "text",
            text: `Education record created successfully:\n${JSON.stringify(created, null, 2)}`,
          },
        ],
      };
    }

    case "update_education": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to update education records." }],
        };
      }

      const id = Number(args.id);
      if (!id || isNaN(id)) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid or missing 'id' argument." }],
        };
      }

      const existing = await db.education.findUnique({ where: { id } });
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Education record with ID ${id} not found.` }],
        };
      }

      const patch: Record<string, any> = {};
      if (typeof args.school === "string") patch.school = args.school.trim();
      if (typeof args.degree === "string") patch.degree = args.degree.trim();
      if (typeof args.field === "string") patch.field = args.field.trim();
      if (typeof args.description === "string") patch.description = normalizeMdxDescription(args.description.trim());

      if (typeof args.start === "string") {
        const d = new Date(args.start);
        if (isNaN(d.getTime())) {
          return {
            isError: true,
            content: [{ type: "text", text: `Invalid start date: "${args.start}".` }],
          };
        }
        patch.start = d;
      }

      if (args.end !== undefined) {
        if (!args.end || String(args.end).toLowerCase() === "present") {
          patch.end = null;
        } else {
          const d = new Date(String(args.end));
          if (!isNaN(d.getTime())) {
            patch.end = d;
          }
        }
      }

      const updated = await db.education.update({
        where: { id },
        data: patch,
      });

      revalidatePath("/admin/educations");
      revalidatePath("/about");

      return {
        content: [
          {
            type: "text",
            text: `Education record updated successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "delete_education": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to delete education records." }],
        };
      }

      const id = Number(args.id);
      if (!id || isNaN(id)) {
        return {
          isError: true,
          content: [{ type: "text", text: "Invalid or missing 'id' argument." }],
        };
      }

      const existing = await db.education.findUnique({ where: { id } });
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Education record with ID ${id} not found.` }],
        };
      }

      await db.education.delete({ where: { id } });

      revalidatePath("/admin/educations");
      revalidatePath("/about");

      return {
        content: [
          {
            type: "text",
            text: `Education record ${id} (${existing.degree} at ${existing.school}) deleted successfully.`,
          },
        ],
      };
    }

    default:
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown education tool: ${toolName}` }],
      };
  }
}
