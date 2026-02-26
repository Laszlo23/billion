import { z } from "zod";

export const createSubmissionSchema = z.object({
  userId: z.string().min(1),
  proofUrl: z
    .string()
    .min(1)
    .refine(
      (value) => value.startsWith("/uploads/") || /^https?:\/\//.test(value),
      "Proof must be a local upload path or public URL.",
    ),
});
