export function resolveBatchOutcome(itemsCreated: number, expectedCount: number) {
  const failedCount = Math.max(0, expectedCount - itemsCreated);
  const batchStatus = itemsCreated === 0 ? "failed" : "done";
  const partial = itemsCreated > 0 && failedCount > 0;

  return {
    batchStatus,
    failedCount,
    partial,
  } as const;
}
