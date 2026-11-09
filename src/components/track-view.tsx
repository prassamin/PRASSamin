"use client";

import { useEffect } from "react";

/**
 * Invisible view tracker: fires one POST /api/track-view after hydration.
 * Renders nothing. Safe to drop anywhere inside a page.
 */
export function TrackView({
  type,
  slug,
}: {
  type: "blog" | "project";
  slug: string;
}) {
  useEffect(() => {
    if (!slug) return;

    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, slug }),
      keepalive: true,
    }).catch(() => {
      // best-effort — never break the page
    });
  }, [type, slug]);

  return null;
}
