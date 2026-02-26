import { getDailyClaimStatus } from "@/src/lib/claims/dailyClaimService";
import { toErrorResponse } from "@/src/lib/http/errorResponse";

type Params = { params: { userId: string } };

export async function GET(_: Request, { params }: Params) {
  try {
    const status = await getDailyClaimStatus(params.userId);
    return Response.json(status);
  } catch (error) {
    return toErrorResponse(error, "Failed to load daily claim status.");
  }
}
