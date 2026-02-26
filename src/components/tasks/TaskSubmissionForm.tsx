"use client";

import { useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTaskPlatformMeta } from "@/src/components/tasks/taskPlatformMeta";
import { RewardBadge } from "@/src/components/ui/RewardBadge";
import { PremiumChip } from "@/src/components/ui/PremiumSurface";
import { actionError, actionSuccess } from "@/src/lib/actionFeedback";

type Props = {
  taskId: string;
  taskPlatform?: string;
  taskTitle?: string;
  rewardAmount?: string;
};

export function TaskSubmissionForm({
  taskId,
  taskPlatform,
  taskTitle,
  rewardAmount,
}: Props) {
  const [userId, setUserId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const platformMeta = getTaskPlatformMeta(taskPlatform);
  const PlatformIcon = platformMeta.icon;

  async function uploadProofImage() {
    if (!proofFile) throw new Error("Please upload a proof image.");
    const formData = new FormData();
    formData.append("file", proofFile);
    const res = await fetch("/api/uploads/proof", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Proof upload failed.");
    }
    return data.url as string;
  }

  async function submitProof() {
    setLoading(true);
    setMessage(null);
    try {
      const proofUrl = await uploadProofImage();
      const res = await fetch(`/api/tasks/${taskId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, proofUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      setMessage(
        "Proof submitted. We review it, then your reward is added automatically.",
      );
      actionSuccess({
        toastMessage: "Proof submitted. Pending review.",
        celebration: {
          type: "milestone",
          title: "Mission submitted",
          subtitle: "Review in progress. Reward unlocks after approval.",
          intensity: "soft",
        },
      });
      setProofFile(null);
      setPreviewUrl(null);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Submit failed.";
      setMessage(text);
      actionError(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-surface space-y-3 rounded-xl p-3 md:p-4">
      {taskTitle ? <p className="text-sm font-semibold text-foreground">{taskTitle}</p> : null}
      <div className="flex flex-wrap gap-2">
        <PremiumChip className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          1 proof per task
        </PremiumChip>
        <PremiumChip className="inline-flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-primary" />
          Manual review
        </PremiumChip>
        {rewardAmount ? <RewardBadge value={rewardAmount} /> : null}
        <PremiumChip>
          <span className="inline-flex items-center gap-1">
            <PlatformIcon className="h-3.5 w-3.5" />
            {platformMeta.label}
          </span>
        </PremiumChip>
      </div>
      <p className="text-xs text-muted-foreground">
        Complete on {platformMeta.label}, upload one clear screenshot, and wait for review.
      </p>
      <div className="grid gap-2 rounded-xl bg-slate-900/45 p-2 text-xs text-muted-foreground md:grid-cols-3">
        <p>1. Do the mission</p>
        <p>2. Upload proof</p>
        <p>3. Get approved reward</p>
      </div>
      <div className="space-y-1">
        <Label>Tasker ID</Label>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your tasker ID"
        />
      </div>
      <div className="space-y-1">
        <Label>Upload proof image</Label>
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setProofFile(file);
            setPreviewUrl(file ? URL.createObjectURL(file) : null);
          }}
        />
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Proof preview"
            className="h-24 w-24 rounded-xl border border-slate-700/70 object-cover"
          />
        ) : null}
      </div>
      <Button
        variant="premium"
        size="hero"
        className="w-full"
        disabled={loading || !userId.trim() || !proofFile}
        onClick={submitProof}
      >
        {loading ? "Submitting..." : "Submit proof and mine PICKS"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <p className="text-xs text-muted-foreground">Proof needed: {platformMeta.proofHint}</p>
    </div>
  );
}
