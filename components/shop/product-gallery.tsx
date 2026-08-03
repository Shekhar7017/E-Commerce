"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt?: string;
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  const active = images[activeIndex] ?? images[0];

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-ink/5 dark:bg-ivory/5 cursor-zoom-in"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {active && (
          <Image
            src={active.url}
            alt={active.alt ?? productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-200 ease-out"
            style={
              isZooming
                ? {
                    transform: "scale(1.8)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border transition-colors",
                i === activeIndex
                  ? "border-emerald-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} thumbnail ${i + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
