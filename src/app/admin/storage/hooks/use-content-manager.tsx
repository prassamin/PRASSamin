"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { toast } from "@heroui/react";
import { useConfirm } from "@/providers/ConfirmProvider";
import {
  getStorageStructureAction,
  createCloudinaryFolderAction,
  deleteCloudinaryFileAction,
  deleteCloudinaryFolderAction,
} from "../actions";
import type { ContentItem, SortDirection, SortKey, UploadFileItem } from "../types";
import { getCloudinaryMimeType } from "@/lib/file-type";
import { storageClient } from "@/lib/storage";

export function normalizePath(p?: string | null): string {
  if (!p || p === "/" || p === "\\" || p.trim() === "") return "pras/portfolio";
  const clean = p
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/+/g, "/");
  return clean || "pras/portfolio";
}

function getNodeByPath(structure: Record<string, any>, path: string) {
  if (!structure) return null;
  const clean = normalizePath(path);
  const parts = clean.split("/").filter(Boolean);
  let current = structure;
  for (const part of parts) {
    if (!current || typeof current !== "object") return null;
    current = current[part];
  }
  return current;
}

function extractFolderTree(
  structure: Record<string, any>,
  rootPath = "pras/portfolio",
): Record<string, ContentItem[]> {
  const tree: Record<string, ContentItem[]> = {};

  function traverse(node: any, path: string) {
    if (!node || typeof node !== "object") return;
    const subfolders: ContentItem[] = Object.entries(node)
      .filter(
        ([k, v]) =>
          k !== "__meta" &&
          k !== "files" &&
          v &&
          typeof v === "object" &&
          (v as any).__meta,
      )
      .map(([k, v]: [string, any]) => ({
        name: v.__meta?.name || k,
        path: v.__meta?.path || `${path}/${k}`,
        url: "",
        kind: "folder" as const,
      }));

    tree[path] = subfolders;

    for (const [k, v] of Object.entries(node)) {
      if (
        k !== "__meta" &&
        k !== "files" &&
        v &&
        typeof v === "object" &&
        (v as any).__meta
      ) {
        traverse(v, (v as any).__meta.path || `${path}/${k}`);
      }
    }
  }

  const rootNode = getNodeByPath(structure, rootPath);
  if (rootNode) {
    traverse(rootNode, rootPath);
  }
  return tree;
}

function extractItemsForPath(
  structure: Record<string, any>,
  path: string,
): ContentItem[] {
  const node = getNodeByPath(structure, path);
  if (!node) return [];

  const subfolders: ContentItem[] = Object.entries(node)
    .filter(
      ([k, v]) =>
        k !== "__meta" &&
        k !== "files" &&
        v &&
        typeof v === "object" &&
        (v as any).__meta,
    )
    .map(([k, v]: [string, any]) => ({
      name: v.__meta?.name || k,
      path: v.__meta?.path || `${path}/${k}`,
      url: "",
      kind: "folder" as const,
    }));

  const files: ContentItem[] = (node.files || []).map((file: any) => {
    const filename =
      file.display_name ||
      file.secure_url?.split("/").pop() ||
      file.public_id?.split("/").pop() ||
      "file";
    const mimeType = getCloudinaryMimeType(file);

    return {
      name: filename,
      path: file.public_id,
      url: file.secure_url || file.url,
      kind: "file" as const,
      sizeBytes: file.bytes,
      mimeType,
      createdAt: file.created_at,
      updatedAt: file.created_at,
      publicId: file.public_id,
      assetId: file.asset_id,
    };
  });

  return [...subfolders, ...files];
}

interface ContentContextType {
  currentPath: string;
  rootPath: string;
  parentPath: string | null;
  sortKey: SortKey;
  setSortKey: (key: SortKey) => void;
  sortDirection: SortDirection;
  setSortDirection: (dir: SortDirection) => void;
  selectedPaths: Set<string>;
  toggleSelect: (path: string) => void;
  selectAllVisible: () => void;
  clearSelection: () => void;
  expandedPaths: Set<string>;
  toggleExpandPath: (path: string) => void;
  loadingTreePaths: Set<string>;
  folderTree: Record<string, ContentItem[]>;
  items: ContentItem[];
  allCurrentItems: ContentItem[];
  isFetching: boolean;
  isUploading: boolean;
  isCreatingFolder: boolean;
  isDeleting: boolean;
  isSubmittingFolder: boolean;
  uploadQueue: UploadFileItem[];
  clearUploadQueue: () => void;
  uploadFiles: (files: File[]) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  deletePaths: (paths: string[]) => Promise<void>;
  deleteSelected: () => Promise<void>;
  goToPath: (path: string) => void;
  goUp: () => void;
  reloadCurrent: () => Promise<void>;
  openFolder: (item: ContentItem) => void;
  // Modals / Preview state
  isCreateFolderOpen: boolean;
  setCreateFolderOpen: (open: boolean) => void;
  folderName: string;
  setFolderName: (name: string) => void;
  handleCloseFolderModal: () => void;
  handleCreateFolder: () => Promise<void>;
  isMediaViewerOpen: boolean;
  mediaViewerIndex: number;
  openPreview: (item: ContentItem) => void;
  closePreview: () => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error("useContent must be used within ContentManagerProvider");
  }
  return ctx;
}

