"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PremiumChip,
  PremiumSoftSurface,
  PremiumSurface,
} from "@/src/components/ui/PremiumSurface";
import { actionError, actionSuccess } from "@/src/lib/actionFeedback";

type Props = {
  initialUserId?: string;
};

type ClaimStatus = {
  canClaim: boolean;
  claimAmount: string;
  cooldownEndsAt: string | null;
  lastClaimedAt: string | null;
};

export function DailyClaimCard({ initialUserId = "" }: Props) {
  const [userId, setUserId] = useState(initialUserId);
  const [status, setStatus] = useState<ClaimStatus | null>(null);
  const [adViewId, setAdViewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const cooldownText = useMemo(() => {
    if (!status?.cooldownEndsAt) return null;
    return new Date(status.cooldownEndsAt).toLocaleString();
  }, [status?.cooldownEndsAt]);

  async function loadStatus(targetUserId: string) {
    if (!targetUserId.trim()) return;
    const res = await fetch(`/api/users/${targetUserId}/daily-claim/status`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load claim status.");
    setStatus(data);
  }

  useEffect(() => {
    if (initialUserId) {
      void loadStatus(initialUserId);
    }
  }, [initialUserId]);

  async function handleWatchAd() {
    if (!userId.trim()) {
      setMessage("Please enter your user ID.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}/ad-placeholder-views`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placementKey: "daily-claim-card" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to record ad view.");
      }
      setAdViewId(data.adPlaceholderViewId);
      await loadStatus(userId);
      setMessage("Ad placeholder watched. You can now claim rewards.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Ad step failed.";
      setMessage(text);
      actionError(text);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim() {
    if (!userId.trim()) {
      setMessage("Please enter your user ID.");
      return;
    }
    if (!adViewId) {
      setMessage("Watch the ad placeholder first.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}/daily-claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adPlaceholderViewId: adViewId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Daily claim failed.");
      }
      await loadStatus(userId);
      setAdViewId(null);
      setMessage(
        `Claimed ${data.amount} reward credits. Next claim after ${new Date(
          data.cooldownEndsAt,
        ).toLocaleString()}.`,
      );
      actionSuccess({
        toastMessage: `Daily reward claimed: +${data.amount} PICKS`,
        celebration: {
          type: "reward",
          title: "Daily claim complete",
          subtitle: `+${data.amount} PICKS added`,
          intensity: "medium",
        },
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : "Claim failed.";
      setMessage(text);
      actionError(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PremiumSurface className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <PremiumChip>24h cooldown</PremiumChip>
          <PremiumChip>Ad-supported reward</PremiumChip>
        </div>
        <h3 className="text-lg font-semibold">Daily PICKS Claim</h3>
        <p className="text-sm text-muted-foreground">
          Watch a short sponsored placeholder and claim daily reward credits every 24h.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="claim-user-id">Tasker User ID</Label>
        <Input
          id="claim-user-id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Paste your tasker ID"
        />
      </div>

      {status ? (
        <PremiumSoftSurface className="space-y-1 p-3 text-sm">
          <p>
            Claim amount: <span className="font-medium">{status.claimAmount} credits</span>
          </p>
          <p>Status: {status.canClaim ? "Ready to claim" : "Cooldown active"}</p>
          {cooldownText ? <p>Next claim: {cooldownText}</p> : null}
        </PremiumSoftSurface>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleWatchAd} disabled={loading}>
          Watch ad placeholder
        </Button>
        <Button variant="success" onClick={handleClaim} disabled={loading}>
          Claim rewards
        </Button>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
    </PremiumSurface>
  );
}
