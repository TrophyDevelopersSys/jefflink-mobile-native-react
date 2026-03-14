"use client";
import React, { useState } from "react";

export interface ImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function ImageGallery({ images, alt = "Gallery image", className = "" }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) return null;

  return (
    <div className={className}>
      {/* Main image */}
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="relative w-full overflow-hidden rounded-lg bg-surface cursor-zoom-in"
      >
        <img
          src={images[active]}
          alt={`${alt} ${active + 1}`}
          className="w-full h-72 object-cover"
        />
        <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          {active + 1}/{images.length}
        </span>
      </button>

      {/* Thumbnails */}
      {images.length > 1 ? (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`flex-shrink-0 rounded overflow-hidden transition-opacity ${
                i === active ? "ring-2 ring-brand-accent opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <img src={src} alt={`Thumbnail ${i + 1}`} className="w-14 h-14 object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Lightbox */}
      {lightbox ? (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <img
            src={images[active]}
            alt={`${alt} full`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white text-2xl bg-black/40 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
