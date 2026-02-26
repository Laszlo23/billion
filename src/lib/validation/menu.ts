import { z } from "zod";

export const menuItemInputSchema = z.object({
  name: z.string().min(1),
  price: z.union([z.number().int().nonnegative(), z.string().min(1)]),
  currency: z.string().min(3).max(10).default("USD"),
});

export const menuCategoryInputSchema = z.object({
  name: z.string().min(1),
  items: z.array(menuItemInputSchema).min(1),
});

export const menuExtractionRequestSchema = z.object({
  imageUrls: z
    .array(
      z
        .string()
        .min(1)
        .refine(
          (value) =>
            value.startsWith("/uploads/") ||
            value.startsWith("data:image/") ||
            /^https?:\/\//.test(value),
          "Image URL must be local upload, data URL, or http(s) URL.",
        ),
    )
    .min(1),
});

export const onboardingRestaurantSchema = z.object({
  ownerId: z.string().min(1),
  name: z.string().min(1),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  categories: z.array(menuCategoryInputSchema).min(1),
});
