import { Prisma, type Prisma as PrismaTypes, ReferralStatus } from "@prisma/client";

import { asDbClient, type DbTxClient, withDbTransaction } from "@/src/lib/db/tx";
import { OnboardingQuestService } from "@/src/lib/gamification/onboardingQuestService";
import { DbPicksProvider } from "@/src/lib/picks/DbPicksProvider";

const picksProvider = new DbPicksProvider();
const REFERRER_REWARD = BigInt(180);
const REFERRED_REWARD = BigInt(120);

export class ReferralError extends Error {}
export class ReferralValidationError extends ReferralError {}
export class ReferralNotFoundError extends ReferralError {}

function generateCodeFromUserId(userId: string) {
  return `BITE-${userId.slice(-6).toUpperCase()}`;
}

async function createUniqueCode(userId: string, tx?: DbTxClient) {
  const db = asDbClient(tx);
  const base = generateCodeFromUserId(userId);
  const existingBase = await db.referralCode.findUnique({ where: { code: base } });
  if (!existingBase) return base;

  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    const existing = await db.referralCode.findUnique({ where: { code: candidate } });
    if (!existing) return candidate;
  }
  return `${base}-${Date.now().toString().slice(-4)}`;
}

export class ReferralService {
  static async getOrCreateCode(userId: string, tx?: DbTxClient) {
    const db = asDbClient(tx);
    const existing = await db.referralCode.findFirst({
      where: { userId, active: true },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return existing;

    const code = await createUniqueCode(userId, tx);
    return db.referralCode.create({
      data: {
        userId,
        code,
        active: true,
      },
    });
  }

  static async applyCode(input: {
    referredUserId: string;
    code: string;
    metadata?: Record<string, unknown>;
  }) {
    return withDbTransaction(
      async (tx) => {
        const referralCode = await tx.referralCode.findUnique({
          where: { code: input.code.trim().toUpperCase() },
          include: { user: { select: { id: true } } },
        });
        if (!referralCode || !referralCode.active) {
          throw new ReferralNotFoundError("Referral code is invalid.");
        }
        if (referralCode.userId === input.referredUserId) {
          throw new ReferralValidationError("You cannot apply your own referral code.");
        }

        const existingReferral = await tx.referral.findUnique({
          where: { referredUserId: input.referredUserId },
        });
        if (existingReferral) {
          return existingReferral;
        }

        const referral = await tx.referral.create({
          data: {
            referrerUserId: referralCode.userId,
            referredUserId: input.referredUserId,
            codeId: referralCode.id,
            status: ReferralStatus.applied,
            metadata: input.metadata as PrismaTypes.InputJsonValue | undefined,
          },
        });

        await OnboardingQuestService.trackEvent(
          {
            userId: input.referredUserId,
            triggerType: "referral_applied",
            referenceId: referral.id,
          },
          tx,
        );

        return referral;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  static async getReferralSnapshot(userId: string) {
    const code = await this.getOrCreateCode(userId);
    const referrals = await asDbClient().referral.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        referredUserId: true,
        status: true,
        createdAt: true,
        qualifiedAt: true,
        rewardedAt: true,
      },
    });

    return {
      code: code.code,
      referrals: referrals.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        qualifiedAt: item.qualifiedAt?.toISOString() ?? null,
        rewardedAt: item.rewardedAt?.toISOString() ?? null,
      })),
    };
  }

  static async qualifyReferralForUser(
    referredUserId: string,
    reason: "submission_approved" | "restaurant_onboarded",
    tx?: DbTxClient,
  ) {
    const db = asDbClient(tx);
    const referral = await db.referral.findUnique({
      where: { referredUserId },
    });
    if (!referral) return null;
    if (referral.status === ReferralStatus.rewarded) return referral;

    const now = new Date();
    const status = ReferralStatus.rewarded;
    const updated = await db.referral.update({
      where: { id: referral.id },
      data: {
        status,
        qualifiedAt: referral.qualifiedAt ?? now,
        rewardedAt: now,
      },
    });

    await picksProvider.credit(
      referral.referrerUserId,
      REFERRER_REWARD,
      {
        referenceType: "referral_bonus",
        referenceId: referral.id,
        counterpartyUserId: referredUserId,
        metadata: { reason, role: "referrer" },
      },
      tx,
    );

    await picksProvider.credit(
      referredUserId,
      REFERRED_REWARD,
      {
        referenceType: "referral_bonus",
        referenceId: referral.id,
        counterpartyUserId: referral.referrerUserId,
        metadata: { reason, role: "referred" },
      },
      tx,
    );

    await OnboardingQuestService.trackEvent(
      {
        userId: referral.referrerUserId,
        triggerType: "referral_conversion",
        referenceId: referral.id,
      },
      tx,
    );
    await OnboardingQuestService.trackEvent(
      {
        userId: referredUserId,
        triggerType: "referral_conversion",
        referenceId: referral.id,
      },
      tx,
    );

    return updated;
  }
}
