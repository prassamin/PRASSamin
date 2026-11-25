export const MCP_SERVER_ENDPOINT = (origin: string) => `${origin}/mcp`;
export const MCP_SERVER_NAME = "portfolio".replace(/[^a-zA-Z0-9]+/g, "");

export const MCP_SERVER_VERSION = "0.1.0";
export const MCP_PROTOCOL_VERSION = "2024-11-05";
export const SUPPORTED_MCP_PROTOCOL_VERSIONS = [
  "2024-11-05",
  "2024-10-07",
  "latest",
];
