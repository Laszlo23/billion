import { prisma } from "@/src/lib/prisma";

export type RewardedAdResult = {
  adPlaceholderViewId: string;
  completed: boolean;
  placementKey: string;
};

export class RewardedAdService {
  static async completePlaceholderAd(input: {
    userId: string;
    placementKey: string;
    sessionId?: string;
  }): Promise<RewardedAdResult> {
    const view = await prisma.adPlaceholderView.create({
      data: {
        userId: input.userId,
        placementKey: input.placementKey,
        sessionId: input.sessionId,
        metadata: { placeholder: true },
      },
    });

    return {
      adPlaceholderViewId: view.id,
      completed: true,
      placementKey: input.placementKey,
    };
  }
}
