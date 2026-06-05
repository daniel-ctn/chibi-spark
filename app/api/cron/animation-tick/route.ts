import { NextResponse } from "next/server";
import { requireServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getQueuedAnimationJobs } from "@/lib/db/queries";
import { processAnimationJob } from "@/server/pipeline/animate-item";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const cronSecret = requireServerEnv("CRON_SECRET");

  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const log = logger.child({ job: "animation-tick" });
  log.info("starting animation tick");

  try {
    const jobs = await getQueuedAnimationJobs(5);

    if (jobs.length === 0) {
      log.info("no queued animation jobs");
      return NextResponse.json({ processed: 0 });
    }

    log.info("processing animation jobs", { count: jobs.length });

    const results = [];
    for (const job of jobs) {
      await processAnimationJob(job.id);
      results.push({ jobId: job.id, status: "processed" });
    }

    log.info("animation tick complete", { processed: results.length });
    return NextResponse.json({ processed: results.length });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log.error("animation tick failed", { error: errorMsg });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const GET = POST;
