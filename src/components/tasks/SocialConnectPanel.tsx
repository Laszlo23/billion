"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, Heart, Instagram, Linkedin, Link2, Music2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";

type SocialStatus = "disconnected" | "connected_unverified" | "connected_verified";
type SocialPlatform = "instagram" | "tiktok" | "linkedin";

type SocialEntry = {
  handle: string | null;
  status: SocialStatus;
};

type SocialsResponse = {
  socials: {
    instagram: SocialEntry;
    tiktok: SocialEntry;
    linkedin: SocialEntry;
  };
};

type Props = {
  userId: string;
};

const platformRows: Array<{ platform: SocialPlatform; label: string; placeholder: string }> = [
  { platform: "instagram", label: "Instagram", placeholder: "burgerlover" },
  { platform: "tiktok", label: "TikTok", placeholder: "myfoodclips" },
  { platform: "linkedin", label: "LinkedIn", placeholder: "firstname-lastname" },
];

function statusLabel(status: SocialStatus) {
  if (status === "connected_verified") return "Verified";
  if (status === "connected_unverified") return "Connected";
  return "Disconnected";
}

function statusClass(status: SocialStatus) {
  if (status === "connected_verified") {
    return "border border-emerald-400/35 bg-emerald-400/15 text-emerald-200";
  }
  if (status === "connected_unverified") {
    return "border border-amber-400/35 bg-amber-400/15 text-amber-200";
  }
  return "border border-slate-500/35 bg-slate-700/25 text-slate-300";
}

export function SocialConnectPanel({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [handles, setHandles] = useState<Record<SocialPlatform, string>>({
    instagram: "",
    tiktok: "",
    linkedin: "",
  });
  const [statuses, setStatuses] = useState<Record<SocialPlatform, SocialStatus>>({
    instagram: "disconnected",
    tiktok: "disconnected",
    linkedin: "disconnected",
  });

  const loadSocials = useCallback(async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}/socials`);
      const json = (await res.json()) as SocialsResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load social handles.");
      }
      setHandles({
        instagram: json.socials.instagram.handle ?? "",
        tiktok: json.socials.tiktok.handle ?? "",
        linkedin: json.socials.linkedin.handle ?? "",
      });
      setStatuses({
        instagram: json.socials.instagram.status,
        tiktok: json.socials.tiktok.status,
        linkedin: json.socials.linkedin.status,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load social handles.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadSocials();
  }, [loadSocials]);

  const verifyReady = useMemo(
    () => ({
      instagram: Boolean(handles.instagram.trim()),
      tiktok: Boolean(handles.tiktok.trim()),
      linkedin: Boolean(handles.linkedin.trim()),
    }),
    [handles],
  );

  async function saveHandles() {
    if (!userId.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}/socials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramHandle: handles.instagram,
          tiktokHandle: handles.tiktok,
          linkedinHandle: handles.linkedin,
        }),
      });
      const json = (await res.json()) as SocialsResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save social handles.");
      }
      setStatuses({
        instagram: json.socials.instagram.status,
        tiktok: json.socials.tiktok.status,
        linkedin: json.socials.linkedin.status,
      });
      setMessage("Social handles saved. Verify each platform for better mission matching.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save handles.");
    } finally {
      setSaving(false);
    }
  }

  async function mockVerify(platform: SocialPlatform) {
    if (!userId.trim()) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}/socials/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const json = (await res.json()) as SocialsResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Verification failed.");
      }
      setStatuses({
        instagram: json.socials.instagram.status,
        tiktok: json.socials.tiktok.status,
        linkedin: json.socials.linkedin.status,
      });
      setMessage(`${platform} is verified for prototype matching.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Verification failed.");
    }
  }

  if (!userId.trim()) {
    return (
      <PremiumSurface>
        <h3 className="text-lg font-semibold">Connect socials</h3>
        <p className="text-sm text-muted-foreground">
          Enter your tasker user ID first to connect Instagram, TikTok, and LinkedIn.
        </p>
      </PremiumSurface>
    );
  }

  return (
    <PremiumSurface className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
          <Heart className="h-4 w-4 text-primary" />
          Connect socials
        </h3>
        <PremiumChip className="inline-flex items-center gap-1">
          <Link2 className="h-3.5 w-3.5" />
          Prototype verification
        </PremiumChip>
      </div>
      <p className="text-sm text-muted-foreground">
        Add your handles so mission checks can map proof to your public profiles.
      </p>
      <div className="space-y-3">
        {platformRows.map((row) => (
          <div key={row.platform} className="glass-surface rounded-xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor={`social-${row.platform}`} className="inline-flex items-center gap-1.5">
                {row.platform === "instagram" ? (
                  <Instagram className="h-3.5 w-3.5 text-primary" />
                ) : row.platform === "tiktok" ? (
                  <Music2 className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Linkedin className="h-3.5 w-3.5 text-primary" />
                )}
                {row.label}
              </Label>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(statuses[row.platform])}`}>
                {statusLabel(statuses[row.platform])}
              </span>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                id={`social-${row.platform}`}
                value={handles[row.platform]}
                onChange={(e) =>
                  setHandles((current) => ({
                    ...current,
                    [row.platform]: e.target.value,
                  }))
                }
                placeholder={row.placeholder}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!verifyReady[row.platform]}
                onClick={() => mockVerify(row.platform)}
              >
                <BadgeCheck className="mr-1 h-4 w-4" />
                Verify
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={saveHandles} disabled={loading || saving}>
        {loading ? "Loading..." : saving ? "Saving..." : "Save social handles"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </PremiumSurface>
  );
}
