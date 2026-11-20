"use client";

import React from "react";
import { create } from "zustand";
import { stringify } from "yaml";
import { toast } from "@heroui/react";
import { OpenStudioOptions, MdxStudioContextValue, StudioTab } from "../types";
import { MdxBlockType } from "../builder/types";

function computeFrontmatter(
  customFrontmatter: string | null,
  includeMetadata: boolean,
  metadata: Record<string, any>,
  getMetadata: (() => Record<string, any>) | null,
): string {
  if (customFrontmatter !== null) return customFrontmatter;
  if (!includeMetadata) return "";
  const meta =
    Object.keys(metadata).length > 0
      ? metadata
      : getMetadata
        ? getMetadata()
        : {};
  if (!meta || Object.keys(meta).length === 0) return "";
  return `---\n${stringify(meta, { lineWidth: 80 })}---`;
}

let currentInsertBlockListener:
  | ((type: MdxBlockType, props?: Record<string, any>) => void)
  | null = null;

export interface MdxStudioStoreState extends MdxStudioContextValue {
  informationSlot:
    | React.ReactNode
    | ((controller: MdxStudioContextValue) => React.ReactNode)
    | null;
  includeMetadata: boolean;
  onSaveCallback: ((mdx: string) => Promise<void> | void) | null;
  onCloseCallback: (() => void) | null;
  getMetadataCallback: (() => Record<string, any>) | null;
  onMetadataChangeCallback: ((metadata: Record<string, any>) => void) | null;
  registerInsertBlockListener: (
    fn: ((type: MdxBlockType, props?: Record<string, any>) => void) | null,
  ) => void;
}

export const useMdxStudioStore = create<MdxStudioStoreState>((set, get) => ({
  isOpen: false,
  title: "MDX Studio",
  documentName: undefined,
  activeTab: "builder",
  hasInformationTab: false,
  informationSlot: null,
  saveButton: null,
  mdx: "",
  isSaving: false,
  frontmatter: "",
  customFrontmatter: null as unknown as any,
  metadata: {},
  includeMetadata: false,
  onSaveCallback: null,
  onCloseCallback: null,
  getMetadataCallback: null,
  onMetadataChangeCallback: null,

  setMdx: (mdx: string) => {
    if (get().mdx === mdx) return;
    set({ mdx });
  },

  goToTab: (tab: StudioTab) => {
    set({ activeTab: tab });
  },

  setFrontmatter: (fm: string) => {
    set({
      frontmatter: fm,
    });
  },

  setCustomFrontmatter: (fm: string | null) => {
    const state = get();
    set({
      frontmatter: computeFrontmatter(
        fm,
        state.includeMetadata,
        state.metadata,
        state.getMetadataCallback,
      ),
    });
  },

  setMetadata: (
    metaOrUpdater:
      | Record<string, any>
      | ((prev: Record<string, any>) => Record<string, any>),
  ) => {
    const state = get();
    const nextMeta =
      typeof metaOrUpdater === "function"
        ? metaOrUpdater(state.metadata)
        : metaOrUpdater;
    set({
      metadata: nextMeta,
      frontmatter: computeFrontmatter(
        null,
        state.includeMetadata,
        nextMeta,
        state.getMetadataCallback,
      ),
    });
  },

  onMetadataChange: (meta: Record<string, any>) => {
    const state = get();
    set({
      metadata: meta,
      frontmatter: computeFrontmatter(
        null,
        state.includeMetadata,
        meta,
        state.getMetadataCallback,
      ),
    });
    state.onMetadataChangeCallback?.(meta);
  },

  registerInsertBlockListener: (fn) => {
    currentInsertBlockListener = fn;
  },

  insertBlock: (type: MdxBlockType, props?: Record<string, any>) => {
    currentInsertBlockListener?.(type, props);
  },

  openStudio: (options: OpenStudioOptions) => {
    const initialMeta =
      options.initialMetadata ??
      (options.getMetadata ? options.getMetadata() : {});
    const includeMeta = Boolean(options.includeMetadata);
    const getMeta = options.getMetadata || null;
    const fm = computeFrontmatter(null, includeMeta, initialMeta, getMeta);

    set({
      isOpen: true,
      title: options.title || "MDX Studio",
      documentName: options.documentName,
      mdx: options.initialMdx || "",
      metadata: initialMeta,
      includeMetadata: includeMeta,
      frontmatter: fm,
      informationSlot: options.informationSlot ?? null,
      hasInformationTab: Boolean(options.informationSlot),
      saveButton:
        typeof options.saveButton === "function" || options.saveButton
          ? options.saveButton
          : null,
      onSaveCallback: options.onSave,
      onCloseCallback: options.onClose || null,
      getMetadataCallback: getMeta,
      onMetadataChangeCallback: options.onMetadataChange || null,
      isSaving: false,
      activeTab: options.informationSlot ? "details" : "builder",
    });
  },

  closeStudio: () => {
    const onClose = get().onCloseCallback;
    set({
      isOpen: false,
      informationSlot: null,
      hasInformationTab: false,
      saveButton: null,
      onSaveCallback: null,
      onCloseCallback: null,
      includeMetadata: false,
      getMetadataCallback: null,
      onMetadataChangeCallback: null,
      frontmatter: "",
      metadata: {},
    });
    currentInsertBlockListener = null;
    onClose?.();
  },

  save: async () => {
    const state = get();
    if (!state.onSaveCallback) return;
    set({ isSaving: true });
    try {
      let compiled = state.mdx;
      const hasFm = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(compiled);
      if (!hasFm && state.frontmatter) {
        compiled = `${state.frontmatter}\n\n${compiled}`;
      }
      await state.onSaveCallback(compiled);
      get().closeStudio();
    } catch (err: any) {
      console.error("Studio save error:", err);
      toast.danger(err.message || "Failed to save content");
    } finally {
      set({ isSaving: false });
    }
  },
}));
