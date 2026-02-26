import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { onboardRestaurant } from "@/src/lib/restaurants/restaurantService";
import { onboardingRestaurantSchema } from "@/src/lib/validation/menu";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = onboardingRestaurantSchema.parse(body);
    const restaurant = await onboardRestaurant(parsed);

    return Response.json({
      id: restaurant.id,
      slug: restaurant.slug,
      route: `/r/${restaurant.slug}`,
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to onboard restaurant.");
  }
}
