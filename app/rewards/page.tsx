import Link from "next/link";
import { Crown, Flame, MapPin, Sparkles, Trophy, UserCircle2 } from "lucide-react";
import { DailyClaimCard } from "@/src/components/claims/DailyClaimCard";
import { OnboardingQuestRail } from "@/src/components/onboarding/OnboardingQuestRail";
import { ReferralLoopCard } from "@/src/components/onboarding/ReferralLoopCard";
import { SeasonBanner } from "@/src/components/shared/SeasonBanner";
import { PremiumChip, PremiumSoftSurface, PremiumSurface } from "@/src/components/ui/PremiumSurface";
import { getRewardsDemoData } from "@/src/lib/gamification/rewardsDemo";

type Props = {
  searchParams: { userId?: string };
};

export default async function RewardsPage({ searchParams }: Props) {
  const data = await getRewardsDemoData(searchParams.userId);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <PremiumSoftSurface className="space-y-3 p-6">
        <SeasonBanner />
        <div className="flex flex-wrap gap-2">
          <PremiumChip className="inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Vienna leaderboard
          </PremiumChip>
          <PremiumChip className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            User level
          </PremiumChip>
          <PremiumChip className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            District progress
          </PremiumChip>
        </div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-semibold">
          <Crown className="h-5 w-5 text-primary" />
          Rewards Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Offchain points only for the pilot. No token transfer flow in this demo.
        </p>
        <Link href={`/player${searchParams.userId ? `?userId=${searchParams.userId}` : ""}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline">
          <UserCircle2 className="h-4 w-4" />
          Open personal player profile
        </Link>
      </PremiumSoftSurface>

      <div className="grid gap-4 md:grid-cols-2">
        <PremiumSurface className="space-y-3">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
            <Sparkles className="h-4 w-4 text-accent" />
            Your level
          </h2>
          {data.currentUser ? (
            <>
              <p className="text-sm">
                {data.currentUser.level} • {data.currentUser.points} points
              </p>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary shadow-[0_10px_20px_-16px_rgba(2,6,14,0.95)]"
                  style={{ width: `${data.currentUser.progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {data.currentUser.nextLevel
                  ? `${data.currentUser.progressPct}% to ${data.currentUser.nextLevel}`
                  : "Top tier reached"}
              </p>
              <p className="text-xs text-muted-foreground">
                Position: {data.currentUser.rank && data.currentUser.rank <= 99 ? `#${data.currentUser.rank}` : "99+"}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add `?userId=...` to show personal progress and activity.
            </p>
          )}
        </PremiumSurface>

        <PremiumSurface className="space-y-3">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
            <MapPin className="h-4 w-4 text-accent" />
            District progress (Pilot numbers)
          </h2>
          <div className="space-y-2">
            {data.districtProgress.map((district) => (
              <div key={district.district} className="glass-surface rounded-xl p-3">
                <p className="font-display text-sm font-semibold">{district.district}</p>
                <p className="text-xs text-muted-foreground">
                  {district.active}/{district.target} Active
                </p>
              </div>
            ))}
          </div>
        </PremiumSurface>
      </div>

      <PremiumSurface className="space-y-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
          <Trophy className="h-4 w-4 text-primary" />
          Vienna Leaderboard (Top 10)
        </h2>
        <div className="space-y-2">
          {data.leaderboard.map((entry) => (
            <div key={entry.userId} className="glass-surface flex items-center justify-between rounded-xl p-3 text-sm">
              <p className="font-display font-semibold">
                #{entry.rank} {entry.name}
              </p>
              <p className="text-muted-foreground">
                {entry.points} • {entry.level}
              </p>
            </div>
          ))}
        </div>
      </PremiumSurface>

      <PremiumSurface className="space-y-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
          <Flame className="h-4 w-4 text-primary" />
          Recent activity
        </h2>
        {data.activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No user activity loaded yet.</p>
        ) : (
          <div className="space-y-2">
            {data.activity.map((item) => (
              <div key={item.id} className="glass-surface rounded-xl p-3 text-sm">
                {item.type} • {item.amount} • {item.referenceType}
              </div>
            ))}
          </div>
        )}
      </PremiumSurface>

      <DailyClaimCard initialUserId={searchParams.userId ?? ""} />
      <OnboardingQuestRail
        userId={searchParams.userId ?? ""}
        persona="player"
        title="Reward onboarding quests"
      />
      <ReferralLoopCard userId={searchParams.userId ?? ""} />
    </main>
  );
}
