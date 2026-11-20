export interface ToolbarCapabilities {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  code: boolean;
  fontSize: boolean;
  link: boolean;
  accent: boolean;
  tooltip: boolean;
  userMention: boolean;
  clear: boolean;
}

export interface SelectionPosition {
  x: number;
  y: number;
  placement: "top" | "bottom";
  element: HTMLInputElement | HTMLTextAreaElement;
  capabilities: ToolbarCapabilities;
}

/**
 * Calculates the exact pixel bounding box of the active text selection
 * inside an <input> or <textarea>, and determines whether the toolbar should
 * sit above or below the selected text line so it never covers the text.
 */
export function getSelectionCoordinates(
  el: HTMLInputElement | HTMLTextAreaElement,
): {
  x: number;
  y: number;
  placement: "top" | "bottom";
} {
  const elRect = el.getBoundingClientRect();
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;

  let spanTop = elRect.top;
  let spanHeight = 24;
  let spanCenterX = elRect.left + elRect.width / 2;

  try {
    const isInput = el instanceof HTMLInputElement;
    const computed = window.getComputedStyle(el);
    const mirror = document.createElement("div");

    mirror.style.position = "fixed";
    mirror.style.top = "-9999px";
    mirror.style.left = "-9999px";
    mirror.style.visibility = "hidden";
    mirror.style.pointerEvents = "none";
    mirror.style.width = `${el.clientWidth}px`;
    mirror.style.boxSizing = computed.boxSizing;
    mirror.style.fontFamily = computed.fontFamily;
    mirror.style.fontSize = computed.fontSize;
    mirror.style.fontWeight = computed.fontWeight;
    mirror.style.fontStyle = computed.fontStyle;
    mirror.style.letterSpacing = computed.letterSpacing;
    mirror.style.lineHeight = computed.lineHeight;
    mirror.style.textTransform = computed.textTransform;
    mirror.style.wordSpacing = computed.wordSpacing;
    mirror.style.textIndent = computed.textIndent;
    mirror.style.paddingTop = computed.paddingTop;
    mirror.style.paddingRight = computed.paddingRight;
    mirror.style.paddingBottom = computed.paddingBottom;
    mirror.style.paddingLeft = computed.paddingLeft;
    mirror.style.borderTopWidth = computed.borderTopWidth;
    mirror.style.borderRightWidth = computed.borderRightWidth;
    mirror.style.borderBottomWidth = computed.borderBottomWidth;
    mirror.style.borderLeftWidth = computed.borderLeftWidth;
    mirror.style.whiteSpace = isInput ? "pre" : "pre-wrap";
    mirror.style.wordBreak = isInput ? "normal" : "break-word";
    mirror.style.overflowWrap = isInput ? "normal" : "break-word";

    const value = el.value;
    const textBefore = document.createTextNode(value.substring(0, start));
    const span = document.createElement("span");
    span.textContent = value.substring(start, end) || " ";
    const textAfter = document.createTextNode(value.substring(end));

    mirror.appendChild(textBefore);
    mirror.appendChild(span);
    mirror.appendChild(textAfter);

    document.body.appendChild(mirror);

    const borderTop = parseFloat(computed.borderTopWidth) || 0;
    const borderLeft = parseFloat(computed.borderLeftWidth) || 0;

    const spanOffsetTop = span.offsetTop;
    const spanOffsetLeft = span.offsetLeft;
    const measuredWidth = span.offsetWidth;
    const measuredHeight = span.offsetHeight;

    document.body.removeChild(mirror);

    spanTop = elRect.top + borderTop + spanOffsetTop - el.scrollTop;
    spanHeight = measuredHeight > 0 ? measuredHeight : 24;
    const spanLeft = elRect.left + borderLeft + spanOffsetLeft - el.scrollLeft;
    spanCenterX = spanLeft + measuredWidth / 2;
  } catch {
    spanTop = elRect.top;
    spanHeight = 24;
    spanCenterX = elRect.left + elRect.width / 2;
  }

  const minX = 175;
  const maxX = window.innerWidth - 175;
  const x = Math.max(minX, Math.min(maxX, spanCenterX));

  const TOOLBAR_HEIGHT = 42;
  const GAP = 10;
  const spaceAbove = spanTop - (TOOLBAR_HEIGHT + GAP);

  if (spaceAbove >= 10) {
    return {
      x,
      y: spanTop - GAP,
      placement: "top",
    };
  }
  return {
    x,
    y: spanTop + spanHeight + GAP,
    placement: "bottom",
  };
}
