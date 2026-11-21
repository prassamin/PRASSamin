import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Universal Lightweight Sync Endpoint for Admin Realtime Polling.
 *
 * Query params:
 * - type: entity/draft type to filter (e.g. "education", "blog", "project", "experience", or "*" / omitted for all)
 * - since: ISO timestamp string or client state fingerprint
 *
 * Response:
 * - fingerprint: state hash `${draftCount}:${entityCount}:${maxTimestamp}`
 * - hasChanges: boolean
 * - latestTimestamp: ISO string of the most recent draft or entity updatedAt
 * - count: total number of pending drafts
 * - draftCount: number of pending drafts
 * - entityCount: number of published entities
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type")?.trim() || "*";
    const since = searchParams.get("since")?.trim();

    // 1. Fetch Drafts info
    const draftWhere = type !== "*" ? { type, status: "draft" } : { status: "draft" };
    const latestDraft = await db.draft.findFirst({
      where: draftWhere,
      orderBy: { updatedAt: "desc" },
      select: { id: true, updatedAt: true, type: true },
    });

    const draftCount = await db.draft.count({
      where: draftWhere,
    });

    // 2. Fetch Entity info based on type
    let latestEntityTime = 0;
    let entityCount = 0;
    let latestEntityId = "";

    if (type === "education" || type === "*") {
      const latestEdu = await db.education.findFirst({
        orderBy: { updated_at: "desc" },
        select: { id: true, updated_at: true },
      });
      const eduTotal = await db.education.count();
      if (latestEdu) {
        const t = latestEdu.updated_at.getTime();
        if (t > latestEntityTime) {
          latestEntityTime = t;
          latestEntityId = String(latestEdu.id);
        }
      }
      entityCount += eduTotal;
    }

    if (type === "experience" || type === "*") {
      const latestExp = await db.experience.findFirst({
        orderBy: { updated_at: "desc" },
        select: { id: true, updated_at: true },
      });
      const expTotal = await db.experience.count();
      if (latestExp) {
        const t = latestExp.updated_at.getTime();
        if (t > latestEntityTime) {
          latestEntityTime = t;
          latestEntityId = String(latestExp.id);
        }
      }
      entityCount += expTotal;
    }

    const draftTime = latestDraft?.updatedAt?.getTime() || 0;
    const maxTime = Math.max(draftTime, latestEntityTime);
    const latestIso = maxTime > 0 ? new Date(maxTime).toISOString() : null;

    let latestType = type;
    let latestId = "";
    if (draftTime >= latestEntityTime && draftTime > 0) {
      latestType = latestDraft?.type || type;
      latestId = latestDraft?.id || "";
    } else if (latestEntityTime > 0) {
      latestType = type === "*" ? "entity" : type;
      latestId = latestEntityId;
    }

    // Build unique state fingerprint: tracks draft count, published count, and latest mutation timestamp
    const fingerprint = `${draftCount}:${entityCount}:${maxTime}`;

    // Calculate changes if `since` was provided
    let hasChanges = false;
    if (since) {
      if (since.includes(":")) {
        hasChanges = since !== fingerprint;
      } else {
        const sinceDate = new Date(since);
        if (!isNaN(sinceDate.getTime())) {
          hasChanges = maxTime > sinceDate.getTime();
        } else {
          hasChanges = true;
        }
      }
    }

    return NextResponse.json(
      {
        fingerprint,
        hasChanges,
        latestTimestamp: latestIso,
        count: draftCount,
        draftCount,
        entityCount,
        latestId,
        latestType,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error: any) {
    console.error("[Realtime Sync Error]:", error);
    return NextResponse.json(
      { hasChanges: false, error: error?.message || "Sync failed" },
      { status: 500 },
    );
  }
}
