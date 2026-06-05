import { z } from "zod";

export const proposalSchema = z.object({
  nickname: z
    .string()
    .max(50, "Nickname must be 50 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  ideaText: z
    .string()
    .min(3, "Idea must be at least 3 characters")
    .max(500, "Idea must be 500 characters or less")
    .transform((val) => val.trim()),
  styleHints: z
    .string()
    .max(200, "Style hints must be 200 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  turnstileToken: z.string().min(1, "Please complete the verification"),
});

export type ProposalInput = z.output<typeof proposalSchema>;
