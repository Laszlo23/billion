import { z } from "zod";

export const socialPlatformSchema = z.enum(["instagram", "tiktok", "linkedin"]);

export const updateSocialHandlesSchema = z.object({
  instagramHandle: z
    .string()
    .trim()
    .max(60)
    .regex(/^[A-Za-z0-9._]*$/, "Instagram handle can contain letters, numbers, dot, underscore.")
    .optional(),
  tiktokHandle: z
    .string()
    .trim()
    .max(60)
    .regex(/^[A-Za-z0-9._]*$/, "TikTok handle can contain letters, numbers, dot, underscore.")
    .optional(),
  linkedinHandle: z
    .string()
    .trim()
    .max(80)
    .regex(/^[A-Za-z0-9-]*$/, "LinkedIn handle can contain letters, numbers, and hyphen.")
    .optional(),
});

export const verifySocialSchema = z.object({
  platform: socialPlatformSchema,
});
