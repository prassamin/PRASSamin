const VOID_HTML_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const INLINE_HTML_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "cite",
  "code",
  "data",
  "del",
  "dfn",
  "em",
  "i",
  "ins",
  "kbd",
  "mark",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
]);

/**
 * Finds the end index of an opening or closing HTML/JSX tag starting at `startIndex` (`<...>`),
 * safely skipping `>` characters inside quoted attribute strings (`"..."`, `'...'`, `` `...` ``)
 * or JSX brace expressions (`{...}`).
 */
function findTagCloseBracket(str: string, startIndex: number): number {
  let inQuote: string | null = null;
  let braceDepth = 0;

  for (let i = startIndex + 1; i < str.length; i++) {
    const ch = str[i];
    const prev = str[i - 1];

    if (inQuote) {
      if (ch === inQuote && prev !== "\\") {
        inQuote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inQuote = ch;
      continue;
    }

    if (ch === "{") {
      braceDepth++;
      continue;
    }

    if (ch === "}") {
      if (braceDepth > 0) braceDepth--;
      continue;
    }

    if (ch === ">" && braceDepth === 0) {
      return i;
    }
  }

  return -1;
}

/**
 * Extracts a complete balanced top-level HTML or JSX element starting at the beginning
 * of `source` (including any nested child tags of the same or different name, and blank lines).
 *
 * Returns `null` if `source` starts with an inline formatting tag (like `<strong>`, `<em>`, `<a>`, `<span>`, `<kbd>`)
 * that is part of a larger paragraph sentence rather than a standalone block element.
 */
function extractBalancedHtmlOrJsxBlock(source: string): string | null {
  if (!source.startsWith("<")) return null;

  // HTML comments <!-- ... -->
  if (source.startsWith("<!--")) {
    const commentEnd = source.indexOf("-->");
    if (commentEnd !== -1) {
      return source.slice(0, commentEnd + 3);
    }
    return null;
  }

  // Match opening tag name: <TagName or <tag-name
  const openTagMatch = source.match(/^<([a-zA-Z][a-zA-Z0-9._-]*)(?=[\s/>])/);
  if (!openTagMatch) return null;

  const rootTagName = openTagMatch[1];
  const lowerRoot = rootTagName.toLowerCase();
  const isCustomComponent = /^[A-Z]/.test(rootTagName);

  const firstCloseIdx = findTagCloseBracket(source, 0);
  if (firstCloseIdx === -1) return null;

  const firstTagRaw = source.slice(0, firstCloseIdx + 1);
  const isSelfClosing =
    /\/\s*>$/.test(firstTagRaw) || VOID_HTML_TAGS.has(lowerRoot);

  if (isSelfClosing) {
    // If it's an inline HTML tag (e.g. <img> followed by text on the same line), only extract
    // as a standalone block if it sits on its own line (or followed by a caption / newline).
    if (!isCustomComponent && INLINE_HTML_TAGS.has(lowerRoot)) {
      const after = source.slice(firstCloseIdx + 1);
      if (after.length > 0 && !/^\s*(?:\r?\n|$)/.test(after)) {
        return null;
      }
    }
    // Check if an <img /> or <ImageZoom /> has an immediate italic markdown caption line `*\n*caption*`
    if (lowerRoot === "img" || lowerRoot === "imagezoom") {
      const after = source.slice(firstCloseIdx + 1);
      const captionMatch = after.match(/^(?:\r?\n)+\*([^\n*]+)\*(?=\r?\n|$)/);
      if (captionMatch) {
        return source.slice(0, firstCloseIdx + 1 + captionMatch[0].length);
      }
    }
    return firstTagRaw;
  }

  // Scan forward for the matching closing `</rootTagName>` while tracking nesting depth
  // of identical tag names (ignoring tags inside code fences).
  let depth = 1;
  let idx = firstCloseIdx + 1;
  let inCodeFence = false;

  while (idx < source.length) {
    // Check for markdown code fence toggle
    if (source.startsWith("```", idx)) {
      inCodeFence = !inCodeFence;
      idx += 3;
      continue;
    }

    if (inCodeFence) {
      idx++;
      continue;
    }

    const nextLt = source.indexOf("<", idx);
    if (nextLt === -1) break;

    if (source.startsWith("<!--", nextLt)) {
      const cEnd = source.indexOf("-->", nextLt + 4);
      idx = cEnd !== -1 ? cEnd + 3 : source.length;
      continue;
    }

    const tagMatch = source
      .slice(nextLt)
      .match(/^<(\/?)([a-zA-Z][a-zA-Z0-9._-]*)(?=[\s/>])/);
    if (!tagMatch) {
      idx = nextLt + 1;
      continue;
    }

    const isClosing = tagMatch[1] === "/";
    const tagName = tagMatch[2];
    const closeBracket = findTagCloseBracket(source, nextLt);
    if (closeBracket === -1) break;

    const fullTag = source.slice(nextLt, closeBracket + 1);
    const selfCloses =
      !isClosing &&
      (/\/\s*>$/.test(fullTag) || VOID_HTML_TAGS.has(tagName.toLowerCase()));

    const isSameTag = isCustomComponent
      ? tagName === rootTagName
      : tagName.toLowerCase() === lowerRoot;

    if (isSameTag && !selfCloses) {
      if (isClosing) {
        depth--;
        if (depth === 0) {
          const endPos = closeBracket + 1;
          // If this is an inline HTML tag (e.g. `<strong>Hello</strong> world`),
          // check if there is trailing text in the same paragraph before `\n\n`.
          if (!isCustomComponent && INLINE_HTML_TAGS.has(lowerRoot)) {
            const after = source.slice(endPos);
            if (after.length > 0 && !/^\s*(?:\r?\n\s*\r?\n|$)/.test(after)) {
              return null;
            }
          }
          return source.slice(0, endPos);
        }
      } else {
        depth++;
      }
    }

    idx = closeBracket + 1;
  }

  return null;
}

export function splitMdxIntoBlocks(mdx: string): string[] {
  const blocks: string[] = [];
  let remaining = mdx.trim();

  while (remaining.length > 0) {
    // 1. Code blocks (```...```) - support leading whitespace/indentation
    const codeMatch = remaining.match(/^[ \t]*```[\s\S]*?\r?\n[ \t]*```/);
    if (codeMatch) {
      blocks.push(codeMatch[0]);
      remaining = remaining.slice(codeMatch[0].length).trim();
      continue;
    }

    // 2. Markdown Table block (| Header | Header |\n| --- | --- |\n...)
    const tableMatch = remaining.match(
      /^(?:\|[^\n]+\|\r?\n\|(?:\s*:?-+:?\s*\|)+(?:\r?\n\|[^\n]*\|)*)/,
    );
    if (tableMatch) {
      blocks.push(tableMatch[0].trim());
      remaining = remaining.slice(tableMatch[0].length).trim();
      continue;
    }

    // 3. Markdown Blockquote (> ...)
    const quoteMatch = remaining.match(/^(?:>[^\n]*\n?)+/);
    if (quoteMatch) {
      blocks.push(quoteMatch[0].trim());
      remaining = remaining.slice(quoteMatch[0].length).trim();
      continue;
    }

    // 4. Markdown List (- ..., * ..., + ..., 1. ..., - [ ] ...)
    const listMatch = remaining.match(
      /^(?:[ \t]*(?:[-*+](?![ \t]*[-*+])[ \t]+|\d+\.[ \t]+)[^\n]*(?:\r?\n|$))+/,
    );
    if (listMatch) {
      blocks.push(listMatch[0].trim());
      remaining = remaining.slice(listMatch[0].length).trim();
      continue;
    }

    // 5. Any Balanced HTML or JSX Block Element (<figure>, <details>, <video>, <Template>, <Tabs>, <div...>, <br />, <hr />, etc.)
    // Preserves multi-line HTML/JSX blocks even when they contain blank lines (\n\n) inside!
    if (remaining.startsWith("<")) {
      const balancedBlock = extractBalancedHtmlOrJsxBlock(remaining);
      if (balancedBlock) {
        blocks.push(balancedBlock.trim());
        remaining = remaining.slice(balancedBlock.length).trim();
        continue;
      }
    }

    // 6. Regular markdown (paragraphs, headings, dividers, etc.) up to the next blank line or block boundary
    const nextCode = remaining.search(/\n\n[ \t]*```/);
    const nextHtmlOrJsxBlock = remaining.search(
      /\n\n[ \t]*<(?:[A-Z][a-zA-Z0-9._-]*|figure|details|table|ul|ol|blockquote|pre|div|section|article|aside|header|footer|nav|main|video|audio|iframe|canvas|svg|form|fieldset|dl|h[1-6]|p|hr|br|img)\b/i,
    );
    const nextTable = remaining.search(
      /\n\n\|[^\n]+\|\r?\n\|(?:\s*:?-+:?\s*\|)+/,
    );
    const nextQuote = remaining.search(/\n\n>/);
    const nextList = remaining.search(
      /\n\n[ \t]*(?:[-*+](?![ \t]*[-*+])[ \t]+|\d+\.[ \t]+)/,
    );
    const nextDoubleNewline = remaining.indexOf("\n\n");

    const splitCandidates = [
      nextCode,
      nextHtmlOrJsxBlock,
      nextTable,
      nextQuote,
      nextList,
      nextDoubleNewline,
    ].filter((pos) => pos !== -1);

    if (splitCandidates.length > 0) {
      const splitAt = Math.min(...splitCandidates);
      const chunk = remaining.slice(0, splitAt).trim();
      if (chunk) blocks.push(chunk);
      remaining = remaining.slice(splitAt).trim();
    } else {
      if (remaining.trim()) blocks.push(remaining.trim());
      remaining = "";
    }
  }

  return blocks;
}
