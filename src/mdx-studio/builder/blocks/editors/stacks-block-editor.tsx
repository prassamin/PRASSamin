"use client";

import React from "react";
import { StackPicker } from "@/app/admin/components/form-primitives";

interface StacksBlockEditorProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
}

export const StacksBlockEditor: React.FC<StacksBlockEditorProps> = React.memo(
  ({ props, updateProp }) => {
    const currentStacks: string[] = Array.isArray(props.stacks)
      ? props.stacks
      : [];
    const toolsValue = currentStacks.join(", ");

    const handleToolsChange = (val: string) => {
      const nextStacks = val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      updateProp("stacks", nextStacks);
    };

    return (
      <div className="space-y-1.5">
        <StackPicker value={toolsValue} onChange={handleToolsChange} />
      </div>
    );
  },
);

StacksBlockEditor.displayName = "StacksBlockEditor";
