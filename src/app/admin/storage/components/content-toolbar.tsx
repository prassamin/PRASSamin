"use client";

import React, { useRef } from "react";
import {
  LuArrowDownWideNarrow,
  LuArrowUp,
  LuArrowUpDown,
  LuArrowUpNarrowWide,
  LuFolderPlus,
  LuRotateCcw,
  LuTrash2,
  LuUpload,
} from "react-icons/lu";
import { Dropdown, Header, Label, Spinner, cn } from "@heroui/react";
import { useContent } from "../hooks/use-content-manager";

type Props = {
  onCreateFolder?: () => void;
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 h-8 min-w-8 px-2.5 rounded-lg text-xs font-medium cursor-pointer select-none" +
  " transition-all duration-200 ease-out" +
  " hover:scale-[1.03] active:scale-[0.96]" +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" +
  " disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100" +
  " [&_svg]:w-4 [&_svg]:h-4";

const GROUP_BASE = "flex items-center gap-1";

function ToolbarButton({
  label,
  icon,
  onClick,
  isPending,
  disabled,
  variant = "default",
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isPending?: boolean;
  disabled?: boolean;
  variant?: "default" | "accent" | "danger";
}) {
  const variantStyles = {
    default: "text-neutral-400 hover:text-white hover:bg-white/[0.08]",
    accent: "text-accent bg-accent/10 hover:bg-accent/20",
    danger: "text-rose-400 hover:bg-rose-500/10",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPending}
      className={cn(BTN_BASE, variantStyles[variant])}
      title={label}
      aria-label={label}
    >
      {isPending ? <Spinner color="current" size="sm" /> : icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

export function ContentToolbar({ onCreateFolder }: Props = {}) {
  const {
    sortKey,
    sortDirection,
    isFetching,
    parentPath,
    selectedPaths,
    isUploading,
    isDeleting,
    uploadFiles: onUploadFiles,
    reloadCurrent: onReload,
    setSortKey: onSortKeyChange,
    setSortDirection: onSortDirectionChange,
    deleteSelected: onDeleteSelected,
    goUp: onGoUp,
    setCreateFolderOpen,
  } = useContent();

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFolder =
    onCreateFolder || (() => setCreateFolderOpen(true));

  const selectedCount = selectedPaths.size;

  return (
    <>
      {/* Hidden upload input */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="*/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            onUploadFiles(files);
          }
          e.currentTarget.value = "";
        }}
      />

      {/* Content toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/[0.05] bg-white/[0.02]">
        {/* Navigation Group */}
        <div className={GROUP_BASE}>
          <ToolbarButton
            label="Up"
            icon={<LuArrowUp />}
            onClick={onGoUp}
            disabled={!Boolean(parentPath)}
          />

          <ToolbarButton
            label="Refresh"
            icon={
              isFetching ? (
                <Spinner color="current" size="sm" />
              ) : (
                <LuRotateCcw className={cn(isFetching && "animate-spin")} />
              )
            }
            onClick={() => void onReload()}
            isPending={isFetching}
          />
        </div>

        {/* Actions Group */}
        <div className={GROUP_BASE}>
          <ToolbarButton
            label="Upload"
            icon={<LuUpload />}
            onClick={() => void uploadInputRef.current?.click()}
            isPending={isUploading}
          />

          <ToolbarButton
            label="New Folder"
            icon={<LuFolderPlus />}
            onClick={handleCreateFolder}
            variant="accent"
          />
        </div>

        {/* Sort Dropdown */}
        <Dropdown>
          <Dropdown.Trigger
            className={cn(
              BTN_BASE,
              "w-auto px-2.5 text-neutral-400 hover:text-white hover:bg-white/[0.08]",
            )}
          >
            <LuArrowUpDown />
            <span className="hidden md:inline">Sort</span>
          </Dropdown.Trigger>
          <Dropdown.Popover
            className="min-w-48 p-1.5 rounded-2xl border border-white/[0.06] bg-neutral-900/90 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] text-neutral-200"
            placement="bottom end"
          >
            <Dropdown.Menu className="gap-1">
              {/* Sort By Section */}
              <Dropdown.Section>
                <Header className="text-[10px] uppercase font-semibold text-neutral-500 px-2 py-1">
                  Sort by
                </Header>
                <Dropdown.Item
                  textValue="Name"
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 cursor-pointer",
                    sortKey === "name"
                      ? "bg-accent/15 text-accent font-medium"
                      : "hover:bg-white/[0.05] text-neutral-300",
                  )}
                  onAction={() => onSortKeyChange("name")}
                >
                  <Label className="flex items-center justify-between text-xs gap-2 w-full">
                    <span>Name</span>
                    {sortKey === "name" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </Label>
                </Dropdown.Item>
                <Dropdown.Item
                  textValue="Date"
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 cursor-pointer",
                    sortKey === "date"
                      ? "bg-accent/15 text-accent font-medium"
                      : "hover:bg-white/[0.05] text-neutral-300",
                  )}
                  onAction={() => onSortKeyChange("date")}
                >
                  <Label className="flex items-center justify-between text-xs gap-2 w-full">
                    <span>Date</span>
                    {sortKey === "date" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </Label>
                </Dropdown.Item>
                <Dropdown.Item
                  textValue="Size"
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 cursor-pointer",
                    sortKey === "size"
                      ? "bg-accent/15 text-accent font-medium"
                      : "hover:bg-white/[0.05] text-neutral-300",
                  )}
                  onAction={() => onSortKeyChange("size")}
                >
                  <Label className="flex items-center justify-between text-xs gap-2 w-full">
                    <span>Size</span>
                    {sortKey === "size" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </Label>
                </Dropdown.Item>
                <Dropdown.Item
                  textValue="Type"
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 cursor-pointer",
                    sortKey === "type"
                      ? "bg-accent/15 text-accent font-medium"
                      : "hover:bg-white/[0.05] text-neutral-300",
                  )}
                  onAction={() => onSortKeyChange("type")}
                >
                  <Label className="flex items-center justify-between text-xs gap-2 w-full">
                    <span>Type</span>
                    {sortKey === "type" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </Label>
                </Dropdown.Item>
              </Dropdown.Section>

              {/* Sort Order Section */}
              <Dropdown.Section className="mt-2 pt-2 border-t border-white/[0.05]">
                <Header className="text-[10px] uppercase font-semibold text-neutral-500 px-2 py-1">
                  Order
                </Header>
                <Dropdown.Item
                  textValue="Ascending"
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 cursor-pointer",
                    sortDirection === "asc"
                      ? "bg-accent/15 text-accent font-medium"
                      : "hover:bg-white/[0.05] text-neutral-300",
                  )}
                  onAction={() => onSortDirectionChange("asc")}
                >
                  <Label className="flex items-center gap-2 text-xs w-full">
                    <LuArrowUpNarrowWide className="w-3.5 h-3.5" />
                    <span>Ascending</span>
                    {sortDirection === "asc" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent ml-auto" />
                    )}
                  </Label>
                </Dropdown.Item>
                <Dropdown.Item
                  textValue="Descending"
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 cursor-pointer",
                    sortDirection === "desc"
                      ? "bg-accent/15 text-accent font-medium"
                      : "hover:bg-white/[0.05] text-neutral-300",
                  )}
                  onAction={() => onSortDirectionChange("desc")}
                >
                  <Label className="flex items-center gap-2 text-xs w-full">
                    <LuArrowDownWideNarrow className="w-3.5 h-3.5" />
                    <span>Descending</span>
                    {sortDirection === "desc" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent ml-auto" />
                    )}
                  </Label>
                </Dropdown.Item>
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        {/* Right Actions (Delete) */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0 || isDeleting}
            className={cn(
              BTN_BASE,
              "gap-1.5 px-3 rounded-xl",
              selectedCount > 0
                ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 hover:text-rose-300"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.08]",
            )}
            title={
              selectedCount > 0
                ? `Delete ${selectedCount} selected item${selectedCount > 1 ? "s" : ""}`
                : "Delete selected (none selected)"
            }
            aria-label="Delete selected"
          >
            <LuTrash2 />
            <span className="hidden md:inline text-xs font-medium">Delete</span>
            {selectedCount > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/20 px-1 text-[10px] font-semibold leading-none text-rose-300">
                {selectedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
