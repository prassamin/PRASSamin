"use client";

import React from "react";
import {
  LuChevronRight,
  LuFolder,
  LuHardDrive,
  LuLoader,
} from "react-icons/lu";
import type { ContentItem } from "../types";
import { cn } from "@heroui/react";
import { normalizePath, useContent } from "../hooks/use-content-manager";

export function ContentTree() {
  const {
    currentPath,
    rootPath,
    folderTree,
    expandedPaths,
    loadingTreePaths,
    isFetching,
    goToPath: onNavigate,
  } = useContent();

  const normRoot = normalizePath(rootPath);
  const normCurrent = normalizePath(currentPath);
  const rootChildren = folderTree[normRoot] ?? folderTree[rootPath] ?? [];

  const renderNode = (node: ContentItem, depth: number) => {
    const nodePath = normalizePath(node.path);
    const isExpanded = expandedPaths.has(nodePath);
    const isLoading = loadingTreePaths.has(nodePath);
    const children = folderTree[nodePath] ?? folderTree[node.path] ?? [];
    const isActive = nodePath === normCurrent;

    return (
      <div key={nodePath}>
        <button
          type="button"
          onClick={() => onNavigate(nodePath)}
          className={cn(
            "group flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-left transition-colors cursor-pointer",
            isActive
              ? "bg-accent/15 text-accent font-medium"
              : "text-neutral-400 hover:bg-white/6 hover:text-white",
          )}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          title={nodePath}
        >
          {isLoading ? (
            <LuLoader className="w-3.5 h-3.5 shrink-0 animate-spin text-accent" />
          ) : (
            <LuChevronRight
              className={cn(
                "w-3.5 h-3.5 shrink-0 transition-transform duration-200 text-neutral-500 group-hover:text-white",
                isExpanded ? "rotate-90" : "rotate-0",
              )}
            />
          )}

          <LuFolder
            className={cn(
              "w-3.5 h-3.5 shrink-0",
              isActive
                ? "text-accent"
                : "text-neutral-400 group-hover:text-neutral-200",
            )}
          />
          <span className="truncate text-xs flex-1">{node.name}</span>
        </button>

        {isExpanded && children.length > 0 && (
          <div className="border-l border-white/5 ml-4">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r border-white/5 bg-white/2 p-3 hidden md:block">
      <div className="mb-2 px-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
        Folder Tree
      </div>

      <button
        type="button"
        onClick={() => onNavigate(normRoot)}
        className={cn(
          "group flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-left transition-colors cursor-pointer",
          normCurrent === normRoot
            ? "bg-accent/15 text-accent font-medium"
            : "text-neutral-400 hover:bg-white/6 hover:text-white",
        )}
        title="Root"
      >
        {loadingTreePaths.has(normRoot) ? (
          <LuLoader className="w-3.5 h-3.5 shrink-0 animate-spin text-accent" />
        ) : (
          <LuChevronRight
            className={cn(
              "w-3.5 h-3.5 shrink-0 transition-transform duration-200 text-neutral-500 group-hover:text-white",
              expandedPaths.has(normRoot) ? "rotate-90" : "rotate-0",
            )}
          />
        )}

        <LuHardDrive
          className={cn(
            "w-3.5 h-3.5 shrink-0",
            normCurrent === normRoot
              ? "text-accent"
              : "text-neutral-400 group-hover:text-neutral-200",
          )}
        />
        <span className="truncate text-xs flex-1">Root</span>
      </button>

      {isFetching && rootChildren.length === 0 ? (
        <div className="mt-2 space-y-1.5 px-1 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/2"
              style={{ paddingLeft: `${8 + (idx % 2) * 12}px` }}
            >
              <div className="w-3.5 h-3.5 rounded bg-white/10 shrink-0" />
              <div
                className="h-3 rounded bg-white/10"
                style={{ width: `${50 + (idx % 3) * 18}%` }}
              />
            </div>
          ))}
        </div>
      ) : expandedPaths.has(normRoot) && rootChildren.length > 0 ? (
        <div className="mt-1 border-l border-white/5 ml-4">
          {rootChildren.map((node) => renderNode(node, 1))}
        </div>
      ) : null}
    </aside>
  );
}
