import { z } from "zod";

import { claimDailyPicks } from "@/src/lib/claims/dailyClaimService";
import { toErrorResponse } from "@/src/lib/http/errorResponse";

const claimSchema = z.object({
  adPlaceholderViewId: z.string().min(1),
});

type Params = { params: { userId: string } };

export async function POST(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = claimSchema.parse(body);
    const result = await claimDailyPicks({
      userId: params.userId,
      adPlaceholderViewId: parsed.adPlaceholderViewId,
    });
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error, "Failed to claim daily PICKS.");
  }
}
