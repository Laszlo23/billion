"use server";

import { prisma } from "@/src/lib/prisma";
import { OnboardingQuestService } from "@/src/lib/gamification/onboardingQuestService";
import { ReferralService } from "@/src/lib/gamification/referralService";
import { extractMenuFromImages } from "@/src/lib/vision/menuExtractionService";

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function detectViennaDistrict(latitude?: number, longitude?: number) {
  if (latitude == null || longitude == null) return null;
  if (latitude > 48.21 && longitude < 16.37) return "District 1";
  if (latitude > 48.2 && longitude >= 16.37) return "District 2";
  if (latitude <= 48.21 && longitude >= 16.33) return "District 7";
  return null;
}

async function uniqueSlug(base: string) {
  const normalized = base || "restaurant";
  const first = await prisma.restaurant.findUnique({ where: { slug: normalized } });
  if (!first) return normalized;

  for (let i = 2; i < 1000; i++) {
    const candidate = `${normalized}-${i}`;
    const existing = await prisma.restaurant.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
  }
  return `${normalized}-${Date.now()}`;
}

export async function createRestaurantFromOnboarding(input: {
  ownerId: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  imageUrls: string[];
}) {
  const owner = await prisma.user.findUnique({
    where: { id: input.ownerId },
    select: { id: true, role: true },
  });
  if (!owner) {
    throw new Error("Owner account not found.");
  }
  if (owner.role !== "restaurant") {
    await prisma.user.update({
      where: { id: owner.id },
      data: { role: "restaurant" },
    });
  }

  const slug = await uniqueSlug(slugifyName(input.name));
  const district = detectViennaDistrict(input.latitude, input.longitude);

  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: input.ownerId,
      name: input.name,
      slug,
      latitude: input.latitude,
      longitude: input.longitude,
      district,
    },
  });

  let manualEditRequired = false;
  try {
    const extracted = await extractMenuFromImages(input.imageUrls);
    for (const category of extracted.categories) {
      const createdCategory = await prisma.menuCategory.create({
        data: { restaurantId: restaurant.id, name: category.name },
      });
      await prisma.menuItem.createMany({
        data: category.items.map((item) => ({
          categoryId: createdCategory.id,
          name: item.name,
          price: BigInt(item.price),
          currency: item.currency,
        })),
      });
    }
  } catch {
    manualEditRequired = true;
    const manualCategory = await prisma.menuCategory.create({
      data: { restaurantId: restaurant.id, name: "Manual edit needed" },
    });
    await prisma.menuItem.create({
      data: {
        categoryId: manualCategory.id,
        name: "Add your first item",
        price: 0n,
        currency: "EUR",
      },
    });
  }

  await OnboardingQuestService.trackEvent({
    userId: input.ownerId,
    triggerType: "restaurant_onboarded",
    referenceId: restaurant.id,
  });
  await ReferralService.qualifyReferralForUser(input.ownerId, "restaurant_onboarded");

  return {
    restaurantId: restaurant.id,
    slug: restaurant.slug,
    district: restaurant.district,
    manualEditRequired,
    qrSvg: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=svg&data=${encodeURIComponent(`/r/${restaurant.slug}`)}`,
  };
}
