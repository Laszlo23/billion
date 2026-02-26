import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalPicksInSystem: bigint;
  totalReserved: bigint;
  totalDistributed: bigint;
  activeRestaurants: number;
};

function metric(label: string, value: string) {
  return (
    <Card className="rounded-xl border bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">Live system snapshot</p>
      </CardContent>
    </Card>
  );
}

export function AdminKpiCards(props: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metric("Total Reward Credits", props.totalPicksInSystem.toString())}
      {metric("Total Reserved Budget", props.totalReserved.toString())}
      {metric("Total Distributed Rewards", props.totalDistributed.toString())}
      {metric("Active Restaurants", String(props.activeRestaurants))}
    </div>
  );
}
