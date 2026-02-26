import { SubmissionStatus, TaskPlatform, UserRole } from "@prisma/client";

import {
  districtRaceSeed,
  landingPilotMetrics,
  liveActivityFeedSeed,
  liveCampaignPreview,
  seasonProgress,
  topContributorsThisWeek,
} from "@/src/lib/demo/landingMetrics";
import { ensureViennaDistrictSeed, ensureViennaLeaderboardSeed } from "@/src/lib/gamification/rewardsDemo";
import { prisma } from "@/src/lib/prisma";

type Badge = "Bronze" | "Silver" | "Gold";

export type LiveCityData = {
  livePill: string;
  seasonDaysLeft: number;
  foundingVenues: number;
  targetFoundingVenues: number;
  metricsLabel: string;
  activeVenues: number;
  missionsCompleted: number;
  reviewsGenerated: number;
  avgRatingImpact: number;
  liveCampaignPreview: {
    venueName: string;
    district: string;
    reviewsGainedThisWeek: number;
    activeMissions: number;
    contributorRank: string;
  };
  activityFeed: Array<{
    id: string;
    message: string;
    timeAgo: string;
  }>;
  leaderboardTop3: Array<{
    id: string;
    name: string;
    points: number;
    badge: Badge;
    xpPct: number;
  }>;
  yourRank: number;
  districtRace: Array<{
    district: string;
    active: number;
    target: number;
  }>;
};

function pointsToBadge(points: number): Badge {
  if (points >= 2000) return "Gold";
  if (points >= 900) return "Silver";
  return "Bronze";
}

function pointsToXpPct(points: number) {
  if (points >= 2000) return 100;
  if (points >= 900) return Math.min(100, Math.round(((points - 900) / 1100) * 100));
  return Math.min(100, Math.round((points / 900) * 100));
}

function formatTimeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getDemoPayload(): LiveCityData {
  return {
    livePill: "LIVE • Vienna Season 1",
    seasonDaysLeft: seasonProgress.daysLeft,
    foundingVenues: seasonProgress.foundingVenues,
    targetFoundingVenues: seasonProgress.targetVenues,
    metricsLabel: "Pilot data",
    activeVenues: landingPilotMetrics.activeVenues,
    missionsCompleted: landingPilotMetrics.missionsCompleted,
    reviewsGenerated: landingPilotMetrics.reviewsGenerated,
    avgRatingImpact: landingPilotMetrics.avgRatingImpact,
    liveCampaignPreview,
    activityFeed: liveActivityFeedSeed.map((item, index) => ({
      id: `feed-${index + 1}`,
      message: item.message,
      timeAgo: item.timeAgo,
    })),
    leaderboardTop3: topContributorsThisWeek.map((item, index) => ({
      id: `top-${index + 1}`,
      name: item.name,
      points: item.points,
      badge: item.badge,
      xpPct: item.xpPct,
    })),
    yourRank: 23,
    districtRace: districtRaceSeed.map((item) => ({ ...item })),
  };
}

