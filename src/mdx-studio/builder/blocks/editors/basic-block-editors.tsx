"use client";

import React from "react";
import { LuCornerDownLeft as CornerDownLeft } from "react-icons/lu";
import { Input } from "@heroui/react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { InlineTooltipField } from "../../components/inline-tooltip-field";

interface BlockEditorProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
}

const HEADING_OPTIONS = [
  { label: "H1", value: "1" },
  { label: "H2", value: "2" },
  { label: "H3", value: "3" },
  { label: "H4", value: "4" },
  { label: "H5", value: "5" },
  { label: "H6", value: "6" },
];

const CALLOUT_OPTIONS = ["Info", "Warning", "Danger"];

export const HeadingBlockEditor: React.FC<BlockEditorProps> = React.memo(
  ({ props, updateProp }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 font-inter">Level:</span>
        <SegmentedControl
          options={HEADING_OPTIONS}
          size="sm"
          defaultValue="2"
          value={(props.level || 2).toString()}
          onValueChange={(value) => updateProp("level", Number(value))}
        />
      </div>
      <InlineTooltipField
        as="input"
        value={props.text || ""}
        onChange={(v) => updateProp("text", v)}
        placeholder="Enter heading text..."
      />
    </div>
  ),
);
HeadingBlockEditor.displayName = "HeadingBlockEditor";

export const ParagraphBlockEditor: React.FC<BlockEditorProps> = React.memo(
  ({ props, updateProp }) => (
    <div>
      <InlineTooltipField
        rows={3}
        value={props.text || ""}
        onChange={(v) => updateProp("text", v)}
        placeholder="Enter paragraph text (supports markdown, links, bold, italic)..."
      />
    </div>
  ),
);
ParagraphBlockEditor.displayName = "ParagraphBlockEditor";

export const DividerBlockEditor: React.FC = React.memo(() => (
  <div className="py-2">
    <div className="h-px bg-white/10 w-full" />
  </div>
));
DividerBlockEditor.displayName = "DividerBlockEditor";

export const BreakBlockEditor: React.FC = React.memo(() => (
  <div className="py-2 flex items-center justify-center">
    <div className="w-full flex items-center gap-2">
      <div className="h-px bg-white/6 flex-1 border-t border-dashed border-white/15" />
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-neutral-400 bg-white/3 border border-white/8 select-none">
        <CornerDownLeft className="w-3 h-3 text-neutral-500" />
      </span>
      <div className="h-px bg-white/6 flex-1 border-t border-dashed border-white/15" />
    </div>
  </div>
));
BreakBlockEditor.displayName = "BreakBlockEditor";

export const CalloutBlockEditor: React.FC<BlockEditorProps> = React.memo(
  ({ props, updateProp }) => (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">Type:</span>
        <SegmentedControl
          options={CALLOUT_OPTIONS}
          value={props.calloutType}
          defaultValue="info"
          size="sm"
          onValueChange={(v) => updateProp("calloutType", v)}
        />
      </div>
      <Input
        type="text"
        value={props.title || ""}
        onChange={(e) => updateProp("title", e.target.value)}
        placeholder="Callout title (optional)..."
        className="w-full text-xs bg-white/3 9.5 border border-white/10 text-white"
      />
      <InlineTooltipField
        rows={2}
        value={props.content || ""}
        onChange={(v) => updateProp("content", v)}
        placeholder="Callout body text..."
      />
    </div>
  ),
);
CalloutBlockEditor.displayName = "CalloutBlockEditor";

export const CardBlockEditor: React.FC<BlockEditorProps> = React.memo(
  ({ props, updateProp }) => (
    <div className="rounded-2xl border border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/[0.035] transition-all duration-200 overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 bg-white/1.5 border-b border-white/5">
        <input
          type="text"
          value={props.title || ""}
          onChange={(e) => updateProp("title", e.target.value)}
          placeholder="Card Title (e.g. Feature Overview)..."
          className="flex-1 text-xs font-semibold bg-transparent border-none text-white focus:outline-none placeholder:text-neutral-500 h-8 px-1 font-rethink"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono text-neutral-500 uppercase">
            Badge:
          </span>
          <input
            type="text"
            value={props.badge || ""}
            onChange={(e) => updateProp("badge", e.target.value)}
            placeholder="Optional badge label..."
            className="px-2.5 py-1 text-[11px] font-mono bg-accent/10 border border-accent/20 rounded-full text-accent placeholder:text-neutral-600 focus:outline-none focus:border-accent w-36"
          />
        </div>
      </div>

      <div className="p-3">
        <InlineTooltipField
          rows={2}
          variant="dark"
          value={props.content || ""}
          onChange={(v) => updateProp("content", v)}
          placeholder="Card description / body text..."
        />
      </div>
    </div>
  ),
);
CardBlockEditor.displayName = "CardBlockEditor";
