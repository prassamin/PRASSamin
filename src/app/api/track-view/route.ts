import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { geolocation } from "@vercel/functions";
import { NODE_ENV } from "@/constants/env";
import { source, projectSource } from "@/lib/source";

const THREE_MINUTES = 3 * 60 * 1000;

/** Slugs must exist in the published content sources. */
function slugExists(type: "blog" | "project", slug: string): boolean {
  const pages = type === "project" ? projectSource.getPages() : source.getPages();
  return pages.some((p) => p.slugs.join("/") === slug);
}

/**
 * Best-effort view tracking. Called client-side after hydration.
 * - Only tracks in production (dev/preview should never pollute stats).
 * - Never throws to the caller: always 204 so tracking can't break pages.
 */
export async function POST(req: NextRequest) {
  if (NODE_ENV !== "production") {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const body = await req.json().catch(() => null);
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const type = body?.type === "project" ? "project" : "blog";
    if (!slug) return new NextResponse(null, { status: 204 });

    // Only track published slugs — ignore junk/unknown paths.
    if (!slugExists(type, slug)) {
      return new NextResponse(null, { status: 204 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    let country: string | undefined;
    let flag: string | undefined;
    try {
      ({ country, flag } = geolocation({ headers: req.headers }) as any);
    } catch {
      // geolocation is Vercel-only; ignore elsewhere.
    }
    const location =
      country && flag
        ? `${country} ${flag}`
        : country || flag || "Unknown";

    const threeMinutesAgo = new Date(Date.now() - THREE_MINUTES);

    if (type === "project") {
      const tracker = await db.projectViewTracker.findUnique({
        where: { slug_visitorId: { slug, visitorId: ip } },
      });

      if (!tracker) {
        await db.$transaction([
          db.projectStat.upsert({
            where: { slug },
            create: { slug, totalViews: 1 },
            update: { totalViews: { increment: 1 } },
          }),
          db.projectViewTracker.create({
            data: {
              slug,
              visitorId: ip,
              count: 1,
              country: location,
              lastSeen: new Date(),
            },
          }),
        ]);
      } else if (tracker.lastSeen < threeMinutesAgo) {
        await db.$transaction([
          db.projectViewTracker.update({
            where: { slug_visitorId: { slug, visitorId: ip } },
            data: { lastSeen: new Date(), count: { increment: 1 } },
          }),
          db.projectStat.update({
            where: { slug },
            data: { totalViews: { increment: 1 } },
          }),
        ]);
      }
    } else {
      const tracker = await db.blogViewTracker.findUnique({
        where: { slug_visitorId: { slug, visitorId: ip } },
      });

      if (!tracker) {
        await db.$transaction([
          db.blogStat.upsert({
            where: { slug },
            create: { slug, totalViews: 1 },
            update: { totalViews: { increment: 1 } },
          }),
          db.blogViewTracker.create({
            data: {
              slug,
              visitorId: ip,
              count: 1,
              country: location,
              lastSeen: new Date(),
            },
          }),
        ]);
      } else if (tracker.lastSeen < threeMinutesAgo) {
        await db.$transaction([
          db.blogViewTracker.update({
            where: { slug_visitorId: { slug, visitorId: ip } },
            data: { lastSeen: new Date(), count: { increment: 1 } },
          }),
          db.blogStat.update({
            where: { slug },
            data: { totalViews: { increment: 1 } },
          }),
        ]);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[track-view]", err);
    return new NextResponse(null, { status: 204 });
  }
}
