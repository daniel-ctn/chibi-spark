import { describe, expect, it } from "vitest";

import { createAdminSessionToken } from "@/lib/admin/auth";
import { resolveBatchOutcome } from "@/server/pipeline/batch-outcome";

describe("createAdminSessionToken", () => {
  it("returns a stable hash for the same secret", () => {
    const first = createAdminSessionToken("secret-one-min-16-ch");
    const second = createAdminSessionToken("secret-one-min-16-ch");
    expect(first).toBe(second);
    expect(first).toHaveLength(64);
  });

  it("changes when the secret changes", () => {
    const first = createAdminSessionToken("secret-one-min-16-ch");
    const second = createAdminSessionToken("secret-two-min-16-ch");
    expect(first).not.toBe(second);
  });
});

describe("resolveBatchOutcome", () => {
  it("marks all-failed runs as failed", () => {
    expect(resolveBatchOutcome(0, 4)).toEqual({
      batchStatus: "failed",
      failedCount: 4,
      partial: false,
    });
  });

  it("marks mixed results as partial success", () => {
    expect(resolveBatchOutcome(2, 4)).toEqual({
      batchStatus: "done",
      failedCount: 2,
      partial: true,
    });
  });

  it("marks full success as done without partial flag", () => {
    expect(resolveBatchOutcome(4, 4)).toEqual({
      batchStatus: "done",
      failedCount: 0,
      partial: false,
    });
  });
});
