"use server";

import { db } from "@/lib/db";

export interface MentionCandidate {
  name: string;
  role: string;
  avatar: string;
}

/**
 * People already known to the site (testimonial authors) — used as quick-fill
 * suggestions for inline `<User />` mentions. Only public profile fields are
 * returned (these are already shown on the public homepage).
 */
export async function getMentionCandidatesAction(): Promise<MentionCandidate[]> {
  try {
    const rows = await db.testimonial.findMany({
      select: { name: true, role: true, avatar: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    const seen = new Set<string>();
    const result: MentionCandidate[] = [];
    for (const r of rows) {
      const key = r.name.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push({ name: r.name, role: r.role, avatar: r.avatar });
    }
    return result;
  } catch (error) {
    console.error("[MdxStudio:Action] Failed to load mention candidates:", error);
    return [];
  }
}
