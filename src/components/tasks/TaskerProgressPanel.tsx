"use client";

import { useEffect, useState } from "react";
import { Activity, Flame, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";
import { SocialConnectPanel } from "@/src/components/tasks/SocialConnectPanel";

type Props = {
  userId: string;
};

type ProfileResponse = {
  user: { id: string; email: string | null; picksBalance: string };
  contributorStatus: {
    tier: "Bronze" | "Silver" | "Gold" | "Elite";
    reputationScore: number;
    missionsCompleted: number;
    reliabilityPct: number;
  };
  profile: {
    xp: number;
    level: number;
    currentStreak: number;
    highestStreak: number;
    totalMissions: number;
    totalEarned: string;
    lastActiveAt: string | null;
  } | null;
  recentEvents: Array<{
    id: string;
    type: string;
    picksAmount: string | null;
    xpGranted: number | null;
    createdAt: string;
  }>;
};

export function TaskerProgressPanel({ userId }: Props) {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!userId.trim()) return;
      setError(null);
      try {
        const res = await fetch(`/api/users/${userId}/profile`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "Failed to load profile.");
        }
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      }
    }
    void load();
  }, [userId]);

  if (!userId.trim()) {
    return (
      <PremiumSurface>
        <h3 className="text-lg font-semibold">Tasker Profile</h3>
        <p className="text-sm text-muted-foreground">
          Enter your contributor user ID to see tier, reliability, and mission stats.
        </p>
      </PremiumSurface>
    );
  }

  if (error) {
    return (
      <PremiumSurface>
        <h3 className="text-lg font-semibold">Tasker Profile</h3>
        <p className="text-sm text-red-500">{error}</p>
      </PremiumSurface>
    );
  }

  if (!data) {
    return (
      <PremiumSurface>
        <h3 className="text-lg font-semibold">Tasker Profile</h3>
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </PremiumSurface>
    );
  }

  return (
    <div className="space-y-3">
      <PremiumSurface className="section-shell section-shell-dark infra-grid-overlay space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-100">
            <Trophy className="h-4 w-4 text-primary" />
            Contributor Profile
          </h3>
          <span className="rounded-full bg-primary/30 px-3 py-1 text-xs font-semibold text-slate-100">
            {data.contributorStatus.tier}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <PremiumChip className="inline-flex items-center gap-1.5 bg-slate-900/60 text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Reputation system
          </PremiumChip>
          <PremiumChip className="inline-flex items-center gap-1.5 bg-slate-900/60 text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Reliability scoring
          </PremiumChip>
          <PremiumChip className="inline-flex items-center gap-1.5 bg-slate-900/60 text-slate-200">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Performance history
          </PremiumChip>
        </div>
        <div className="grid gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-100">
            Reputation: {data.contributorStatus.reputationScore}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-100">
            Missions: {data.contributorStatus.missionsCompleted}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-100">
            Reliability: {data.contributorStatus.reliabilityPct}%
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-100">
            Level: {data.profile?.level ?? 1}
          </div>
        </div>
        <div className="text-xs text-slate-300">
          XP: {data.profile?.xp ?? 0} | Current streak: {data.profile?.currentStreak ?? 0} |
          Total earned: {data.profile?.totalEarned ?? "0"}
        </div>
        {data.recentEvents.length > 0 ? (
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Flame className="h-3.5 w-3.5 text-primary" />
              Recent activity
            </p>
            {data.recentEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-xs text-slate-100">
                {event.type} | +{event.picksAmount ?? "0"} PICKS | +{event.xpGranted ?? 0} XP
              </div>
            ))}
          </div>
        ) : null}
      </PremiumSurface>
      <SocialConnectPanel userId={userId} />
    </div>
  );
}
