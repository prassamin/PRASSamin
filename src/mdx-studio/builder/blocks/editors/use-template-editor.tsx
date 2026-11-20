"use client";

import React, { useMemo } from "react";
import {
  LuCircleAlert as AlertCircle,
  LuTriangleAlert as AlertTriangle,
  LuX as X,
} from "react-icons/lu";
import { cn } from "@heroui/react";
import { Select } from "@/components/ui/select";
import { TemplateDefinitionInfo } from "../../types";

interface UseTemplateBlockEditorProps {
  props: Record<string, any>;
  availableTemplates: TemplateDefinitionInfo[];
  updateProp: (key: string, value: any) => void;
}

export const UseTemplateBlockEditor: React.FC<UseTemplateBlockEditorProps> =
  React.memo(({ props, availableTemplates, updateProp }) => {
    const selectedName = String(props.name || "").trim();
    const mode = props.mode === "shorthand" ? "shorthand" : "tag";
    const savedValues: Record<string, string> =
      props.values && typeof props.values === "object" ? props.values : {};

    const matchedTemplate = useMemo(
      () => availableTemplates.find((t) => t.name === selectedName),
      [availableTemplates, selectedName],
    );

    const templateOptions = useMemo(
      () =>
        Array.from(
          new Map(availableTemplates.map((t) => [t.name, t])).values(),
        ).map((t) => ({
          value: t.name,
          label: `${t.name}${
            t.variables.length > 0
              ? ` (${t.variables.length} ${t.variables.length === 1 ? "var" : "vars"})`
              : ""
          }`,
        })),
      [availableTemplates],
    );

    const declaredVars = matchedTemplate ? matchedTemplate.variables : [];
    const extraKeys = Object.keys(savedValues).filter(
      (k) => !declaredVars.includes(k),
    );
    const allVarKeys = [...declaredVars, ...extraKeys];

    const handleUpdateVarValue = (key: string, val: string) => {
      updateProp("values", {
        ...savedValues,
        [key]: val,
      });
    };

    const handleRemoveExtraVar = (key: string) => {
      const next = { ...savedValues };
      delete next[key];
      updateProp("values", next);
    };

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
              Template:
            </label>

            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => updateProp("mode", "shorthand")}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer",
                  mode === "shorthand"
                    ? "bg-fuchsia-500/25 text-fuchsia-300 font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5",
                )}
                title="Shorthand mode (#template-name)"
              >
                #{selectedName || "name"}
              </button>
              <button
                type="button"
                onClick={() => updateProp("mode", "tag")}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer",
                  mode === "tag"
                    ? "bg-fuchsia-500/25 text-fuchsia-300 font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5",
                )}
                title="Component tag mode (<UseTemplate />)"
              >
                &lt;UseTemplate /&gt;
              </button>
            </div>
          </div>

          {availableTemplates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/12 bg-white/2 p-3 text-xs text-neutral-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                No templates defined in this document yet. Add a{" "}
                <strong className="text-neutral-200">Template</strong> block
                from the sidebar first.
              </span>
            </div>
          ) : (
            <Select
              options={templateOptions}
              value={selectedName}
              onChange={(val) => updateProp("name", val)}
              placeholder="Choose a template..."
            />
          )}

          {selectedName && matchedTemplate && (
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span className="text-[11px] text-neutral-400">
                {mode === "shorthand" ? (
                  <>
                    Compiles as{" "}
                    <code className="text-fuchsia-300 font-mono">
                      #{selectedName}
                    </code>
                    .
                  </>
                ) : (
                  <>
                    Compiles as{" "}
                    <code className="text-fuchsia-300 font-mono">
                      &lt;UseTemplate name=&quot;{selectedName}&quot; /&gt;
                    </code>
                    .
                  </>
                )}
              </span>
            </div>
          )}

          {selectedName &&
            !matchedTemplate &&
            availableTemplates.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Template{" "}
                  <code className="font-mono">&ldquo;{selectedName}&rdquo;</code>{" "}
                  was not found in this document. Pick an existing template
                  above.
                </span>
              </div>
            )}
        </div>

        {matchedTemplate && allVarKeys.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
              Template Variables:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allVarKeys.map((varKey) => {
                const isUnused = !declaredVars.includes(varKey);
                return (
                  <div
                    key={varKey}
                    className={cn(
                      "space-y-1 p-2.5 rounded-xl border transition-colors",
                      isUnused
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-white/2 border-white/8",
                    )}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <label className="text-[11px] font-mono text-fuchsia-300 truncate">
                        {`{{${varKey}}}`}
                      </label>
                      {isUnused && (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono uppercase text-amber-400">
                            unused
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraVar(varKey)}
                            title={`Remove unused prop "${varKey}"`}
                            className="p-0.5 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      data-format-role="plain"
                      value={savedValues[varKey] ?? ""}
                      onChange={(e) =>
                        handleUpdateVarValue(varKey, e.target.value)
                      }
                      placeholder={`Value for ${varKey}...`}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-black/30 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-fuchsia-400/60 transition-colors"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  });

UseTemplateBlockEditor.displayName = "UseTemplateBlockEditor";
