"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
  alt?: string;
}

export function ImageUploader({
  images,
  onChange,
  folder,
  multiple = true,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder: string;
  multiple?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        uploaded.push({
          url: json.data.url,
          publicId: json.data.publicId,
          isPrimary: images.length === 0 && uploaded.length === 0,
        });
      }

      onChange(multiple ? [...images, ...uploaded] : uploaded);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove(publicId: string) {
    const remaining = images.filter((img) => img.publicId !== publicId);
    if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    onChange(remaining);
  }

  function handleSetPrimary(publicId: string) {
    onChange(
      images.map((img) => ({ ...img, isPrimary: img.publicId === publicId }))
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
        {images.map((img) => (
          <div
            key={img.publicId}
            className="relative aspect-square overflow-hidden rounded-md border border-ink/10 dark:border-ivory/10"
          >
            <Image src={img.url} alt="" fill sizes="150px" className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img.publicId)}
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-ivory"
            >
              <X size={12} />
            </button>
            <button
              type="button"
              onClick={() => handleSetPrimary(img.publicId)}
              className={cn(
                "absolute bottom-1 left-1 flex h-6 w-6 items-center justify-center rounded-full",
                img.isPrimary ? "bg-emerald-500 text-ivory" : "bg-ink/50 text-ivory/70"
              )}
              aria-label="Set as primary image"
            >
              <Star size={12} className={img.isPrimary ? "fill-current" : ""} />
            </button>
          </div>
        ))}

        <label
          className={cn(
            "flex aspect-square items-center justify-center rounded-md border border-dashed border-ink/20 dark:border-ivory/20 cursor-pointer hover:border-emerald-500 transition-colors",
            isUploading && "pointer-events-none opacity-50"
          )}
        >
          {isUploading ? (
            <Loader2 size={20} className="animate-spin text-emerald-500" />
          ) : (
            <Upload size={20} className="text-ink/40 dark:text-ivory/40" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      <p className="text-xs text-ink/40 dark:text-ivory/40">
        Click the star to set the primary image. JPEG, PNG, WEBP, or AVIF, up
        to 5MB each.
      </p>
    </div>
  );
}
