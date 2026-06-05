import { openaiText } from "@/lib/ai";
import type { SafetyLabel } from "@/lib/ai/text/service";

export async function moderateProposal(
  text: string,
): Promise<{ label: SafetyLabel; reason?: string }> {
  try {
    const result = await openaiText.classifySafety({ text });
    return {
      label: result.label,
      reason: result.reason,
    };
  } catch (error) {
    console.error("Moderation error:", error);
    return { label: "borderline", reason: "Moderation service unavailable" };
  }
}
