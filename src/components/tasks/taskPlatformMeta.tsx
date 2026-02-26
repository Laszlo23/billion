import {
  Clapperboard,
  Globe2,
  Instagram,
  Linkedin,
  MessageSquareText,
  Youtube,
} from "lucide-react";

export const taskPlatformOptions = [
  {
    value: "instagram",
    label: "Instagram",
    proofHint: "Upload a story/post screenshot with tag and timestamp.",
    icon: Instagram,
  },
  {
    value: "tiktok",
    label: "TikTok",
    proofHint: "Upload a video publish screenshot with account name visible.",
    icon: Clapperboard,
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    proofHint: "Upload a post screenshot showing your caption and restaurant mention.",
    icon: Linkedin,
  },
  {
    value: "youtube",
    label: "YouTube",
    proofHint: "Upload Shorts/video publish proof from your channel page.",
    icon: Youtube,
  },
  {
    value: "google_review",
    label: "Google Review",
    proofHint: "Upload a screenshot of your posted Google review.",
    icon: MessageSquareText,
  },
  {
    value: "other",
    label: "Other",
    proofHint: "Upload clear proof showing task completion and account context.",
    icon: Globe2,
  },
] as const;

export type TaskPlatformValue = (typeof taskPlatformOptions)[number]["value"];

const fallbackPlatform = taskPlatformOptions[taskPlatformOptions.length - 1];

export function getTaskPlatformMeta(platform: string | undefined) {
  return taskPlatformOptions.find((item) => item.value === platform) ?? fallbackPlatform;
}
