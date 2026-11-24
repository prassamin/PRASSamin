"use client";

import React from "react";
import { LuPlus } from "react-icons/lu";

interface McpHeaderProps {
  onCreate: () => void;
}

export const McpHeader: React.FC<McpHeaderProps> = ({ onCreate }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-rethink text-white tracking-tight">
          Access Tokens
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 leading-relaxed">
          Access tokens for AI agents (Claude Desktop, Cursor, …) to use the
          site&apos;s remote MCP tools.
        </p>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-neutral-950 font-semibold text-xs sm:text-sm shadow-xs hover:bg-accent/90 transition-all cursor-pointer active:scale-[0.98]"
        >
          <LuPlus className="w-4 h-4" />
          Create token
        </button>
      </div>
    </div>
  );
};
