"use server";

import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { MCP_SCOPES } from "./constants";
import type { McpScope } from "./constants";

export type McpTokenRecord = {
  id: string;
  name: string;
  scopes: string[];
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function validateName(name: string): string {
  const clean = name.trim().slice(0, 60);
  if (!clean) throw new Error("Token name is required.");
  return clean;
}

function validateScopes(raw: string[]): string[] {
  const scopes = Array.from(new Set(raw)).filter((s): s is McpScope =>
    MCP_SCOPES.includes(s as McpScope),
  );
  if (scopes.length === 0) throw new Error("Select at least one scope.");
  return scopes;
}

/**
 * Create a token. Returns the plaintext token exactly once — only its
 * SHA-256 hash is stored, so it cannot be recovered later.
 */
export async function createMcpTokenAction(
  name: string,
  scopes: string[],
): Promise<{ token: string; record: McpTokenRecord }> {
  const cleanName = validateName(name);
  const cleanScopes = validateScopes(scopes);

  // Standard-looking access token: recognizable prefix + 32 random bytes.
  // Format: pras_mcp_<43-char base64url payload>
  const plaintext = `pras_mcp_${randomBytes(32).toString("base64url")}`;

  const record = await db.mcpToken.create({
    data: {
      name: cleanName,
      tokenHash: hashToken(plaintext),
      scopes: cleanScopes,
    },
    select: {
      id: true,
      name: true,
      scopes: true,
      lastUsedAt: true,
      revokedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return { token: plaintext, record };
}

export async function revokeMcpTokenAction(id: string): Promise<void> {
  await db.mcpToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export async function deleteMcpTokenAction(id: string): Promise<void> {
  await db.mcpToken.delete({ where: { id } });
}
