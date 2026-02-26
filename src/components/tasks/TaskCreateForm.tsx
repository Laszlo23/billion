"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  TaskPlatformValue,
  getTaskPlatformMeta,
  taskPlatformOptions,
} from "@/src/components/tasks/taskPlatformMeta";

type Props = {
  restaurantId: string;
  onTaskCreated?: () => Promise<void> | void;
};

const taskTemplates = [
  {
    title: "Share an Instagram story with your dish",
    description:
      "Ask customer to post one dish photo in story, tag restaurant, and keep it visible for 24h.",
    platform: "instagram" as TaskPlatformValue,
    rewardAmount: "120",
  },
  {
    title: "Post a TikTok first-bite video",
    description:
      "Ask customer for a short first-bite clip with restaurant mention in caption.",
    platform: "tiktok" as TaskPlatformValue,
    rewardAmount: "180",
  },
  {
    title: "Write a Google review with dish image",
    description:
      "Ask customer for an honest review with one dish photo and dish name.",
    platform: "google_review" as TaskPlatformValue,
    rewardAmount: "140",
  },
  {
    title: "Publish a LinkedIn lunch recommendation",
    description:
      "Ask customer for a short LinkedIn post about lunch experience with one dish photo and restaurant mention.",
    platform: "linkedin" as TaskPlatformValue,
    rewardAmount: "130",
  },
] as const;

export function TaskCreateForm({ restaurantId, onTaskCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState<TaskPlatformValue>("other");
  const [rewardAmount, setRewardAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, platform, rewardAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create task.");
      setMessage(`Campaign launched: ${data.title}`);
      toast.success("Task created and activated.");
      setTitle("");
      setDescription("");
      setPlatform("other");
      setRewardAmount("");
      await onTaskCreated?.();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Create task failed.";
      setMessage(text);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Task title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example: Share an Instagram story with your dish"
        />
      </div>
      <div className="space-y-1">
        <Label>What customer should do</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the exact action in one short sentence."
        />
      </div>
      <div className="space-y-1">
        <Label>Platform</Label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as TaskPlatformValue)}
        >
          {taskPlatformOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {getTaskPlatformMeta(platform).proofHint}
        </p>
      </div>
      <div className="space-y-1">
        <Label>Reward (PICKS)</Label>
        <Input
          value={rewardAmount}
          onChange={(e) => setRewardAmount(e.target.value)}
          inputMode="numeric"
          placeholder="Example: 120"
        />
        <p className="text-xs text-muted-foreground">
          Suggested range: 80-250 PICKS for simple one-action tasks.
        </p>
      </div>
      <div className="space-y-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Quick sample tasks
        </p>
        <div className="grid gap-2 md:grid-cols-3">
          {taskTemplates.map((template) => (
            <button
              key={template.title}
              type="button"
              className={`glass-surface rounded-xl p-2 text-left text-xs transition hover:border-primary ${
                title === template.title ? "border-primary bg-primary/10" : ""
              }`}
              onClick={() => {
                setTitle(template.title);
                setDescription(template.description);
                setPlatform(template.platform);
                setRewardAmount(template.rewardAmount);
              }}
            >
              <p className="inline-flex items-center gap-1 font-semibold text-foreground">
                {(() => {
                  const meta = getTaskPlatformMeta(template.platform);
                  const Icon = meta.icon;
                  return <Icon className="h-3.5 w-3.5" />;
                })()}
                {template.title}
              </p>
              <p className="mt-1 text-muted-foreground">Reward: +{template.rewardAmount} PICKS</p>
            </button>
          ))}
        </div>
      </div>
      <Button onClick={onSubmit} disabled={loading}>
        {loading ? "Creating..." : "Create task"}
      </Button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
