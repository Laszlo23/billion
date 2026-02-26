import Link from "next/link";
import { Flame, NotebookPen } from "lucide-react";

import { SeasonBanner } from "@/src/components/shared/SeasonBanner";
import { OnboardingQuestRail } from "@/src/components/onboarding/OnboardingQuestRail";
import { RestaurantBusinessKpiCards } from "@/src/components/restaurant/RestaurantBusinessKpiCards";
import { RestaurantQrCard } from "@/src/components/qr/RestaurantQrCard";
import { SubmissionReviewList } from "@/src/components/tasks/SubmissionReviewList";
import { RestaurantTaskManager } from "@/src/components/tasks/RestaurantTaskManager";
import { prisma } from "@/src/lib/prisma";
import { getRestaurantDashboardMetrics } from "@/src/lib/restaurant/restaurantDashboardMetricsService";

type Props = {
  searchParams?: { manualEdit?: string };
};

export default async function RestaurantDashboardPage({ searchParams }: Props) {
  let restaurant = null as any;
  let metrics = null as Awaited<ReturnType<typeof getRestaurantDashboardMetrics>> | null;
  let dbAvailable = true;
  try {
    restaurant = await prisma.restaurant.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        categories: {
          include: { items: true },
          take: 3,
        },
        tasks: {
          where: { status: { not: "deleted" } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    const taskIds = restaurant
      ? (
          await prisma.task.findMany({
            where: { restaurantId: restaurant.id },
            select: { id: true },
          })
        ).map((task) => task.id)
      : [];
    const pendingSubmissions = await prisma.taskSubmission.findMany({
      where: taskIds.length
        ? { taskId: { in: taskIds }, status: "pending" }
        : { id: "___none___" },
      orderBy: { createdAt: "desc" },
      include: { task: { select: { title: true } } },
      take: 10,
    });
    if (restaurant) {
      (restaurant as any).pendingSubmissions = pendingSubmissions;
    }
    if (restaurant) {
      metrics = await getRestaurantDashboardMetrics(restaurant.id);
    }
  } catch {
    dbAvailable = false;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-5 py-6 md:px-8 md:py-8">
      <section className="season-section">
        <div className="relative z-10 space-y-2">
          <SeasonBanner className="max-w-3xl" />
          <p className="premium-kicker text-muted-foreground">Restaurant Console</p>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-5xl">
            Growth Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Manage menu, tasks, and approvals in one calm workspace.
          </p>
        </div>
      </section>
      {!dbAvailable ? (
        <p className="text-sm text-muted-foreground">
          Database is not reachable locally yet.
        </p>
      ) : null}
      {searchParams?.manualEdit === "1" ? (
        <div className="glass-surface rounded-xl border-primary/35 bg-primary/20 p-3 text-sm text-foreground">
          AI extraction failed during onboarding. Use <strong>Edit menu</strong> below to enter
          items manually.
        </div>
      ) : null}
      {!restaurant ? (
        <p className="text-muted-foreground">
          No restaurant onboarded yet. Go to onboarding.
        </p>
      ) : (
        <>
          {metrics ? (
            <RestaurantBusinessKpiCards
              totalCampaignBudget={metrics.totalCampaignBudget}
              activeCampaigns={metrics.activeCampaigns}
              completedActions={metrics.completedActions}
              estimatedGrowthValue={metrics.estimatedGrowthValue}
              rewardDistribution={metrics.rewardDistribution}
              availableBudget={metrics.availableBudget}
              reservedBudget={metrics.reservedBudget}
              campaignRoiEstimatePct={metrics.campaignRoiEstimatePct}
              reviewGrowthProjection={metrics.reviewGrowthProjection}
              engagementVelocity={metrics.engagementVelocity}
              contributorRatingOverview={metrics.contributorRatingOverview}
            />
          ) : null}
          <OnboardingQuestRail
            userId={restaurant.ownerId}
            persona="venue"
            title="Venue momentum quests"
          />
          <RestaurantQrCard slug={restaurant.slug} />
          <section className="glass-surface space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
                <NotebookPen className="h-4 w-4 text-primary" />
                Menu preview
              </h2>
              <Link className="text-sm font-semibold text-primary underline" href="/restaurant/onboarding">
                Edit menu
              </Link>
            </div>
            {restaurant.categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {restaurant.categories.map((category: any) => (
                  <div key={category.id} className="glass-surface rounded-lg p-3">
                    <p className="font-display text-sm font-semibold">{category.name}</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {category.items.slice(0, 4).map((item: any) => (
                        <li key={item.id}>
                          {item.name} - {new Intl.NumberFormat("de-AT", { style: "currency", currency: item.currency || "EUR" }).format(Number(item.price) / 100)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
          <RestaurantTaskManager
            restaurantId={restaurant.id}
            initialTasks={restaurant.tasks.map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              platform: task.platform,
              rewardAmount: task.rewardAmount.toString(),
              status: task.status,
            }))}
          />
          <section className="glass-surface space-y-2 p-4">
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
              <Flame className="h-4 w-4 text-primary" />
              Pending submissions
            </h2>
            <p className="text-xs text-muted-foreground">Approve high-quality proofs to release rewards.</p>
            <SubmissionReviewList
              submissions={(restaurant as any).pendingSubmissions.map((submission: any) => ({
                id: submission.id,
                proofUrl: submission.proofUrl,
                userId: submission.userId,
                taskTitle: submission.task.title,
                status: submission.status,
              }))}
            />
          </section>
          <Link className="premium-cta block text-center" href="/restaurant/submissions">
            Open moderation queue
          </Link>
        </>
      )}
      <Link className="premium-cta-secondary block text-center" href="/restaurant/onboarding">
        Open storefront setup
      </Link>
    </main>
  );
}
