export const heroFoodImage =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80";

export const onboardingFoodImage =
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80";

export const personaCards = [
  {
    title: "For Gastro Owners",
    subtitle:
      "Launch a premium QR menu and campaign tasks that turn guests into creators.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
    href: "/restaurant/onboarding",
    cta: "Launch your growth engine",
  },
  {
    title: "For Taskers",
    subtitle:
      "Complete social food missions, earn rewards, and build a strong contributor profile.",
    image:
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=900&q=80",
    href: "/r/sunset-bistro",
    cta: "Start earning with missions",
  },
] as const;

const restaurantImageBySlug: Record<string, string> = {
  "sunset-bistro":
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
  "ocean-bowl":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80",
  "night-market-grill":
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=80",
  "garden-pasta-house":
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1400&q=80",
  "smoky-barrel-bbq":
    "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1400&q=80",
  "golden-lantern-pho":
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1400&q=80",
  "bluefin-sushi-lab":
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1400&q=80",
  "olive-and-ember":
    "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1400&q=80",
  "seoul-street-kitchen":
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1400&q=80",
  "taco-republic":
    "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=1400&q=80",
  "firebrick-pizza-co":
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80",
  "harbor-brunch-club":
    "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1400&q=80",
};

export function getRestaurantHeroImage(slug: string): string {
  return (
    restaurantImageBySlug[slug] ??
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=80"
  );
}
