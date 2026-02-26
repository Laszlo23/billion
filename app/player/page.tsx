"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Copy, Sparkles, UserCircle2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingQuestRail } from "@/src/components/onboarding/OnboardingQuestRail";
import { ReferralLoopCard } from "@/src/components/onboarding/ReferralLoopCard";
import { MySubmissionsPanel } from "@/src/components/tasks/MySubmissionsPanel";
import { SocialConnectPanel } from "@/src/components/tasks/SocialConnectPanel";
import { TaskerProgressPanel } from "@/src/components/tasks/TaskerProgressPanel";
import { PremiumChip, PremiumSoftSurface, PremiumSurface } from "@/src/components/ui/PremiumSurface";

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
};

function formatPicks(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat("de-AT").format(amount);
}

export default function PlayerHubPage() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState(searchParams.get("userId") ?? "");
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileUrl = useMemo(() => (userId ? `/player/${userId}` : ""), [userId]);

  useEffect(() => {
    async function loadProfile() {
      if (!userId.trim()) {
        setProfile(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${userId}/profile`);
        const json = (await res.json()) as ProfileResponse & { error?: string };
        if (!res.ok) {
          throw new Error(json.error ?? "Failed to load profile.");
        }
        setProfile(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, [userId]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <PremiumSoftSurface className="season-section space-y-3 p-6">
        <div className="flex flex-wrap gap-2">
          <PremiumChip className="inline-flex items-center gap-1.5">
            <UserCircle2 className="h-3.5 w-3.5 text-accent" />
            Personal player hub
          </PremiumChip>
          <PremiumChip className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Public profile
          </PremiumChip>
          <PremiumChip className="inline-flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            Balance + missions
          </PremiumChip>
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground">My Player Space</h1>
        <p className="text-sm text-muted-foreground">
          See your PICKS balance, completed tasks, and set your public profile for restaurants and other players.
        </p>
      </PremiumSoftSurface>

      <PremiumSurface className="space-y-3">
        <Label htmlFor="player-user-id">Your user ID</Label>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            id="player-user-id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Paste your user ID"
          />
          {userId ? (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(`/player/${userId}`);
                toast.success("Public profile link copied.");
              }}
            >
              <Copy className="mr-1 h-4 w-4" />
              Copy public link
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: share your public profile with venues: <code>{profileUrl || "/player/your-user-id"}</code>
        </p>
      </PremiumSurface>

      {loading ? (
        <PremiumSurface>
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </PremiumSurface>
      ) : null}

      {error ? (
        <PremiumSurface>
          <p className="text-sm text-red-500">{error}</p>
        </PremiumSurface>
      ) : null}

      {profile ? (
        <PremiumSurface className="space-y-3">
          <h2 className="text-lg font-semibold">At a glance</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="glass-surface rounded-xl p-3">
              <p className="text-xs text-muted-foreground">PICKS balance</p>
              <p className="text-xl font-semibold">{formatPicks(profile.user.picksBalance)}</p>
            </div>
            <div className="glass-surface rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Tier</p>
              <p className="text-xl font-semibold">{profile.contributorStatus.tier}</p>
            </div>
            <div className="glass-surface rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Missions done</p>
              <p className="text-xl font-semibold">{profile.contributorStatus.missionsCompleted}</p>
            </div>
            <div className="glass-surface rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Reliability</p>
              <p className="text-xl font-semibold">{profile.contributorStatus.reliabilityPct}%</p>
            </div>
          </div>
          <Link href={`/player/${profile.user.id}`} className="text-sm font-semibold text-primary underline">
            Open public profile preview
          </Link>
        </PremiumSurface>
      ) : null}

      <SocialConnectPanel userId={userId} />
      <OnboardingQuestRail userId={userId} persona="player" title="Your first-session quest path" />
      <ReferralLoopCard userId={userId} />
      <TaskerProgressPanel userId={userId} />
      <MySubmissionsPanel userId={userId} />
    </main>
  );
}
