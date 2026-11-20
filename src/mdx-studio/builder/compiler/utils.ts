import {
  MdxBlock,
  MdxBlockType,
  COMPONENT_TRAY_ITEMS,
  TypeTableProperty,
  FileTreeNode,
} from "../types";

export function slugify(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createBlock(
  type: MdxBlockType,
  initialProps?: Record<string, any>,
): MdxBlock {
  const item = COMPONENT_TRAY_ITEMS.find((c) => c.type === type);
  const defaultProps = item
    ? JSON.parse(JSON.stringify(item.defaultProps))
    : {};

  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    props: {
      ...defaultProps,
      ...initialProps,
    },
  };
}

export function serializeFileTree(nodes: FileTreeNode[], indent = 2): string {
  const spaces = " ".repeat(indent);
  const lines: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      const openAttr = node.defaultOpen ? " defaultOpen" : "";
      lines.push(
        `${spaces}<Folder name="${node.name || "folder"}"${openAttr}>`,
      );
      if (node.children && node.children.length > 0) {
        lines.push(serializeFileTree(node.children, indent + 2));
      }
      lines.push(`${spaces}</Folder>`);
    } else {
      lines.push(`${spaces}<File name="${node.name || "file.txt"}" />`);
    }
  }
  return lines.join("\n");
}

/**
 * Returns a template name that does not collide with any existing root-level
 * `<Template>` block. `base` → `base`, `base-2`, `base-3`, ...
 */
export function getUniqueTemplateName(
  blocks: MdxBlock[],
  base = "my-template",
): string {
  const taken = new Set(
    blocks
      .filter((b) => b.type === "template")
      .map((b) => String(b.props?.name || "").trim())
      .filter(Boolean),
  );
  const cleanBase =
    String(base || "my-template")
      .trim()
      .replace(/-\d+$/, "") || "my-template";
  if (!taken.has(cleanBase)) return cleanBase;
  let i = 2;
  while (taken.has(`${cleanBase}-${i}`)) i++;
  return `${cleanBase}-${i}`;
}

export function dedentCode(code: string): string {
  const lines = code.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return code;
  const minIndent = Math.min(
    ...nonEmpty.map((l) => l.match(/^[ \t]*/)?.[0].length || 0),
  );
  if (minIndent === 0) return code;
  return lines
    .map((l) => (l.trim().length === 0 ? "" : l.slice(minIndent)))
    .join("\n");
}

export function parseCardSnippet(rawCard: string): {
  title: string;
  badge: string;
  content: string;
} | null {
  // Compound syntax: <Card><Card.Header><Card.Title>...</Card.Title>...<Card.Content>...</Card.Content></Card>
  const compoundMatch = rawCard.match(
    /<Card[\s\S]*?>[\s\S]*?<Card\.Title>(.*?)<\/Card\.Title>(?:[\s\S]*?<Chip[^>]*>(.*?)<\/Chip>)?[\s\S]*?<Card\.Content>([\s\S]*?)<\/Card\.Content>[\s\S]*?<\/Card>/i,
  );
  if (compoundMatch) {
    return {
      title: compoundMatch[1]?.trim() || "",
      badge: compoundMatch[2]?.trim() || "",
      content: compoundMatch[3]?.trim() || "",
    };
  }

  // Self-closing prop syntax: <Card title="..." badge="..." description="..." />
  const selfClosingMatch = rawCard.match(/^<Card\b([^>]*?)\/>$/i);
  if (selfClosingMatch) {
    const attrs = selfClosingMatch[1] || "";
    const titleMatch = attrs.match(/title=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/);
    const badgeMatch = attrs.match(/badge=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/);
    const descMatch = attrs.match(/description=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/);
    return {
      title: (titleMatch ? titleMatch[1] || titleMatch[2] || titleMatch[3] || "" : "")
        .replace(/&quot;/g, '"').trim(),
      badge: (badgeMatch ? badgeMatch[1] || badgeMatch[2] || badgeMatch[3] || "" : "")
        .replace(/&quot;/g, '"').trim(),
      content: (descMatch ? descMatch[1] || descMatch[2] || descMatch[3] || "" : "")
        .replace(/&quot;/g, '"').trim(),
    };
  }

  // Prop syntax: <Card title="..." badge="...">...body...</Card>
  const propMatch = rawCard.match(/^<Card\b([^>]*)>([\s\S]*?)<\/Card>$/i);
  if (propMatch) {
    const attrs = propMatch[1] || "";
    const content = propMatch[2]?.trim() || "";
    const titleMatch = attrs.match(/title=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/);
    const badgeMatch = attrs.match(/badge=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/);
    const descMatch = attrs.match(/description=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/);
    return {
      title: (titleMatch ? titleMatch[1] || titleMatch[2] || titleMatch[3] || "" : "")
        .replace(/&quot;/g, '"').trim(),
      badge: (badgeMatch ? badgeMatch[1] || badgeMatch[2] || badgeMatch[3] || "" : "")
        .replace(/&quot;/g, '"').trim(),
      content: content || (descMatch ? descMatch[1] || descMatch[2] || descMatch[3] || "" : "")
        .replace(/&quot;/g, '"').trim(),
    };
  }

  return null;
}

