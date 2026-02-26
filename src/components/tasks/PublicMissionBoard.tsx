"use client";

import { useMemo, useState } from "react";
import { Camera, CheckCircle2, Clock3, Heart, Target, Upload } from "lucide-react";

import { TaskSubmissionForm } from "@/src/components/tasks/TaskSubmissionForm";
import {
  TaskPlatformValue,
  getTaskPlatformMeta,
  taskPlatformOptions,
} from "@/src/components/tasks/taskPlatformMeta";
import { RewardBadge } from "@/src/components/ui/RewardBadge";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";

type MissionTask = {
  id: string;
  title: string;
  description: string;
  platform: string;
  rewardAmount: string;
};

type Props = {
  restaurantName: string;
  tasks: MissionTask[];
};

const fallbackSampleTasks: MissionTask[] = [
  {
    id: "sample-instagram-story",
    title: "Share an Instagram story with your dish",
    description:
      "Take one clear dish photo, tag the restaurant, and keep the story visible for 24 hours.",
    platform: "instagram",
    rewardAmount: "120",
  },
  {
    id: "sample-tiktok-bite",
    title: "Post a TikTok first-bite video",
    description:
      "Record a short first-bite clip, mention the restaurant in caption, and show the dish clearly.",
    platform: "tiktok",
    rewardAmount: "180",
  },
  {
    id: "sample-google-review",
    title: "Write a Google review with dish image",
    description:
      "Post an honest review, include one dish photo, and mention what you liked most.",
    platform: "google_review",
    rewardAmount: "140",
  },
  {
    id: "sample-instagram-carousel",
    title: "Post an Instagram carousel (dish + venue + vibe)",
    description:
      "Share 3 photos: dish close-up, table moment, and restaurant interior with location tag.",
    platform: "instagram",
    rewardAmount: "165",
  },
  {
    id: "sample-linkedin-lunch",
    title: "Publish a LinkedIn lunch recommendation",
    description:
      "Write a short professional post about your lunch experience and include one clear photo.",
    platform: "linkedin",
    rewardAmount: "130",
  },
  {
    id: "sample-youtube-shorts",
    title: "Upload a YouTube Shorts dish reveal",
    description:
      "Capture a quick dish reveal clip (8-15 seconds), mention the restaurant, and keep it public.",
    platform: "youtube",
    rewardAmount: "200",
  },
];

const platformFilters: Array<{ value: "all" | TaskPlatformValue; label: string }> = [
  { value: "all", label: "All" },
  ...taskPlatformOptions.map((option) => ({ value: option.value, label: option.label })),
];

function estimateTime(platform: string) {
  switch (platform) {
    case "instagram":
      return "3-5 min";
    case "tiktok":
      return "6-10 min";
    case "linkedin":
      return "4-7 min";
    case "youtube":
      return "8-15 min";
    case "google_review":
      return "3-6 min";
    default:
      return "4-8 min";
  }
}

function actionLabel(platform: string) {
  switch (platform) {
    case "instagram":
      return "Post a story or feed photo";
    case "tiktok":
      return "Post a short video";
    case "google_review":
      return "Post a review with image";
    case "linkedin":
      return "Post a lunch recommendation";
    case "youtube":
      return "Post a Shorts clip";
    default:
      return "Complete and post the task";
  }
}

function sampleLinkedinCaption(restaurantName: string) {
  return `Lunch break recommendation: had a great meal at ${restaurantName}. Cozy atmosphere, fast service, and a dish worth sharing with the team.`;
}

export function PublicMissionBoard({ restaurantName, tasks }: Props) {
  const [activeFilter, setActiveFilter] = useState<"all" | TaskPlatformValue>("all");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const displayTasks = tasks.length > 0 ? tasks : fallbackSampleTasks;
  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") return displayTasks;
    return displayTasks.filter((task) => task.platform === activeFilter);
  }, [activeFilter, displayTasks]);

  return (
    <section className="season-section space-y-4">
      <div className="space-y-2">
        <h2 className="premium-section-title">Social Tasks</h2>
        <p className="text-sm text-muted-foreground">
          Choose one mission and submit one clean proof.
        </p>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5 text-primary" />
          Keep it simple: one action, one screenshot, one reward.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {platformFilters.map((filter) => {
          const isActive = filter.value === activeFilter;
          const count =
            filter.value === "all"
              ? displayTasks.length
              : displayTasks.filter((task) => task.platform === filter.value).length;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-white/20 bg-[linear-gradient(140deg,#ff7a18,#ff3d00)] text-primary-foreground"
                  : "border-border bg-card/90 text-foreground hover:border-accent/60"
              }`}
            >
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      {tasks.length === 0 ? (
        <PremiumSurface>
          <p className="text-sm font-medium text-foreground">Demo tasks are showing right now.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The owner has no live tasks yet, so these sample tasks help you see the flow.
          </p>
        </PremiumSurface>
      ) : null}
      {filteredTasks.length === 0 ? (
        <PremiumSurface>
          <p className="text-sm text-muted-foreground">
            No tasks in this filter. Try All, Instagram, TikTok, or Google Review.
          </p>
        </PremiumSurface>
      ) : null}

      {filteredTasks.map((task) => {
        const platform = getTaskPlatformMeta(task.platform);
        const PlatformIcon = platform.icon;
        const isOpen = openTaskId === task.id;
        return (
          <PremiumSurface key={task.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-lg font-semibold">{task.title}</p>
                <p className="text-xs text-muted-foreground">{restaurantName}</p>
              </div>
              <RewardBadge value={task.rewardAmount} />
            </div>
            <div className="flex flex-wrap gap-2">
              <PremiumChip className="inline-flex items-center gap-1">
                <PlatformIcon className="h-3.5 w-3.5" />
                {platform.label}
              </PremiumChip>
              <PremiumChip className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {estimateTime(task.platform)}
              </PremiumChip>
              <PremiumChip className="inline-flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                1 proof required
              </PremiumChip>
            </div>
            <p className="text-sm text-muted-foreground">{actionLabel(task.platform)}</p>
            <button
              type="button"
              className="w-full rounded-xl border border-white/20 bg-[linear-gradient(140deg,#ff7a18,#ff3d00)] px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
              onClick={() => setOpenTaskId(isOpen ? null : task.id)}
            >
              {isOpen ? "Hide details" : "Start task"}
            </button>
            {isOpen ? (
              <div className="space-y-3">
                <div className="grid gap-2 rounded-lg border border-slate-500/35 bg-slate-900/60 p-3 text-xs text-slate-300 md:grid-cols-3">
                  <p className="inline-flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-foreground" />
                    Do: {actionLabel(task.platform)}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-foreground" />
                    Upload: One clear screenshot/photo
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
                    Reward: Auto-added after approval
                  </p>
                </div>
                {task.platform === "linkedin" ? (
                  <div className="glass-surface rounded-xl p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                      LinkedIn post preview
                    </p>
                    <div className="mt-2 rounded-lg border border-slate-500/35 bg-slate-900/65 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-100">Your Name • LinkedIn</p>
                        <p className="text-[11px] text-slate-400">Now</p>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">
                        {sampleLinkedinCaption(restaurantName)}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        Add one clear dish photo and tag the restaurant name in your caption.
                      </p>
                    </div>
                  </div>
                ) : null}
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <TaskSubmissionForm
                  taskId={task.id}
                  taskPlatform={task.platform}
                  taskTitle={task.title}
                  rewardAmount={task.rewardAmount}
                />
              </div>
            ) : null}
          </PremiumSurface>
        );
      })}
    </section>
  );
}
