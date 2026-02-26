"use client";

export default function RestaurantError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-8">
      <h2 className="text-xl font-semibold">Restaurant dashboard unavailable</h2>
      <p className="text-sm text-muted-foreground">
        Please check your database connection and retry.
      </p>
      <button className="rounded border px-4 py-2" onClick={() => reset()}>
        Retry
      </button>
    </main>
  );
}
