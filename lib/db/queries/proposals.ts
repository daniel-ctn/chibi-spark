import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { proposals, type Proposal } from "@/lib/db/schema";
import { newId } from "@/lib/ids";

export async function createProposal(input: {
  nickname?: string | null;
  ideaText: string;
  styleHints?: string | null;
  sourceIpHash?: string | null;
  safetyLabel: "safe" | "borderline" | "unsafe" | "pending";
}): Promise<Proposal> {
  const [row] = await db
    .insert(proposals)
    .values({
      id: newId(),
      nickname: input.nickname ?? null,
      ideaText: input.ideaText,
      styleHints: input.styleHints ?? null,
      sourceIpHash: input.sourceIpHash ?? null,
      safetyLabel: input.safetyLabel,
    })
    .returning();
  if (!row) throw new Error("Failed to create proposal");
  return row;
}

export async function getApprovedProposalsForPicking(limit: number) {
  return db
    .select({ id: proposals.id, ideaText: proposals.ideaText })
    .from(proposals)
    .where(and(eq(proposals.status, "pending"), eq(proposals.safetyLabel, "safe")))
    .orderBy(desc(proposals.createdAt))
    .limit(limit);
}

export async function markProposalsAsUsed(ids: string[]) {
  if (ids.length === 0) return;
  await db.update(proposals).set({ status: "used" }).where(inArray(proposals.id, ids));
}
