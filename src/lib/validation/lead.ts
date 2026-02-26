import { z } from "zod";

export const createRestaurantLeadSchema = z.object({
  restaurantName: z.string().min(2).max(120),
  district: z.string().min(1).max(80),
  phoneOrWhatsApp: z.string().min(6).max(50),
});
