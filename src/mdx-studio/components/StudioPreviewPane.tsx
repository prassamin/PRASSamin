"use client";

import React, { useState } from "react";
import MDXContent from "@/components/MDXContent";
import { Monitor, Smartphone, X } from "lucide-react";

interface StudioPreviewPaneProps {
  mdx: string;
  metadata: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
}

export const StudioPreviewPane: React.FC<StudioPreviewPaneProps> = ({
  mdx,
  metadata,
  isOpen,
  onClose,
}) => {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  if (!isOpen) return null;

  return (
    <div className="w-full lg:w-[480px] xl:w-[540px] bg-neutral-950/90 border-l border-white/[0.08] flex flex-col h-full overflow-hidden shrink-0 select-none">
      {/* Preview Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-rethink">
            Live Site Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Toggle */}
          <div className="flex items-center rounded-xl bg-white/[0.04] p-0.5 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                device === "desktop"
                  ? "bg-white/15 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                device === "mobile"
                  ? "bg-white/15 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close Preview"
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Screen Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center bg-black/40">
        <div
          className={`w-full transition-all duration-300 rounded-2xl bg-neutral-900/90 border border-white/[0.08] p-6 shadow-2xl select-text ${
            device === "mobile" ? "max-w-xs p-4 text-xs" : "max-w-xl"
          }`}
        >
          {/* Metadata Card Summary Preview */}
          {(metadata.degree || metadata.school || metadata.title) && (
            <div className="pb-4 mb-4 border-b border-white/[0.08]">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider block font-bold mb-1">
                Preview Header
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-rethink">
                {metadata.degree || metadata.title}
              </h2>
              {metadata.school && (
                <p className="text-xs text-neutral-400 font-inter mt-0.5">
                  {metadata.school}
                </p>
              )}
            </div>
          )}

          {/* Compiled MDX Output */}
          <div className="prose prose-invert prose-neutral max-w-none text-sm text-neutral-200">
            {mdx.trim() ? (
              <MDXContent content={mdx} />
            ) : (
              <p className="text-xs text-neutral-500 italic text-center py-8">
                No MDX content yet. Add components from the builder to preview live.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioPreviewPane;
