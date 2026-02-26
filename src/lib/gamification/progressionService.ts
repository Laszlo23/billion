import { asDbClient } from "@/src/lib/db/tx";
import type { DbTxClient } from "@/src/lib/db/tx";

const BASE_XP_PER_MISSION = 120;
const BASE_XP_PER_DAILY_CLAIM = 40;

function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 300) + 1);
}

async function ensureProfile(userId: string, tx?: DbTxClient) {
  const db = asDbClient(tx);
  return db.taskerProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export class ProgressionService {
  static async applyMissionCompletion(
    input: {
      userId: string;
      picksAmount: bigint;
      referenceId: string;
    },
    tx?: DbTxClient,
  ) {
    const db = asDbClient(tx);
    const profile = await ensureProfile(input.userId, tx);
    const nextXp = profile.xp + BASE_XP_PER_MISSION;
    const nextLevel = levelFromXp(nextXp);

    await db.taskerProfile.update({
      where: { userId: input.userId },
      data: {
        xp: nextXp,
        level: nextLevel,
        totalMissions: { increment: 1 },
        totalEarned: { increment: input.picksAmount },
      },
    });

    await db.taskEvent.create({
      data: {
        userId: input.userId,
        type: "completed",
        referenceId: input.referenceId,
        picksAmount: input.picksAmount,
        xpGranted: BASE_XP_PER_MISSION,
      },
    });
  }

  static async applyDailyClaim(
    input: {
      userId: string;
      picksAmount: bigint;
      referenceId: string;
    },
    tx?: DbTxClient,
  ) {
    const db = asDbClient(tx);
    const profile = await ensureProfile(input.userId, tx);
    const nextXp = profile.xp + BASE_XP_PER_DAILY_CLAIM;
    const nextLevel = levelFromXp(nextXp);

    await db.taskerProfile.update({
      where: { userId: input.userId },
      data: {
        xp: nextXp,
        level: nextLevel,
        totalEarned: { increment: input.picksAmount },
      },
    });

    await db.taskEvent.create({
      data: {
        userId: input.userId,
        type: "daily_claim",
        referenceId: input.referenceId,
        picksAmount: input.picksAmount,
        xpGranted: BASE_XP_PER_DAILY_CLAIM,
      },
    });
  }
}
