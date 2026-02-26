"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";

type SubmissionItem = {
  id: string;
  status: "pending" | "approved" | "rejected";
  proofUrl: string;
  createdAt: string;
  task: {
    title: string;
    rewardAmount: string;
    restaurant: { name: string; slug: string };
  };
};

type Props = {
  userId: string;
};

export function MySubmissionsPanel({ userId }: Props) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!userId.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${userId}/submissions`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load submissions.");
        }
        setSubmissions(data.submissions ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load submissions.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [userId]);

  return (
    <PremiumSurface className="space-y-3">
      <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
        <ListChecks className="h-4 w-4 text-primary" />
        My submissions
      </h3>
      <div className="flex flex-wrap gap-2">
        <PremiumChip className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-accent" />
          Status tracking
        </PremiumChip>
        <PremiumChip className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          Reward updates
        </PremiumChip>
      </div>
      {!userId ? (
        <p className="text-sm text-muted-foreground">
          Enter your user ID above to see your submission history.
        </p>
      ) : null}
      {loading ? <p className="text-sm">Loading...</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {!loading && !error && submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : null}
      <div className="space-y-2">
        {submissions.map((submission) => (
          <div key={submission.id} className="glass-surface rounded-xl p-3 text-sm">
            <p className="font-medium">{submission.task.title}</p>
            <p className="text-muted-foreground">
              {submission.task.restaurant.name} - Reward{" "}
              {submission.task.rewardAmount}
            </p>
            <p>
              Status:{" "}
              <span
                className={
                  submission.status === "approved"
                    ? "font-semibold text-emerald-700"
                    : submission.status === "rejected"
                      ? "font-semibold text-red-600"
                      : "font-semibold text-amber-700"
                }
              >
                {submission.status}
              </span>
            </p>
            <a href={submission.proofUrl} className="underline" target="_blank">
              View proof
            </a>
          </div>
        ))}
      </div>
    </PremiumSurface>
  );
}
