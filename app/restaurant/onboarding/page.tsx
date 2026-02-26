import { RestaurantOnboardingPanel } from "@/src/components/menu/RestaurantOnboardingPanel";
import { PremiumChip, PremiumSoftSurface } from "@/src/components/ui/PremiumSurface";
import { onboardingFoodImage } from "@/src/lib/demo/foodImages";
import { Camera, MapPin, Store } from "lucide-react";

export default function RestaurantOnboardingPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-8 md:px-8">
      <PremiumSoftSurface className="season-section space-y-4 p-6 md:p-8">
        <div className="premium-hero-media h-40 w-full">
          <img
            src={onboardingFoodImage}
            alt="Restaurant onboarding food visual"
            className="h-full w-full object-cover"
          />
          <div className="absolute left-0 top-0 z-10 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              Browser-first setup
            </p>
          </div>
        </div>
        <PremiumChip>Restaurant onboarding</PremiumChip>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Take a picture of your menu. We do the rest.
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Three quick steps. Your QR menu and dashboard go live right after.
        </p>
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <p className="premium-card inline-flex items-center gap-2 p-3">
            <Camera className="h-4 w-4 text-accent" />
            1. Upload menu photos
          </p>
          <p className="premium-card inline-flex items-center gap-2 p-3">
            <MapPin className="h-4 w-4 text-accent" />
            2. Share your location
          </p>
          <p className="premium-card inline-flex items-center gap-2 p-3">
            <Store className="h-4 w-4 text-primary" />
            3. Name and publish
          </p>
        </div>
      </PremiumSoftSurface>
      <RestaurantOnboardingPanel />
    </main>
  );
}
