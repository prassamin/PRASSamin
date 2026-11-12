import { NextResponse } from "next/server";
import { APP_NAME } from "@/constants";
import { db } from "@/lib/db";

/**
 * Health probe for uptime monitors (UptimeRobot, etc.).
 *
 * Checks both the app process and the database connection. The SELECT 1
 * also keeps serverless databases (Supabase, Prisma Postgres) awake —
 * they sleep on inactivity just like Vercel functions do.
 *
 * - 200: app + db healthy
 * - 503: app is up but the database is unreachable (alert-worthy)
 */
export async function GET() {
  const time = new Date().toISOString();

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        app: APP_NAME,
        db: "error",
        time,
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      app: APP_NAME,
      db: "ok",
      time,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
