import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { generationJobs, type GenerationJob } from "@/lib/db/schema";
import { newId } from "@/lib/ids";

export async function createJob(input: {
  id?: string;
  chibiItemId?: string | null;
  jobType: "text" | "image" | "animation" | "metadata";
  status?: "queued" | "running" | "succeeded" | "failed" | "skipped";
  provider?: string | null;
  providerJobId?: string | null;
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown> | null;
  errorMessage?: string | null;
  attempts?: number;
  startedAt?: Date | null;
  completedAt?: Date | null;
}): Promise<GenerationJob> {
  const [row] = await db
    .insert(generationJobs)
    .values({
      id: input.id ?? newId(),
      chibiItemId: input.chibiItemId ?? null,
      jobType: input.jobType,
      status: input.status ?? "queued",
      provider: input.provider ?? null,
      providerJobId: input.providerJobId ?? null,
      inputPayload: input.inputPayload ?? {},
      outputPayload: input.outputPayload ?? null,
      errorMessage: input.errorMessage ?? null,
      attempts: input.attempts ?? 0,
      startedAt: input.startedAt ?? null,
      completedAt: input.completedAt ?? null,
    })
    .returning();
  if (!row) throw new Error("Failed to create job");
  return row;
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<GenerationJob, "id" | "createdAt">>,
): Promise<GenerationJob> {
  const [row] = await db
    .update(generationJobs)
    .set(updates)
    .where(eq(generationJobs.id, id))
    .returning();
  if (!row) throw new Error("Failed to update job");
  return row;
}

export async function getJob(id: string): Promise<GenerationJob | null> {
  const [row] = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.id, id))
    .limit(1);
  return row ?? null;
}

export async function getQueuedAnimationJobs(limit: number): Promise<GenerationJob[]> {
  return db
    .select()
    .from(generationJobs)
    .where(
      and(eq(generationJobs.status, "queued"), eq(generationJobs.jobType, "animation")),
    )
    .orderBy(asc(generationJobs.createdAt))
    .limit(limit);
}