export function parseMarkdownTable(raw: string): {
  headers: string[];
  alignments: ("left" | "center" | "right")[];
  rows: string[][];
} | null {
  const lines = raw
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;

  const isRow = (l: string) => l.startsWith("|") && l.endsWith("|");
  if (!isRow(lines[0]) || !isRow(lines[1])) return null;

  // Check delimiter row
  const delimiterParts = lines[1]
    .slice(1, -1)
    .split("|")
    .map((p) => p.trim());
  const isDelimiter =
    delimiterParts.length > 0 &&
    delimiterParts.every((p) => /^:?-+:?$/.test(p));
  if (!isDelimiter) return null;

  const headers = lines[0]
    .slice(1, -1)
    .split("|")
    .map((h) => h.trim().replace(/\\\|/g, "|"));

  const alignments: ("left" | "center" | "right")[] = delimiterParts.map(
    (p) => {
      if (p.startsWith(":") && p.endsWith(":")) return "center";
      if (p.endsWith(":")) return "right";
      return "left";
    },
  );

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    if (!isRow(lines[i])) break;
    const cells = lines[i]
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim().replace(/\\\|/g, "|"));
    while (cells.length < headers.length) cells.push("");
    rows.push(cells.slice(0, headers.length));
  }

  return { headers, alignments, rows };
}

export function parseTypeTableParameters(raw: string): TypeTableProperty[] {
  const typeIdx = raw.indexOf("type={");
  if (typeIdx === -1) return [];

  let depth = 0;
  let inString: string | null = null;
  let start = -1;

  for (let i = typeIdx + 5; i < raw.length; i++) {
    const ch = raw[i];
    const prev = raw[i - 1];

    if (inString) {
      if (ch === inString && prev !== "\\") {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const outer = raw.slice(start, i + 1);
        const inner = outer.replace(/^\{|\}$/g, "").trim();
        try {
          const obj = new Function("return (" + inner + ")")();
          if (obj && typeof obj === "object") {
            return Object.entries(obj).map(([name, val]: [string, any]) => ({
              name,
              type: typeof val?.type === "string" ? val.type : "string",
              description:
                typeof val?.description === "string" ? val.description : "",
              default: val?.default !== undefined ? String(val.default) : "",
              required: Boolean(val?.required),
              deprecated: Boolean(val?.deprecated),
              typeDescriptionLink:
                typeof val?.typeDescriptionLink === "string"
                  ? val.typeDescriptionLink
                  : "",
            }));
          }
        } catch {
          // ignore parsing error
        }
        break;
      }
    }
  }

  return [];
}

export function parseFilesChildren(content: string): FileTreeNode[] {
  const nodes: FileTreeNode[] = [];
  let remaining = content.trim();

  while (remaining.length > 0) {
    remaining = remaining.trim();
    if (!remaining) break;

    // Folder match: <Folder name="..." [defaultOpen]> ... </Folder>
    if (/^<Folder/i.test(remaining)) {
      let depth = 0;
      let endIdx = -1;
      const folderTagRegex = /<Folder\b[^>]*>|<\/Folder>/gi;
      let match: RegExpExecArray | null;

      while ((match = folderTagRegex.exec(remaining)) !== null) {
        if (match[0].startsWith("</")) {
          depth--;
          if (depth === 0) {
            endIdx = match.index + match[0].length;
            break;
          }
        } else {
          depth++;
        }
      }

      if (endIdx !== -1) {
        const fullFolder = remaining.slice(0, endIdx);
        remaining = remaining.slice(endIdx).trim();

        const openMatch = fullFolder.match(
          /^<Folder\b([^>]*)>([\s\S]*?)<\/Folder>$/i,
        );
        if (openMatch) {
          const attrs = openMatch[1];
          const inner = openMatch[2];
          const nameMatch = attrs.match(/name="([^"]*)"/i);
          const defaultOpen = /\bdefaultOpen\b/i.test(attrs);

          nodes.push({
            id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: "folder",
            name: nameMatch ? nameMatch[1] : "folder",
            defaultOpen,
            children: parseFilesChildren(inner),
          });
          continue;
        }
      }
    }

    // File match: <File name="..." [icon=...] /> or <File name="...">...</File>
    const fileMatch = remaining.match(
      /^<File\b([^>]*?)(?:\/>|>([\s\S]*?)<\/File>)/i,
    );
    if (fileMatch) {
      const attrs = fileMatch[1];
      const nameMatch = attrs.match(/name="([^"]*)"/i);
      nodes.push({
        id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: "file",
        name: nameMatch ? nameMatch[1] : "file",
      });
      remaining = remaining.slice(fileMatch[0].length).trim();
      continue;
    }

    // Advance past unknown tag/char
    const nextTag = remaining.indexOf("<", 1);
    if (nextTag !== -1) {
      remaining = remaining.slice(nextTag).trim();
    } else {
      break;
    }
  }

  return nodes;
}

export function extractItemsProp(str: string): any[] {
  const startIdx = str.indexOf("items={");
  if (startIdx === -1) return [];
  let depth = 0;
  let inString: string | null = null;
  const jsonStart = startIdx + 7;
  let jsonEnd = -1;

  for (let i = startIdx + 6; i < str.length; i++) {
    const char = str[i];
    if (inString) {
      if (char === inString && str[i - 1] !== "\\") {
        inString = null;
      }
    } else if (char === '"' || char === "'" || char === "`") {
      inString = char;
    } else if (char === "{" || char === "[") {
      depth++;
    } else if (char === "}" || char === "]") {
      depth--;
      if (depth === 0) {
        jsonEnd = i;
        break;
      }
    }
  }

  if (jsonEnd !== -1) {
    const raw = str.slice(jsonStart, jsonEnd);
    try {
      const parsed = new Function(`return (${raw});`)();
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}
