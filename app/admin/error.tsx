"use client";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-8">
      <h2 className="text-xl font-semibold">Admin view unavailable</h2>
      <p className="text-sm text-muted-foreground">
        We could not load admin metrics right now.
      </p>
      <button className="rounded border px-4 py-2" onClick={() => reset()}>
        Retry
      </button>
    </main>
  );
}
