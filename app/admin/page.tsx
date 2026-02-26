import { AdminKpiCards } from "@/src/components/admin/AdminKpiCards";
import { getAdminMetrics } from "@/src/lib/admin/adminMetricsService";

export default async function AdminPage() {
  const metrics = await getAdminMetrics();
  const industryRollout = ["Restaurants", "Cafes", "Gyms", "Salons", "Retail", "Events"];

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-5 py-6 md:px-8 md:py-8">
      <section className="section-shell section-shell-dark infra-grid-overlay">
        <div className="relative z-10 space-y-2">
          <p className="premium-kicker text-slate-300">System Control</p>
          <h1 className="text-3xl font-semibold text-slate-100 md:text-5xl">Platform Operations</h1>
          <p className="max-w-2xl text-sm text-slate-300 md:text-base">
          Built on secure infrastructure with auditable reward allocation and transparent
          distribution logic.
          </p>
        </div>
      </section>
      <AdminKpiCards
        totalPicksInSystem={metrics.totalPicksInSystem}
        totalReserved={metrics.totalReserved}
        totalDistributed={metrics.totalDistributed}
        activeRestaurants={metrics.activeRestaurants}
      />
      <section className="space-y-2">
        <h2 className="premium-section-title text-foreground">Industry Rollout Surface</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          {industryRollout.map((industry) => (
            <div key={industry} className="rounded-xl border bg-white p-3 text-center text-sm font-medium">
              {industry}
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="premium-section-title text-foreground">Top Contributors</h2>
        {!metrics.dbAvailable ? (
          <p className="text-sm text-muted-foreground">
            Database is not reachable locally yet. Demo operations data is shown as fallback.
          </p>
        ) : null}
        <div className="space-y-2">
          {metrics.topEarners.map((earner, index) => {
            const displayName = (earner.email ?? earner.userId).split("@")[0];
            const tier =
              earner.earned > 3000n
                ? "Elite"
                : earner.earned > 2400n
                  ? "Gold"
                  : earner.earned > 1800n
                    ? "Silver"
                    : "Bronze";

            return (
              <div key={earner.userId} className="rounded-xl border bg-white p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    #{index + 1} {displayName}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {tier}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">Email: {earner.email ?? "-"}</p>
                <p className="mt-1 text-muted-foreground">Earned: {earner.earned.toString()} PICKS</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
