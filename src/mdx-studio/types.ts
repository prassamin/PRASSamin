import React from "react";
import { MdxBlockType } from "./builder/types";

export type StudioTab = "details" | "builder";

export interface OpenStudioOptions {
  title: string;
  documentName?: string;
  initialMdx?: string;
  /**
   * Optional custom component slot for the "Information" tab.
   * If omitted, the studio skips the Information tab and directly shows the MDX builder.
   */
  informationSlot?:
    | React.ReactNode
    | ((controller: MdxStudioContextValue) => React.ReactNode);
  /**
   * Optional custom save button that replaces the default Save/Continue
   * button in the studio header. Pass a React node, or a function receiving
   * the studio controller (to access save(), isSaving, closeStudio, etc.).
   */
  saveButton?:
    | React.ReactNode
    | ((controller: MdxStudioContextValue) => React.ReactNode);
  /**
   * When true, on save the studio prepends a YAML frontmatter block built
   * from `getMetadata()` to the MDX body:
   *
   *   ---
   *   <metadata>
   *   ---
   *
   *   <body>
   *
   * When false (default) the body is saved as-is.
   */
  includeMetadata?: boolean;
  /**
   * Function returning the metadata object to serialize into frontmatter.
   * Called at save time when `includeMetadata` is true (so the latest form
   * state is always used).
   */
  getMetadata?: () => Record<string, any>;
  /**
   * Called when user saves from the studio header or via controller.save().
   * Receives the compiled MDX string.
   */
  onSave: (compiledMdx: string) => Promise<void> | void;
  onClose?: () => void;
}

export interface MdxStudioContextValue {
  isOpen: boolean;
  title: string;
  documentName?: string;
  activeTab: StudioTab;
  goToTab: (tab: StudioTab) => void;
  hasInformationTab: boolean;
  mdx: string;
  setMdx: (mdx: string) => void;
  insertBlock: (type: MdxBlockType, props?: Record<string, any>) => void;
  isSaving: boolean;
  save: () => Promise<void>;
  closeStudio: () => void;
  openStudio: (options: OpenStudioOptions) => void;
  /** Custom save button slot (node or controller function) or null for default. */
  saveButton: React.ReactNode | ((controller: MdxStudioContextValue) => React.ReactNode) | null;
  /**
   * Pre-serialized YAML frontmatter block (`---…---`) reflecting the current
   * metadata when `includeMetadata` is enabled. Empty string otherwise.
   */
  frontmatter: string;
}

export interface MdxStudioModalProps {
  informationSlot?:
    | React.ReactNode
    | ((controller: MdxStudioContextValue) => React.ReactNode)
    | null;
  insertBlockListenerRef?: React.MutableRefObject<
    ((type: MdxBlockType, props?: Record<string, any>) => void) | null
  >;
}
