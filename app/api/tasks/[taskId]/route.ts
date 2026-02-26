import { TaskStatus } from "@prisma/client";

import { updateTaskStatus } from "@/src/lib/tasks/taskService";
import { updateTaskStatusSchema } from "@/src/lib/validation/task";

type Params = { params: { taskId: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { status } = updateTaskStatusSchema.parse(body);
    const task = await updateTaskStatus(params.taskId, status as TaskStatus);
    return Response.json(task);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update task status.";
    return Response.json({ error: message }, { status: 400 });
  }
}
