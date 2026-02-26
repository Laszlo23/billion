import { TaskList } from "@/src/components/tasks/TaskList";
import { prisma } from "@/src/lib/prisma";

export default async function RestaurantTasksPage() {
  let restaurant = null as any;
  let dbAvailable = true;
  try {
    restaurant = await prisma.restaurant.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        tasks: {
          where: { status: { not: "deleted" } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    dbAvailable = false;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <h1 className="text-2xl font-semibold">Restaurant Tasks</h1>
      {!dbAvailable ? (
        <p className="text-sm text-muted-foreground">
          Database is not reachable locally yet.
        </p>
      ) : null}
      {!restaurant ? (
        <p>No restaurant found.</p>
      ) : (
        <TaskList
          tasks={restaurant.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            platform: task.platform,
            rewardAmount: task.rewardAmount.toString(),
            status: task.status,
          }))}
        />
      )}
    </main>
  );
}
