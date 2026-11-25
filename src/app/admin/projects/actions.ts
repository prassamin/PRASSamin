"use server";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { stringify } from "yaml";
import { db } from "@/lib/db";

const CONTENT_ROOT = path.join(process.cwd(), "content", "projects");
const SAFE_FILE = /^[a-zA-Z0-9._-]+\.mdx?$/;

export async function getProjectFileAction(file: string) {
  if (!SAFE_FILE.test(file)) {
    return { success: false, error: "Invalid filename" };
  }

  try {
    const content = await readFile(path.join(CONTENT_ROOT, file), "utf8");
    return { success: true, content };
  } catch {
    return { success: false, error: "File not found" };
  }
}

export interface ProjectStats {
  totalViews: number;
  uniqueVisitors: number;
  countries: { country: string; views: number }[];
  daily: { date: string; views: number }[];
}

export async function getProjectStatsAction(
  slug: string,
): Promise<ProjectStats> {
  try {
    const trackers = await db.projectViewTracker.findMany({
      where: { slug },
      select: { count: true, country: true, lastSeen: true },
    });
    console.log(slug);
    const totalViews = trackers.reduce((acc, t) => acc + t.count, 0);
    const uniqueVisitors = trackers.length;

    const countryMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();
    for (const t of trackers) {
      const raw = String(t.country || "").trim();
      const label =
        raw && raw !== "undefined" && raw !== "undefined undefined"
          ? raw
          : "Unknown";
      countryMap.set(label, (countryMap.get(label) || 0) + t.count);
      const day = t.lastSeen.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + t.count);
    }

    const countries = Array.from(countryMap.entries())
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views);

    const daily = Array.from(dailyMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    return { totalViews, uniqueVisitors, countries, daily };
  } catch {
    return { totalViews: 0, uniqueVisitors: 0, countries: [], daily: [] };
  }
}

export async function saveProjectFileAction(file: string, content: string) {
  if (!SAFE_FILE.test(file)) {
    return { success: false, error: "Invalid filename" };
  }

  try {
    const filePath = path.join(CONTENT_ROOT, file);
    await writeFile(filePath, content, "utf8");

    revalidatePath("/admin/projects");
    revalidatePath("/projects");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to save project file" };
  }
}

export async function deleteProjectDraftAction(id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid Draft ID is required.");
  }

  await db.draft.delete({
    where: { id },
  });

  revalidatePath("/admin/projects");
  return { success: true };
}

const YAML_OPTIONS = {
  lineWidth: 80,
  defaultStringType: "QUOTE_DOUBLE" as const,
  defaultKeyType: "PLAIN" as const,
};

export async function publishProjectDraftAction(
  draftId: string,
  overrides?: {
    slug?: string;
    content?: string;
  },
) {
  if (!draftId) throw new Error("Draft ID is required.");

  const draft = await db.draft.findUnique({
    where: { id: draftId },
  });

  if (!draft || draft.type !== "project") {
    throw new Error("Project draft not found.");
  }

  const data = (draft.data as Record<string, any>) || {};
  const rawSlug = overrides?.slug || data.targetSlug || data.slug || "project-showcase";
  const slug = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!slug || slug === "index") {
    throw new Error("Invalid or reserved project slug.");
  }

  const now = new Date().toISOString();
  const frontmatter: Record<string, any> = {
    title: String(data.title || "Untitled Project").trim(),
  };

  if (data.category) frontmatter.category = String(data.category).trim();
  if (data.description) frontmatter.description = String(data.description).trim();
  if (Array.isArray(data.tools) && data.tools.length > 0) {
    frontmatter.tools = data.tools.map((t: string) => String(t).trim()).filter(Boolean);
  }
  if (data.github) frontmatter.github = String(data.github).trim();
  if (data.live) frontmatter.live = String(data.live).trim();
  if (data.thumbnail) frontmatter.thumbnail = String(data.thumbnail).trim();
  if (data.banner) frontmatter.banner = String(data.banner).trim();

  frontmatter.createdAt = data.createdAt || now;
  frontmatter.updatedAt = now;

  const bodyContent = overrides?.content !== undefined ? overrides.content : (data.content || "");
  const fullMdx = `---\n${stringify(frontmatter, YAML_OPTIONS)}---\n\n${bodyContent.trim()}\n`;

  let savedToDisk = false;
  try {
    const filePath = path.join(CONTENT_ROOT, `${slug}.mdx`);
    await writeFile(filePath, fullMdx, "utf8");
    savedToDisk = true;
  } catch {
    // In production read-only filesystem (e.g. Vercel), disk writes are safely bypassed
  }

  await db.draft.delete({
    where: { id: draftId },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);

  return { success: true, slug, savedToDisk };
}
