import { rangesOverlap } from "../inline-tooltip-utils";
import { ToolbarCapabilities } from "./selection-coords";

/**
 * Detects if the current selection range [start, end) touches, contains,
 * or is situated inside any tag (e.g. <Tag>, </Tag>, <LuIcon ... />, <span ...>, <InlineTooltip ...>).
 * Selecting tags or text inside tags should never display the formatting toolbar.
 */
export function selectionOverlapsTag(
  value: string,
  start: number,
  end: number,
): boolean {
  if (start >= end) return false;

  const selectedText = value.substring(start, end);
  if (selectedText.includes("<") || selectedText.includes(">")) {
    return true;
  }

  const before = value.substring(0, start);
  const lastOpen = before.lastIndexOf("<");
  const lastClose = before.lastIndexOf(">");
  if (lastOpen > lastClose) {
    const nextClose = value.indexOf(">", start);
    if (nextClose !== -1) {
      return true;
    }
  }

  const TAG_REGEX = /<(?:\/?[a-zA-Z][^>]*?)>/g;
  let match: RegExpExecArray | null;
  while ((match = TAG_REGEX.exec(value)) !== null) {
    const tagStart = match.index;
    const tagEnd = match.index + match[0].length;
    if (rangesOverlap(tagStart, tagEnd, start, end)) {
      return true;
    }
  }

  return false;
}

export function getCapabilities(
  el: HTMLInputElement | HTMLTextAreaElement,
): ToolbarCapabilities | null {
  if (el.type === "url" || el.type === "number" || el.type === "search") {
    return null;
  }

  const formatRole = el.getAttribute("data-format-role");
  if (formatRole === "plain") return null;

  if (
    el.closest("[data-inline-tooltip-block]") ||
    el.closest("[data-inline-tooltip]") ||
    el.hasAttribute("data-inline-tooltip-input") ||
    el.getAttribute("data-inline-tooltip") === "true"
  ) {
    return null;
  }

  const blockCard = el.closest("[data-block-type]");
  const blockType = blockCard?.getAttribute("data-block-type") || "paragraph";

  if (
    blockType === "code" ||
    blockType === "divider" ||
    blockType === "chipGroup" ||
    blockType === "avatar" ||
    blockType === "profile"
  ) {
    return null;
  }

  if (
    blockType === "tabs" ||
    el.getAttribute("data-tab-label") === "true" ||
    el.placeholder?.toLowerCase().includes("tab title") ||
    el.placeholder?.toLowerCase().includes("package-manager")
  ) {
    return null;
  }

  if (blockType === "heading" || formatRole === "heading") {
    return {
      bold: false,
      italic: true,
      strike: false,
      code: true,
      fontSize: false,
      link: false,
      accent: true,
      tooltip: true,
      userMention: true,
      clear: true,
    };
  }

  if (blockType === "table") {
    return {
      bold: true,
      italic: true,
      strike: true,
      code: true,
      fontSize: false,
      link: true,
      accent: true,
      tooltip: false,
      userMention: false,
      clear: true,
    };
  }

  if (el.tagName === "INPUT" || formatRole === "title") {
    if (
      formatRole === "caption" ||
      el.placeholder?.toLowerCase().includes("caption")
    ) {
      return {
        bold: false,
        italic: true,
        strike: false,
        code: true,
        fontSize: false,
        link: true,
        accent: false,
        tooltip: false,
        userMention: false,
        clear: true,
      };
    }

    return {
      bold: true,
      italic: true,
      strike: false,
      code: true,
      fontSize: false,
      link: false,
      accent: true,
      tooltip: false,
      userMention: false,
      clear: true,
    };
  }

  if (blockType === "callout") {
    return {
      bold: true,
      italic: true,
      strike: true,
      code: true,
      fontSize: false,
      link: true,
      accent: true,
      tooltip: true,
      userMention: true,
      clear: true,
    };
  }

  return {
    bold: true,
    italic: true,
    strike: true,
    code: true,
    fontSize: true,
    link: true,
    accent: true,
    tooltip: true,
    userMention: true,
    clear: true,
  };
}
