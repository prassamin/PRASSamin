import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { McpAuthContext } from "../auth";
import { ToolDefinition, CallToolResult } from "../protocol";

export const DRAFT_TOOLS: ToolDefinition[] = [
  {
    name: "list_drafts",
    description: "List pending drafts with optional filtering by type (e.g. 'education', 'blog', 'project') or status.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Optional draft type filter (e.g. 'education', 'blog', 'project', 'experience').",
        },
        status: {
          type: "string",
          description: "Optional status filter (e.g. 'draft', 'published', 'archived'). Defaults to 'draft'.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_draft",
    description: "Retrieve a draft by its CUID string ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the draft.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "patch_draft",
    description:
      "Partially update an existing draft (PATCH mode). Deep-merges new fields into the draft's existing JSON data without losing unmentioned keys. Optionally updates status. Requires write scope.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the draft to patch.",
        },
        data: {
          type: "object",
          description: "Key-value fields to merge into the draft's data payload.",
        },
        status: {
          type: "string",
          description: "Optional new status (e.g. 'draft', 'published', 'archived').",
        },
      },
      required: ["id", "data"],
      additionalProperties: false,
    },
  },
  {
    name: "put_draft",
    description:
      "Completely replace an existing draft's data (PUT mode). Replaces the entire JSON data payload with the provided object. Requires write scope.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the draft to overwrite.",
        },
        data: {
          type: "object",
          description: "The complete new JSON data payload.",
        },
        status: {
          type: "string",
          description: "Optional new status (e.g. 'draft', 'published', 'archived').",
        },
      },
      required: ["id", "data"],
      additionalProperties: false,
    },
  },
  {
    name: "delete_draft",
    description: "Delete a draft by its CUID. Requires write scope.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID (CUID) of the draft to delete.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
];

export async function handleDraftTool(
  toolName: string,
  args: Record<string, unknown> = {},
  auth: McpAuthContext,
): Promise<CallToolResult> {
  const hasWrite = auth.scopes.includes("write");

  switch (toolName) {
    case "list_drafts": {
      const type = typeof args.type === "string" ? args.type.trim() : undefined;
      const status = typeof args.status === "string" ? args.status.trim() : "draft";

      const whereClause: { type?: string; status?: string } = {};
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;

      const drafts = await db.draft.findMany({
        where: whereClause,
        orderBy: { updatedAt: "desc" },
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(drafts, null, 2),
          },
        ],
      };
    }

    case "get_draft": {
      const id = typeof args.id === "string" ? args.id.trim() : "";
      if (!id) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required 'id' argument." }],
        };
      }

      const draft = await db.draft.findUnique({ where: { id } });
      if (!draft) {
        return {
          isError: true,
          content: [{ type: "text", text: `Draft with ID '${id}' not found.` }],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(draft, null, 2),
          },
        ],
      };
    }

    case "patch_draft": {
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

      const incomingData = args.data;
      if (!incomingData || typeof incomingData !== "object" || Array.isArray(incomingData)) {
        return {
          isError: true,
          content: [{ type: "text", text: "The 'data' argument must be an object of fields to merge." }],
        };
      }

      const existing = await db.draft.findUnique({ where: { id } });
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Draft with ID '${id}' not found.` }],
        };
      }

      const existingData =
        existing.data && typeof existing.data === "object" && !Array.isArray(existing.data)
          ? (existing.data as Record<string, unknown>)
          : {};

      const mergedData = {
        ...existingData,
        ...(incomingData as Record<string, unknown>),
      };

      const status = typeof args.status === "string" && args.status.trim() ? args.status.trim() : existing.status;

      const updated = await db.draft.update({
        where: { id },
        data: {
          data: mergedData as Prisma.InputJsonValue,
          status,
        },
      });

      if (updated.type === "education") {
        revalidatePath("/admin/educations");
      }

      return {
        content: [
          {
            type: "text",
            text: `Draft '${id}' patched successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "put_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to overwrite drafts." }],
        };
      }

      const id = typeof args.id === "string" ? args.id.trim() : "";
      if (!id) {
        return {
          isError: true,
          content: [{ type: "text", text: "Missing required 'id' argument." }],
        };
      }

      const incomingData = args.data;
      if (!incomingData || typeof incomingData !== "object" || Array.isArray(incomingData)) {
        return {
          isError: true,
          content: [{ type: "text", text: "The 'data' argument must be an object representing the entire payload." }],
        };
      }

      const existing = await db.draft.findUnique({ where: { id } });
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Draft with ID '${id}' not found.` }],
        };
      }

      const status = typeof args.status === "string" && args.status.trim() ? args.status.trim() : existing.status;

      const updated = await db.draft.update({
        where: { id },
        data: {
          data: incomingData as Prisma.InputJsonValue,
          status,
        },
      });

      if (updated.type === "education") {
        revalidatePath("/admin/educations");
      }

      return {
        content: [
          {
            type: "text",
            text: `Draft '${id}' replaced (PUT) successfully:\n${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "delete_draft": {
      if (!hasWrite) {
        return {
          isError: true,
          content: [{ type: "text", text: "Unauthorized: 'write' scope is required to delete drafts." }],
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
      if (!existing) {
        return {
          isError: true,
          content: [{ type: "text", text: `Draft with ID '${id}' not found.` }],
        };
      }

      await db.draft.delete({ where: { id } });

      if (existing.type === "education") {
        revalidatePath("/admin/educations");
      }

      return {
        content: [
          {
            type: "text",
            text: `Draft '${id}' (${existing.type}) deleted successfully.`,
          },
        ],
      };
    }

    default:
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown draft tool: ${toolName}` }],
      };
  }
}
