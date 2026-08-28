"use client";

import { useState } from "react";

interface GalleryItem {
  _id: string;
  url: string;
  alt: string;
  category: string;
  isFeatured: boolean;
}

interface GalleryGridProps {
  images: GalleryItem[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  if (images.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">No images in this category yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {images.map((image) => (
          <div
            key={image._id}
            className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
            onClick={() => setLightboxImage(image)}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="h-auto w-full transition-transform duration-300 hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImage.url}
            alt={lightboxImage.alt}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            decoding="async"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {lightboxImage.alt}
          </p>
        </div>
      )}
    </>
  );
}
