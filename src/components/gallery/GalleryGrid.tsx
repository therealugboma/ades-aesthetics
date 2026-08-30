"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const visibleImages = images.filter(
    (image) =>
      !failedImageIds.has(image._id) &&
      !image.url.startsWith("/images/gallery/")
  );

  useEffect(() => {
    if (!lightboxImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
      } else if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus();
    };
  }, [lightboxImage]);

  if (visibleImages.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">No images in this category yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visibleImages.map((image) => (
          <button
            type="button"
            key={image._id}
            className="relative aspect-[3/4] overflow-hidden rounded-xl bg-rose-50 text-left"
            onClick={(event) => {
              openerRef.current = event.currentTarget;
              setLightboxImage(image);
            }}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={75}
              className="object-cover transition-transform duration-300 hover:scale-105 motion-reduce:transition-none"
              onError={() =>
                setFailedImageIds((current) => new Set(current).add(image._id))
              }
            />
          </button>
        ))}
      </div>

      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image preview: ${lightboxImage.alt}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close image preview"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative h-[85vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              fill
              sizes="100vw"
              quality={75}
              className="rounded-lg object-contain"
            />
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {lightboxImage.alt}
          </p>
        </div>
      )}
    </>
  );
}
