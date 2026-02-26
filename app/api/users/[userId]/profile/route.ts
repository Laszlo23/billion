import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { prisma } from "@/src/lib/prisma";

type Params = { params: { userId: string } };

export async function GET(_: Request, { params }: Params) {
  try {
    const [user, profile, recentEvents, submissionStats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.userId },
        select: { id: true, email: true, picksBalance: true },
      }),
      prisma.taskerProfile.findUnique({
        where: { userId: params.userId },
        select: {
          xp: true,
          level: true,
          currentStreak: true,
          highestStreak: true,
          totalMissions: true,
          totalEarned: true,
          lastActiveAt: true,
        },
      }),
      prisma.taskEvent.findMany({
        where: { userId: params.userId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.taskSubmission.groupBy({
        by: ["status"],
        where: { userId: params.userId },
        _count: { _all: true },
      }),
    ]);
    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    const totalSubmissions = submissionStats.reduce((sum, row) => sum + row._count._all, 0);
    const approvedSubmissions =
      submissionStats.find((row) => row.status === "approved")?._count._all ?? 0;
    const reliabilityPct =
      totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;
    const reputationScore = Math.min(
      100,
      Math.round((profile?.level ?? 1) * 8 + reliabilityPct * 0.55 + (profile?.xp ?? 0) * 0.04),
    );

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        picksBalance: user.picksBalance.toString(),
      },
      contributorStatus: {
        tier:
          reputationScore >= 85
            ? "Elite"
            : reputationScore >= 70
              ? "Gold"
              : reputationScore >= 50
                ? "Silver"
                : "Bronze",
        reputationScore,
        missionsCompleted: profile?.totalMissions ?? 0,
        reliabilityPct,
      },
      profile: profile
        ? {
            ...profile,
            totalEarned: profile.totalEarned.toString(),
          }
        : null,
      recentEvents: recentEvents.map((event) => ({
        ...event,
        picksAmount: event.picksAmount?.toString() ?? null,
      })),
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to load tasker profile.");
  }
}
