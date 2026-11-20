"use client";

import React, { useState, useRef } from "react";
import {
  LuGripVertical as GripVertical,
  LuTrash2 as Trash2,
  LuCopy as Copy,
  LuExternalLink as ExternalLink,
  LuChevronUp as ChevronUp,
  LuChevronDown as ChevronDown,
  LuPlus as Plus,
  LuX as X,
  LuHeading as Heading,
  LuAlignLeft as AlignLeft,
  LuAlignCenter as AlignCenter,
  LuAlignRight as AlignRight,
  LuMinus as Minus,
  LuLightbulb as Lightbulb,
  LuCreditCard as CreditCard,
  LuLayers as Layers,
  LuCodeXml as CodeXml,
  LuImage as ImageIcon,
  LuTable as TableIcon,
  LuTag as Tag,
  LuMegaphone as Megaphone,
  LuCircleHelp as HelpCircle,
  LuListOrdered as ListOrdered,
  LuSlidersHorizontal as SlidersHorizontal,
  LuBold as Bold,
  LuItalic as Italic,
  LuRefreshCw as RefreshCw,
  LuHighlighter as Highlighter,
  LuEye as Eye,
  LuCircleAlert as AlertCircle,
  LuTriangleAlert as AlertTriangle,
  LuWholeWord as WholeWord,
  LuWandSparkles as WandSparkles,
  LuTableProperties as TableProperties,
  LuFolderTree as FolderTree,
  LuFolder as Folder,
  LuFolderOpen as FolderOpen,
  LuFolderPlus as FolderPlus,
  LuFileText as FileText,
  LuFilePlus as FilePlus,
  LuCircleUser as CircleUser,
  LuUser as User,
  LuUsers as Users,
  LuLink as LinkIcon,
  LuQuote as Quote,
  LuCornerDownLeft as CornerDownLeft,
  LuTerminal as Terminal,
  LuBlocks as BlocksIcon,
  LuCopyPlus as CopyPlus,
  LuEyeOff as EyeOff,
  LuSparkles as Sparkles,
  LuTag as TagIcon,
  LuType as TypeIcon,
  LuAlignStartHorizontal,
  LuAlignStartVertical,
} from "react-icons/lu";
import {
  MdxBlock,
  MdxBlockType,
  TypeTableProperty,
  FileTreeNode,
  ListType,
  ListItem,
  TemplateDefinitionInfo,
} from "../../types";
import { LuList, LuListOrdered, LuListTodo, LuCheck } from "react-icons/lu";
import { createBlock, extractTemplateVariables } from "../../compiler";
import { cn } from "@heroui/react";
import { DropIndicator } from "../../components/drop-indicator";
import { ImagePicker } from "@/components/image-picker";
import { InlineTooltipField } from "../../components/inline-tooltip-field";
import { Input } from "@heroui/react";
import { MdxChip } from "@/mdx-components";
import { MdxAvatarGroup } from "@/components/mdx/mdx-avatar";
import { MdxProfile } from "@/components/mdx/mdx-profile";
import { MdxBlockquote } from "@/components/mdx/mdx-blockquote";
import { Select } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { canDropBlockInTab, canDropBlockInTemplate } from "../registry";

interface BlockEditorProps {
  props: Record<string, any>;
  updateProp: (keyOrPatch: string | Record<string, any>, value?: any) => void;
}

