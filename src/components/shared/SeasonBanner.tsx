"use client";

type Props = {
  className?: string;
};

export function SeasonBanner({ className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-cyan-300/35 bg-[linear-gradient(130deg,rgba(30,41,59,0.86),rgba(15,23,42,0.94))] px-4 py-3 text-sm font-semibold text-foreground ${className}`.trim()}
    >
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(0,224,255,0.8)]" />
        Vienna Season 1 — 30 restaurants • 90 days • Top 100 contributors get recognition.
      </span>
    </div>
  );
}
