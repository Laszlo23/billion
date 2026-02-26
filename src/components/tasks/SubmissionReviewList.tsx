"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { actionError, actionSuccess } from "@/src/lib/actionFeedback";

type Submission = {
  id: string;
  proofUrl: string;
  userId: string;
  taskTitle: string;
  status: "pending" | "approved" | "rejected";
};

type Props = {
  submissions: Submission[];
};

export function SubmissionReviewList({ submissions }: Props) {
  const [items, setItems] = useState<Submission[]>(submissions);
  const [filter, setFilter] = useState<Submission["status"] | "all">("all");
  const [message, setMessage] = useState<string | null>(null);

  async function settle(submissionId: string, action: "approve" | "reject") {
    const res = await fetch(`/api/submissions/${submissionId}/${action}`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      const text = data.error ?? `${action} failed.`;
      setMessage(text);
      actionError(text);
      return;
    }
    setItems((current) =>
      current.map((submission) =>
        submission.id === submissionId
          ? {
              ...submission,
              status: data.status as Submission["status"],
            }
          : submission,
      ),
    );
    setMessage(`Submission ${data.status}`);
    actionSuccess({
      toastMessage: `Submission ${data.status}.`,
      celebration:
        action === "approve"
          ? {
              type: "success",
              title: "Submission approved",
              subtitle: "Rewards are now released to the player.",
              intensity: "medium",
            }
          : undefined,
    });
  }

  const filteredItems = items
    .filter((submission) => filter === "all" || submission.status === filter)
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return 0;
    });

  return (
    <div className="space-y-3">
      {message ? <p className="text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>
      {filteredItems.map((submission) => (
        <div key={submission.id} className="glass-surface rounded-md p-3">
          <p className="font-medium">{submission.taskTitle}</p>
          <p className="text-sm">
            User:{" "}
            <Link href={`/player/${submission.userId}`} className="font-semibold text-primary underline">
              {submission.userId}
            </Link>
          </p>
          <a className="text-sm underline" href={submission.proofUrl} target="_blank">
            Open proof image
          </a>
          <p className="text-sm">Status: {submission.status}</p>
          {submission.status === "pending" ? (
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => settle(submission.id, "approve")}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => settle(submission.id, "reject")}>
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
