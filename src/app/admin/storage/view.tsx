"use client";

import React, { useEffect } from "react";
import { Spinner } from "@heroui/react";
import {
  ContentManagerProvider,
  useContent,
} from "./hooks/use-content-manager";
import { ContentBreadcrumbs } from "./components/content-breadcrumbs";
import { ContentToolbar } from "./components/content-toolbar";
import { ContentTree } from "./components/content-tree";
import { ContentGrid } from "./components/content-grid";
import { CreateFolderModal } from "./components/create-folder-modal";
import { MediaViewer } from "./components/media-viewer";
import { UploadProgressPanel } from "@/components/upload-progress-panel";

function ContentManagerViewInner() {
  const {
    currentPath,
    rootPath,
    expandedPaths,
    toggleExpandPath,
    uploadQueue,
    clearUploadQueue,
  } = useContent();

  const root = rootPath || "pras/portfolio";

  useEffect(() => {
    if (!root) return;
    if (expandedPaths.has(root)) return;
    toggleExpandPath(root);
  }, [root, expandedPaths, toggleExpandPath]);

  if (!currentPath) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner className="text-accent" />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100dvh-112px)] rounded-2xl border border-white/[0.06] bg-muted/40 backdrop-blur-2xl flex flex-col overflow-hidden shadow-2xl relative">
      {/* Ambient gloss glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-sky-500/[0.04] blur-3xl" />

      {/* Header with Breadcrumbs */}
      <div className="border-b border-white/[0.05] bg-white/[0.02] px-4 py-2.5">
        <ContentBreadcrumbs />
      </div>

      {/* Toolbar */}
      <ContentToolbar />

      {/* Main Split Area (Tree + Grid) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Folder Tree Sidebar */}
        <ContentTree />

        {/* Right Content Grid / Table */}
        <ContentGrid />
      </div>

      {/* Create Folder Modal */}
      <CreateFolderModal />

      {/* Media Viewer Drawer */}
      <MediaViewer />

      {/* Upload Progress Panel (Fixed bottom-right side with Framer Motion) */}
      <UploadProgressPanel queue={uploadQueue} onClear={clearUploadQueue} />
    </div>
  );
}

interface AdminMediaViewProps {
  initialStructure?: Record<string, any>;
}

export function AdminMediaView({ initialStructure = {} }: AdminMediaViewProps) {
  return (
    <ContentManagerProvider initialStructure={initialStructure}>
      <ContentManagerViewInner />
    </ContentManagerProvider>
  );
}

export default AdminMediaView;
