"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Gift, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";

type ReferralItem = {
  id: string;
  referredUserId: string;
  status: "applied" | "qualified" | "rewarded";
  createdAt: string;
  qualifiedAt: string | null;
  rewardedAt: string | null;
};

type Snapshot = {
  code: string;
  referrals: ReferralItem[];
};

type Props = {
  userId: string;
  className?: string;
};

export function ReferralLoopCard({ userId, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [applyCode, setApplyCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loadSnapshot = useCallback(async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}/referrals`);
      const json = (await res.json()) as Snapshot & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load referral data.");
      }
      setSnapshot(json);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load referrals.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  const rewardedCount = useMemo(
    () => snapshot?.referrals.filter((item) => item.status === "rewarded").length ?? 0,
    [snapshot],
  );

  async function handleApplyCode() {
    if (!userId.trim() || !applyCode.trim()) return;
    try {
      const res = await fetch("/api/referrals/apply-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referredUserId: userId, code: applyCode.trim().toUpperCase() }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Could not apply referral code.");
      }
      toast.success("Referral code applied. Complete your first approved mission to unlock rewards.");
      setApplyCode("");
      await loadSnapshot();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply referral code.");
    }
  }

  return (
    <PremiumSurface className={`space-y-3 ${className ?? ""}`.trim()}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
          <Users className="h-4 w-4 text-accent" />
          Bring friends, earn faster
        </h3>
        <PremiumChip className="inline-flex items-center gap-1">
          <Gift className="h-3.5 w-3.5 text-primary" />
          {rewardedCount} rewarded
        </PremiumChip>
      </div>

      <p className="text-sm text-muted-foreground">
        Share your code. When a friend gets their first approved mission, both get bonus PICKS.
      </p>

      {snapshot?.code ? (
        <div className="glass-surface flex items-center justify-between rounded-xl p-3">
          <p className="text-sm font-semibold text-foreground">{snapshot.code}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(snapshot.code);
              toast.success("Referral code copied.");
            }}
          >
            <Copy className="mr-1 h-3.5 w-3.5" />
            Copy
          </Button>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Have a referral code?</p>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            value={applyCode}
            onChange={(event) => setApplyCode(event.target.value)}
            placeholder="Paste code (e.g. BITE-ABC123)"
          />
          <Button type="button" onClick={() => void handleApplyCode()} disabled={!applyCode.trim()}>
            Apply code
          </Button>
        </div>
      </div>

      {loading ? <p className="text-xs text-muted-foreground">Loading referrals...</p> : null}
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

      {snapshot?.referrals.length ? (
        <div className="space-y-2">
          {snapshot.referrals.slice(0, 5).map((item) => (
            <div key={item.id} className="glass-surface flex items-center justify-between rounded-xl p-3 text-xs">
              <p className="text-muted-foreground">{item.referredUserId}</p>
              <p className="font-semibold text-foreground">{item.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No referrals yet. Share your code to start your loop.</p>
      )}
    </PremiumSurface>
  );
}
