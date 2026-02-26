"use client";

import { useState } from "react";
import { Flame, RefreshCcw, Sparkles } from "lucide-react";

import { TaskCreateForm } from "@/src/components/tasks/TaskCreateForm";
import { TaskList } from "@/src/components/tasks/TaskList";
import { PremiumSurface } from "@/src/components/ui/PremiumSurface";

type TaskItem = {
  id: string;
  title: string;
  description: string;
  platform: string;
  rewardAmount: string;
  status: "active" | "paused" | "deleted";
};

type Props = {
  restaurantId: string;
  initialTasks: TaskItem[];
};

export function RestaurantTaskManager({ restaurantId, initialTasks }: Props) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshTasks() {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/tasks`);
      const json = (await res.json()) as Array<{
        id: string;
        title: string;
        description: string;
        platform: string;
        rewardAmount: string | number;
        status: "active" | "paused" | "deleted";
      }> & { error?: string };
      if (!res.ok || !Array.isArray(json)) {
        throw new Error((json as { error?: string }).error ?? "Failed to refresh tasks.");
      }
      setTasks(
        json.map((task) => ({
          ...task,
          rewardAmount: task.rewardAmount.toString(),
        })),
      );
      setMessage("Task board updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to refresh tasks.");
    }
  }

  return (
    <div className="space-y-4">
      <PremiumSurface className="glass-surface space-y-3">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Create campaign tasks
        </h2>
        <p className="text-sm text-muted-foreground">
          Launch platform-specific customer actions to promote dishes, events, and offers.
        </p>
        <TaskCreateForm restaurantId={restaurantId} onTaskCreated={refreshTasks} />
      </PremiumSurface>
      <PremiumSurface className="glass-surface space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
            <Flame className="h-4 w-4 text-primary" />
            Active campaign board
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
            onClick={() => void refreshTasks()}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh now
          </button>
        </div>
        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
        <TaskList tasks={tasks} onStatusChanged={refreshTasks} />
      </PremiumSurface>
    </div>
  );
}
