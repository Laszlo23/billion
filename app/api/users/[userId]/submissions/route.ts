import { prisma } from "@/src/lib/prisma";

type Params = { params: { userId: string } };

export async function GET(_: Request, { params }: Params) {
  try {
    const submissions = await prisma.taskSubmission.findMany({
      where: { userId: params.userId },
      include: {
        task: {
          select: {
            title: true,
            rewardAmount: true,
            restaurant: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return Response.json({ submissions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load user submissions.";
    return Response.json({ error: message }, { status: 503 });
  }
}
