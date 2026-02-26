import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { approveSubmission } from "@/src/lib/submissions/submissionService";

type Params = { params: { submissionId: string } };

export async function POST(_: Request, { params }: Params) {
  try {
    const submissionId = await approveSubmission(params.submissionId);
    return Response.json({ submissionId, status: "approved" });
  } catch (error) {
    return toErrorResponse(error, "Approval failed.");
  }
}
