"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";

const CONTENT_ROOT = path.join(process.cwd(), "content", "blogs");
const SAFE_FILE = /^[a-zA-Z0-9._-]+\.mdx?$/;

export async function getBlogFileAction(file: string) {
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

export interface BlogStats {
  totalViews: number;
  uniqueVisitors: number;
  countries: { country: string; views: number }[];
  daily: { date: string; views: number }[];
}

export async function getBlogStatsAction(slug: string): Promise<BlogStats> {
  try {
    const trackers = await db.blogViewTracker.findMany({
      where: { slug },
      select: { count: true, country: true, lastSeen: true },
    });

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
