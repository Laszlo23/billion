import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { prisma } from "@/src/lib/prisma";
import { createRestaurantLeadSchema } from "@/src/lib/validation/lead";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createRestaurantLeadSchema.parse(body);
    const lead = await prisma.restaurantLead.create({
      data: parsed,
      select: { id: true, createdAt: true },
    });

    return Response.json({ id: lead.id, createdAt: lead.createdAt.toISOString() });
  } catch (error) {
    return toErrorResponse(error, "Could not store lead.");
  }
}
