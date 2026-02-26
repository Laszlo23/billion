import { z } from "zod";

import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { ReferralService } from "@/src/lib/gamification/referralService";

const applyReferralSchema = z.object({
  referredUserId: z.string().min(1),
  code: z.string().min(3).max(32),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = applyReferralSchema.parse(body);
    const referral = await ReferralService.applyCode(parsed);
    return Response.json({ referral });
  } catch (error) {
    return toErrorResponse(error, "Failed to apply referral code.");
  }
}