export async function getLiveCityData(): Promise<LiveCityData> {
  const demoMode = process.env.DEMO_MODE !== "false";

  if (demoMode) {
    try {
      await ensureViennaLeaderboardSeed();
      await ensureViennaDistrictSeed();
    } catch {
      // If DB is unavailable, demo payload still works.
    }
  }

  if (demoMode) {
    const restaurantCount = await prisma.restaurant.count().catch(() => 0);
    if (restaurantCount === 0) {
      return getDemoPayload();
    }
  }

  try {
    const [
      activeVenues,
      missionsCompleted,
      reviewsGenerated,
      taskCreations,
      approvals,
      topUsers,
      districtsFromSeed,
      districtAggregates,
    ] = await Promise.all([
      prisma.restaurant.count(),
      prisma.taskSubmission.count({ where: { status: SubmissionStatus.approved } }),
      prisma.taskSubmission.count({
        where: {
          status: SubmissionStatus.approved,
          task: { platform: TaskPlatform.google_review },
        },
      }),
      prisma.task.findMany({
        orderBy: { createdAt: "desc" },
        take: 2,
        include: { restaurant: { select: { name: true } } },
      }),
      prisma.taskSubmission.findMany({
        where: { status: SubmissionStatus.approved },
        orderBy: { createdAt: "desc" },
        take: 2,
        include: {
          task: {
            select: {
              platform: true,
              restaurant: { select: { district: true } },
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: UserRole.user },
        orderBy: { picksBalance: "desc" },
        take: 3,
        select: { id: true, picksBalance: true },
      }),
      prisma.gamificationSeed.findMany({
        where: { city: "Vienna" },
        take: 3,
        orderBy: { restaurantsActive: "desc" },
      }),
      prisma.restaurant.groupBy({
        by: ["district"],
        _count: { _all: true },
        where: { district: { not: null } },
      }),
    ]);

    const districtRace =
      districtsFromSeed.length > 0
        ? districtsFromSeed.map((entry) => ({
            district: entry.district,
            active: entry.restaurantsActive,
            target: entry.restaurantsTarget,
          }))
        : districtAggregates
            .filter((entry) => Boolean(entry.district))
            .sort((a, b) => b._count._all - a._count._all)
            .slice(0, 3)
            .map((entry) => ({
              district: entry.district ?? "District",
              active: entry._count._all,
              target: 20,
            }));

    const feed: LiveCityData["activityFeed"] = [];
    for (const item of approvals) {
      const district = item.task.restaurant.district ?? "District";
      const isReview = item.task.platform === TaskPlatform.google_review;
      feed.push({
        id: `approval-${item.id}`,
        message: isReview
          ? `+1 Google review approved — ${district}`
          : `+1 mission approved — ${district}`,
        timeAgo: formatTimeAgo(item.createdAt),
      });
    }
    for (const task of taskCreations) {
      const missionType =
        task.platform === TaskPlatform.instagram
          ? "IG Story"
          : task.platform === TaskPlatform.google_review
            ? "Google Review"
            : "mission";
      feed.push({
        id: `task-${task.id}`,
        message: `${task.restaurant.name} launched ‘${missionType}’ mission`,
        timeAgo: formatTimeAgo(task.createdAt),
      });
    }
    const firstDistrictCross = districtRace.find((item) => item.active >= 5);
    if (firstDistrictCross) {
      feed.push({
        id: "district-cross",
        message: `${firstDistrictCross.district} crossed ${firstDistrictCross.active} venues`,
        timeAgo: "just now",
      });
    }
    while (feed.length < 4) {
      const fallback = liveActivityFeedSeed[feed.length];
      feed.push({
        id: `fallback-${feed.length}`,
        message: fallback.message,
        timeAgo: fallback.timeAgo,
      });
    }

    const leaderboardTop3 =
      topUsers.length > 0
        ? topUsers.map((user, index) => {
            const points = Number(user.picksBalance);
            return {
              id: user.id,
              name: `Contributor #${String(14 + index).padStart(3, "0")}`,
              points,
              badge: pointsToBadge(points),
              xpPct: pointsToXpPct(points),
            };
          })
        : getDemoPayload().leaderboardTop3;

    const safeActive = activeVenues > 0 ? activeVenues : landingPilotMetrics.activeVenues;
    const safeMissions =
      missionsCompleted > 0 ? missionsCompleted : landingPilotMetrics.missionsCompleted;
    const safeReviews =
      reviewsGenerated > 0 ? reviewsGenerated : landingPilotMetrics.reviewsGenerated;
    const avgRatingImpact = Number(
      Math.max(0.1, Math.min(0.9, safeReviews / Math.max(safeMissions, 1))).toFixed(1),
    );

    return {
      livePill: "LIVE • Vienna Season 1",
      seasonDaysLeft: seasonProgress.daysLeft,
      foundingVenues: Math.min(safeActive, seasonProgress.targetVenues),
      targetFoundingVenues: seasonProgress.targetVenues,
      metricsLabel: demoMode ? "Pilot data" : "Live data",
      activeVenues: safeActive,
      missionsCompleted: safeMissions,
      reviewsGenerated: safeReviews,
      avgRatingImpact,
      liveCampaignPreview,
      activityFeed: feed.slice(0, 4),
      leaderboardTop3,
      yourRank: 23,
      districtRace:
        districtRace.length > 0 ? districtRace.slice(0, 3) : getDemoPayload().districtRace,
    };
  } catch {
    return getDemoPayload();
  }
}
