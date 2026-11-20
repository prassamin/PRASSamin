"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import { UserMentionData } from "./user-mention-utils";
import { useBuilderUiStore } from "../store/use-builder-ui-store";

export interface UserMentionTarget {
  element: HTMLInputElement | HTMLTextAreaElement;
  /** Range in the field value that the inserted tag replaces */
  start: number;
  end: number;
  /** Prefilled / existing data (editing an existing mention or selected text) */
  initial: UserMentionData | null;
  isEditing: boolean;
}

export const useUserMention = () =>
  useBuilderUiStore(
    useShallow((s) => ({
      isOpen: s.isUserMentionOpen,
      target: s.userMentionTarget,
      openMentionPicker: s.openMentionPicker,
      closeMentionPicker: s.closeMentionPicker,
      insertMention: s.insertMention,
    })),
  );

/** Action-only selector so text fields never re-render when the mention modal opens/closes */
export const useOpenUserMention = () =>
  useBuilderUiStore((s) => s.openMentionPicker);

export const UserMentionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
