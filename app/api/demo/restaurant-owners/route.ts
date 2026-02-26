import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const owners = await prisma.user.findMany({
      where: { role: "restaurant" },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: {
        id: true,
        email: true,
      },
    });

    return Response.json({ owners });
  } catch (error) {
    return toErrorResponse(error, "Failed to load demo restaurant owners.");
  }
}
