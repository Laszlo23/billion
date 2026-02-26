import { Prisma, SubmissionStatus } from "@prisma/client";

import { withDbTransaction } from "@/src/lib/db/tx";
import { OnboardingQuestService } from "@/src/lib/gamification/onboardingQuestService";
import { ProgressionService } from "@/src/lib/gamification/progressionService";
import { ReferralService } from "@/src/lib/gamification/referralService";
import { StreakService } from "@/src/lib/gamification/streakService";
import { DbPicksProvider } from "@/src/lib/picks/DbPicksProvider";
import { prisma } from "@/src/lib/prisma";

const picksProvider = new DbPicksProvider();

const MAX_SUBMISSIONS_PER_DAY = 5;

export class DomainNotFoundError extends Error {}
export class DomainConflictError extends Error {}
export class DomainValidationError extends Error {}

export async function createTaskSubmission(input: {
  taskId: string;
  userId: string;
  proofUrl: string;
}) {
  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
    select: { id: true, status: true },
  });
  if (!task || task.status !== "active") {
    throw new DomainValidationError("Task is not active.");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const submittedToday = await prisma.taskSubmission.count({
    where: {
      userId: input.userId,
      createdAt: { gte: todayStart },
    },
  });

  if (submittedToday >= MAX_SUBMISSIONS_PER_DAY) {
    throw new DomainConflictError("Daily submission limit reached.");
  }

  const submission = await prisma.taskSubmission.create({
    data: {
      taskId: input.taskId,
      userId: input.userId,
      proofUrl: input.proofUrl,
      status: SubmissionStatus.pending,
    },
  });

  await OnboardingQuestService.trackEvent({
    userId: input.userId,
    triggerType: "mission_submitted",
    referenceId: submission.id,
  });

  return submission;
}

export async function approveSubmission(submissionId: string) {
  return withDbTransaction(
    async (tx) => {
      const submission = await tx.taskSubmission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          status: true,
          userId: true,
          task: {
            select: {
              id: true,
              rewardAmount: true,
              restaurant: { select: { ownerId: true } },
            },
          },
        },
      });
      if (!submission) throw new DomainNotFoundError("Submission not found.");
      if (submission.status !== SubmissionStatus.pending) {
        throw new DomainConflictError("Submission already processed.");
      }

      await tx.taskSubmission.update({
        where: { id: submission.id },
        data: { status: SubmissionStatus.approved },
      });

      const restaurantOwnerId = submission.task.restaurant.ownerId;
      const taskReward = submission.task.rewardAmount;

      await picksProvider.releaseReserve(
        restaurantOwnerId,
        taskReward,
        {
          referenceType: "submission_approval",
          referenceId: submission.id,
          metadata: { submissionId: submission.id, step: "release_reserve" },
        },
        tx,
      );

      await picksProvider.debit(
        restaurantOwnerId,
        taskReward,
        {
          referenceType: "submission_approval",
          referenceId: submission.id,
          counterpartyUserId: submission.userId,
          metadata: { submissionId: submission.id, step: "owner_debit" },
        },
        tx,
      );

      await picksProvider.credit(
        submission.userId,
        taskReward,
        {
          referenceType: "submission_approval",
          referenceId: submission.id,
          counterpartyUserId: restaurantOwnerId,
          metadata: { submissionId: submission.id, step: "user_credit" },
        },
        tx,
      );

      await ProgressionService.applyMissionCompletion(
        {
          userId: submission.userId,
          picksAmount: taskReward,
          referenceId: submission.id,
        },
        tx,
      );
      await StreakService.touchActivity(submission.userId, tx);
      await OnboardingQuestService.trackEvent(
        {
          userId: submission.userId,
          triggerType: "submission_approved",
          referenceId: submission.id,
        },
        tx,
      );
      await OnboardingQuestService.trackEvent(
        {
          userId: restaurantOwnerId,
          triggerType: "submission_reviewed",
          referenceId: submission.id,
        },
        tx,
      );
      await ReferralService.qualifyReferralForUser(
        submission.userId,
        "submission_approved",
        tx,
      );

      return submission.id;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function rejectSubmission(submissionId: string) {
  return withDbTransaction(
    async (tx) => {
      const submission = await tx.taskSubmission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          status: true,
          task: {
            select: {
              restaurant: {
                select: { ownerId: true },
              },
            },
          },
        },
      });
      if (!submission) throw new DomainNotFoundError("Submission not found.");
      if (submission.status !== SubmissionStatus.pending) {
        throw new DomainConflictError("Submission already processed.");
      }

      const updated = await tx.taskSubmission.update({
        where: { id: submission.id },
        data: { status: SubmissionStatus.rejected },
      });

      await OnboardingQuestService.trackEvent(
        {
          userId: submission.task.restaurant.ownerId,
          triggerType: "submission_reviewed",
          referenceId: submission.id,
        },
        tx,
      );

      return updated;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
