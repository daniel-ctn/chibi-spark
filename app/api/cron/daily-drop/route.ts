import { NextResponse } from "next/server";
import { requireServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const cronSecret = requireServerEnv("CRON_SECRET");

  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { runDailyDrop } = await import("@/server/pipeline/daily-drop");
    const result = await runDailyDrop({ triggeredBy: "cron" });
    return NextResponse.json(result);
  } catch (err) {
    logger.error("daily-drop cron failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const GET = POST;
