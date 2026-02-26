import { UserRole } from "@prisma/client";

import { prisma } from "@/src/lib/prisma";

const demoTopEarners = [
  {
    userId: "demo-contributor-01",
    earned: 3220n,
    email: "creator.alpha@billion.local",
    walletAddress: null,
  },
  {
    userId: "demo-contributor-02",
    earned: 2875n,
    email: "foodloop.pro@billion.local",
    walletAddress: null,
  },
  {
    userId: "demo-contributor-03",
    earned: 2540n,
    email: "reels.operator@billion.local",
    walletAddress: null,
  },
  {
    userId: "demo-contributor-04",
    earned: 2180n,
    email: "ugc.pilot@billion.local",
    walletAddress: null,
  },
] as const;

export async function getAdminMetrics() {
  try {
    const [
      balanceAgg,
      reservedAgg,
      distributedAgg,
      activeRestaurants,
      topEarners,
    ] = await Promise.all([
      prisma.user.aggregate({ _sum: { picksBalance: true } }),
      prisma.user.aggregate({ _sum: { reservedBalance: true } }),
      prisma.transactionLog.aggregate({
        where: { type: "earn" },
        _sum: { amount: true },
      }),
      prisma.restaurant.count(),
      prisma.transactionLog.groupBy({
        by: ["userId"],
        where: { type: "earn" },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
      }),
    ]);

    const users = await prisma.user.findMany({
      where: {
        id: { in: topEarners.map((row) => row.userId) },
        role: { not: UserRole.admin },
      },
      select: { id: true, email: true, walletAddress: true },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    return {
      totalPicksInSystem: balanceAgg._sum.picksBalance ?? BigInt(0),
      totalReserved: reservedAgg._sum.reservedBalance ?? BigInt(0),
      totalDistributed: distributedAgg._sum.amount ?? BigInt(0),
      activeRestaurants,
      topEarners:
        topEarners.length > 0
          ? topEarners.map((row) => ({
              userId: row.userId,
              earned: row._sum.amount ?? BigInt(0),
              email: userMap.get(row.userId)?.email ?? null,
              walletAddress: userMap.get(row.userId)?.walletAddress ?? null,
            }))
          : [...demoTopEarners],
      dbAvailable: true,
    };
  } catch {
    return {
      totalPicksInSystem: 42950000n,
      totalReserved: 9540000n,
      totalDistributed: 18620000n,
      activeRestaurants: 12,
      topEarners: [...demoTopEarners] as Array<{
        userId: string;
        earned: bigint;
        email: string | null;
        walletAddress: string | null;
      }>,
      dbAvailable: false,
    };
  }
}
