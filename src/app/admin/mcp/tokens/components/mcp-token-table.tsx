"use client";

import React from "react";
import {
  LuKeyRound,
  LuBan,
  LuTrash2,
  LuClock,
  LuBot,
} from "react-icons/lu";
import { cn } from "@heroui/react";
import type { McpTokenRecord } from "../actions";

interface McpTokenTableProps {
  tokens: McpTokenRecord[];
  onRevoke: (token: McpTokenRecord) => void;
  onDelete: (token: McpTokenRecord) => void;
}

function formatDate(value?: Date | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const McpTokenTable: React.FC<McpTokenTableProps> = ({
  tokens,
  onRevoke,
  onDelete,
}) => {
  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-muted/20 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
          <LuKeyRound className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white font-rethink">
          No tokens yet
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 max-w-sm mx-auto leading-relaxed">
          Create a token to let an AI agent access your portfolio&apos;s MCP
          tools.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/6 bg-muted/40 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-left">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Name
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Scopes
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Status
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Created
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Last used
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tokens.map((token) => {
              const isRevoked = Boolean(token.revokedAt);

              return (
                <tr
                  key={token.id}
                  className={cn(
                    "transition-colors",
                    isRevoked
                      ? "opacity-50 bg-muted/10"
                      : "hover:bg-white/3",
                  )}
                >
                  {/* Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-semibold text-sm text-foreground font-rethink truncate max-w-44">
                        {token.name}
                      </span>
                    </div>
                  </td>

                  {/* Scopes */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {token.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/3 text-neutral-300 text-[10px] font-mono"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {isRevoked ? (
                      <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg bg-red-500/10 border border-red-500/10 text-red-400 text-[10px] font-medium">
                        Revoked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-accent/10 border border-accent/5 text-accent text-[10px] font-medium">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400 whitespace-nowrap">
                      <LuClock className="w-3 h-3 text-neutral-500" />
                      {formatDate(token.createdAt)}
                    </span>
                  </td>

                  {/* Last used */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400 whitespace-nowrap">
                      <LuBot className="w-3 h-3 text-neutral-500" />
                      {formatDate(token.lastUsedAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isRevoked && (
                        <button
                          type="button"
                          onClick={() => onRevoke(token)}
                          title="Revoke token"
                          className="w-8 h-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/30 hover:bg-amber-400/10 transition-all cursor-pointer"
                        >
                          <LuBan className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(token)}
                        title="Delete token"
                        className="w-8 h-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-neutral-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all cursor-pointer"
                      >
                        <LuTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default McpTokenTable;
