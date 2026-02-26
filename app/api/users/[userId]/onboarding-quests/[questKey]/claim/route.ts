import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { OnboardingQuestService } from "@/src/lib/gamification/onboardingQuestService";

type Params = { params: { userId: string; questKey: string } };

export async function POST(_: Request, { params }: Params) {
  try {
    const result = await OnboardingQuestService.claimQuestReward(
      params.userId,
      params.questKey,
    );
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error, "Failed to claim quest reward.");
  }
}
