import { createHash } from "node:crypto";
import { db } from "@/lib/db";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface McpAuthContext {
  tokenId: string;
  name: string;
  scopes: string[];
}

/**
 * Authenticates an MCP request using a Bearer token.
 *
 * Extracts the token from the `Authorization` header, hashes it with SHA-256,
 * and looks up the corresponding token record in the database.
 *
 * Authentication is rejected if the header is missing or malformed, the
 * token does not exist, the token has been revoked or expired, or the
 * database lookup fails.
 *
 * On successful authentication, updates the token's `lastUsedAt` timestamp
 * asynchronously. This update is best-effort and does not affect the
 * authentication result if it fails.
 *
 * This MCP server is primarily intended for a single administrator, so
 * authentication deliberately skips in-memory caching. Each request performs
 * a database lookup to ensure that token revocations and expiration changes
 * are reflected immediately, without waiting for a cache to expire.
 *
 * @param authorizationHeader - The value of the request's `Authorization`
 *   header, or `null` if the header is absent.
 *
 * @returns The authenticated token's ID, name, and scopes, or `null` if
 *   authentication fails.
 */
export async function authenticateMcpRequest(
  authorizationHeader: string | null,
): Promise<McpAuthContext | null> {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  try {
    const record = await db.mcpToken.findUnique({
      where: { tokenHash: hashToken(token) },
      select: {
        id: true,
        name: true,
        scopes: true,
        revokedAt: true,
        expiresAt: true,
      },
    });

    if (!record) return null;
    if (record.revokedAt) return null;
    if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
      return null;
    }

    // Touch lastUsedAt (fire-and-forget; never fail auth on this).
    db.mcpToken
      .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
      .catch(() => { });

    return {
      tokenId: record.id,
      name: record.name,
      scopes: record.scopes,
    };
  } catch {
    return null;
  }
}
