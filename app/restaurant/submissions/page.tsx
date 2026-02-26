import { ShieldCheck } from "lucide-react";
import { SeasonBanner } from "@/src/components/shared/SeasonBanner";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";
import { SubmissionReviewList } from "@/src/components/tasks/SubmissionReviewList";
import { prisma } from "@/src/lib/prisma";

export default async function RestaurantSubmissionsPage() {
  let submissions = [] as any[];
  let dbAvailable = true;
  try {
    const restaurant = await prisma.restaurant.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    const taskIds = restaurant
      ? (
          await prisma.task.findMany({
            where: { restaurantId: restaurant.id },
            select: { id: true },
          })
        ).map((task) => task.id)
      : [];

    submissions = await prisma.taskSubmission.findMany({
      where: taskIds.length ? { taskId: { in: taskIds } } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        task: {
          select: {
            title: true,
          },
        },
      },
      take: 100,
    });
  } catch {
    dbAvailable = false;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <PremiumSurface className="season-section space-y-3">
        <SeasonBanner className="max-w-3xl" />
        <div className="flex flex-wrap gap-2">
          <PremiumChip className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Moderation queue
          </PremiumChip>
          <PremiumChip>Approve trusted proofs</PremiumChip>
          <PremiumChip>View player profiles</PremiumChip>
        </div>
        <h1 className="text-2xl font-semibold">Submission Reviews</h1>
      </PremiumSurface>
      {!dbAvailable ? (
        <p className="text-sm text-muted-foreground">
          Database is not reachable locally yet.
        </p>
      ) : null}
      <SubmissionReviewList
        submissions={submissions.map((submission) => ({
          id: submission.id,
          proofUrl: submission.proofUrl,
          userId: submission.userId,
          taskTitle: submission.task.title,
          status: submission.status,
        }))}
      />
    </main>
  );
}
