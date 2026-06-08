"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  isAdminAuthenticated,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/admin/auth";
import { requireServerEnv } from "@/lib/env";
import { updateProposal } from "@/lib/db/queries/proposals";
import { requeueJob } from "@/lib/db/queries/jobs";
import { runDailyDrop } from "@/server/pipeline/daily-drop";

export interface AdminActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

async function requireAdmin(): Promise<AdminActionResult | null> {
  if (!isAdminConfigured()) {
    return { success: false, error: "Admin is not configured" };
  }
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Unauthorized" };
  }
  return null;
}

export async function loginAdmin(password: string): Promise<AdminActionResult> {
  if (!isAdminConfigured()) {
    return { success: false, error: "Admin is not configured" };
  }

  if (!verifyAdminPassword(password)) {
    return { success: false, error: "Invalid password" };
  }

  const secret = requireServerEnv("ADMIN_SECRET");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSessionToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function approveProposal(proposalId: string): Promise<AdminActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  await updateProposal(proposalId, { safetyLabel: "safe" });
  revalidatePath("/admin");
  return { success: true, message: "Proposal approved" };
}

export async function rejectProposal(proposalId: string): Promise<AdminActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  await updateProposal(proposalId, { status: "rejected" });
  revalidatePath("/admin");
  return { success: true, message: "Proposal rejected" };
}

export async function requeueFailedJob(jobId: string): Promise<AdminActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  await requeueJob(jobId);
  revalidatePath("/admin");
  return { success: true, message: "Job requeued" };
}

export async function triggerDailyDrop(): Promise<AdminActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const result = await runDailyDrop({ triggeredBy: "manual" });
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/gallery");

  if (result.status === "failed") {
    return {
      success: false,
      error: result.error ?? "Daily drop failed",
    };
  }

  return {
    success: true,
    message: `Daily drop: ${result.status} (${result.itemCount ?? 0} items)`,
  };
}
