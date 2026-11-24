"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuX, LuCopy, LuCheck, LuKeyRound } from "react-icons/lu";
import { CheckboxGroup, toast } from "@heroui/react";
import { Drawer } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { createMcpTokenAction, McpTokenRecord } from "../actions";
import { MCP_SCOPES } from "../constants";

interface McpTokenCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (record: McpTokenRecord) => void;
}

export const McpTokenCreateDrawer: React.FC<McpTokenCreateDrawerProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdData, setCreatedData] = useState<{
    token: string;
    record: McpTokenRecord;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (secret: string) => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("Token copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.danger("Could not copy token.");
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.danger("Token name is required.");
      return;
    }
    if (scopes.length === 0) {
      toast.danger("Select at least one scope.");
      return;
    }
    setIsCreating(true);
    try {
      const result = await createMcpTokenAction(name, scopes);
      // Notify parent so the table in the background updates immediately
      onCreated(result.record);
      // Switch drawer into the one-time copy success step
      setCreatedData(result);
    } catch (err: any) {
      toast.danger(err?.message || "Failed to create token.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setScopes(["read"]);
    setCreatedData(null);
    setCopied(false);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} placement="right" adaptive>
      <Drawer.CloseButton>
        <LuX className="w-4 h-4" />
      </Drawer.CloseButton>

      <Drawer.Header className="border-none bg-transparent pb-0 pt-6">
        <div>
          <h2 className="text-xl font-medium font-rethink text-foreground">
            {createdData ? "Token generated" : "Create MCP token"}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {createdData
              ? `"${createdData.record.name}" is ready for use`
              : "Let an AI agent access your site's tools"}
          </p>
        </div>
      </Drawer.Header>

      <Drawer.Body className="space-y-6">
        <AnimatePresence mode="wait" initial={false}>
          {createdData ? (
            /* Step 2: One-Time Secret Token Reveal */
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              {/* Secret Token Field */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300 font-inter">
                  Personal Access Token
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    rows={3}
                    value={createdData.token}
                    className="w-full font-mono text-xs text-neutral-100 bg-neutral-950/40 border border-white/4 rounded-2xl p-3.5 pr-12 outline-none select-all transition-colors resize-none leading-relaxed break-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(createdData.token)}
                    className="absolute right-1.5 top-1.5 size-8 rounded-[calc(var(--radius)*1.25)] bg-white/5 hover:bg-white/8 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-90"
                  >
                    {copied ? (
                      <LuCheck className="size-4 text-emerald-400" />
                    ) : (
                      <LuCopy className="size-4" />
                    )}
                  </button>
                </div>
              </div>
              {/* Discreet security notice */}
              <div className="p-3.5 rounded-2xl bg-linear-to-r from-amber-500/4 via-amber-500/12 to-amber-500/4 border border-amber-500/12 flex items-start gap-3">
                <p className="text-[13px] font-medium text-amber-300/90">
                  Copy the access token and save it somewhere safe. You won’t be able to see it again.
                </p>
              </div>
            </motion.div>
          ) : (
            /* Configuration Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300 font-inter">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. claude-desktop"
                  autoFocus
                  className="w-full h-11 px-4 rounded-xl bg-foreground/4 border border-foreground/6 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <p className="text-[11px] text-neutral-500">
                  A label to identify which agent uses this token.
                </p>
              </div>

              {/* Scopes */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 font-inter">
                  Scopes
                </label>
                <CheckboxGroup
                  name="scopes"
                  value={scopes}
                  onChange={setScopes}
                >
                  {MCP_SCOPES.map((scope) => (
                    <Checkbox key={scope} value={scope}>
                      {scope}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer.Body>

      <Drawer.Footer className="border-none bg-transparent">
        {createdData ? (
          <div className="w-full flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 px-6 rounded-2xl bg-accent text-neutral-950 font-semibold text-sm hover:bg-accent/90 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating || !name.trim() || scopes.length === 0}
              className="px-5 h-10 rounded-2xl bg-accent text-neutral-950 font-semibold text-sm hover:bg-accent/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
            >
              {isCreating ? "Creating…" : "Create token"}
            </button>
          </div>
        )}
      </Drawer.Footer>
    </Drawer>
  );
};

export default McpTokenCreateDrawer;
