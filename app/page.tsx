"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Camera,
  Clock3,
  Compass,
  Gift,
  Flame,
  Gamepad2,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Store,
  Ticket,
  MessageSquareText,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  districtRaceSeed,
  landingPilotMetrics,
  liveActivityFeedSeed,
  seasonProgress
} from "@/src/lib/demo/landingMetrics";
import { motionPresets } from "@/src/lib/motion";

type LandingLiveData = {
  seasonDaysLeft: number;
  foundingVenues: number;
  targetFoundingVenues: number;
  activeVenues: number;
  missionsCompleted: number;
  reviewsGenerated: number;
  avgRatingImpact: number;
  activityFeed: Array<{ id: string; message: string; timeAgo: string }>;
  districtRace: Array<{ district: string; active: number; target: number }>;
};

const fallbackLiveData: LandingLiveData = {
  seasonDaysLeft: seasonProgress.daysLeft,
  foundingVenues: seasonProgress.foundingVenues,
  targetFoundingVenues: seasonProgress.targetVenues,
  activeVenues: landingPilotMetrics.activeVenues,
  missionsCompleted: landingPilotMetrics.missionsCompleted,
  reviewsGenerated: landingPilotMetrics.reviewsGenerated,
  avgRatingImpact: landingPilotMetrics.avgRatingImpact,
  activityFeed: liveActivityFeedSeed.map((item, index) => ({
    id: `feed-${index}`,
    message: item.message,
    timeAgo: item.timeAgo,
  })),
  districtRace: districtRaceSeed.map((item) => ({ ...item })),
};

const peopleHowItWorks = [
  {
    icon: Compass,
    title: "Pick a venue",
    description: "Find nearby spots with active missions and jump in instantly.",
  },
  {
    icon: Camera,
    title: "Do a mission",
    description: "Post a photo, review, or story. Most missions take around 2 minutes.",
  },
  {
    icon: BadgeCheck,
    title: "Get verified + level up",
    description: "Your action gets approved, your district climbs, and your profile levels up.",
  },
] as const;

const missionCards = [
  {
    title: "📸 Snap the vibe",
    platform: "Photo mission",
    reward: "45 PICKS",
    eta: "~2 min",
    difficulty: "Easy",
    impact: "Boosts venue visibility",
  },
  {
    title: "⭐ Drop a review",
    platform: "Google mission",
    reward: "65 PICKS",
    eta: "~3 min",
    difficulty: "Easy",
    impact: "Improves rating trust",
  },
  {
    title: "🎥 Post a story",
    platform: "Instagram mission",
    reward: "55 PICKS",
    eta: "~2 min",
    difficulty: "Easy",
    impact: "Drives local discovery",
  },
  {
    title: "🤝 Bring a friend",
    platform: "Referral mission",
    reward: "90 PICKS",
    eta: "~2 min",
    difficulty: "Easy",
    impact: "Increases repeat visits",
  },
] as const;

const districtMapSeed = [
  { district: "District 1", active: 6, target: 20, topVenue: "Bella Tavola", heat: "Hot", locked: false },
  { district: "District 2", active: 4, target: 20, topVenue: "Sunset Bistro", heat: "Warm", locked: false },
  { district: "District 3", active: 3, target: 20, topVenue: "Pasta Lab", heat: "Warm", locked: false },
  { district: "District 5", active: 2, target: 20, topVenue: "Maison Brunch", heat: "Warm", locked: false },
  { district: "District 6", active: 0, target: 20, topVenue: "Unlock to reveal", heat: "Quiet", locked: true },
  { district: "District 7", active: 5, target: 20, topVenue: "Harbor Brunch Club", heat: "Hot", locked: false },
  { district: "District 8", active: 1, target: 20, topVenue: "Local Slice", heat: "Quiet", locked: false },
  { district: "District 9", active: 0, target: 20, topVenue: "Unlock to reveal", heat: "Quiet", locked: true },
] as const;

