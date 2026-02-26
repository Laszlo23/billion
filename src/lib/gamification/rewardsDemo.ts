import { prisma } from "@/src/lib/prisma";

const DEFAULT_VIENNA_DISTRICTS = [
  { district: "District 1", restaurantsActive: 5, restaurantsTarget: 20 },
  { district: "District 2", restaurantsActive: 3, restaurantsTarget: 20 },
  { district: "District 7", restaurantsActive: 2, restaurantsTarget: 20 },
] as const;

function levelFromPoints(points: number) {
  if (points >= 2000) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
}

function levelProgress(points: number) {
  if (points >= 2000) return { current: "Gold", next: null, progressPct: 100 };
  if (points >= 500) {
    return {
      current: "Silver",
      next: "Gold",
      progressPct: Math.min(100, Math.round(((points - 500) / 1500) * 100)),
    };
  }
  return {
    current: "Bronze",
    next: "Silver",
    progressPct: Math.min(100, Math.round((points / 500) * 100)),
  };
}

export async function ensureViennaLeaderboardSeed() {
  const existing = await prisma.user.count({
    where: { email: { startsWith: "leaderboard+" } },
  });
  if (existing >= 10) return;

  const starterPoints = [2420, 2260, 2015, 1850, 1620, 1440, 1180, 970, 760, 610];
  await Promise.all(
    starterPoints.map((points, index) =>
      prisma.user.upsert({
        where: { email: `leaderboard+${String(index + 1).padStart(3, "0")}@bitemine.demo` },
        update: { role: "user", picksBalance: BigInt(points) },
        create: {
          email: `leaderboard+${String(index + 1).padStart(3, "0")}@bitemine.demo`,
          role: "user",
          picksBalance: BigInt(points),
        },
      }),
    ),
  );
}

export async function ensureViennaDistrictSeed() {
  const count = await prisma.gamificationSeed.count({ where: { city: "Vienna" } });
  if (count > 0) return;
  await prisma.gamificationSeed.createMany({
    data: DEFAULT_VIENNA_DISTRICTS.map((item) => ({ city: "Vienna", ...item })),
  });
}

export async function getRewardsDemoData(userId?: string) {
  await ensureViennaLeaderboardSeed();
  await ensureViennaDistrictSeed();

  const [leaderboardUsers, districtRows, currentUser, logs] = await Promise.all([
    prisma.user.findMany({
      where: { role: "user" },
      orderBy: { picksBalance: "desc" },
      take: 10,
      select: { id: true, email: true, picksBalance: true },
    }),
    prisma.gamificationSeed.findMany({
      where: { city: "Vienna" },
      orderBy: { district: "asc" },
      take: 3,
    }),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, picksBalance: true },
        })
      : null,
    userId
      ? prisma.transactionLog.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, type: true, amount: true, createdAt: true, referenceType: true },
        })
      : [],
  ]);

  const currentPoints = Number(currentUser?.picksBalance ?? 0n);
  const currentLevel = levelProgress(currentPoints);
  const rank = userId
    ? (await prisma.user.count({
        where: { role: "user", picksBalance: { gt: currentUser?.picksBalance ?? 0n } },
      })) + 1
    : null;

  return {
    leaderboard: leaderboardUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: `Contributor #${String(index + 14).padStart(3, "0")}`,
      points: Number(user.picksBalance),
      level: levelFromPoints(Number(user.picksBalance)),
    })),
    districtProgress: districtRows.map((row) => ({
      district: row.district,
      active: row.restaurantsActive,
      target: row.restaurantsTarget,
    })),
    currentUser: currentUser
      ? {
          id: currentUser.id,
          email: currentUser.email,
          points: currentPoints,
          level: currentLevel.current,
          progressPct: currentLevel.progressPct,
          nextLevel: currentLevel.next,
          rank: rank ?? null,
        }
      : null,
    activity: logs.map((log) => ({
      id: log.id,
      type: log.type,
      amount: log.amount.toString(),
      referenceType: log.referenceType,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}
