"use client";

import { create } from "zustand";
import { MdxBlock, TemplateDefinitionInfo } from "../types";
import { extractTemplateVariables } from "../compiler";
import { setFieldValue } from "../components/inline-tooltip-utils";
import {
  ExistingIconInfo,
  IconInsertionTarget,
  findOverlappingIcon,
} from "../components/icon-picker-context";
import {
  UserMentionData,
  buildUserMentionTag,
  findUserMentionAt,
} from "../components/user-mention-utils";
import { InlineTooltipTarget } from "../components/inline-tooltip-context";
import { UserMentionTarget } from "../components/user-mention-context";

export interface OpenUserMentionOptions {
  start?: number;
  end?: number;
  prefillName?: string;
}

interface BuilderUiStoreState {
  // Active canvas block
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;

  // Templates slice (stabilized by signature so typing in normal blocks never triggers re-renders)
  availableTemplates: TemplateDefinitionInfo[];
  duplicateTemplateIds: Set<string>;
  templateSignature: string;
  syncTemplatesFromBlocks: (blocks: MdxBlock[]) => void;

  // Inline Tooltip slice
  inlineTooltipTarget: InlineTooltipTarget | null;
  openInlineTooltip: (
    element: HTMLInputElement | HTMLTextAreaElement,
    word: string,
    start: number,
    end: number,
  ) => void;
  closeInlineTooltip: () => void;

  // Icon Picker slice
  isIconPickerOpen: boolean;
  iconPickerTarget: IconInsertionTarget | null;
  openIconPicker: (element?: HTMLInputElement | HTMLTextAreaElement) => void;
  closeIconPicker: () => void;
  insertIcon: (iconTag: string) => void;

  // User Mention slice
  isUserMentionOpen: boolean;
  userMentionTarget: UserMentionTarget | null;
  openMentionPicker: (
    element?: HTMLInputElement | HTMLTextAreaElement | null,
    options?: OpenUserMentionOptions,
  ) => void;
  closeMentionPicker: () => void;
  insertMention: (data: UserMentionData) => void;
}

const EMPTY_TEMPLATES: TemplateDefinitionInfo[] = [];
const EMPTY_DUPES = new Set<string>();

