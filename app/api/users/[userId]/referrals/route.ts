import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { ReferralService } from "@/src/lib/gamification/referralService";

type Params = { params: { userId: string } };

export async function GET(_: Request, { params }: Params) {
  try {
    const snapshot = await ReferralService.getReferralSnapshot(params.userId);
    return Response.json(snapshot);
  } catch (error) {
    return toErrorResponse(error, "Failed to load referral data.");
  }
}