interface ContentManagerProviderProps {
  initialStructure?: Record<string, any>;
  children: React.ReactNode;
}

const ROOT_PATH = "pras/portfolio";
const CONCURRENCY = 3;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function ContentManagerProvider({
  initialStructure = {},
  children,
}: ContentManagerProviderProps) {
  const [structure, setStructure] = useState<Record<string, any>>(initialStructure);
  const [currentPath, setCurrentPath] = useState<string>(ROOT_PATH);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set([ROOT_PATH]),
  );
  const [loadingTreePaths, setLoadingTreePaths] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState<boolean>(() => {
    return !initialStructure || Object.keys(initialStructure).length === 0;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingFolder, setIsSubmittingFolder] = useState(false);

  // Modals & Preview
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isMediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

  // Upload Queue
  const [uploadQueue, setUploadQueue] = useState<UploadFileItem[]>([]);

  const { confirm } = useConfirm();

  // Fetch / Refresh structure
  const fetchStructure = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await getStorageStructureAction(ROOT_PATH);
      if (res.structure) {
        setStructure(res.structure);
      }
    } catch (err: any) {
      console.error("Failed to load storage structure:", err);
      toast.danger(err?.message || "Failed to load storage structure.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!initialStructure || Object.keys(initialStructure).length === 0) {
      fetchStructure();
    }
  }, [fetchStructure, initialStructure]);

  // Folder Tree derived from structure
  const folderTree = useMemo(() => {
    return extractFolderTree(structure, ROOT_PATH);
  }, [structure]);

  // Items in current path
  const allCurrentItems = useMemo(() => {
    return extractItemsForPath(structure, currentPath);
  }, [structure, currentPath]);

  // Filtered & Sorted items
  const items = useMemo(() => {
    const list = [...allCurrentItems];

    list.sort((a, b) => {
      // Folders always on top
      if (a.kind !== b.kind) {
        return a.kind === "folder" ? -1 : 1;
      }

      let comp = 0;
      if (sortKey === "name") {
        comp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      } else if (sortKey === "date") {
        const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comp = da - db;
      } else if (sortKey === "size") {
        comp = (a.sizeBytes || 0) - (b.sizeBytes || 0);
      } else if (sortKey === "type") {
        const ta = a.mimeType || "";
        const tb = b.mimeType || "";
        comp = ta.localeCompare(tb);
      }

      return sortDirection === "asc" ? comp : -comp;
    });

    return list;
  }, [allCurrentItems, sortKey, sortDirection]);

  // Parent path calculation
  const parentPath = useMemo(() => {
    if (currentPath === ROOT_PATH) return null;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const parent = parts.join("/");
    return parent.startsWith(ROOT_PATH) ? parent : ROOT_PATH;
  }, [currentPath]);

  // Navigation
  const goToPath = useCallback((targetPath: string) => {
    setSelectedPaths(new Set());

    const normCurrent = normalizePath(currentPath);
    const normTarget = normalizePath(targetPath);

    // Case 1: Clicking the currently active folder -> toggle expand/collapse
    if (normCurrent === normTarget) {
      const isExpanded = expandedPaths.has(normTarget);
      if (isExpanded) {
        // Root stays open, but collapse all its subfolders
        if (normTarget === ROOT_PATH) {
          setExpandedPaths(new Set([ROOT_PATH]));
        } else {
          // Collapse normTarget and all subfolders beneath it
          setExpandedPaths((prev) => {
            const next = new Set<string>();
            for (const p of prev) {
              const normP = normalizePath(p);
              const isTargetOrChild =
                normP === normTarget || normP.startsWith(normTarget + "/");
              if (!isTargetOrChild) next.add(normP);
            }
            return next;
          });
        }
      } else {
        // Expand normTarget (children come from folderTree)
        setExpandedPaths((prev) => new Set(prev).add(normTarget));
      }
      return;
    }

    // Case 2: Navigating from a child up to its parent / ancestor -> collapse deeper branches
    const isChildToParent =
      normTarget === ROOT_PATH
        ? normCurrent !== ROOT_PATH
        : normCurrent.startsWith(normTarget + "/");

    if (isChildToParent) {
      setExpandedPaths((prev) => {
        const next = new Set<string>();
        for (const p of prev) {
          const normP = normalizePath(p);
          const isDescendant =
            normTarget === ROOT_PATH
              ? normP !== ROOT_PATH
              : normP !== normTarget && normP.startsWith(normTarget + "/");
          if (!isDescendant) next.add(normP);
        }
        // Ensure normTarget and all its ancestors stay expanded
        const parts = normTarget.split("/").filter(Boolean);
        next.add(ROOT_PATH);
        for (let i = 1; i <= parts.length; i++) {
          next.add(parts.slice(0, i).join("/"));
        }
        return next;
      });
      setCurrentPath(normTarget);
      return;
    }

    // Case 3: Navigating from a parent to a child, or jumping to another branch
    // -> expand normTarget and all its ancestors
    setCurrentPath(normTarget);
    setExpandedPaths((prev) => {
      const next = new Set<string>(prev);
      const parts = normTarget.split("/").filter(Boolean);
      next.add(ROOT_PATH);
      for (let i = 1; i <= parts.length; i++) {
        next.add(parts.slice(0, i).join("/"));
      }
      return next;
    });
  }, [currentPath, expandedPaths]);

  const goUp = useCallback(() => {
    if (parentPath) {
      goToPath(parentPath);
    }
  }, [parentPath, goToPath]);

  const toggleExpandPath = useCallback((path: string) => {
    const norm = normalizePath(path);
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(norm)) {
        if (norm !== ROOT_PATH) {
          next.delete(norm);
        }
      } else {
        next.add(norm);
      }
      return next;
    });
  }, []);

  const openFolder = useCallback(
    (item: ContentItem) => {
      if (item.kind !== "folder") return;
      goToPath(item.path);
    },
    [goToPath],
  );

  // Selection
  const toggleSelect = useCallback((path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedPaths(new Set(items.map((i) => i.path)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedPaths(new Set());
  }, []);

  // Upload with Axios and real-time progress
  const uploadFiles = useCallback(
    async (filesToUpload: File[]) => {
      if (!filesToUpload.length) return;

      const validFiles: File[] = [];
      const newQueueItems: UploadFileItem[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const id = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;

        if (file.size > MAX_FILE_SIZE) {
          newQueueItems.push({
            id,
            name: file.name,
            size: file.size,
            path: `${currentPath}/${file.name}`,
            status: "error",
            percent: 0,
            loaded: 0,
            error: `Exceeds max size (${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB)`,
          });
        } else {
          validFiles.push(file);
          newQueueItems.push({
            id,
            name: file.name,
            size: file.size,
            path: `${currentPath}/${file.name}`,
            status: "pending",
            percent: 0,
            loaded: 0,
          });
        }
      }

      setUploadQueue((prev) => [...prev, ...newQueueItems]);
      if (validFiles.length === 0) return;

      setIsUploading(true);

      const queueMap = new Map<string, UploadFileItem>();
      newQueueItems.forEach((q) => queueMap.set(q.name, q));

      const worker = async () => {
        while (validFiles.length > 0) {
          const fileToUpload = validFiles.shift();
          if (!fileToUpload) break;

          const queueItem = queueMap.get(fileToUpload.name);
          if (!queueItem) continue;

          // Mark uploading
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueItem.id
                ? { ...item, status: "uploading", percent: 5 }
                : item,
            ),
          );

          try {
            const basePublicId =
              fileToUpload.name.replace(/\.[^/.]+$/, "") ||
              `file_${Date.now()}`;

            await storageClient.upload.file(fileToUpload, {
              folder: currentPath,
              publicId: basePublicId,
              onProgress: (p) => {
                const percent = Math.min(98, p.percent);
                setUploadQueue((prev) =>
                  prev.map((item) =>
                    item.id === queueItem.id
                      ? {
                          ...item,
                          percent,
                          loaded: p.loaded,
                          status: "uploading",
                        }
                      : item,
                  ),
                );
              },
            });

            // Mark done
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === queueItem.id
                  ? {
                      ...item,
                      status: "done",
                      percent: 100,
                      loaded: queueItem.size,
                    }
                  : item,
              ),
            );
          } catch (err: any) {
            console.error("Upload error for file:", fileToUpload.name, err);
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === queueItem.id
                  ? {
                      ...item,
                      status: "error",
                      error: err?.response?.data?.error?.message || err?.message || "Upload failed",
                    }
                  : item,
              ),
            );
          }
        }
      };

      const workers = Array.from(
        { length: Math.min(CONCURRENCY, validFiles.length) },
        () => worker(),
      );

      await Promise.all(workers);
      setIsUploading(false);

      // Refresh storage data
      await fetchStructure();
      toast.success("Upload batch completed");
    },
    [currentPath, fetchStructure],
  );

  const clearUploadQueue = useCallback(() => {
    setUploadQueue([]);
  }, []);

  // Create Folder
  const createFolder = useCallback(
    async (name: string) => {
      const cleanName = name.trim();
      if (!cleanName) return;

      setIsCreatingFolder(true);
      try {
        const targetPath = `${currentPath}/${cleanName}`;
        await createCloudinaryFolderAction(targetPath);
        await fetchStructure();
      } catch (err: any) {
        console.error("Create folder error:", err);
        toast.danger(err?.message || "Failed to create folder");
        throw err;
      } finally {
        setIsCreatingFolder(false);
      }
    },
    [currentPath, fetchStructure],
  );

  const handleCloseFolderModal = useCallback(() => {
    if (isCreatingFolder || isSubmittingFolder) return;
    setCreateFolderOpen(false);
    setFolderName("");
  }, [isCreatingFolder, isSubmittingFolder]);

  const handleCreateFolder = useCallback(async () => {
    const nextName = folderName.trim();
    if (!nextName || isSubmittingFolder) return;

    setIsSubmittingFolder(true);
    try {
      await createFolder(nextName);
      handleCloseFolderModal();
    } catch {
      // keep open
    } finally {
      setIsSubmittingFolder(false);
    }
  }, [folderName, isSubmittingFolder, createFolder, handleCloseFolderModal]);

  // Delete items
  const deletePaths = useCallback(
    async (pathsToDelete: string[]) => {
      if (!pathsToDelete.length) return;

      setIsDeleting(true);
      try {
        for (const p of pathsToDelete) {
          const item = items.find((i) => i.path === p);
          if (item?.kind === "folder") {
            await deleteCloudinaryFolderAction(p);
          } else {
            await deleteCloudinaryFileAction(
              p,
              item ? storageClient.getFileResourceType(item) : undefined,
            );
          }
        }

        setSelectedPaths(new Set());
        await fetchStructure();
        toast.success(
          pathsToDelete.length === 1
            ? "Item deleted successfully"
            : `${pathsToDelete.length} items deleted successfully`,
        );
      } catch (err: any) {
        console.error("Delete items error:", err);
        toast.danger(err?.message || "Failed to delete item(s)");
      } finally {
        setIsDeleting(false);
      }
    },
    [items, fetchStructure],
  );

  const deleteSelected = useCallback(async () => {
    const count = selectedPaths.size;
    if (count === 0) return;

    const paths = Array.from(selectedPaths);
    confirm({
      title: `Delete ${count} item${count > 1 ? "s" : ""}?`,
      description: `Are you sure you want to permanently delete ${count} selected item${
        count > 1 ? "s" : ""
      } from Cloudinary? This action cannot be undone.`,
      isDanger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        await deletePaths(paths);
      },
    });
  }, [selectedPaths, confirm, deletePaths]);

  // Preview Drawer
  const openPreview = useCallback(
    (item: ContentItem) => {
      const mediaList = items.filter((it) => storageClient.isMediaItem(it));
      const idx = mediaList.findIndex((m) => m.path === item.path);
      setMediaViewerIndex(idx >= 0 ? idx : 0);
      setMediaViewerOpen(true);
    },
    [items],
  );

  const closePreview = useCallback(() => {
    setMediaViewerOpen(false);
  }, []);

  const value: ContentContextType = {
    currentPath,
    rootPath: ROOT_PATH,
    parentPath,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    selectedPaths,
    toggleSelect,
    selectAllVisible,
    clearSelection,
    expandedPaths,
    toggleExpandPath,
    loadingTreePaths,
    folderTree,
    items,
    allCurrentItems,
    isFetching,
    isUploading,
    isCreatingFolder,
    isDeleting,
    isSubmittingFolder,
    uploadQueue,
    clearUploadQueue,
    uploadFiles,
    createFolder,
    deletePaths,
    deleteSelected,
    goToPath,
    goUp,
    reloadCurrent: fetchStructure,
    openFolder,
    isCreateFolderOpen,
    setCreateFolderOpen,
    folderName,
    setFolderName,
    handleCloseFolderModal,
    handleCreateFolder,
    isMediaViewerOpen,
    mediaViewerIndex,
    openPreview,
    closePreview,
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}
