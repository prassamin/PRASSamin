import { NextRequest } from "next/server";
import { APP_NAME } from "@/config";
import {
  MCP_TOOLS,
  MCP_PROMPTS,
  handleGetPrompt,
  PING_RESULT,
  JSONRPC_ERROR,
  type JsonRpcRequest,
  type JsonRpcNotification,
  type JsonRpcResponse,
  type JsonRpcId,
  type McpInitializeParams,
  type McpInitializeResult,
  type McpCallToolParams,
} from "@/lib/mcp/protocol";
import {
  MCP_PROTOCOL_VERSION,
  SUPPORTED_MCP_PROTOCOL_VERSIONS,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
} from "@/config/mcp";
import { authenticateMcpRequest } from "@/lib/mcp/auth";
import { dispatchMcpTool, getAvailableTools, ALL_MCP_TOOLS } from "@/lib/mcp/tools";

/** Streamable HTTP transport for the MCP protocol (JSON-RPC 2.0). */
export async function POST(req: NextRequest) {
  // Parse body — tolerate empty/invalid as a parse error.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonRpcResponse({ id: null, error: JSONRPC_ERROR.ParseError });
  }

  if (Array.isArray(body)) {
    return jsonRpcResponse({
      id: null,
      error: JSONRPC_ERROR.InvalidRequest,
    });
  }

  const message = body as (JsonRpcRequest | JsonRpcNotification) | undefined;
  if (
    !message ||
    message.jsonrpc !== "2.0" ||
    typeof message.method !== "string"
  ) {
    return jsonRpcResponse({ id: null, error: JSONRPC_ERROR.InvalidRequest });
  }

  const auth = await authenticateMcpRequest(req.headers.get("authorization"));

  // Method dispatch.
  const method = message.method;
  const isNotification = !("id" in message);
  const id = isNotification ? null : (message as JsonRpcRequest).id;

  switch (method) {
    case "initialize":
      return handleInitialize(message, auth, id);
    case "notifications/initialized":
      // Notification — acknowledge with 202, no body.
      return new Response(null, { status: 202 });
    case "ping":
      if (!auth) return unauthorized(id);
      return jsonRpcResponse({ id: id as JsonRpcId, result: PING_RESULT });
    case "tools/list": {
      if (!auth) return unauthorized(id);
      const allowedTools = getAvailableTools(auth.scopes).map(
        ({ requiredScope: _scope, ...toolProps }) => toolProps,
      );
      return jsonRpcResponse({
        id: id as JsonRpcId,
        result: { tools: allowedTools },
      });
    }
    case "tools/call":
      if (!auth) return unauthorized(id);
      return handleCallTool(message as JsonRpcRequest, auth, id);
    case "prompts/list":
      if (!auth) return unauthorized(id);
      return jsonRpcResponse({
        id: id as JsonRpcId,
        result: { prompts: MCP_PROMPTS },
      });
    case "prompts/get":
      if (!auth) return unauthorized(id);
      return handleGetPromptMessage(message as JsonRpcRequest, id);
    default:
      return jsonRpcResponse({
        id: id as JsonRpcId,
        error: JSONRPC_ERROR.MethodNotFound,
      });
  }
}

/* ────────────────────────────────────────────────────────────────
 * Handlers
 * ──────────────────────────────────────────────────────────────── */

function handleInitialize(
  message: JsonRpcRequest | JsonRpcNotification,
  auth: Awaited<ReturnType<typeof authenticateMcpRequest>>,
  id: JsonRpcId | null,
) {
  const params = (message.params ?? {}) as Partial<McpInitializeParams>;
  const requestedVersion = params.protocolVersion;

  // Negotiate protocol version with client: if client requests a known supported
  // version, echo that back; otherwise default to the stable specification version.
  const protocolVersion =
    requestedVersion && SUPPORTED_MCP_PROTOCOL_VERSIONS.includes(requestedVersion)
      ? requestedVersion
      : MCP_PROTOCOL_VERSION;

  const result: McpInitializeResult = {
    protocolVersion,
    capabilities: {
      tools: {},
      prompts: {},
    },
    serverInfo: {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
    },
    instructions:
      `You are connected to ${APP_NAME}'s Portfolio Assistant MCP Server.${
        auth
          ? auth.scopes.includes("write")
            ? " Connected with Full Access (Read & Write): you can inspect portfolio content and create or revise drafts."
            : " Connected with Read-Only Access: you can inspect portfolio content and editorial guidelines. Write and draft mutation tools are hidden."
          : ""
      } Before performing operations on portfolio content (education, blogs, projects, experiences), you should inspect the prompts library (e.g. 'prompts/get' with 'education_best_standards') or call 'get_content_guidelines' to adhere to formatting standards and MDX styling rules. Always prefer creating or updating drafts so that content can be reviewed in the admin panel before publishing.`,
  };

  return jsonRpcResponse({ id: id as JsonRpcId, result });
}

async function handleCallTool(
  message: JsonRpcRequest,
  auth: NonNullable<Awaited<ReturnType<typeof authenticateMcpRequest>>>,
  id: JsonRpcId,
) {
  const params = (message.params ?? {}) as Partial<McpCallToolParams>;
  const name = params.name;

  if (!name) {
    return jsonRpcResponse({
      id,
      error: {
        code: -32602,
        message: "Missing 'name' in tool call parameters",
      },
    });
  }

  const tool = ALL_MCP_TOOLS.find((t) => t.name === name);
  if (!tool) {
    return jsonRpcResponse({
      id,
      error: {
        code: -32602,
        message: `Unknown tool: ${name}`,
      },
    });
  }

  // Enforce dynamic authorization scope check
  if (tool.requiredScope === "write" && !auth.scopes.includes("write")) {
    return jsonRpcResponse({
      id,
      error: {
        code: -32003,
        message: `Forbidden: Token lacks 'write' scope required to invoke tool '${name}'`,
      },
    });
  }

  try {
    const result = await dispatchMcpTool(name, params.arguments, auth);
    return jsonRpcResponse({
      id,
      result,
    });
  } catch (err: any) {
    return jsonRpcResponse({
      id,
      error: {
        code: -32603,
        message: err?.message || "Internal error executing tool",
      },
    });
  }
}

function handleGetPromptMessage(
  message: JsonRpcRequest,
  id: JsonRpcId,
) {
  const params = (message.params ?? {}) as { name?: string; arguments?: Record<string, string> };
  const name = params.name;

  if (!name) {
    return jsonRpcResponse({
      id,
      error: {
        code: -32602,
        message: "Missing 'name' in prompt request parameters",
      },
    });
  }

  const promptResult = handleGetPrompt(name, params.arguments);
  if (!promptResult) {
    return jsonRpcResponse({
      id,
      error: {
        code: -32602,
        message: `Unknown prompt: ${name}`,
      },
    });
  }

  return jsonRpcResponse({
    id,
    result: promptResult,
  });
}

/* ────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────── */

function unauthorized(id: JsonRpcId | null) {
  return jsonRpcResponse({
    id: id as JsonRpcId,
    error: {
      code: -32001,
      message: "Unauthorized: missing or invalid bearer token",
    },
  });
}

function jsonRpcResponse(body: Omit<JsonRpcResponse, "jsonrpc">) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", ...body }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
