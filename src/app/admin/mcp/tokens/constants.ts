/**
 * Shared, non-server module for MCP token metadata.
 *
 * Must stay OUT of any "use server" file: Next.js only transfers async
 * server functions to the client — values like this would be undefined
 * there, causing runtime failures (e.g. `.map is not a function`).
 */
export const MCP_SCOPES = ["read", "write"] as const;

export type McpScope = (typeof MCP_SCOPES)[number];
