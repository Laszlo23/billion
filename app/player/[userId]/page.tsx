import Link from "next/link";
import { ExternalLink, Instagram, Linkedin, Music2, ShieldCheck, Trophy, Wallet } from "lucide-react";

import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: { userId: string };
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function displayNameFromData(email: string | null, handles: string[]) {
  const firstHandle = handles.find((handle) => handle);
  if (firstHandle) return `@${firstHandle}`;
  if (email) return email.split("@")[0] ?? "Player";
  return "Anonymous Player";
}

export default async function PublicPlayerPage({ params }: Params) {
  let user: any = null;
  let profile: any = null;
  let recentSubmissions: any[] = [];
  let dbAvailable = true;
  try {
    user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, email: true, picksBalance: true },
    });
    if (user) {
      profile = await prisma.taskerProfile.findUnique({
        where: { userId: params.userId },
      });
      recentSubmissions = await prisma.taskSubmission.findMany({
        where: { userId: params.userId, status: "approved" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          task: {
            select: {
              title: true,
              rewardAmount: true,
              restaurant: { select: { name: true, slug: true } },
            },
          },
        },
      });
    }
  } catch {
    dbAvailable = false;
  }

  if (!dbAvailable) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-sm text-muted-foreground">Database is not reachable locally yet.</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-sm text-muted-foreground">Player not found.</p>
      </main>
    );
  }

  const socialHandles = [
    profile?.instagramHandle ?? "",
    profile?.tiktokHandle ?? "",
    profile?.linkedinHandle ?? "",
  ];
  const displayName = displayNameFromData(user.email, socialHandles);
  const level = profile?.level ?? 1;
  const totalMissions = profile?.totalMissions ?? recentSubmissions.length;
  const reliability = totalMissions > 0 ? Math.round((recentSubmissions.length / totalMissions) * 100) : 0;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <PremiumSurface className="season-section space-y-4">
        <div className="flex items-center gap-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-accent/35 bg-slate-900/60 text-lg font-semibold text-foreground">
            {initials(displayName)}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">Public contributor profile</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <PremiumChip className="inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Level {level}
          </PremiumChip>
          <PremiumChip className="inline-flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            {user.picksBalance.toString()} PICKS
          </PremiumChip>
          <PremiumChip className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Reliability {reliability}%
          </PremiumChip>
        </div>
      </PremiumSurface>

      <div className="grid gap-4 md:grid-cols-3">
        <PremiumSurface className="space-y-2">
          <p className="text-xs text-muted-foreground">Missions completed</p>
          <p className="text-2xl font-semibold">{totalMissions}</p>
        </PremiumSurface>
        <PremiumSurface className="space-y-2">
          <p className="text-xs text-muted-foreground">Current streak</p>
          <p className="text-2xl font-semibold">{profile?.currentStreak ?? 0}</p>
        </PremiumSurface>
        <PremiumSurface className="space-y-2">
          <p className="text-xs text-muted-foreground">Total earned</p>
          <p className="text-2xl font-semibold">{profile?.totalEarned?.toString() ?? "0"}</p>
        </PremiumSurface>
      </div>

      <PremiumSurface className="space-y-3">
        <h2 className="text-lg font-semibold">Connected socials</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="glass-surface rounded-xl p-3 text-sm">
            <p className="inline-flex items-center gap-1.5 font-medium">
              <Instagram className="h-4 w-4 text-primary" />
              Instagram
            </p>
            <p className="text-muted-foreground">{profile?.instagramHandle ? `@${profile.instagramHandle}` : "Not set"}</p>
          </div>
          <div className="glass-surface rounded-xl p-3 text-sm">
            <p className="inline-flex items-center gap-1.5 font-medium">
              <Music2 className="h-4 w-4 text-primary" />
              TikTok
            </p>
            <p className="text-muted-foreground">{profile?.tiktokHandle ? `@${profile.tiktokHandle}` : "Not set"}</p>
          </div>
          <div className="glass-surface rounded-xl p-3 text-sm">
            <p className="inline-flex items-center gap-1.5 font-medium">
              <Linkedin className="h-4 w-4 text-primary" />
              LinkedIn
            </p>
            <p className="text-muted-foreground">{profile?.linkedinHandle ? `@${profile.linkedinHandle}` : "Not set"}</p>
          </div>
        </div>
      </PremiumSurface>

      <PremiumSurface className="space-y-3">
        <h2 className="text-lg font-semibold">Recent approved missions</h2>
        {recentSubmissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved missions yet.</p>
        ) : (
          <div className="space-y-2">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="glass-surface rounded-xl p-3 text-sm">
                <p className="font-medium">{submission.task.title}</p>
                <p className="text-muted-foreground">
                  {submission.task.restaurant.name} • +{submission.task.rewardAmount.toString()} PICKS
                </p>
                <Link
                  href={`/r/${submission.task.restaurant.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline"
                >
                  View restaurant
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </PremiumSurface>
    </main>
  );
}
