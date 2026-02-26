import { SubmissionStatus, TaskStatus } from "@prisma/client";

import { prisma } from "@/src/lib/prisma";

export type RestaurantDashboardMetrics = {
  totalCampaignBudget: bigint;
  activeCampaigns: number;
  completedActions: number;
  estimatedGrowthValue: bigint;
  rewardDistribution: bigint;
  availableBudget: bigint;
  reservedBudget: bigint;
  campaignRoiEstimatePct: number;
  reviewGrowthProjection: number;
  engagementVelocity: string;
  contributorRatingOverview: string;
  dbAvailable: boolean;
};

export async function getRestaurantDashboardMetrics(
  restaurantId: string,
): Promise<RestaurantDashboardMetrics> {
  try {
    const [restaurant, tasks, approvedSubmissions, allSubmissions] = await Promise.all([
      prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: {
          id: true,
          owner: {
            select: {
              picksBalance: true,
              reservedBalance: true,
            },
          },
        },
      }),
      prisma.task.findMany({
        where: {
          restaurantId,
          status: { in: [TaskStatus.active, TaskStatus.paused] },
        },
        select: {
          id: true,
          status: true,
          rewardAmount: true,
        },
      }),
      prisma.taskSubmission.findMany({
        where: {
          status: SubmissionStatus.approved,
          task: { restaurantId },
        },
        select: {
          id: true,
          task: { select: { rewardAmount: true } },
        },
      }),
      prisma.taskSubmission.findMany({
        where: {
          task: { restaurantId },
        },
        select: {
          id: true,
          status: true,
          userId: true,
        },
      }),
    ]);

    if (!restaurant) {
      return {
        totalCampaignBudget: 0n,
        activeCampaigns: 0,
        completedActions: 0,
        estimatedGrowthValue: 0n,
        rewardDistribution: 0n,
        availableBudget: 0n,
        reservedBudget: 0n,
        campaignRoiEstimatePct: 0,
        reviewGrowthProjection: 0,
        engagementVelocity: "Low",
        contributorRatingOverview: "No data",
        dbAvailable: true,
      };
    }

    const totalCampaignBudget = tasks.reduce(
      (sum, task) => sum + task.rewardAmount,
      0n,
    );
    const activeCampaigns = tasks.filter((task) => task.status === TaskStatus.active).length;
    const completedActions = approvedSubmissions.length;
    const rewardDistribution = approvedSubmissions.reduce(
      (sum, submission) => sum + submission.task.rewardAmount,
      0n,
    );

    // Conservative proxy for value generated from completed actions.
    const estimatedGrowthValue = rewardDistribution * 3n;

    const availableBudget =
      restaurant.owner.picksBalance - restaurant.owner.reservedBalance;
    const campaignRoiEstimatePct =
      rewardDistribution > 0n
        ? Number((estimatedGrowthValue * 100n) / rewardDistribution)
        : 0;
    const reviewGrowthProjection = Math.max(0, completedActions * 4);
    const engagementVelocity =
      completedActions >= 60 ? "High" : completedActions >= 20 ? "Medium" : "Low";
    const approvedContributorIds = new Set(
      allSubmissions
        .filter((submission) => submission.status === SubmissionStatus.approved)
        .map((submission) => submission.userId),
    );
    const contributorApprovalRatePct =
      allSubmissions.length > 0
        ? Math.round((approvedSubmissions.length / allSubmissions.length) * 100)
        : 0;
    const contributorRatingOverview =
      allSubmissions.length > 0
        ? `${approvedContributorIds.size} verified contributors • ${contributorApprovalRatePct}% approval quality`
        : "No contributor data yet";

    return {
      totalCampaignBudget,
      activeCampaigns,
      completedActions,
      estimatedGrowthValue,
      rewardDistribution,
      availableBudget,
      reservedBudget: restaurant.owner.reservedBalance,
      campaignRoiEstimatePct,
      reviewGrowthProjection,
      engagementVelocity,
      contributorRatingOverview,
      dbAvailable: true,
    };
  } catch {
    return {
      totalCampaignBudget: 0n,
      activeCampaigns: 0,
      completedActions: 0,
      estimatedGrowthValue: 0n,
      rewardDistribution: 0n,
      availableBudget: 0n,
      reservedBudget: 0n,
      campaignRoiEstimatePct: 0,
      reviewGrowthProjection: 0,
      engagementVelocity: "Low",
      contributorRatingOverview: "No data",
      dbAvailable: false,
    };
  }
}