const peopleFeedSeed = [
  { name: "Mia", action: "posted a story at Bella Tavola", district: "District 1", time: "2m ago" },
  { name: "Luca", action: "dropped a review for Sunset Bistro", district: "District 7", time: "4m ago" },
  { name: "Nina", action: "completed 'Snap the vibe' at Pasta Lab", district: "District 2", time: "6m ago" },
  { name: "Jonas", action: "brought a friend to Maison Brunch", district: "District 5", time: "8m ago" },
] as const;

function AnimatedCount({
  value,
  decimals = 0,
  prefix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const durationMs = 900;
    const startAt = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startAt) / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayValue(value * eased);
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toFixed(decimals)}
    </span>
  );
}

function toCountdownText(seconds: number) {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const mins = Math.floor((seconds % (60 * 60)) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

function initials(name: string) {
  const clean = name.trim();
  if (!clean) return "BM";
  const words = clean.split(" ");
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function MapProgressRing({
  active,
  target,
}: {
  active: number;
  target: number;
}) {
  const progress = Math.min(100, Math.round((active / Math.max(1, target)) * 100));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;
  const gradientId = `ring-${active}-${target}`;

  return (
    <div className="relative h-20 w-20">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="9" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="9"
          strokeLinecap="round"
          style={{ strokeDasharray: circumference }}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: strokeOffset }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A18" />
            <stop offset="100%" stopColor="#00E0FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#E5E7EB]">
        {progress}%
      </div>
    </div>
  );
}

export default function Home() {
  const [liveData, setLiveData] = useState<LandingLiveData>(fallbackLiveData);
  const [leadForm, setLeadForm] = useState({
    restaurantName: "",
    district: "",
    phoneOrWhatsApp: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [referralUserId, setReferralUserId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralSubmitting, setReferralSubmitting] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(72 * 24 * 60 * 60);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const res = await fetch("/api/demo/live-city-data");
        const data = (await res.json()) as Partial<LandingLiveData>;
        if (!res.ok) return;
        setLiveData((prev) => ({
          ...prev,
          ...data,
          activityFeed: data.activityFeed ?? prev.activityFeed,
          districtRace: data.districtRace ?? prev.districtRace,
        }));
      } catch {
        // Keep fallback data silently.
      }
    }
    void loadLiveData();
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const seasonFillPct = Math.round(
    (liveData.foundingVenues / Math.max(1, liveData.targetFoundingVenues)) * 100,
  );

  const countdownText = useMemo(() => toCountdownText(countdownSeconds), [countdownSeconds]);

  async function submitLead() {
    if (
      !leadForm.restaurantName.trim() ||
      !leadForm.district.trim() ||
      !leadForm.phoneOrWhatsApp.trim()
    ) {
      toast.error("Please fill restaurant name, district, and phone/WhatsApp.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/restaurants/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit lead.");
      toast.success("Thanks. We will contact you shortly.");
      setLeadForm({ restaurantName: "", district: "", phoneOrWhatsApp: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  async function applyReferralCode() {
    if (!referralUserId.trim() || !referralCode.trim()) {
      toast.error("Add your user ID and referral code.");
      return;
    }
    setReferralSubmitting(true);
    try {
      const res = await fetch("/api/referrals/apply-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referredUserId: referralUserId.trim(),
          code: referralCode.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not apply referral code.");
      toast.success("Referral code applied. Finish your first approved mission for bonus rewards.");
      setReferralCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply referral code.");
    } finally {
      setReferralSubmitting(false);
    }
  }

  return (
    <main className="landing-season-shell mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-6 pb-28 md:gap-12 md:px-8 md:py-8 md:pb-10">
      <section className="season-hero px-5 py-10 md:px-8 md:py-14">
        <div className="pointer-events-none absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "blur(2px) saturate(1.05)", transform: "scale(1.05)" }}
            onError={(event) => {
              event.currentTarget.src = "/api/demo/hero-bg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/36 via-[#0F172A]/68 to-[#0F172A]/93" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,122,24,0.32),transparent_47%),radial-gradient(circle_at_80%_40%,rgba(0,224,255,0.22),transparent_47%)]" />
        </div>

        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={`particle-${index}`}
            className="season-particle"
            style={{
              width: `${6 + (index % 4) * 3}px`,
              height: `${6 + (index % 4) * 3}px`,
              left: `${10 + index * 10}%`,
              top: `${8 + ((index * 9) % 64)}%`,
              animationDelay: `${index * 0.4}s`,
            }}
          />
        ))}

        <div className="relative z-10 mb-6 flex items-center justify-between gap-2">
          <span className="season-pill-live">
            <span className="season-live-dot" />
            LIVE - Vienna Season 1
          </span>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-black/25 px-3 py-1 text-xs text-[#E5E7EB]/85 backdrop-blur-sm">
              {liveData.foundingVenues} / {liveData.targetFoundingVenues} founding venues
            </span>
            <span className="rounded-full bg-black/25 px-3 py-1 text-xs text-[#E5E7EB]/85 backdrop-blur-sm">
              closes in {Math.floor(countdownSeconds / (60 * 60 * 24))}d
            </span>
          </div>
        </div>

        <div className="grid h-full gap-6 md:grid-cols-[1.05fr_0.95fr] md:gap-8">
          <motion.div
            className="z-10 flex flex-col justify-center gap-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionPresets.duration.medium, ease: motionPresets.ease }}
          >
            <div className="relative max-w-xl">
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,122,24,0.4)_0%,rgba(255,122,24,0)_70%)] blur-3xl opacity-20" />
              <h1 className="text-5xl font-semibold leading-[1.02] tracking-[0.01em] text-[#E5E7EB] md:text-7xl">
                Turn nights out into a game.
              </h1>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-[#E5E7EB]/88 md:text-lg">
              Complete quick missions at venues (photo, review, story), climb districts, earn rewards.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-[#E5E7EB]/90">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 backdrop-blur-sm">
                <Clock3 className="h-3.5 w-3.5 text-[#FF7A18]" />
                2-minute missions
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-[#00E0FF]" />
                Real places, real impact
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 backdrop-blur-sm">
                <Flame className="h-3.5 w-3.5 text-[#FF7A18]" />
                Level up your district
              </span>
            </div>

            <div className="rounded-2xl bg-black/20 px-3 py-2 text-sm text-[#E5E7EB]/90 backdrop-blur-sm">
              🔥 Tonight: {liveData.activeVenues} venues live • {liveData.missionsCompleted} missions completed •
              District 1 is heating up
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Link
                href="/r/sunset-bistro"
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.04]"
                style={{
                  background: "linear-gradient(90deg, #FF7A18 0%, #FF3D00 100%)",
                  boxShadow:
                    "0 14px 34px rgba(255,122,24,0.45), 0 0 22px rgba(255,61,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              >
                Start playing
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-2 py-2 text-sm font-semibold text-[#E5E7EB]/90 transition hover:text-[#00E0FF] hover:underline"
              >
                See how it works
              </Link>
            </div>
            <p className="text-xs text-[#E5E7EB]/70">No signup drama. Start in seconds.</p>
          </motion.div>

          <motion.div
            className="z-10 self-center p-1"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: motionPresets.duration.slow,
              delay: motionPresets.stagger.tight,
              ease: motionPresets.ease,
            }}
          >
            <div
              className="relative overflow-hidden rounded-[28px] p-5 md:p-6"
              style={{
                borderRadius: "28px",
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
                boxShadow:
                  "0 28px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 24px rgba(0,224,255,0.12)",
              }}
            >
              <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#00E0FF]/18 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-[#FF7A18]/16 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#E5E7EB]">
                  <MapPin className="h-4 w-4 text-[#FF7A18]" />
                  BiteMine
                </p>
                <span className="season-pill-live">
                  <span className="season-live-dot" />
                  LIVE
                </span>
              </div>

              <div className="relative mt-4 flex items-center justify-center">
                <div className="pointer-events-none absolute h-44 w-44 rounded-full bg-[#00E0FF]/20 blur-3xl" />
                <MapProgressRing active={liveData.districtRace[0]?.active ?? 0} target={liveData.districtRace[0]?.target ?? 20} />
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-[#E5E7EB]/90">
                <Clock3 className="h-4 w-4 text-[#FF7A18]" />
                Season closes in
                <motion.span
                  key={countdownText}
                  initial={{ opacity: 0.35, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-semibold text-[#FF7A18]"
                >
                  {countdownText}
                </motion.span>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-[#E5E7EB]/80">
                  <span>12 / 30 Founding Venues</span>
                  <span>{seasonFillPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#1E293B]">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#00E0FF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${seasonFillPct}%` }}
                    transition={{ duration: motionPresets.duration.slow, ease: motionPresets.softEase }}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {liveData.activityFeed.slice(0, 3).map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="px-1 py-2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + index * motionPresets.stagger.tight, ease: motionPresets.softEase }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-sm text-[#E5E7EB]">{item.message}</p>
                      <span className="text-xs text-[#94A3B8]">{item.timeAgo}</span>
                    </div>
                    {index < 2 ? (
                      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[#00E0FF]/35 to-transparent" />
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        id="how-it-works"
        className="season-section"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="season-kicker">How it works</p>
            <h2 className="text-2xl font-semibold text-[#E5E7EB] md:text-3xl">Play in 3 quick steps</h2>
          </div>
          <span className="text-xs text-[#94A3B8]">Feels like a city game</span>
        </div>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {peopleHowItWorks.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                className="min-w-[85%] rounded-[28px] bg-white/5 p-5 backdrop-blur-xl sm:min-w-[55%] md:min-w-[32%]"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.07, duration: 0.35 }}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF7A18]/20 text-[#FF7A18]">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-lg font-semibold text-[#E5E7EB]">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#94A3B8]">{step.description}</p>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        className="season-section"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <p className="season-kicker">Starter rewards</p>
        <h2 className="text-2xl font-semibold text-[#E5E7EB] md:text-3xl">
          First 10 minutes: get hooked fast.
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-3xl bg-white/5 p-4 backdrop-blur-xl">
            <p className="text-sm font-semibold text-[#E5E7EB]">1) Submit your first mission</p>
            <p className="mt-1 text-xs text-[#94A3B8]">Instantly unlock your starter quest progress.</p>
          </article>
          <article className="rounded-3xl bg-white/5 p-4 backdrop-blur-xl">
            <p className="text-sm font-semibold text-[#E5E7EB]">2) Get approved + claim</p>
            <p className="mt-1 text-xs text-[#94A3B8]">Claim bonus PICKS and XP from your quest rail.</p>
          </article>
          <article className="rounded-3xl bg-white/5 p-4 backdrop-blur-xl">
            <p className="text-sm font-semibold text-[#E5E7EB]">3) Bring a friend</p>
            <p className="mt-1 text-xs text-[#94A3B8]">Both sides earn when first mission gets approved.</p>
          </article>
        </div>
        <div className="mt-4 grid gap-3 rounded-3xl bg-white/5 p-4 md:grid-cols-[1fr_1fr_auto]">
          <Input
            value={referralUserId}
            onChange={(event) => setReferralUserId(event.target.value)}
            placeholder="Your user ID"
            className="border-[#334155] bg-[#0F172A]/80 text-[#E5E7EB] placeholder:text-[#94A3B8]"
          />
          <Input
            value={referralCode}
            onChange={(event) => setReferralCode(event.target.value)}
            placeholder="Referral code (BITE-...)"
            className="border-[#334155] bg-[#0F172A]/80 text-[#E5E7EB] placeholder:text-[#94A3B8]"
          />
          <Button
            type="button"
            variant="premium"
            disabled={referralSubmitting}
            onClick={() => void applyReferralCode()}
          >
            {referralSubmitting ? "Applying..." : "Apply code"}
          </Button>
        </div>
      </motion.section>

      <motion.section
        className="season-section"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="season-kicker">People playing right now</p>
            <h2 className="text-2xl font-semibold text-[#E5E7EB] md:text-3xl">Real actions, verified.</h2>
          </div>
          <span className="season-pill-live">
            <span className="season-live-dot" />
            LIVE
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {peopleFeedSeed.map((item, index) => (
            <motion.article
              key={item.name + item.time}
              className="rounded-3xl bg-white/5 p-4 backdrop-blur-xl transition hover:bg-white/[0.08]"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-xs font-semibold text-[#E5E7EB]">
                  {initials(item.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-[#E5E7EB]">
                    <span className="text-[#00E0FF]">{item.name}</span> {item.action}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#94A3B8]">
                    <span className="rounded-full bg-[#FF7A18]/15 px-2 py-0.5 text-[#E5E7EB]">{item.district}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
                <span className="rounded-full border border-[#FF7A18]/40 bg-[#FF7A18]/20 px-2 py-0.5 text-[10px] font-semibold text-[#E5E7EB]">
                  Verified
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="season-section"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="season-kicker">District Map</p>
            <h2 className="text-2xl font-semibold text-[#E5E7EB] md:text-3xl">Claim your district early.</h2>
          </div>
          <p className="text-xs text-[#94A3B8]">The city remembers.</p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {districtMapSeed.map((district) => (
            <motion.article
              key={district.district}
              className={`relative rounded-3xl bg-white/5 p-4 backdrop-blur-xl ${
                district.district === "District 1" ? "animate-[pulse_2.4s_ease-in-out_infinite]" : ""
              }`}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              {district.district === "District 1" ? (
                <span className="absolute right-3 top-3 rounded-full bg-[#FF7A18]/25 px-2 py-0.5 text-[10px] font-semibold text-[#E5E7EB]">
                  HOT
                </span>
              ) : null}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#E5E7EB]">{district.district}</p>
                <p className="text-xs text-[#94A3B8]">🔥 {district.heat}</p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <MapProgressRing active={district.active} target={district.target} />
                <div>
                  <p className="text-xs text-[#94A3B8]">Top venue</p>
                  <p className="text-sm text-[#E5E7EB]">{district.topVenue}</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">
                    {district.active}/{district.target} active
                  </p>
                </div>
              </div>
              {district.locked ? (
                <button className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#1E293B] px-3 py-1 text-xs font-semibold text-[#E5E7EB]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#00E0FF]" />
                  Unlock
                </button>
              ) : null}
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="season-section"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <p className="season-kicker">Missions</p>
        <h2 className="text-2xl font-semibold text-[#E5E7EB] md:text-3xl">Pick a quest and play.</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {missionCards.map((mission) => (
            <motion.article
              key={mission.title}
              className="rounded-3xl bg-white/5 p-4 backdrop-blur-xl transition hover:bg-white/[0.08]"
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-lg font-semibold text-[#E5E7EB]">{mission.title}</p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">{mission.platform}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-[#FF7A18]/20 px-2.5 py-1 text-[#E5E7EB]">
                  Reward: {mission.reward}
                </span>
                <span className="rounded-full bg-[#1E293B] px-2.5 py-1 text-[#E5E7EB]">{mission.eta}</span>
                <span className="rounded-full bg-[#1E293B] px-2.5 py-1 text-[#E5E7EB]">{mission.difficulty}</span>
              </div>
              <p className="mt-3 text-sm text-[#94A3B8]">{mission.impact}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="season-section"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <p className="season-kicker">Choose your lane</p>
        <h2 className="text-2xl font-semibold text-[#E5E7EB] md:text-3xl">People first. Venue flow next.</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-3xl bg-white/5 p-5 backdrop-blur-xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#E5E7EB]">
              <Gamepad2 className="h-4 w-4 text-[#00E0FF]" />
              Play & earn rewards
            </p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Join missions at your favorite venues and help your district rise tonight.
            </p>
            <Link href="/r/sunset-bistro" className="season-btn-primary mt-4 w-full">
              Start playing
            </Link>
          </article>
          <article className="rounded-3xl bg-white/5 p-5 backdrop-blur-xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#E5E7EB]">
              <Store className="h-4 w-4 text-[#FF7A18]" />
              For venues
            </p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Activate missions + reservations and turn guests into visible social momentum.
            </p>
            <Link href="#lead-form" className="season-btn-secondary mt-4 w-full">
              Become a venue
            </Link>
          </article>
        </div>
      </motion.section>

      <motion.section
        id="lead-form"
        className="season-section space-y-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <p className="season-kicker">Venue onboarding</p>
        <h2 className="text-2xl font-semibold text-[#E5E7EB] md:text-3xl">For venues: activate missions + reservations</h2>
        <p className="text-sm text-[#94A3B8]">
          Claim a founding slot, launch your QR menu, and start social missions in minutes.
        </p>
        <div className="grid gap-3 rounded-3xl bg-white/5 p-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#0F172A]/60 p-3">
            <PlayCircle className="h-5 w-5 text-[#FF7A18]" />
            <p className="mt-2 text-sm font-semibold text-[#E5E7EB]">Founding Venue Slot</p>
            <p className="text-xs text-[#94A3B8]">12 / 30 claimed • Season ends in {liveData.seasonDaysLeft} days</p>
          </div>
          <div className="rounded-2xl bg-[#0F172A]/60 p-3">
            <Ticket className="h-5 w-5 text-[#00E0FF]" />
            <p className="mt-2 text-sm font-semibold text-[#E5E7EB]">Pilot data ready</p>
            <p className="text-xs text-[#94A3B8]">
              {liveData.activeVenues} venues • {liveData.reviewsGenerated} reviews generated
            </p>
          </div>
          <div className="rounded-2xl bg-[#0F172A]/60 p-3">
            <Gift className="h-5 w-5 text-[#FF7A18]" />
            <p className="mt-2 text-sm font-semibold text-[#E5E7EB]">Launch fast</p>
            <p className="text-xs text-[#94A3B8]">Menu + missions + tracking in one simple flow</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="restaurantName" className="text-[#E5E7EB]/85">
              Restaurant name
            </Label>
            <Input
              id="restaurantName"
              value={leadForm.restaurantName}
              onChange={(e) =>
                setLeadForm((prev) => ({ ...prev, restaurantName: e.target.value }))
              }
              placeholder="Example: Vienna Pasta House"
              className="border-[#334155] bg-[#0F172A]/80 text-[#E5E7EB] placeholder:text-[#94A3B8]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="district" className="text-[#E5E7EB]/85">
              District
            </Label>
            <Input
              id="district"
              value={leadForm.district}
              onChange={(e) => setLeadForm((prev) => ({ ...prev, district: e.target.value }))}
              placeholder="Example: District 7"
              className="border-[#334155] bg-[#0F172A]/80 text-[#E5E7EB] placeholder:text-[#94A3B8]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phoneOrWhatsApp" className="text-[#E5E7EB]/85">
              Phone / WhatsApp
            </Label>
            <Input
              id="phoneOrWhatsApp"
              value={leadForm.phoneOrWhatsApp}
              onChange={(e) =>
                setLeadForm((prev) => ({ ...prev, phoneOrWhatsApp: e.target.value }))
              }
              placeholder="Example: +43 660 1234567"
              className="border-[#334155] bg-[#0F172A]/80 text-[#E5E7EB] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="premium"
          size="hero"
          className="season-btn-primary w-full border-0 md:w-auto"
          disabled={submitting}
          onClick={() => void submitLead()}
        >
          {submitting ? "Submitting..." : "Get Onboarded"}
        </Button>
        <div className="flex flex-wrap gap-2 pt-1 text-xs text-[#94A3B8]">
          <span className="rounded-full border border-[#334155] bg-[#0F172A]/70 px-3 py-1">
            Manual moderation (pilot)
          </span>
          <span className="rounded-full border border-[#334155] bg-[#0F172A]/70 px-3 py-1">
            Anti-spam limits
          </span>
          <span className="rounded-full border border-[#334155] bg-[#0F172A]/70 px-3 py-1">
            Auditable reward ledger (DB-first)
          </span>
        </div>
      </motion.section>

      <nav className="fixed inset-x-0 bottom-24 z-30 mx-auto w-[calc(100%-1.5rem)] max-w-md md:hidden">
        <Link href="/r/sunset-bistro" className="season-btn-primary w-full">
          <Upload className="mr-1 h-4 w-4" />
          Start playing
        </Link>
      </nav>

      <a
        href="#lead-form"
        className="season-glass fixed bottom-24 right-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden"
        aria-label="Jump to lead form"
      >
        <MessageSquareText className="h-4 w-4 text-[#E5E7EB]" />
      </a>

      <div className="season-divider" />
      <p className="pb-20 text-center text-xs text-[#94A3B8] md:pb-0">Pilot interface. Live numbers update in demo mode.</p>
    </main>
  );
}
