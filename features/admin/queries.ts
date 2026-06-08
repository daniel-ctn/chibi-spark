import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { dailyBatches, generationJobs } from "@/lib/db/schema";
import {
  countProposalsBySafety,
  getProposalsForReview,
} from "@/lib/db/queries/proposals";
import { getFailedJobs } from "@/lib/db/queries/jobs";

export async function getAdminDashboardData() {
  const [proposals, failedJobs, proposalCounts, latestBatch, queuedAnimations] =
    await Promise.all([
      getProposalsForReview(30),
      getFailedJobs(20),
      countProposalsBySafety(),
      db
        .select()
        .from(dailyBatches)
        .orderBy(desc(dailyBatches.generationDate))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(generationJobs)
        .where(eq(generationJobs.status, "queued"))
        .then((rows) => rows[0]?.count ?? 0),
    ]);

  const pendingBySafety = Object.fromEntries(
    proposalCounts.map((row) => [row.safetyLabel, row.count]),
  ) as Record<string, number>;

  return {
    proposals,
    failedJobs,
    latestBatch,
    stats: {
      pendingSafe: pendingBySafety.safe ?? 0,
      pendingBorderline: pendingBySafety.borderline ?? 0,
      failedJobs: failedJobs.length,
      queuedAnimations,
    },
  };
}
