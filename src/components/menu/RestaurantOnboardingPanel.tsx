"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, Download, LocateFixed, MapPin, Sparkles, Store } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OnboardingQuestRail } from "@/src/components/onboarding/OnboardingQuestRail";
import { actionError, actionSuccess } from "@/src/lib/actionFeedback";
import { createRestaurantFromOnboarding } from "@/src/lib/restaurants/actions";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";

type DemoOwner = { id: string; email: string | null };
type UploadedImage = { name: string; url: string };

export function RestaurantOnboardingPanel() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState("");
  const [owners, setOwners] = useState<DemoOwner[]>([]);
  const [showOwnerSettings, setShowOwnerSettings] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [result, setResult] = useState<null | {
    slug: string;
    qrSvg: string;
    manualEditRequired: boolean;
  }>(null);

  useEffect(() => {
    async function loadOwners() {
      try {
        const res = await fetch("/api/demo/restaurant-owners");
        const json = (await res.json()) as { owners?: DemoOwner[] };
        if (!res.ok) return;
        setOwners(json.owners ?? []);
      } catch {
        setOwners([]);
      }
    }
    void loadOwners();
  }, []);

  useEffect(() => {
    if (!ownerId && owners.length > 0) {
      setOwnerId(owners[0]?.id ?? "");
    }
  }, [ownerId, owners]);

  const stepState = useMemo(
    () => ({
      photosReady: images.length > 0 && images.length <= 5,
      locationReady:
        (typeof latitude === "number" && typeof longitude === "number") ||
        Boolean(address.trim()),
      nameReady: Boolean(name.trim()),
      ownerSelected: Boolean(ownerId.trim()),
      readyToPublish:
        Boolean(ownerId.trim() && name.trim()) &&
        images.length > 0 &&
        images.length <= 5 &&
        ((typeof latitude === "number" && typeof longitude === "number") ||
          Boolean(address.trim())),
    }),
    [address, images.length, latitude, longitude, name, ownerId],
  );
  const progressPct = activeStep === 1 ? 34 : activeStep === 2 ? 68 : 100;

  useEffect(() => {
    if (activeStep === 1 && stepState.photosReady) {
      setActiveStep(2);
      return;
    }
    if (activeStep === 2 && stepState.locationReady) {
      setActiveStep(3);
    }
  }, [activeStep, stepState.locationReady, stepState.photosReady]);

  async function uploadMenuFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    if (fileList.length + images.length > 5) {
      toast.error("Upload up to 5 photos for faster onboarding.");
      return;
    }
    const formData = new FormData();
    Array.from(fileList).forEach((file) => formData.append("files", file));
    const res = await fetch("/api/uploads/menu", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Upload failed.");
    }
    const incoming = (data.files ?? []) as UploadedImage[];
    setImages((prev) => [...prev, ...incoming].slice(0, 5));
    toast.success(`${incoming.length} photo(s) uploaded.`);
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        toast.success("Location captured.");
      },
      () => {
        toast.error("Could not fetch location. You can still continue with manual address.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function publishRestaurant() {
    if (!stepState.readyToPublish) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await createRestaurantFromOnboarding({
        ownerId,
        name,
        latitude,
        longitude,
        address,
        imageUrls: images.map((image) => image.url),
      });
      setResult({
        slug: response.slug,
        qrSvg: response.qrSvg,
        manualEditRequired: response.manualEditRequired,
      });
      actionSuccess({
        toastMessage: "Restaurant created. Opening dashboard...",
        celebration: {
          type: "milestone",
          title: "Venue is live",
          subtitle: `/${response.slug} is ready for missions`,
          intensity: "strong",
        },
      });
      router.push(
        response.manualEditRequired
          ? "/restaurant/dashboard?manualEdit=1"
          : "/restaurant/dashboard",
      );
    } catch (error) {
      actionError(error instanceof Error ? error.message : "Onboarding failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PremiumSurface className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="owner-id" className="text-sm font-medium">
            Workspace
          </Label>
          <PremiumChip>Demo mode</PremiumChip>
        </div>
        <div className="glass-surface rounded-lg p-3 text-sm">
          <p className="font-medium text-slate-100">
            Owner: {(owners.find((owner) => owner.id === ownerId)?.email ?? ownerId) || "Not selected"}
          </p>
          <button
            type="button"
            className="mt-1 text-xs text-primary underline"
            onClick={() => setShowOwnerSettings((prev) => !prev)}
          >
            {showOwnerSettings ? "Hide owner settings" : "Change owner"}
          </button>
        </div>
        {showOwnerSettings ? (
          <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr]">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              <option value="">Select seeded owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.email ?? owner.id}
                </option>
              ))}
            </select>
            <p className="self-center text-center text-xs text-muted-foreground">or</p>
            <Input
              id="owner-id"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              placeholder="Paste owner user ID"
            />
          </div>
        ) : null}
        <div className="grid gap-2 text-xs md:grid-cols-3">
          <p className={`premium-card p-2 ${stepState.photosReady ? "border-emerald-300/40" : ""}`}>
            <span className="inline-flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-accent" />
              Photos {stepState.photosReady ? "done" : "pending"}
            </span>
          </p>
          <p className={`premium-card p-2 ${stepState.locationReady ? "border-emerald-300/40" : ""}`}>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              Location {stepState.locationReady ? "done" : "pending"}
            </span>
          </p>
          <p className={`premium-card p-2 ${stepState.nameReady ? "border-emerald-300/40" : ""}`}>
            <span className="inline-flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-primary" />
              Name {stepState.nameReady ? "done" : "pending"}
            </span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          One action per step. We auto-move you to the next step.
        </p>
      </PremiumSurface>
      <OnboardingQuestRail
        userId={ownerId}
        persona="venue"
        title="Venue launch rewards"
      />
      <PremiumSurface className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Step {activeStep} of 3
          </h3>
          <p className="text-xs text-muted-foreground">About 3 minutes</p>
        </div>
        <div className="h-1.5 rounded-full bg-slate-700/40">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#00E0FF] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {activeStep === 1 ? (
          <div className="space-y-3">
            <Label htmlFor="menu-upload">Upload menu photos (1-5)</Label>
            <Input
              id="menu-upload"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => {
                void uploadMenuFiles(e.target.files).catch((error: unknown) => {
                  toast.error(error instanceof Error ? error.message : "Upload failed.");
                });
              }}
            />
            <p className="text-xs text-muted-foreground">
              Keep each page fully visible for best extraction quality.
            </p>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
              {images.map((image, index) => (
                <img
                  key={`${image.url}-${index}`}
                  src={image.url}
                  alt={image.name}
                  className="h-20 w-full rounded-lg border object-cover"
                />
              ))}
            </div>
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="space-y-3">
            <Button type="button" variant="outline" className="w-full" onClick={requestLocation}>
              <LocateFixed className="mr-2 h-4 w-4" />
              Share current location
            </Button>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="glass-surface rounded-lg p-3 text-sm">
                Latitude: {latitude?.toFixed(6) ?? "Not set"}
              </div>
              <div className="glass-surface rounded-lg p-3 text-sm">
                Longitude: {longitude?.toFixed(6) ?? "Not set"}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">Manual address fallback</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Example: Mariahilfer Strasse 101, Vienna"
              />
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={() => setActiveStep(3)}>
              Continue to name
            </Button>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="restaurant-name">Restaurant name</Label>
              <Input
                id="restaurant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Vienna Pasta House"
              />
            </div>
            <Button
              type="button"
              variant="premium"
              size="hero"
              className="w-full"
              disabled={!stepState.readyToPublish || loading || !stepState.ownerSelected}
              onClick={() => void publishRestaurant()}
            >
              {loading ? "Creating..." : "Go live now"}
            </Button>
            {!stepState.ownerSelected ? (
              <p className="text-xs text-red-500">Select a workspace owner before publishing.</p>
            ) : null}
          </div>
        ) : null}
      </PremiumSurface>

      {result ? (
        <PremiumSurface className="space-y-3">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            QR ready: /r/{result.slug}
          </p>
          <img src={result.qrSvg} alt="Generated QR SVG" className="h-40 w-40 rounded-xl border bg-white p-2" />
          <a
            href={result.qrSvg}
            download={`qr-${result.slug}.svg`}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Download QR SVG
          </a>
          {result.manualEditRequired ? (
            <p className="text-xs text-amber-700">
              AI extraction failed, so manual edit fallback was created for this restaurant.
            </p>
          ) : (
            <p className="text-xs text-emerald-700">Menu extracted automatically from uploaded photos.</p>
          )}
        </PremiumSurface>
      ) : null}
    </div>
  );
}
