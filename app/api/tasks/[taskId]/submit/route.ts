import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { createTaskSubmission } from "@/src/lib/submissions/submissionService";
import { createSubmissionSchema } from "@/src/lib/validation/submission";

type Params = { params: { taskId: string } };

export async function POST(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = createSubmissionSchema.parse(body);
    const submission = await createTaskSubmission({
      taskId: params.taskId,
      ...parsed,
    });

    return Response.json(submission);
  } catch (error) {
    return toErrorResponse(error, "Failed to create submission.");
  }
}
