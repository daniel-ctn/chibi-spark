import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dailyBatches, type DailyBatch } from "@/lib/db/schema";
import { newId } from "@/lib/ids";

export async function createBatch(input: {
  id?: string;
  generationDate: string;
  status: "pending" | "running" | "done" | "failed";
}): Promise<DailyBatch> {
  const [row] = await db
    .insert(dailyBatches)
    .values({
      id: input.id ?? newId(),
      generationDate: input.generationDate,
      status: input.status,
    })
    .returning();
  if (!row) throw new Error("Failed to create batch");
  return row;
}

export async function getBatchByDate(generationDate: string): Promise<DailyBatch | null> {
  const [row] = await db
    .select()
    .from(dailyBatches)
    .where(eq(dailyBatches.generationDate, generationDate))
    .limit(1);
  return row ?? null;
}

export async function updateBatch(
  id: string,
  updates: Partial<Omit<DailyBatch, "id" | "createdAt">>,
): Promise<DailyBatch> {
  const [row] = await db
    .update(dailyBatches)
    .set(updates)
    .where(eq(dailyBatches.id, id))
    .returning();
  if (!row) throw new Error("Failed to update batch");
  return row;
}
