import { Prisma, type OnboardingQuestPersona, type OnboardingQuestTriggerType } from "@prisma/client";

import { asDbClient, type DbTxClient, withDbTransaction } from "@/src/lib/db/tx";
import { DbPicksProvider } from "@/src/lib/picks/DbPicksProvider";

const picksProvider = new DbPicksProvider();

export class OnboardingQuestError extends Error {}
export class OnboardingQuestNotFoundError extends OnboardingQuestError {}
export class OnboardingQuestClaimError extends OnboardingQuestError {}

type QuestState = {
  key: string;
  title: string;
  description: string;
  persona: OnboardingQuestPersona;
  triggerType: OnboardingQuestTriggerType;
  targetCount: number;
  rewardPicks: string;
  rewardXp: number;
  progress: number;
  status: "in_progress" | "completed" | "claimed";
  completedAt: string | null;
  rewardClaimedAt: string | null;
};

function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 300) + 1);
}

function personaForRole(role: "restaurant" | "user" | "admin"): OnboardingQuestPersona[] {
  if (role === "restaurant") return ["venue", "both"];
  return ["player", "both"];
}

async function upsertQuestCompletionEvent(
  input: { userId: string; questKey: string; progressId: string },
  tx?: DbTxClient,
) {
  const db = asDbClient(tx);
  try {
    await db.taskEvent.create({
      data: {
        userId: input.userId,
        type: "onboarding_quest_completed",
        referenceId: input.progressId,
        metadata: { questKey: input.questKey },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }
    throw error;
  }
}

export class OnboardingQuestService {
  static async getQuestState(userId: string, tx?: DbTxClient): Promise<QuestState[]> {
    const db = asDbClient(tx);
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new OnboardingQuestNotFoundError("User not found.");

    const quests = await db.onboardingQuest.findMany({
      where: {
        active: true,
        persona: { in: personaForRole(user.role) },
      },
      orderBy: [{ persona: "asc" }, { createdAt: "asc" }],
    });

    const progresses = await db.userOnboardingQuestProgress.findMany({
      where: {
        userId,
        questId: { in: quests.map((quest) => quest.id) },
      },
    });
    const progressByQuestId = new Map(progresses.map((item) => [item.questId, item]));

    return quests.map((quest) => {
      const progress = progressByQuestId.get(quest.id);
      return {
        key: quest.key,
        title: quest.title,
        description: quest.description,
        persona: quest.persona,
        triggerType: quest.triggerType,
        targetCount: quest.targetCount,
        rewardPicks: quest.rewardPicks.toString(),
        rewardXp: quest.rewardXp,
        progress: progress?.progress ?? 0,
        status: progress?.status ?? "in_progress",
        completedAt: progress?.completedAt ? progress.completedAt.toISOString() : null,
        rewardClaimedAt: progress?.rewardClaimedAt
          ? progress.rewardClaimedAt.toISOString()
          : null,
      };
    });
  }

  static async trackEvent(
    input: {
      userId: string;
      triggerType: OnboardingQuestTriggerType;
      referenceId: string;
      progressIncrement?: number;
      metadata?: Record<string, unknown>;
    },
    tx?: DbTxClient,
  ) {
    const db = asDbClient(tx);
    const user = await db.user.findUnique({
      where: { id: input.userId },
      select: { role: true },
    });
    if (!user) throw new OnboardingQuestNotFoundError("User not found.");

    const quests = await db.onboardingQuest.findMany({
      where: {
        active: true,
        triggerType: input.triggerType,
        persona: { in: personaForRole(user.role) },
      },
    });
    if (!quests.length) return [];

    const completedQuestKeys: string[] = [];
    const incrementBy = Math.max(1, input.progressIncrement ?? 1);

    for (const quest of quests) {
      const existing = await db.userOnboardingQuestProgress.findUnique({
        where: {
          userId_questId: {
            userId: input.userId,
            questId: quest.id,
          },
        },
      });

      if (existing?.status === "claimed") continue;

      const nextProgress = Math.min(
        quest.targetCount,
        (existing?.progress ?? 0) + incrementBy,
      );
      const shouldComplete =
        nextProgress >= quest.targetCount &&
        (!existing || existing.status === "in_progress");

      const progress = await db.userOnboardingQuestProgress.upsert({
        where: {
          userId_questId: {
            userId: input.userId,
            questId: quest.id,
          },
        },
        update: {
          progress: nextProgress,
          status: shouldComplete ? "completed" : existing?.status ?? "in_progress",
          completedAt: shouldComplete ? new Date() : existing?.completedAt ?? null,
        },
        create: {
          userId: input.userId,
          questId: quest.id,
          progress: nextProgress,
          status: shouldComplete ? "completed" : "in_progress",
          completedAt: shouldComplete ? new Date() : null,
        },
      });

      if (shouldComplete) {
        completedQuestKeys.push(quest.key);
        await upsertQuestCompletionEvent(
          { userId: input.userId, questKey: quest.key, progressId: progress.id },
          tx,
        );
      }
    }

    return completedQuestKeys;
  }

  static async claimQuestReward(userId: string, questKey: string) {
    return withDbTransaction(
      async (tx) => {
        const quest = await tx.onboardingQuest.findUnique({
          where: { key: questKey },
        });
        if (!quest || !quest.active) {
          throw new OnboardingQuestNotFoundError("Quest not found.");
        }

        const progress = await tx.userOnboardingQuestProgress.findUnique({
          where: {
            userId_questId: {
              userId,
              questId: quest.id,
            },
          },
        });

        if (!progress || progress.status === "in_progress") {
          throw new OnboardingQuestClaimError("Quest is not completed yet.");
        }
        if (progress.status === "claimed") {
          return {
            questKey,
            rewardPicks: quest.rewardPicks.toString(),
            rewardXp: quest.rewardXp,
            status: "already_claimed" as const,
          };
        }

        if (quest.rewardPicks > 0) {
          await picksProvider.credit(
            userId,
            quest.rewardPicks,
            {
              referenceType: "onboarding_quest_reward",
              referenceId: progress.id,
              metadata: { questKey },
            },
            tx,
          );
        }

        if (quest.rewardXp > 0) {
          const profile = await tx.taskerProfile.upsert({
            where: { userId },
            update: {},
            create: { userId },
          });
          const xp = profile.xp + quest.rewardXp;
          await tx.taskerProfile.update({
            where: { userId },
            data: {
              xp,
              level: levelFromXp(xp),
            },
          });
        }

        await tx.userOnboardingQuestProgress.update({
          where: { id: progress.id },
          data: {
            status: "claimed",
            rewardClaimedAt: new Date(),
          },
        });

        return {
          questKey,
          rewardPicks: quest.rewardPicks.toString(),
          rewardXp: quest.rewardXp,
          status: "claimed" as const,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
