"use client";

import React, { useState } from "react";
import { toast } from "@heroui/react";
import { useConfirm } from "@/providers/confirm-provider";
import {
  revokeMcpTokenAction,
  deleteMcpTokenAction,
  updateMcpTokenScopeAction,
  McpTokenRecord,
} from "./actions";
import { McpHeader } from "./components/mcp-header";
import { McpTokenTable } from "./components/mcp-token-table";
import { McpTokenCreateDrawer } from "./components/mcp-token-create-drawer";

interface McpViewProps {
  tokens: McpTokenRecord[];
}

export const McpView: React.FC<McpViewProps> = ({ tokens: initialTokens }) => {
  const { confirm } = useConfirm();
  const [tokens, setTokens] = useState<McpTokenRecord[]>(initialTokens);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreated = (record: McpTokenRecord) => {
    setTokens((prev) => [record, ...prev]);
  };

  const handleRevoke = (token: McpTokenRecord) => {
    confirm({
      title: "Revoke token?",
      description: `"${token.name}" will stop working immediately. Agents using it will lose access.`,
      isDanger: true,
      confirmText: "Revoke",
      onConfirm: async () => {
        try {
          await revokeMcpTokenAction(token.id);
          setTokens((prev) =>
            prev.map((t) =>
              t.id === token.id ? { ...t, revokedAt: new Date() } : t,
            ),
          );
          toast.success(`Revoked "${token.name}".`);
        } catch {
          toast.danger("Failed to revoke token.");
        }
      },
    });
  };

  const handleDelete = (token: McpTokenRecord) => {
    confirm({
      title: "Delete token?",
      description: `"${token.name}" will be permanently removed. This cannot be undone.`,
      isDanger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteMcpTokenAction(token.id);
          setTokens((prev) => prev.filter((t) => t.id !== token.id));
          toast.success(`Deleted "${token.name}".`);
        } catch {
          toast.danger("Failed to delete token.");
        }
      },
    });
  };

  const handleToggleScope = async (
    token: McpTokenRecord,
    enableWrite: boolean,
  ) => {
    const nextScopes = enableWrite ? ["read", "write"] : ["read"];
    // Optimistic update
    setTokens((prev) =>
      prev.map((t) => (t.id === token.id ? { ...t, scopes: nextScopes } : t)),
    );
    try {
      await updateMcpTokenScopeAction(token.id, nextScopes);
    } catch {
      // Revert on error
      setTokens((prev) =>
        prev.map((t) =>
          t.id === token.id ? { ...t, scopes: token.scopes } : t,
        ),
      );
      toast.danger("Failed to update token scope.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      <McpHeader onCreate={() => setIsCreateOpen(true)} />

      <McpTokenTable
        tokens={tokens}
        onRevoke={handleRevoke}
        onDelete={handleDelete}
        onToggleScope={handleToggleScope}
      />

      <McpTokenCreateDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default McpView;
