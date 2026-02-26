import { Prisma, SubmissionStatus, TaskPlatform, TaskStatus } from "@prisma/client";

import { withDbTransaction } from "@/src/lib/db/tx";
import { OnboardingQuestService } from "@/src/lib/gamification/onboardingQuestService";
import { parsePicksAmount } from "@/src/lib/picks/amount";
import { DbPicksProvider } from "@/src/lib/picks/DbPicksProvider";
import { prisma } from "@/src/lib/prisma";

const picksProvider = new DbPicksProvider();

export async function createTaskForRestaurant(input: {
  restaurantId: string;
  title: string;
  description: string;
  platform?: TaskPlatform;
  rewardAmount: string | number;
}) {
  const rewardAmount = parsePicksAmount(input.rewardAmount);

  return withDbTransaction(
    async (tx) => {
      const restaurant = await tx.restaurant.findUnique({
        where: { id: input.restaurantId },
        select: { id: true, ownerId: true },
      });
      if (!restaurant) throw new Error("Restaurant not found.");

      const task = await tx.task.create({
        data: {
          restaurantId: restaurant.id,
          title: input.title,
          description: input.description,
          platform: input.platform ?? TaskPlatform.other,
          rewardAmount,
          status: TaskStatus.active,
        },
      });

      await picksProvider.reserve(
        restaurant.ownerId,
        rewardAmount,
        {
          referenceType: "task_creation",
          referenceId: task.id,
          metadata: { taskId: task.id, restaurantId: restaurant.id },
        },
        tx,
      );

      await OnboardingQuestService.trackEvent(
        {
          userId: restaurant.ownerId,
          triggerType: "task_created",
          referenceId: task.id,
        },
        tx,
      );

      return task;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  return withDbTransaction(
    async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          status: true,
          rewardAmount: true,
          restaurant: { select: { ownerId: true } },
          submissions: {
            where: { status: SubmissionStatus.approved },
            select: { id: true },
            take: 1,
          },
        },
      });
      if (!task) throw new Error("Task not found.");

      if (task.status === TaskStatus.deleted) return task;

      const updated = await tx.task.update({
        where: { id: task.id },
        data: { status },
      });

      const shouldRelease =
        status === TaskStatus.deleted && task.submissions.length === 0;

      if (shouldRelease) {
        await picksProvider.releaseReserve(
          task.restaurant.ownerId,
          task.rewardAmount,
          {
            referenceType: "task_deletion",
            referenceId: task.id,
            metadata: { taskId: task.id },
          },
          tx,
        );
      }

      return updated;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function listTasksByRestaurant(restaurantId: string) {
  return prisma.task.findMany({
    where: { restaurantId, status: { not: TaskStatus.deleted } },
    orderBy: { createdAt: "desc" },
  });
}
