import {
  Activity,
  BarChart3,
  CheckCircle2,
  Gauge,
  Layers3,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalCampaignBudget: bigint;
  activeCampaigns: number;
  completedActions: number;
  estimatedGrowthValue: bigint;
  rewardDistribution: bigint;
  availableBudget: bigint;
  reservedBudget: bigint;
  campaignRoiEstimatePct: number;
  reviewGrowthProjection: number;
  engagementVelocity: string;
  contributorRatingOverview: string;
};

function KpiCard({
  title,
  value,
  icon,
  note,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  note?: string;
}) {
  return (
    <Card className="glass-surface">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>{title}</span>
          <span className="text-foreground">{icon}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </CardContent>
    </Card>
  );
}

export function RestaurantBusinessKpiCards(props: Props) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Total Campaign Budget"
          value={props.totalCampaignBudget.toString()}
          icon={<Wallet className="h-4 w-4" />}
          note="Configured campaign budget"
        />
        <KpiCard
          title="Active Campaigns"
          value={String(props.activeCampaigns)}
          icon={<Layers3 className="h-4 w-4" />}
          note="Currently live"
        />
        <KpiCard
          title="Completed Actions"
          value={String(props.completedActions)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          note="Approved actions"
        />
        <KpiCard
          title="Estimated Growth Value"
          value={props.estimatedGrowthValue.toString()}
          icon={<BarChart3 className="h-4 w-4" />}
          note="Pilot estimate"
        />
        <KpiCard
          title="Reward Distribution"
          value={props.rewardDistribution.toString()}
          icon={<BarChart3 className="h-4 w-4" />}
          note="Rewards released"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Campaign ROI Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="inline-flex items-center gap-2 text-xl font-semibold">
              <Gauge className="h-4 w-4 text-foreground" />
              {props.campaignRoiEstimatePct}%
            </p>
            <p className="text-xs text-muted-foreground">Value per distributed reward.</p>
          </CardContent>
        </Card>
        <Card className="glass-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Review Growth Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="inline-flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-4 w-4 text-foreground" />
              {props.reviewGrowthProjection}
            </p>
            <p className="text-xs text-muted-foreground">Projected actions next cycle.</p>
          </CardContent>
        </Card>
        <Card className="glass-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="inline-flex items-center gap-2 text-xl font-semibold">
              <Layers3 className="h-4 w-4 text-foreground" />
              {props.engagementVelocity}
            </p>
            <p className="text-xs text-muted-foreground">Execution pace.</p>
          </CardContent>
        </Card>
        <Card className="glass-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contributor Rating Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="inline-flex items-center gap-2 text-sm font-semibold leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-foreground" />
              {props.contributorRatingOverview}
            </p>
            <p className="text-xs text-muted-foreground">Reliability from submission quality.</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="glass-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Incentive Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{props.availableBudget.toString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reserved Incentive Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{props.reservedBudget.toString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
