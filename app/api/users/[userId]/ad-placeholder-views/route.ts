import { z } from "zod";

import { RewardedAdService } from "@/src/lib/ads/rewardedAdService";
import { toErrorResponse } from "@/src/lib/http/errorResponse";

const adViewSchema = z.object({
  placementKey: z.string().min(1).max(120).default("daily-claim-card"),
  sessionId: z.string().max(120).optional(),
});

type Params = { params: { userId: string } };

export async function POST(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = adViewSchema.parse(body);
    const adView = await RewardedAdService.completePlaceholderAd({
      userId: params.userId,
      placementKey: parsed.placementKey,
      sessionId: parsed.sessionId,
    });
    return Response.json({
      adPlaceholderViewId: adView.adPlaceholderViewId,
      viewedAt: new Date().toISOString(),
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to record ad view.");
  }
}
