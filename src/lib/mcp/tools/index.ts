import { McpAuthContext } from "../auth";
import { ToolDefinition, CallToolResult } from "../protocol";
import { EDUCATION_TOOLS, handleEducationTool } from "./education";
import { EXPERIENCE_TOOLS, handleExperienceTool } from "./experience";
import { BLOG_TOOLS, handleBlogTool } from "./blog";
import { PROJECT_TOOLS, handleProjectTool } from "./project";
import { DRAFT_TOOLS, handleDraftTool } from "./drafts";
import {
  EDUCATION_DRAFT_STANDARDS,
  EXPERIENCE_DRAFT_STANDARDS,
  BLOG_DRAFT_STANDARDS,
  PROJECT_DRAFT_STANDARDS,
  MDX_COMPONENTS_REFERENCE,
  MCP_GLOBAL_INSTRUCTIONS,
} from "../prompts";
import { AVAILABLE_STACK_NAMES } from "@/lib/stacks";

export const GUIDELINE_TOOLS: ToolDefinition[] = [
  {
    name: "get_content_guidelines",
    description:
      "Retrieve editorial guidelines, formatting standards, allowed MDX components, or full component catalogs for portfolio content (e.g. 'education', 'experience', 'mdx_components', 'blog', 'project', 'stacks').",
    requiredScope: "read",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description:
            "Category to fetch standards for: 'education' | 'experience' | 'mdx_components' | 'blog' | 'global_rules' | 'project' | 'stacks'.",
          enum: ["education", "experience", "mdx_components", "blog", "global_rules", "project", "stacks"],
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
export const ALL_MCP_TOOLS: ToolDefinition[] = [
  ...EDUCATION_TOOLS,
  ...EXPERIENCE_TOOLS,
  ...BLOG_TOOLS,
  ...PROJECT_TOOLS,
  ...DRAFT_TOOLS,
  ...GUIDELINE_TOOLS,
];

/**
 * Returns the subset of MCP tools accessible by the presented token scopes.
 * If the token does not possess 'write' scope, all mutation/draft-creation tools
 * are completely filtered out, returning only read-only tools.
 */
export function getAvailableTools(scopes: string[] = []): ToolDefinition[] {
  const hasWrite = scopes.includes("write");
  return ALL_MCP_TOOLS.filter((tool) => {
    if (tool.requiredScope === "write") {
      return hasWrite;
    }
    return true;
  });
}

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

    if (type === "experience") {
      return {
        content: [{ type: "text", text: EXPERIENCE_DRAFT_STANDARDS }],
      };
    }

    if (type === "blog") {
      return {
        content: [{ type: "text", text: BLOG_DRAFT_STANDARDS }],
      };
    }

    if (type === "project") {
      return {
        content: [{ type: "text", text: PROJECT_DRAFT_STANDARDS }],
      };
    }

    if (type === "mdx_components") {
      return {
        content: [{ type: "text", text: MDX_COMPONENTS_REFERENCE }],
      };
    }

    if (type === "global_rules" || type === "rules") {
      return {
        content: [{ type: "text", text: MCP_GLOBAL_INSTRUCTIONS }],
      };
    }

    if (type === "stacks") {
      return {
        content: [
          {
            type: "text",
            text: `### Available Tech Stacks (${AVAILABLE_STACK_NAMES.length} registered)\nUse these exact names in <Stack name="..." /> or project frontmatter \`tools\` array:\n\n${AVAILABLE_STACK_NAMES.join(", ")}`,
          },
        ],
      };
    }

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Standards for '${type}' are currently being defined. For available guidelines, try 'education', 'experience', or 'mdx_components'.`,
        },
      ],
    };
  }

  if (EDUCATION_TOOLS.some((t) => t.name === toolName)) {
    return handleEducationTool(toolName, args, auth);
  }

  if (EXPERIENCE_TOOLS.some((t) => t.name === toolName)) {
    return handleExperienceTool(toolName, args, auth);
  }

  if (BLOG_TOOLS.some((t) => t.name === toolName)) {
    return handleBlogTool(toolName, args, auth);
  }

  if (PROJECT_TOOLS.some((t) => t.name === toolName)) {
    return handleProjectTool(toolName, args, auth);
  }

  if (DRAFT_TOOLS.some((t) => t.name === toolName)) {
    return handleDraftTool(toolName, args, auth);
  }

  return {
    isError: true,
    content: [{ type: "text", text: `Tool "${toolName}" is not registered or implemented.` }],
  };
}
