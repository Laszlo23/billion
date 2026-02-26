"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumChip, PremiumSurface } from "@/src/components/ui/PremiumSurface";

type Item = { name: string; price: string; currency: string };
type Category = { name: string; items: Item[] };

type Props = {
  ownerId: string;
  initialCategories: Category[];
};

export function MenuPreviewEditor({ ownerId, initialCategories }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [message, setMessage] = useState<string | null>(null);
  const [publishedRoute, setPublishedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const valid = useMemo(
    () => Boolean(name.trim() && slug.trim() && categories.length > 0),
    [categories, name, slug],
  );

  function updateCategoryName(index: number, next: string) {
    const clone = [...categories];
    clone[index].name = next;
    setCategories(clone);
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/restaurants/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          name,
          slug,
          categories,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onboarding failed.");
      setPublishedRoute(data.route as string);
      setMessage("Restaurant published successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PremiumSurface className="space-y-4">
      <div className="space-y-2">
        <PremiumChip>Final review</PremiumChip>
        <h3 className="text-lg font-semibold">Review extracted menu</h3>
        <p className="text-sm text-muted-foreground">
          Rename categories if needed, then publish your restaurant QR page.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="restaurant-name">Restaurant Name</Label>
        <Input
          id="restaurant-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="restaurant-slug">Slug</Label>
        <Input id="restaurant-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>
      {categories.map((category, index) => (
        <div key={index} className="rounded-xl border bg-white/80 p-3">
          <Input
            value={category.name}
            onChange={(e) => updateCategoryName(index, e.target.value)}
          />
          <ul className="mt-2 text-sm text-muted-foreground">
            {category.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {item.name} - {item.price} {item.currency}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Button onClick={handleSave} disabled={!valid || loading}>
        {loading ? "Publishing..." : "Publish QR Menu"}
      </Button>
      {message ? <p className="text-sm">{message}</p> : null}
      {publishedRoute ? (
        <div className="grid gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p className="font-medium text-emerald-800">
            Live route ready: <code>{publishedRoute}</code>
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={publishedRoute}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
            >
              View live menu
            </Link>
            <Link
              href="/restaurant"
              className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      ) : null}
    </PremiumSurface>
  );
}