export const TableBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => {
  // Table block helpers
  const tableHeaders: string[] =
    Array.isArray(props.headers) && props.headers.length > 0
      ? props.headers
      : ["Column 1", "Column 2"];
  const tableAlignments: ("left" | "center" | "right")[] = Array.isArray(
    props.alignments,
  )
    ? props.alignments
    : tableHeaders.map(() => "left");
  const tableRows: string[][] = Array.isArray(props.rows) ? props.rows : [];

  const handleAddTableColumn = () => {
    const colNum = tableHeaders.length + 1;
    const newHeaders = [...tableHeaders, `Header ${colNum}`];
    const newAlignments: ("left" | "center" | "right")[] = [
      ...tableAlignments,
      "left",
    ];
    const newRows = tableRows.map((r) => [...r, ""]);
    updateProp({
      ...props,
      headers: newHeaders,
      alignments: newAlignments,
      rows: newRows,
    });
  };

  const handleDeleteTableColumn = (cIdx: number) => {
    if (tableHeaders.length <= 1) return;
    const newHeaders = tableHeaders.filter((_, i) => i !== cIdx);
    const newAlignments = tableAlignments.filter((_, i) => i !== cIdx);
    const newRows = tableRows.map((r) => r.filter((_, i) => i !== cIdx));
    updateProp({
      ...props,
      headers: newHeaders,
      alignments: newAlignments,
      rows: newRows,
    });
  };

  const handleUpdateTableHeader = (cIdx: number, val: string) => {
    const newHeaders = [...tableHeaders];
    newHeaders[cIdx] = val;
    updateProp("headers", newHeaders);
  };

  const handleUpdateTableAlignment = (
    cIdx: number,
    align: "left" | "center" | "right",
  ) => {
    const newAlignments = [...tableAlignments];
    newAlignments[cIdx] = align;
    updateProp("alignments", newAlignments);
  };

  const handleAddTableRow = () => {
    const emptyRow = tableHeaders.map(() => "");
    updateProp("rows", [...tableRows, emptyRow]);
  };

  const handleDeleteTableRow = (rIdx: number) => {
    const newRows = tableRows.filter((_, i) => i !== rIdx);
    updateProp("rows", newRows);
  };

  const handleUpdateTableCell = (rIdx: number, cIdx: number, val: string) => {
    const newRows = tableRows.map((r, ri) => {
      if (ri !== rIdx) return r;
      const copy = [...r];
      while (copy.length < tableHeaders.length) copy.push("");
      copy[cIdx] = val;
      return copy;
    });
    updateProp("rows", newRows);
  };

  // TypeTable block helpers
  const typeTableParams: TypeTableProperty[] = Array.isArray(props.parameters)
    ? props.parameters
    : [];
  return (
          <div className="space-y-3">
            {/* Table meta bar */}
            <div className="flex items-center justify-end gap-2 px-1">
              <button
                type="button"
                onClick={handleAddTableColumn}
                className="px-2.5 py-1 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-accent" />
                <span>Add Column</span>
              </button>
            </div>

            {/* Scrollable table grid container */}
            <div className="rounded-2xl border border-white/8 bg-white/1.5 overflow-x-auto p-2.5 space-y-2">
              {/* Header row */}
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${tableHeaders.length}, minmax(140px, 1fr)) 36px`,
                }}
              >
                {tableHeaders.map((header, cIdx) => {
                  const align = tableAlignments[cIdx] || "left";
                  return (
                    <div
                      key={cIdx}
                      className="flex flex-col gap-1.5 p-2 rounded-xl bg-white/[0.035] border border-white/8"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-0.5 bg-black/30 p-0.5 rounded-lg border border-white/5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTableAlignment(cIdx, "left")
                            }
                            title="Align Left"
                            className={cn(
                              "p-1 rounded text-[10px] transition-colors",
                              align === "left"
                                ? "bg-accent/20 text-accent font-bold"
                                : "text-neutral-400 hover:text-white hover:bg-white/10",
                            )}
                          >
                            <AlignLeft className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTableAlignment(cIdx, "center")
                            }
                            title="Align Center"
                            className={cn(
                              "p-1 rounded text-[10px] transition-colors",
                              align === "center"
                                ? "bg-accent/20 text-accent font-bold"
                                : "text-neutral-400 hover:text-white hover:bg-white/10",
                            )}
                          >
                            <AlignCenter className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTableAlignment(cIdx, "right")
                            }
                            title="Align Right"
                            className={cn(
                              "p-1 rounded text-[10px] transition-colors",
                              align === "right"
                                ? "bg-accent/20 text-accent font-bold"
                                : "text-neutral-400 hover:text-white hover:bg-white/10",
                            )}
                          >
                            <AlignRight className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {tableHeaders.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTableColumn(cIdx)}
                            title="Delete Column"
                            className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={header}
                        onChange={(e) =>
                          handleUpdateTableHeader(cIdx, e.target.value)
                        }
                        placeholder={`Column ${cIdx + 1}`}
                        className={cn(
                          "w-full px-2 py-1 bg-white/4 border border-white/10 focus:border-accent/40 rounded-lg text-xs font-semibold text-white placeholder:text-neutral-500 focus:outline-none transition-colors",
                          align === "center" && "text-center",
                          align === "right" && "text-right",
                        )}
                      />
                    </div>
                  );
                })}

                {/* Header spacer aligned with delete row button */}
                <div className="w-9" />
              </div>

              {/* Data rows */}
              {tableRows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="grid gap-2 items-center"
                  style={{
                    gridTemplateColumns: `repeat(${tableHeaders.length}, minmax(140px, 1fr)) 36px`,
                  }}
                >
                  {tableHeaders.map((_, cIdx) => {
                    const align = tableAlignments[cIdx] || "left";
                    return (
                      <input
                        key={cIdx}
                        type="text"
                        value={row[cIdx] ?? ""}
                        onChange={(e) =>
                          handleUpdateTableCell(rIdx, cIdx, e.target.value)
                        }
                        placeholder="Cell value..."
                        className={cn(
                          "w-full px-2.5 py-1.5 bg-black/30 border border-white/8 focus:border-accent/40 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none transition-colors",
                          align === "center" && "text-center",
                          align === "right" && "text-right",
                        )}
                      />
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleDeleteTableRow(rIdx)}
                    title="Delete Row"
                    className="w-9 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add row button */}
            <button
              type="button"
              onClick={handleAddTableRow}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-white/15 hover:border-accent/40 bg-white/1.5 hover:bg-accent/4 text-neutral-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent transition-colors" />
              <span>Add Row</span>
            </button>
          </div>
  );
});
TableBlockEditor.displayName = "TableBlockEditor";

export const TypeTableBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => {
  const typeTableParams: TypeTableProperty[] = Array.isArray(props.parameters) ? props.parameters : [];

  const handleAddTypeTableProp = () => {
    const next: TypeTableProperty[] = [
      ...typeTableParams,
      {
        name: `prop${typeTableParams.length + 1}`,
        type: "string",
        description: "",
        default: "",
        required: false,
        deprecated: false,
      },
    ];
    updateProp("parameters", next);
  };

  const handleUpdateTypeTableProp = (
    propIdx: number,
    field: keyof TypeTableProperty,
    val: any,
  ) => {
    const next = typeTableParams.map((item, idx) =>
      idx === propIdx ? { ...item, [field]: val } : item,
    );
    updateProp("parameters", next);
  };

  const handleDeleteTypeTableProp = (propIdx: number) => {
    const next = typeTableParams.filter((_, idx) => idx !== propIdx);
    updateProp("parameters", next);
  };

  const handleMoveTypeTableProp = (
    propIdx: number,
    direction: "up" | "down",
  ) => {
    const targetIdx = direction === "up" ? propIdx - 1 : propIdx + 1;
    if (targetIdx < 0 || targetIdx >= typeTableParams.length) return;
    const next = [...typeTableParams];
    const [moved] = next.splice(propIdx, 1);
    next.splice(targetIdx, 0, moved);
    updateProp("parameters", next);
  };

  // Files block helpers
  const fileTreeItems: FileTreeNode[] = Array.isArray(props.items)
    ? props.items
    : [];
  return (
          <div className="space-y-3">
            {/* List of properties */}
            <div className="space-y-2.5">
              {typeTableParams.map((param, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3 rounded-2xl bg-white/2.5 border border-white/8 hover:border-white/14 transition-all space-y-2.5"
                >
                  {/* Top row: Name, Type, Default, Toggles, Reorder & Delete */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reorder arrows */}
                    <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/5">
                      <button
                        type="button"
                        disabled={pIdx === 0}
                        onClick={() => handleMoveTypeTableProp(pIdx, "up")}
                        title="Move Up"
                        className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={pIdx === typeTableParams.length - 1}
                        onClick={() => handleMoveTypeTableProp(pIdx, "down")}
                        title="Move Down"
                        className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Prop Name */}
                    <div className="flex-1 min-w-32.5">
                      <input
                        type="text"
                        data-format-role="plain"
                        value={param.name}
                        onChange={(e) =>
                          handleUpdateTypeTableProp(
                            pIdx,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="Prop name (e.g. title)"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 focus:border-accent/40 rounded-xl text-xs font-mono font-bold text-accent placeholder:text-neutral-600 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Prop Type */}
                    <div className="flex-1 min-w-32.5">
                      <input
                        type="text"
                        data-format-role="plain"
                        value={param.type}
                        onChange={(e) =>
                          handleUpdateTypeTableProp(
                            pIdx,
                            "type",
                            e.target.value,
                          )
                        }
                        placeholder="Type (e.g. string)"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 focus:border-sky-400/40 rounded-xl text-xs font-mono text-sky-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Default value */}
                    <div className="w-28 min-w-22.5">
                      <input
                        type="text"
                        data-format-role="plain"
                        value={param.default ?? ""}
                        onChange={(e) =>
                          handleUpdateTypeTableProp(
                            pIdx,
                            "default",
                            e.target.value,
                          )
                        }
                        placeholder="Default (-)"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 focus:border-white/30 rounded-xl text-xs font-mono text-neutral-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Required Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTypeTableProp(
                          pIdx,
                          "required",
                          !param.required,
                        )
                      }
                      title={
                        param.required ? "Mark as Optional" : "Mark as Required"
                      }
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold transition-all border cursor-pointer",
                        param.required
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm"
                          : "bg-white/3 text-neutral-500 border-white/5 hover:text-neutral-300 hover:border-white/15",
                      )}
                    >
                      {param.required ? "Req" : "Opt"}
                    </button>

                    {/* Deprecated Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTypeTableProp(
                          pIdx,
                          "deprecated",
                          !param.deprecated,
                        )
                      }
                      title={
                        param.deprecated
                          ? "Remove Deprecated Flag"
                          : "Mark as Deprecated"
                      }
                      className={cn(
                        "px-2 py-1.5 rounded-xl text-[11px] font-mono transition-all border cursor-pointer",
                        param.deprecated
                          ? "bg-red-500/20 text-red-300 border-red-500/40 line-through"
                          : "bg-white/3 text-neutral-500 border-white/5 hover:text-neutral-300 hover:border-white/15",
                      )}
                    >
                      Dep
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTypeTableProp(pIdx)}
                      title="Delete Property"
                      className="p-1.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom row: Description */}
                  <div>
                    <input
                      type="text"
                      value={param.description ?? ""}
                      onChange={(e) =>
                        handleUpdateTypeTableProp(
                          pIdx,
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder="Description of this prop (optional)..."
                      className="w-full px-3 py-1.5 bg-black/20 border border-white/6 focus:border-accent/30 rounded-xl text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Property Bottom Button */}
            <button
              type="button"
              onClick={handleAddTypeTableProp}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-white/15 hover:border-accent/40 bg-white/1.5 hover:bg-accent/4 text-neutral-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent transition-colors" />
              <span>Add Property</span>
            </button>
          </div>
  );
});
TypeTableBlockEditor.displayName = "TypeTableBlockEditor";
