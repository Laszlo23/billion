import { TaskCreateForm } from "@/src/components/tasks/TaskCreateForm";
import { prisma } from "@/src/lib/prisma";

export default async function NewTaskPage() {
  let restaurant = null as any;
  let dbAvailable = true;
  try {
    restaurant = await prisma.restaurant.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
  } catch {
    dbAvailable = false;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <h1 className="text-2xl font-semibold">Create Task</h1>
      {!dbAvailable ? (
        <p className="text-sm text-muted-foreground">
          Database is not reachable locally yet.
        </p>
      ) : null}
      {!restaurant ? (
        <p>Onboard a restaurant first.</p>
      ) : (
        <TaskCreateForm restaurantId={restaurant.id} />
      )}
    </main>
  );
}
