export type CelebrationType = "success" | "reward" | "milestone" | "level_up";

export type CelebrationPayload = {
  type?: CelebrationType;
  title: string;
  subtitle?: string;
  durationMs?: number;
  intensity?: "soft" | "medium" | "strong";
};

const CELEBRATION_EVENT = "bitemine:celebrate";

export function emitCelebration(payload: CelebrationPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CelebrationPayload>(CELEBRATION_EVENT, { detail: payload }));
}

export function onCelebration(listener: (payload: CelebrationPayload) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CelebrationPayload>;
    listener(customEvent.detail);
  };
  window.addEventListener(CELEBRATION_EVENT, handler as EventListener);
  return () => {
    window.removeEventListener(CELEBRATION_EVENT, handler as EventListener);
  };
}
