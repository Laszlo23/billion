"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Star, Trophy } from "lucide-react";

import { onCelebration, type CelebrationPayload } from "@/src/lib/celebration";
import { popIn } from "@/src/lib/motion";

type CelebrationState = CelebrationPayload & { id: number };

function iconForType(type: CelebrationPayload["type"]) {
  if (type === "reward") return Star;
  if (type === "level_up") return Trophy;
  return Sparkles;
}

export function CelebrationHost() {
  const [active, setActive] = useState<CelebrationState | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    const unsubscribe = onCelebration((payload) => {
      counterRef.current += 1;
      setActive({ ...payload, id: Date.now() + counterRef.current });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!active) return;
    const duration = active.durationMs ?? 2200;
    const timer = setTimeout(() => setActive(null), duration);
    return () => clearTimeout(timer);
  }, [active]);

  const Icon = useMemo(() => iconForType(active?.type), [active?.type]);

  return (
    <div className="celebration-host pointer-events-none fixed inset-x-0 top-4 z-[120] mx-auto flex w-full justify-center px-4">
      <AnimatePresence>
        {active ? (
          <motion.div
            key={active.id}
            variants={popIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="celebration-card relative overflow-hidden rounded-2xl px-4 py-3"
          >
            <span className="celebration-burst" aria-hidden />
            <div className="relative z-10 flex items-start gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <Icon className="h-4.5 w-4.5 text-amber-100" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100">{active.title}</p>
                {active.subtitle ? (
                  <p className="text-xs text-slate-300">{active.subtitle}</p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
