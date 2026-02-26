"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PremiumChip,
  PremiumSoftSurface,
  PremiumSurface,
} from "@/src/components/ui/PremiumSurface";

type Props = {
  onExtracted: (categories: unknown[]) => void;
};

type UploadedImage = {
  name: string;
  url: string;
};

export function MenuScannerUpload({ onExtracted }: Props) {
  const [urlsInput, setUrlsInput] = useState("");
  const [localImages, setLocalImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleLocalFileUpload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      Array.from(fileList).forEach((file) => formData.append("files", file));
      const res = await fetch("/api/uploads/menu", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }
      setLocalImages((prev) => [...prev, ...(data.files ?? [])]);
      setSuccess(`${data.files?.length ?? 0} image(s) uploaded.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images.");
    } finally {
      setUploading(false);
    }
  }

  function moveImage(index: number, direction: "up" | "down") {
    setLocalImages((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  }

  function removeImage(index: number) {
    setLocalImages((current) => current.filter((_, i) => i !== index));
  }

  async function handleExtract() {
    const manualUrls = urlsInput
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);
    const imageUrls = [...localImages.map((image) => image.url), ...manualUrls];

    if (imageUrls.length === 0) {
      setError("Add at least one menu image.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/vision/extract-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Menu extraction failed.");
      }
      onExtracted(data.categories ?? []);
      setSuccess("Menu extracted. Continue to review and publish your live QR page.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract menu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PremiumSurface className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <PremiumChip>Step 1: Add photos</PremiumChip>
          <PremiumChip>Step 2: AI reads menu</PremiumChip>
          <PremiumChip>Step 3: Review & publish</PremiumChip>
        </div>
        <h3 className="text-xl font-semibold">Capture your menu in minutes</h3>
        <p className="text-sm text-muted-foreground">
          Use your camera or upload files. BiteMine turns your menu into structured
          categories and items automatically.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <PremiumSoftSurface className="space-y-2 border-dashed p-4">
          <Label htmlFor="menu-camera">Capture with camera</Label>
          <Input
            id="menu-camera"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => handleLocalFileUpload(e.target.files)}
          />
          <p className="text-xs text-muted-foreground">
            Best results: bright lighting, full page visible.
          </p>
        </PremiumSoftSurface>
        <PremiumSoftSurface className="space-y-2 border-dashed p-4">
          <Label htmlFor="menu-files">Upload from device</Label>
          <Input
            id="menu-files"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleLocalFileUpload(e.target.files)}
          />
          <p className="text-xs text-muted-foreground">
            JPG or PNG supported. Upload several pages in sequence.
          </p>
        </PremiumSoftSurface>
      </div>

      {localImages.length > 0 ? (
        <div className="space-y-2">
          <Label>Uploaded pages ({localImages.length})</Label>
          <div className="space-y-2">
            {localImages.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className="flex items-center justify-between rounded-xl border bg-white/80 p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <span>{image.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => moveImage(index, "up")}
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => moveImage(index, "down")}
                  >
                    Down
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Label htmlFor="menu-urls">Optional: paste public image URLs</Label>
      <Textarea
        id="menu-urls"
        value={urlsInput}
        onChange={(e) => setUrlsInput(e.target.value)}
        placeholder="https://.../menu-page-1.jpg"
      />
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button className="w-full md:w-auto" onClick={handleExtract} disabled={loading || uploading}>
        {uploading ? "Uploading..." : loading ? "Extracting..." : "Build menu with AI"}
      </Button>
    </PremiumSurface>
  );
}
