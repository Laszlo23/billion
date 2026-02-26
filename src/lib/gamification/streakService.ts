import { asDbClient } from "@/src/lib/db/tx";
import type { DbTxClient } from "@/src/lib/db/tx";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayDiff(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export class StreakService {
  static async touchActivity(userId: string, tx?: DbTxClient) {
    const db = asDbClient(tx);
    const profile = await db.taskerProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const now = new Date();
    let currentStreak = 1;
    let streakIncreased = false;
    if (profile.lastActiveAt) {
      const diff = dayDiff(profile.lastActiveAt, now);
      if (diff === 0) {
        currentStreak = profile.currentStreak || 1;
      } else if (diff === 1) {
        currentStreak = Math.max(1, profile.currentStreak + 1);
        streakIncreased = true;
      }
    }
    const highestStreak = Math.max(profile.highestStreak, currentStreak);

    await db.taskerProfile.update({
      where: { userId },
      data: {
        currentStreak,
        highestStreak,
        lastActiveAt: now,
      },
    });

    if (streakIncreased && currentStreak > 1) {
      await db.taskEvent.create({
        data: {
          userId,
          type: "streak_bonus",
          referenceId: `streak-${now.toISOString().slice(0, 10)}`,
          metadata: { currentStreak },
        },
      });
    }
  }
}
