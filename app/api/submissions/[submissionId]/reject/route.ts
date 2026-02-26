import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { rejectSubmission } from "@/src/lib/submissions/submissionService";

type Params = { params: { submissionId: string } };

export async function POST(_: Request, { params }: Params) {
  try {
    const submission = await rejectSubmission(params.submissionId);
    return Response.json({ submissionId: submission.id, status: "rejected" });
  } catch (error) {
    return toErrorResponse(error, "Reject failed.");
  }
}
