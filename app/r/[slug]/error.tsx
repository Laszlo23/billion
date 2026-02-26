"use client";

export default function PublicRestaurantError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-8">
      <h2 className="text-xl font-semibold">Menu page unavailable</h2>
      <p className="text-sm text-muted-foreground">
        We could not load this restaurant right now.
      </p>
      <button className="rounded border px-4 py-2" onClick={() => reset()}>
        Retry
      </button>
    </main>
  );
}
