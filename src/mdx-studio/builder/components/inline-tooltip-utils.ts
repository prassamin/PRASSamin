/**
 * Shared pure helpers for inline tooltip markup handling.
 *
 * Used by BOTH the floating selection menu (wrap / unwrap decisions) and the
 * persistent inline tooltip editor field (parsing, live rewrites), so their
 * understanding of the markup can never drift apart.
 */

export interface TooltipOccurrence {
  start: number;
  end: number;
  /** decoded tooltip hover text (content attr) */
  content: string;
  /** the wrapped text (tag children) */
  inner: string;
}

/**
 * Attrs stop at the closing tag (tempered dot) so ">" inside the content
 * attribute is safe.
 */
export const TOOLTIP_TAG_REGEX =
  /<InlineTooltip\b((?:(?!<\/InlineTooltip\b)[\s\S])*)>([\s\S]*?)<\/InlineTooltip>/g;

export function parseInlineTooltips(source: string): TooltipOccurrence[] {
  return [...source.matchAll(TOOLTIP_TAG_REGEX)].map((m) => {
    const attrs = m[1] || "";
    const contentMatch = attrs.match(/content=("(?:[^"]*)"|'(?:[^']*)')/);
    const raw = contentMatch ? contentMatch[1] : '""';
    const start = m.index ?? 0;
    return {
      start,
      end: start + m[0].length,
      content: decodeTooltipAttr(raw.slice(1, -1)),
      inner: m[2] ?? "",
    };
  });
}

/** CRLF/CR normalized to LF - newlines themselves are KEPT (see encode) */
export function normalizeTooltipText(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

/**
 * Encodes a hover string for storage inside a JSX attribute string literal:
 * - `&` first, so the produced references are never re-escaped
 * - newlines -> &#10;: raw newlines are illegal in JSX attribute strings;
 *   numeric character references ARE decoded by the MDX/JSX compilers
 * - `"` -> &quot;
 */
export function escapeTooltipAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/\n/g, "&#10;")
    .replace(/"/g, "&quot;");
}

/** Inverse of escapeTooltipAttr. `&amp;` last so it is never double-decoded. */
export function decodeTooltipAttr(raw: string): string {
  return raw
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

/** Splits a raw selection into surrounding whitespace + core text */
export function splitWhitespace(raw: string): {
  lead: string;
  core: string;
  trail: string;
} {
  const leadLen = raw.length - raw.trimStart().length;
  const trailLen = raw.length - raw.trimEnd().length;
  return {
    lead: raw.slice(0, leadLen),
    core: raw.slice(leadLen, raw.length - trailLen),
    trail: raw.slice(raw.length - trailLen),
  };
}

export function buildTooltipTag(contentEsc: string, core: string): string {
  return `<InlineTooltip content="${contentEsc}">${core}</InlineTooltip>`;
}

/**
 * Unwraps every complete tooltip inside a string - leaves inner text only.
 * For selections that fully sit inside a single occurrence.
 */
export function stripInlineTooltips(s: string): string {
  return s.replace(TOOLTIP_TAG_REGEX, "$2");
}

/** True when [aStart, aEnd) partially overlaps [bStart, bEnd) */
export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Controlled-input write back that guarantees React synthetic onChange fires.
 * No focus steal - the field keeps the user's pointer/focus context.
 */
export function setFieldValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  newValue: string,
): void {
  const prototype =
    el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (setter) {
    setter.call(el, newValue);
  } else {
    el.value = newValue;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
