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
