import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { OnboardingQuestService } from "@/src/lib/gamification/onboardingQuestService";

type Params = { params: { userId: string } };

export async function GET(_: Request, { params }: Params) {
  try {
    const quests = await OnboardingQuestService.getQuestState(params.userId);
    return Response.json({ quests });
  } catch (error) {
    return toErrorResponse(error, "Failed to load onboarding quests.");
  }
}
