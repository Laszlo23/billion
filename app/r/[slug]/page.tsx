import { Beef, CupSoda, Flame, Sparkles, UtensilsCrossed } from "lucide-react";
import { DailyClaimCard } from "@/src/components/claims/DailyClaimCard";
import { OnboardingQuestRail } from "@/src/components/onboarding/OnboardingQuestRail";
import { ReferralLoopCard } from "@/src/components/onboarding/ReferralLoopCard";
import { SeasonBanner } from "@/src/components/shared/SeasonBanner";
import { MySubmissionsPanel } from "@/src/components/tasks/MySubmissionsPanel";
import { PublicMissionBoard } from "@/src/components/tasks/PublicMissionBoard";
import { TaskerProgressPanel } from "@/src/components/tasks/TaskerProgressPanel";
import {
  PremiumChip,
  PremiumSoftSurface,
  PremiumSurface,
} from "@/src/components/ui/PremiumSurface";
import { getRestaurantHeroImage } from "@/src/lib/demo/foodImages";
import { getMenuItemImage } from "@/src/lib/demo/menuItemImages";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: { slug: string };
  searchParams: { userId?: string };
};

function formatPrice(price: bigint, currency: string) {
  const amount = Number(price) / 100;
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function categoryIcon(categoryName: string) {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes("burger") || normalized.includes("grill")) return Beef;
  if (normalized.includes("drink") || normalized.includes("sweet")) return CupSoda;
  if (normalized.includes("cozy") || normalized.includes("plate")) return UtensilsCrossed;
  return Sparkles;
}

export default async function PublicRestaurantPage({
  params,
  searchParams,
}: Params) {
  let restaurant = null as any;
  try {
    restaurant = await prisma.restaurant.findUnique({
      where: { slug: params.slug },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
        tasks: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-sm text-muted-foreground">
          Database is not reachable locally yet.
        </p>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p>Restaurant not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-6 md:px-8 md:py-8">
      <PremiumSoftSurface className="season-section space-y-4 p-6">
        <SeasonBanner className="relative z-10" />
        <div className="premium-hero-media mb-2 h-48 w-full">
          <img
            src={getRestaurantHeroImage(restaurant.slug)}
            alt={`${restaurant.name} hero`}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 z-10 p-4 text-white">
            <p className="text-base font-semibold">{restaurant.name}</p>
            <p className="text-xs text-white/85">Live contributor layer</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <PremiumChip>Live menu</PremiumChip>
          <PremiumChip>Task board</PremiumChip>
          <PremiumChip>Rewards</PremiumChip>
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground">{restaurant.name}</h1>
        <p className="text-sm text-muted-foreground">
          Pick a task, post once, upload proof, and get rewarded after review.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: Add <code>?userId=your-id</code> to unlock your profile and submission history.
        </p>
      </PremiumSoftSurface>

      <section id="menu" className="space-y-4 scroll-mt-24">
        <h2 className="premium-section-title">Menu</h2>
        {restaurant.categories.map((category: any) => (
          <PremiumSurface key={category.id} className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              {(() => {
                const CategoryIcon = categoryIcon(category.name);
                return (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-500/40 bg-slate-900/60">
                    <CategoryIcon className="h-4 w-4 text-accent" />
                  </span>
                );
              })()}
              <h3 className="font-display text-base font-medium text-slate-100">{category.name}</h3>
            </div>
            <ul className="mt-2 space-y-2 text-sm">
              {category.items.map((item: any) => (
                <li
                  key={item.id}
                  className="glass-surface flex items-center gap-3 rounded-xl p-2.5"
                >
                  <img
                    src={getMenuItemImage(item.name, category.name)}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg border border-slate-500/45 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Fresh kitchen favorite</p>
                  </div>
                  <span className="rounded-full border border-primary/45 bg-primary/20 px-2.5 py-1 text-xs font-semibold text-foreground">
                    {formatPrice(item.price, item.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </PremiumSurface>
        ))}
      </section>

      <section id="tasks" className="scroll-mt-24">
        <div className="mb-3 flex flex-wrap gap-2">
          <PremiumChip className="inline-flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" />
            One mission at a time
          </PremiumChip>
          <PremiumChip>Post once, upload once, earn after approval</PremiumChip>
        </div>
        <PublicMissionBoard
          restaurantName={restaurant.name}
          tasks={restaurant.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            platform: task.platform,
            rewardAmount: task.rewardAmount.toString(),
          }))}
        />
      </section>

      <section id="rewards" className="scroll-mt-24 space-y-4">
        <DailyClaimCard initialUserId={searchParams.userId ?? ""} />
        <OnboardingQuestRail
          userId={searchParams.userId ?? ""}
          persona="player"
          title="Tonight's starter quests"
        />
        <ReferralLoopCard userId={searchParams.userId ?? ""} />
      </section>
      {searchParams.userId ? (
        <>
          <TaskerProgressPanel userId={searchParams.userId} />
          <MySubmissionsPanel userId={searchParams.userId} />
        </>
      ) : (
        <PremiumSurface>
          <p className="text-sm font-medium text-foreground">Want your personal progress view?</p>
          <p className="text-xs text-muted-foreground">
            Open this page with <code>?userId=your-id</code> to see rank and submissions.
          </p>
        </PremiumSurface>
      )}

      <nav className="glass-surface-strong fixed inset-x-0 bottom-20 z-30 mx-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl p-1 shadow-lg md:hidden">
        <div className="grid grid-cols-3 gap-1 text-center text-sm">
          <a href="#menu" className="rounded-xl px-3 py-2 font-semibold text-foreground">
            Menu
          </a>
          <a href="#tasks" className="rounded-xl px-3 py-2 font-semibold text-foreground">
            Tasks
          </a>
          <a href="#rewards" className="rounded-xl px-3 py-2 font-semibold text-foreground">
            Rewards
          </a>
        </div>
      </nav>
    </main>
  );
}
