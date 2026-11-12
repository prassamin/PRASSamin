-- AddMCP token management for remote agent MCP integration.
-- Pure additive: creates a single table, touches nothing existing.

-- CreateTable
CREATE TABLE "mcp_tokens" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "scopes" TEXT[] NOT NULL DEFAULT ARRAY['read']::TEXT[],
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mcp_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mcp_tokens_token_hash_key" ON "mcp_tokens"("token_hash");
