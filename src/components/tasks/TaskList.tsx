"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTaskPlatformMeta } from "@/src/components/tasks/taskPlatformMeta";

type Task = {
  id: string;
  title: string;
  description: string;
  platform: string;
  rewardAmount: string;
  status: "active" | "paused" | "deleted";
};

type Props = {
  tasks: Task[];
  onStatusChanged?: () => Promise<void> | void;
};

export function TaskList({ tasks, onStatusChanged }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  async function changeStatus(taskId: string, status: Task["status"]) {
    try {
      setLoadingTaskId(taskId);
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Failed to update status.");
        setLoadingTaskId(null);
        return;
      }
      setMessage(`Task status updated: ${data.status}`);
      setLoadingTaskId(null);
      await onStatusChanged?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update status.");
      setLoadingTaskId(null);
    }
  }

  return (
    <div className="space-y-3">
      {message ? <p className="text-sm">{message}</p> : null}
      {tasks.map((task) => (
        <div key={task.id} className="glass-surface p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-600/80 bg-slate-900/55 px-2.5 py-1 text-xs font-medium text-slate-100">
              {(() => {
                const meta = getTaskPlatformMeta(task.platform);
                const Icon = meta.icon;
                return (
                  <>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{meta.label}</span>
                  </>
                );
              })()}
            </div>
            <Badge>{task.status}</Badge>
          </div>
          <h3 className="mt-2 font-semibold">{task.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
          <div className="mt-2 rounded-lg border border-slate-700/70 bg-slate-900/55 px-3 py-2">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Reward: +{task.rewardAmount} PICKS
            </p>
            <p className="text-xs text-muted-foreground">One action, one proof, then manual review.</p>
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => changeStatus(task.id, "paused")}
              disabled={loadingTaskId === task.id}
            >
              Pause
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => changeStatus(task.id, "active")}
              disabled={loadingTaskId === task.id}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => changeStatus(task.id, "deleted")}
              disabled={loadingTaskId === task.id}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
