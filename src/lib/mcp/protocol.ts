import { ALL_MCP_TOOLS } from "./tools";
export { MCP_PROMPTS, handleGetPrompt } from "./prompts";

/**
 * MCP (Model Context Protocol) primitives — JSON-RPC 2.0 + MCP message
 * shapes, version-aligned with the MCP Streamable HTTP transport.
 */
export const MCP_TOOLS: ToolDefinition[] = ALL_MCP_TOOLS;

/* ────────────────────────────────────────────────────────────────
 * JSON-RPC 2.0
 * ──────────────────────────────────────────────────────────────── */

export type JsonRpcId = string | number | null;

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcNotification {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export const JSONRPC_ERROR = {
  ParseError: { code: -32700, message: "Parse error" },
  InvalidRequest: { code: -32600, message: "Invalid Request" },
  MethodNotFound: { code: -32601, message: "Method not found" },
  InvalidParams: { code: -32602, message: "Invalid params" },
  InternalError: { code: -32603, message: "Internal error" },
} as const;

/* ────────────────────────────────────────────────────────────────
 * MCP types
 * ──────────────────────────────────────────────────────────────── */

export interface McpInitializeParams {
  protocolVersion: string;
  capabilities?: Record<string, unknown>;
  clientInfo: { name: string; version: string };
}

export interface McpInitializeResult {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  serverInfo: { name: string; version: string };
  instructions?: string;
}

export interface ToolDefinition {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
  requiredScope?: "read" | "write";
}

export interface ToolsListResult {
  tools: ToolDefinition[];
}

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptDefinition {
  name: string;
  description?: string;
  arguments?: PromptArgument[];
}

export interface PromptMessage {
  role: "user" | "assistant";
  content: {
    type: "text";
    text: string;
  };
}

export interface PromptsListResult {
  prompts: PromptDefinition[];
}

export interface GetPromptResult {
  description?: string;
  messages: PromptMessage[];
}

export interface McpCallToolParams {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface CallToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/** Successful result for MCP ping. */
export const PING_RESULT: Record<string, never> = {};
