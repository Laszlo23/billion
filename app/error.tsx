"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="p-8">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh or try again.
        </p>
        <button className="mt-4 rounded border px-4 py-2" onClick={() => reset()}>
          Retry
        </button>
      </body>
    </html>
  );
}
