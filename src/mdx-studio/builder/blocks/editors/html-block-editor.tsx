"use client";

import React from "react";
import { LuCodeXml } from "react-icons/lu";

interface HtmlBlockEditorProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
}

export const HtmlBlockEditor: React.FC<HtmlBlockEditorProps> = React.memo(
  ({ props, updateProp }) => {
    const code = String(props.code || "");
    const tagMatch = code.trim().match(/^<([a-zA-Z][a-zA-Z0-9._-]*)/);
    const detectedTag = tagMatch ? `<${tagMatch[1]}>` : "<html />";

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-500/12 border border-pink-500/25 text-[11px] font-mono font-semibold text-pink-300">
              <LuCodeXml className="w-3 h-3" />
              {detectedTag}
            </span>
            <span className="text-[11px] text-neutral-400">
              Raw HTML / JSX block (preserved 1:1 in MDX)
            </span>
          </div>
        </div>

        <textarea
          data-format-role="plain"
          value={code}
          onChange={(e) => updateProp("code", e.target.value)}
          placeholder='<figure className="my-6">\n  <img src="..." alt="..." />\n  <figcaption>Caption text</figcaption>\n</figure>'
          rows={Math.min(14, Math.max(4, code.split("\n").length + 1))}
          className="w-full text-xs bg-neutral-950/70 border border-white/10 focus:border-pink-500/40 rounded-xl font-mono text-pink-200 p-3 leading-relaxed resize-y focus:outline-none placeholder:text-neutral-600 block transition-colors"
        />
      </div>
    );
  },
);
HtmlBlockEditor.displayName = "HtmlBlockEditor";
