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
 * Authenticates a request using `Authorization: Bearer <token>`.
 *
 * Tokens are stored as SHA-256 hashes, so we hash the presented value and
 * look it up. Revoked/expired tokens are rejected.
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
      .catch(() => {});

    return {
      tokenId: record.id,
      name: record.name,
      scopes: record.scopes,
    };
  } catch {
    return null;
  }
}
