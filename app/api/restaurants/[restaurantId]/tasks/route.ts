import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { createTaskForRestaurant, listTasksByRestaurant } from "@/src/lib/tasks/taskService";
import { createTaskSchema } from "@/src/lib/validation/task";

type Params = { params: { restaurantId: string } };

export async function GET(_: Request, { params }: Params) {
  try {
    const tasks = await listTasksByRestaurant(params.restaurantId);
    return Response.json(tasks);
  } catch (error) {
    return toErrorResponse(error, "Failed to load tasks.");
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = createTaskSchema.parse(body);
    const task = await createTaskForRestaurant({
      restaurantId: params.restaurantId,
      ...parsed,
    });
    return Response.json(task);
  } catch (error) {
    return toErrorResponse(error, "Failed to create task.");
  }
}
