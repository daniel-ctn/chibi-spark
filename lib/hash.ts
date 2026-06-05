import { createHash } from "crypto";
import { env } from "@/lib/env";

export function hashIp(ip: string): string {
  const salt = env.CRON_SECRET ?? "default-salt";
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}
