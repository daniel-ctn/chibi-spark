"use server";

import { headers } from "next/headers";
import { proposalSchema, type ProposalInput } from "@/lib/validators/proposals";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { checkRateLimit } from "@/lib/rate-limit";
import { moderateProposal } from "@/lib/moderation";
import { hashIp } from "@/lib/hash";
import { createProposal } from "@/lib/db/queries/proposals";
import { logger } from "@/lib/logger";

export interface ActionResult {
  success: boolean;
  error?: string;
  proposalId?: string;
}

export async function submitProposal(input: ProposalInput): Promise<ActionResult> {
  const log = logger.child({ action: "submitProposal" });

  try {
    const validated = proposalSchema.safeParse(input);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Invalid input",
      };
    }

    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";
    const ipHash = hashIp(ip);

    const turnstileResult = await verifyTurnstileToken(validated.data.turnstileToken, ip);
    if (!turnstileResult.success) {
      log.warn("Turnstile verification failed", { ipHash, error: turnstileResult.error });
      return {
        success: false,
        error: "Verification failed. Please try again.",
      };
    }

    const rateLimitResult = await checkRateLimit(ipHash);
    if (!rateLimitResult.allowed) {
      log.warn("Rate limit exceeded", { ipHash, reason: rateLimitResult.reason });
      return {
        success: false,
        error: rateLimitResult.reason ?? "Too many requests",
      };
    }

    const moderationResult = await moderateProposal(validated.data.ideaText);
    if (moderationResult.label === "unsafe") {
      log.warn("Proposal rejected by moderation", {
        ipHash,
        reason: moderationResult.reason,
      });
      return {
        success: false,
        error: "Your idea couldn't be submitted. Please try a different idea.",
      };
    }

    const proposal = await createProposal({
      nickname: validated.data.nickname ?? null,
      ideaText: validated.data.ideaText,
      styleHints: validated.data.styleHints ?? null,
      sourceIpHash: ipHash,
      safetyLabel: moderationResult.label,
    });

    log.info("Proposal created", {
      proposalId: proposal.id,
      ipHash,
      safetyLabel: moderationResult.label,
    });

    return {
      success: true,
      proposalId: proposal.id,
    };
  } catch (error) {
    log.error("Proposal submission failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}
