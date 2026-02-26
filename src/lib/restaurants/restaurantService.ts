import { UserRole } from "@prisma/client";

import { prisma } from "@/src/lib/prisma";
import { parsePicksAmount } from "@/src/lib/picks/amount";

type OnboardRestaurantInput = {
  ownerId: string;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  categories: Array<{
    name: string;
    items: Array<{ name: string; price: string | number; currency: string }>;
  }>;
};

export async function onboardRestaurant(input: OnboardRestaurantInput) {
  return prisma.$transaction(async (tx) => {
    const owner = await tx.user.findUnique({
      where: { id: input.ownerId },
      select: { id: true, role: true },
    });

    if (!owner) {
      throw new Error("Owner user does not exist.");
    }

    if (owner.role !== UserRole.restaurant) {
      await tx.user.update({
        where: { id: owner.id },
        data: { role: UserRole.restaurant },
      });
    }

    const restaurant = await tx.restaurant.create({
      data: {
        ownerId: input.ownerId,
        name: input.name,
        slug: input.slug,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });

    for (const category of input.categories) {
      const createdCategory = await tx.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: category.name,
        },
      });

      await tx.menuItem.createMany({
        data: category.items.map((item) => ({
          categoryId: createdCategory.id,
          name: item.name,
          price: parsePicksAmount(item.price),
          currency: item.currency,
        })),
      });
    }

    return restaurant;
  });
}
