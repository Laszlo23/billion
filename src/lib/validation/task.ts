import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(5).max(2000),
  platform: z
    .enum([
      "instagram",
      "tiktok",
      "linkedin",
      "youtube",
      "google_review",
      "other",
    ])
    .default("other"),
  rewardAmount: z.union([z.string().min(1), z.number().int().positive()]),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["active", "paused", "deleted"]),
});
