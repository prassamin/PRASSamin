"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { stringify } from "yaml";
import { OpenStudioOptions, MdxStudioContextValue, StudioTab } from "./types";
import { MdxBlockType } from "./builder/types";
import { toast } from "@heroui/react";
import { MdxStudioModal } from "./mdx-studio";

const MdxStudioContext = createContext<MdxStudioContextValue | null>(null);

export const MdxStudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("MDX Studio");
  const [documentName, setDocumentName] = useState<string | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState<StudioTab>("builder");
  const [informationSlot, setInformationSlot] = useState<
    | React.ReactNode
    | ((controller: MdxStudioContextValue) => React.ReactNode)
    | null
  >(null);
  const [saveButton, setSaveButton] = useState<
    | React.ReactNode
    | ((controller: MdxStudioContextValue) => React.ReactNode)
    | null
  >(null);
  const [mdx, setMdx] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const onSaveRef = useRef<((mdx: string) => Promise<void> | void) | null>(
    null,
  );
  const onCloseRef = useRef<(() => void) | null>(null);
  const includeMetadataRef = useRef(false);
  const getMetadataRef = useRef<(() => Record<string, any>) | null>(null);
  const insertBlockListenerRef = useRef<
    ((type: MdxBlockType, props?: Record<string, any>) => void) | null
  >(null);

  const hasInformationTab = Boolean(informationSlot);

  // Pre-serialized frontmatter block when includeMetadata is enabled.
  const frontmatter = useMemo(() => {
    if (!includeMetadataRef.current || !getMetadataRef.current) return "";
    const meta = getMetadataRef.current();
    if (!meta || Object.keys(meta).length === 0) return "";
    return `---\n${stringify(meta, { lineWidth: 80 })}---`;
  }, [mdx, activeTab]);

  const openStudio = useCallback((options: OpenStudioOptions) => {
    setTitle(options.title || "MDX Studio");
    setDocumentName(options.documentName);
    setMdx(options.initialMdx || "");
    setInformationSlot(
      options.informationSlot ? () => options.informationSlot : null,
    );
    setSaveButton(
      typeof options.saveButton === "function" || options.saveButton
        ? options.saveButton
        : null,
    );
    onSaveRef.current = options.onSave;
    onCloseRef.current = options.onClose || null;
    includeMetadataRef.current = Boolean(options.includeMetadata);
    getMetadataRef.current = options.getMetadata || null;
    setIsSaving(false);
    // If informationSlot is provided, open to "details" first; otherwise directly to "builder"
    setActiveTab(options.informationSlot ? "details" : "builder");
    setIsOpen(true);
  }, []);

  const closeStudio = useCallback(() => {
    setIsOpen(false);
    onCloseRef.current?.();
    setInformationSlot(null);
    setSaveButton(null);
    onSaveRef.current = null;
    onCloseRef.current = null;
    includeMetadataRef.current = false;
    getMetadataRef.current = null;
    insertBlockListenerRef.current = null;
  }, []);

  const goToTab = useCallback((tab: StudioTab) => {
    setActiveTab(tab);
  }, []);

  const insertBlock = useCallback(
    (type: MdxBlockType, props?: Record<string, any>) => {
      if (insertBlockListenerRef.current) {
        insertBlockListenerRef.current(type, props);
      }
    },
    [],
  );

  const save = useCallback(async () => {
    if (!onSaveRef.current) return;
    setIsSaving(true);
    try {
      let compiled = mdx;

      // Optional: prepend YAML frontmatter from the info form metadata.
      if (frontmatter) {
        compiled = `${frontmatter}\n\n${mdx}`;
      }

      await onSaveRef.current(compiled);
      closeStudio();
    } catch (err: any) {
      console.error("Studio save error:", err);
      toast.danger(err.message || "Failed to save content");
    } finally {
      setIsSaving(false);
    }
  }, [mdx, frontmatter, closeStudio]);

  const value: MdxStudioContextValue = {
    isOpen,
    title,
    documentName,
    activeTab,
    goToTab,
    hasInformationTab,
    mdx,
    setMdx,
    insertBlock,
    isSaving,
    save,
    closeStudio,
    openStudio,
    saveButton,
    frontmatter,
  };

  return (
    <MdxStudioContext.Provider value={value}>
      {children}
      <MdxStudioModal
        informationSlot={informationSlot}
        insertBlockListenerRef={insertBlockListenerRef}
      />
    </MdxStudioContext.Provider>
  );
};

export const useMdxStudio = (): MdxStudioContextValue => {
  const context = useContext(MdxStudioContext);
  if (!context) {
    throw new Error("useMdxStudio must be used within an MdxStudioProvider");
  }
  return context;
};
