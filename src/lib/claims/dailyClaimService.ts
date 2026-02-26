import { Prisma } from "@prisma/client";

import { withDbTransaction } from "@/src/lib/db/tx";
import { OnboardingQuestService } from "@/src/lib/gamification/onboardingQuestService";
import { ProgressionService } from "@/src/lib/gamification/progressionService";
import { StreakService } from "@/src/lib/gamification/streakService";
import { DbPicksProvider } from "@/src/lib/picks/DbPicksProvider";
import {
  DomainConflictError,
  DomainNotFoundError,
  DomainValidationError,
} from "@/src/lib/submissions/submissionService";
import { prisma } from "@/src/lib/prisma";

const DAILY_CLAIM_AMOUNT = BigInt(50);
const DAILY_CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const picksProvider = new DbPicksProvider();

export async function recordAdPlaceholderView(input: {
  userId: string;
  placementKey: string;
  sessionId?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true },
  });
  if (!user) {
    throw new DomainNotFoundError("User not found.");
  }

  return prisma.adPlaceholderView.create({
    data: {
      userId: input.userId,
      placementKey: input.placementKey,
      sessionId: input.sessionId,
      metadata: { source: "daily-claim-placeholder" },
    },
  });
}

export async function getDailyClaimStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) throw new DomainNotFoundError("User not found.");

  const lastClaim = await prisma.dailyClaim.findFirst({
    where: { userId },
    orderBy: { claimedAt: "desc" },
  });

  const now = new Date();
  const canClaim = !lastClaim || lastClaim.cooldownEndsAt <= now;

  return {
    canClaim,
    claimAmount: DAILY_CLAIM_AMOUNT.toString(),
    cooldownEndsAt: lastClaim?.cooldownEndsAt ?? null,
    lastClaimedAt: lastClaim?.claimedAt ?? null,
  };
}

export async function claimDailyPicks(input: {
  userId: string;
  adPlaceholderViewId: string;
}) {
  return withDbTransaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: input.userId },
        select: { id: true },
      });
      if (!user) throw new DomainNotFoundError("User not found.");

      const adView = await tx.adPlaceholderView.findUnique({
        where: { id: input.adPlaceholderViewId },
        select: {
          id: true,
          userId: true,
          claim: { select: { id: true } },
        },
      });

      if (!adView) {
        throw new DomainNotFoundError("Ad placeholder view not found.");
      }
      if (adView.userId !== input.userId) {
        throw new DomainValidationError(
          "Ad placeholder view does not belong to this user.",
        );
      }
      if (adView.claim) {
        throw new DomainConflictError("This ad placeholder view is already claimed.");
      }

      const lastClaim = await tx.dailyClaim.findFirst({
        where: { userId: input.userId },
        orderBy: { claimedAt: "desc" },
      });
      const now = new Date();
      if (lastClaim && lastClaim.cooldownEndsAt > now) {
        throw new DomainConflictError(
          "Daily claim cooldown active. Come back later.",
        );
      }

      const cooldownEndsAt = new Date(now.getTime() + DAILY_CLAIM_COOLDOWN_MS);
      const claim = await tx.dailyClaim.create({
        data: {
          userId: input.userId,
          adPlaceholderViewId: input.adPlaceholderViewId,
          amount: DAILY_CLAIM_AMOUNT,
          cooldownEndsAt,
        },
      });

      await picksProvider.credit(
        input.userId,
        DAILY_CLAIM_AMOUNT,
        {
          referenceType: "daily_claim",
          referenceId: claim.id,
          metadata: {
            adPlaceholderViewId: input.adPlaceholderViewId,
          },
        },
        tx,
      );

      await ProgressionService.applyDailyClaim(
        {
          userId: input.userId,
          picksAmount: DAILY_CLAIM_AMOUNT,
          referenceId: claim.id,
        },
        tx,
      );
      await StreakService.touchActivity(input.userId, tx);
      await OnboardingQuestService.trackEvent(
        {
          userId: input.userId,
          triggerType: "daily_claim",
          referenceId: claim.id,
        },
        tx,
      );

      return {
        claimId: claim.id,
        amount: claim.amount.toString(),
        cooldownEndsAt: claim.cooldownEndsAt,
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
