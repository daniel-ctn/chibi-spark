import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export const ADMIN_COOKIE = "chibi_admin_session";

export function isAdminConfigured(): boolean {
  return Boolean(env.ADMIN_SECRET && env.ADMIN_SECRET.length >= 16);
}

export function createAdminSessionToken(secret: string): string {
  return createHash("sha256").update(`chibi-admin:${secret}`).digest("hex");
}

export function verifyAdminPassword(input: string): boolean {
  const secret = env.ADMIN_SECRET;
  if (!secret) return false;

  const a = Buffer.from(input);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const expected = createAdminSessionToken(env.ADMIN_SECRET!);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
