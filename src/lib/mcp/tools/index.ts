import { McpAuthContext } from "../auth";
import { ToolDefinition, CallToolResult } from "../protocol";
import { EDUCATION_TOOLS, handleEducationTool } from "./education";
import { DRAFT_TOOLS, handleDraftTool } from "./drafts";
import { EDUCATION_DRAFT_STANDARDS, MDX_COMPONENTS_REFERENCE } from "../prompts";

export const GUIDELINE_TOOLS: ToolDefinition[] = [
  {
    name: "get_content_guidelines",
    description:
      "Retrieve editorial guidelines, formatting standards, allowed MDX components, or full component catalogs for portfolio content (e.g. 'education', 'mdx_components', 'blog', 'project').",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description:
            "Category to fetch standards for: 'education' | 'mdx_components' | 'blog' | 'project'.",
          enum: ["education", "mdx_components", "blog", "project"],
        },
      },
      required: ["type"],
      additionalProperties: false,
    },
  },
];

/**
 * Registry of all available MCP tools across domains.
 */
export const ALL_MCP_TOOLS: ToolDefinition[] = [...EDUCATION_TOOLS, ...DRAFT_TOOLS, ...GUIDELINE_TOOLS];

/**
 * Dispatches an incoming tools/call invocation to the appropriate domain handler.
 */
export async function dispatchMcpTool(
  toolName: string,
  args: Record<string, unknown> = {},
  auth: McpAuthContext,
): Promise<CallToolResult> {
  if (toolName === "get_content_guidelines") {
    const type = String(args.type || "").toLowerCase().trim();
    if (type === "education") {
      return {
        content: [{ type: "text", text: EDUCATION_DRAFT_STANDARDS }],
      };
    }

    if (type === "mdx_components") {
      return {
        content: [{ type: "text", text: MDX_COMPONENTS_REFERENCE }],
      };
    }

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Standards for '${type}' are currently being defined. For available guidelines, try 'education' or 'mdx_components'.`,
        },
      ],
    };
  }

  if (EDUCATION_TOOLS.some((t) => t.name === toolName)) {
    return handleEducationTool(toolName, args, auth);
  }

  if (DRAFT_TOOLS.some((t) => t.name === toolName)) {
    return handleDraftTool(toolName, args, auth);
  }

  return {
    isError: true,
    content: [{ type: "text", text: `Tool "${toolName}" is not registered or implemented.` }],
  };
}
