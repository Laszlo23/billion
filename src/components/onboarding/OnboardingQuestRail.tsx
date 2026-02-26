"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Gift, Loader2, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";
import { actionError, actionSuccess } from "@/src/lib/actionFeedback";

type QuestStatus = "in_progress" | "completed" | "claimed";
type QuestPersona = "player" | "venue" | "both";

type QuestState = {
  key: string;
  title: string;
  description: string;
  persona: QuestPersona;
  targetCount: number;
  rewardPicks: string;
  rewardXp: number;
  progress: number;
  status: QuestStatus;
};

type Props = {
  userId: string;
  persona: "player" | "venue";
  title?: string;
  className?: string;
};

function statusLabel(status: QuestStatus) {
  if (status === "claimed") return "Claimed";
  if (status === "completed") return "Ready to claim";
  return "In progress";
}

export function OnboardingQuestRail({ userId, persona, title, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [claimingKey, setClaimingKey] = useState<string | null>(null);
  const [quests, setQuests] = useState<QuestState[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadQuests = useCallback(async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}/onboarding-quests`);
      const json = (await res.json()) as { quests?: QuestState[]; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load onboarding quests.");
      }
      const filtered = (json.quests ?? []).filter(
        (quest) => quest.persona === "both" || quest.persona === persona,
      );
      setQuests(filtered);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load quests.");
    } finally {
      setLoading(false);
    }
  }, [persona, userId]);

  useEffect(() => {
    void loadQuests();
  }, [loadQuests]);

  const completion = useMemo(() => {
    const total = quests.length;
    const done = quests.filter((quest) => quest.status === "claimed").length;
    return { total, done };
  }, [quests]);

  async function claimQuest(questKey: string) {
    setClaimingKey(questKey);
    try {
      const res = await fetch(`/api/users/${userId}/onboarding-quests/${questKey}/claim`, {
        method: "POST",
      });
      const json = (await res.json()) as {
        status?: "claimed" | "already_claimed";
        rewardPicks?: string;
        rewardXp?: number;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Could not claim reward.");
      }
      actionSuccess({
        toastMessage:
          json.status === "claimed"
            ? `Reward claimed: +${json.rewardPicks ?? "0"} PICKS, +${json.rewardXp ?? 0} XP`
            : "Reward already claimed.",
        celebration:
          json.status === "claimed"
            ? {
                type: "reward",
                title: "Quest reward unlocked",
                subtitle: `+${json.rewardPicks ?? "0"} PICKS and +${json.rewardXp ?? 0} XP`,
                intensity: "medium",
              }
            : undefined,
      });
      await loadQuests();
    } catch (error) {
      actionError(error instanceof Error ? error.message : "Could not claim reward.");
    } finally {
      setClaimingKey(null);
    }
  }

  if (!userId.trim()) {
    return (
      <PremiumSurface className={className}>
        <p className="text-sm text-muted-foreground">
          Add your user ID to unlock your onboarding quests and rewards.
        </p>
      </PremiumSurface>
    );
  }

  return (
    <PremiumSurface
      variant={completion.done > 0 ? "celebrate" : "default"}
      className={`space-y-3 ${className ?? ""}`.trim()}
    >
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
          <Target className="h-4 w-4 text-primary" />
          {title ?? (persona === "venue" ? "Venue launch quests" : "Starter quests")}
        </h3>
        <PremiumChip>
          {completion.done}/{completion.total} claimed
        </PremiumChip>
      </div>

      {loading ? (
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading quests...
        </div>
      ) : null}

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="space-y-2">
        {quests.map((quest) => {
          const progressPct = Math.min(100, Math.round((quest.progress / Math.max(1, quest.targetCount)) * 100));
          return (
            <article key={quest.key} className="glass-surface space-y-2 rounded-xl p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{quest.title}</p>
                <span className="text-xs text-muted-foreground">{statusLabel(quest.status)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{quest.description}</p>
              <div className="h-1.5 rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#00E0FF]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <PremiumChip className="inline-flex items-center gap-1">
                  <Gift className="h-3.5 w-3.5 text-primary" />
                  +{quest.rewardPicks} PICKS
                </PremiumChip>
                <PremiumChip>+{quest.rewardXp} XP</PremiumChip>
                <span>
                  {quest.progress}/{quest.targetCount}
                </span>
              </div>
              {quest.status === "completed" ? (
                <Button
                  size="sm"
                  variant="premium"
                  disabled={claimingKey === quest.key}
                  onClick={() => void claimQuest(quest.key)}
                >
                  {claimingKey === quest.key ? "Claiming..." : "Claim now"}
                </Button>
              ) : null}
              {quest.status === "claimed" ? (
                <p className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Reward received
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </PremiumSurface>
  );
}
