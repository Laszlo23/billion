import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  value: string | number;
  className?: string;
};

export function RewardBadge({ value, className }: Props) {
  return (
    <span className={cn("reward-badge px-3 py-1 text-xs font-semibold", className)}>
      <Star className="h-3.5 w-3.5 fill-amber-200 text-amber-200" />
      +{value} PICKS
    </span>
  );
}