export const useBuilderUiStore = create<BuilderUiStoreState>((set, get) => ({
  activeBlockId: null,
  setActiveBlockId: (id) => {
    if (get().activeBlockId === id) return;
    set({ activeBlockId: id });
  },

  availableTemplates: EMPTY_TEMPLATES,
  duplicateTemplateIds: EMPTY_DUPES,
  templateSignature: "",
  syncTemplatesFromBlocks: (blocks: MdxBlock[]) => {
    const result: TemplateDefinitionInfo[] = [];
    const dupes = new Set<string>();
    const seen = new Set<string>();

    for (const b of blocks) {
      if (b.type === "template") {
        const name = String(b.props?.name || "").trim();
        if (!name) continue;
        if (seen.has(name)) {
          dupes.add(b.id);
          continue;
        }
        seen.add(name);
        const nested: MdxBlock[] = Array.isArray(b.props?.blocks)
          ? b.props.blocks
          : [];
        result.push({
          id: b.id,
          name,
          variables: extractTemplateVariables(nested),
          blockCount: nested.length,
        });
      }
    }

    const sig = `${result
      .map(
        (t) =>
          `${t.id}:${t.name}:${t.blockCount}:${t.variables.join(",")}`,
      )
      .join("|")}#${Array.from(dupes).join(",")}`;

    if (sig === get().templateSignature) return;

    set({
      availableTemplates: result.length > 0 ? result : EMPTY_TEMPLATES,
      duplicateTemplateIds: dupes.size > 0 ? dupes : EMPTY_DUPES,
      templateSignature: sig,
    });
  },

  // Inline Tooltip
  inlineTooltipTarget: null,
  openInlineTooltip: (element, word, start, end) =>
    set({ inlineTooltipTarget: { element, word, start, end } }),
  closeInlineTooltip: () => {
    if (!get().inlineTooltipTarget) return;
    set({ inlineTooltipTarget: null });
  },

  // Icon Picker
  isIconPickerOpen: false,
  iconPickerTarget: null,
  openIconPicker: (element) => {
    let active = element;
    if (!active && typeof document !== "undefined") {
      const docActive = document.activeElement;
      if (
        docActive instanceof HTMLInputElement ||
        docActive instanceof HTMLTextAreaElement
      ) {
        active = docActive;
      }
    }

    let nextTarget: IconInsertionTarget | null = null;
    if (active) {
      const start = active.selectionStart ?? active.value.length;
      const end = active.selectionEnd ?? active.value.length;
      const existing: ExistingIconInfo | null = findOverlappingIcon(
        active.value || "",
        start,
        end,
      );
      if (existing) {
        nextTarget = {
          element: active,
          start: existing.start,
          end: existing.end,
          existingIcon: existing,
        };
      } else {
        nextTarget = { element: active, start, end, existingIcon: null };
      }
    }

    set({ isIconPickerOpen: true, iconPickerTarget: nextTarget });
  },
  closeIconPicker: () =>
    set({ isIconPickerOpen: false, iconPickerTarget: null }),
  insertIcon: (iconTag: string) => {
    const target = get().iconPickerTarget;
    if (!target?.element) {
      get().closeIconPicker();
      return;
    }

    const el = target.element;
    const currentValue = el.value || "";
    const existing =
      target.existingIcon ||
      findOverlappingIcon(currentValue, target.start, target.end);

    const replaceStart = existing ? existing.start : target.start;
    const replaceEnd = existing ? existing.end : target.end;

    const before = currentValue.slice(0, replaceStart);
    const after = currentValue.slice(replaceEnd);

    const needsLeadingSpace = before.length > 0 && !/\s$/.test(before);
    const needsTrailingSpace = after.length > 0 && !/^\s/.test(after);

    const insertion = `${needsLeadingSpace ? " " : ""}${iconTag}${needsTrailingSpace ? " " : ""}`;
    const nextValue = `${before}${insertion}${after}`;

    setFieldValue(el, nextValue);

    const newCursorPos =
      before.length +
      (needsLeadingSpace ? 1 : 0) +
      iconTag.length +
      (needsTrailingSpace ? 1 : 0);
    requestAnimationFrame(() => {
      try {
        el.focus();
        el.setSelectionRange(newCursorPos, newCursorPos);
      } catch {}
    });

    get().closeIconPicker();
  },

  // User Mention
  isUserMentionOpen: false,
  userMentionTarget: null,
  openMentionPicker: (element, options) => {
    let el = element ?? null;
    if (!el && typeof document !== "undefined") {
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
      ) {
        el = active;
      }
    }
    if (!el) return;

    const value = el.value || "";
    const start = options?.start ?? el.selectionStart ?? value.length;
    const end = options?.end ?? el.selectionEnd ?? value.length;

    const existing = findUserMentionAt(value, start, end);
    if (existing) {
      const { start: s, end: e, ...data } = existing;
      set({
        isUserMentionOpen: true,
        userMentionTarget: {
          element: el,
          start: s,
          end: e,
          initial: data,
          isEditing: true,
        },
      });
    } else {
      set({
        isUserMentionOpen: true,
        userMentionTarget: {
          element: el,
          start,
          end,
          initial: options?.prefillName
            ? { name: options.prefillName.trim() }
            : null,
          isEditing: false,
        },
      });
    }
  },
  closeMentionPicker: () =>
    set({ isUserMentionOpen: false, userMentionTarget: null }),
  insertMention: (data: UserMentionData) => {
    const target = get().userMentionTarget;
    if (!target?.element || !data.name.trim()) {
      get().closeMentionPicker();
      return;
    }
    const el = target.element;
    const value = el.value || "";
    const before = value.slice(0, target.start);
    const after = value.slice(target.end);
    const tag = buildUserMentionTag(data);

    const lead = before.length > 0 && !/\s$/.test(before) ? " " : "";
    const trail = after.length === 0 || !/^\s/.test(after) ? " " : "";
    const insertion = `${lead}${tag}${trail}`;
    setFieldValue(el, `${before}${insertion}${after}`);

    const caret = before.length + insertion.length;
    requestAnimationFrame(() => {
      try {
        el.focus();
        el.setSelectionRange(caret, caret);
      } catch {}
    });
    get().closeMentionPicker();
  },
}));
