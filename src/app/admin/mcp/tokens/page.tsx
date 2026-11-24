import { cache } from "react";
import { db } from "@/lib/db";
import { metatag } from "@/lib/metatag";
import { AdminBody } from "@/app/admin/components/admin-body";
import { McpView } from "./view";
import type { McpTokenRecord } from "./actions";

const getMcpTokens = cache(async (): Promise<McpTokenRecord[]> => {
  try {
    const tokens = await db.mcpToken.findMany({
      orderBy: { createdAt: "desc" },
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
    return tokens;
  } catch (error) {
    console.error("Failed to load MCP tokens:", error);
    return [];
  }
});

export const generateMetadata = () => {
  return metatag({
    title: "MCP Tokens | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminMcpPage = async () => {
  const tokens = await getMcpTokens();

  return (
    <AdminBody>
      <McpView tokens={tokens} />
    </AdminBody>
  );
};

export default AdminMcpPage;
