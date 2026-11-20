/**
 * Shared pure helpers for inline `<User ... />` mention markup.
 *
 * Format (self-closing, attributes only when non-empty):
 *   <User name="Jane Doe" avatar="/a.png" href="https://..." role="Engineer" bio="..." />
 */
import { decodeTooltipAttr, escapeTooltipAttr } from "./inline-tooltip-utils";

export interface UserMentionData {
  name: string;
  avatar?: string;
  href?: string;
  role?: string;
  bio?: string;
}

export interface UserMentionOccurrence extends UserMentionData {
  start: number;
  end: number;
}

const MENTION_ATTR_KEYS: (keyof UserMentionData)[] = [
  "name",
  "avatar",
  "href",
  "role",
  "bio",
];

/**
 * `<User` followed by a word boundary that is NOT another identifier char
 * (so `<UseTemplate>` / `<UserCard>` never match). Attribute values are quoted
 * strings, so a `/>` can't appear inside them unescaped... except inside quotes,
 * which the tempered pattern below skips.
 */
export const USER_MENTION_REGEX =
  /<User(?![A-Za-z0-9_])((?:\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*\/>/g;

function parseAttrs(attrs: string): Record<string, string> {
  const result: Record<string, string> = {};
  const re = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrs)) !== null) {
    result[m[1]] = decodeTooltipAttr(m[2] ?? m[3] ?? "");
  }
  return result;
}

export function parseUserMentions(source: string): UserMentionOccurrence[] {
  return [...source.matchAll(USER_MENTION_REGEX)].map((m) => {
    const attrs = parseAttrs(m[1] || "");
    const start = m.index ?? 0;
    return {
      start,
      end: start + m[0].length,
      name: attrs.name || "",
      avatar: attrs.avatar || undefined,
      href: attrs.href || undefined,
      role: attrs.role || undefined,
      bio: attrs.bio || undefined,
    };
  });
}

/** Single-line attrs (name/avatar/href/role) collapse newlines; bio keeps them. */
export function buildUserMentionTag(data: UserMentionData): string {
  const parts: string[] = [];
  for (const key of MENTION_ATTR_KEYS) {
    let val = String(data[key] ?? "").replace(/\r\n?/g, "\n");
    if (key !== "bio") val = val.replace(/\s*\n\s*/g, " ");
    val = val.trim();
    if (!val) continue;
    parts.push(`${key}="${escapeTooltipAttr(val)}"`);
  }
  if (!parts.some((p) => p.startsWith("name="))) {
    parts.unshift(`name="User"`);
  }
  return `<User ${parts.join(" ")} />`;
}

/** Finds the mention containing the caret / overlapping the selection. */
export function findUserMentionAt(
  value: string,
  start: number,
  end: number,
): UserMentionOccurrence | null {
  for (const occ of parseUserMentions(value)) {
    const insideCollapsed =
      start === end && start > occ.start && start < occ.end;
    const overlaps =
      start !== end && Math.max(start, occ.start) < Math.min(end, occ.end);
    if (insideCollapsed || overlaps) return occ;
  }
  return null;
}
