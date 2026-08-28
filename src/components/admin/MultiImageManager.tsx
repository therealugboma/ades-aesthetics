"use client";

import { useRef } from "react";

export type ManagedImage =
  | { id: string; kind: "existing"; url: string }
  | { id: string; kind: "new"; file: File; previewUrl: string };

interface MultiImageManagerProps {
  label: string;
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  maxImages?: number;
}

export function existingManagedImages(urls: string[]): ManagedImage[] {
  return urls.filter(Boolean).map((url, index) => ({
    id: `existing-${index}-${url}`,
    kind: "existing",
    url,
  }));
}

export function releaseManagedImagePreviews(images: ManagedImage[]) {
  for (const image of images) {
    if (image.kind === "new") URL.revokeObjectURL(image.previewUrl);
  }
}

export default function MultiImageManager({
  label,
  images,
  onChange,
  maxImages = 12,
}: MultiImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const available = Math.max(maxImages - images.length, 0);
    const additions: ManagedImage[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, available)
      .map((file) => ({
        id: `new-${crypto.randomUUID()}`,
        kind: "new" as const,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    onChange([...images, ...additions]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const removed = images[index];
    if (removed?.kind === "new") URL.revokeObjectURL(removed.previewUrl);
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <p className="text-xs text-gray-500">The first image is the cover. Add up to {maxImages}.</p>
        </div>
        <span className="text-xs text-gray-400">{images.length}/{maxImages}</span>
      </div>

      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => {
            const src = image.kind === "existing" ? image.url : image.previewUrl;
            return (
              <div key={image.id} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <div className="relative aspect-square">
                  <img src={src} alt={`${label} ${index + 1}`} className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-gray-900/80 px-2 py-1 text-[10px] font-medium text-white">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-lg leading-none text-red-600 shadow"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveImage(index, index - 1)}
                    className="px-2 py-1 text-xs text-gray-600 disabled:opacity-25"
                    aria-label={`Move image ${index + 1} left`}
                  >
                    ←
                  </button>
                  <span className="text-[10px] text-gray-400">{index + 1}</span>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => moveImage(index, index + 1)}
                    className="px-2 py-1 text-xs text-gray-600 disabled:opacity-25"
                    aria-label={`Move image ${index + 1} right`}
                  >
                    →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => addFiles(event.target.files)}
        className="hidden"
      />
      <button
        type="button"
        disabled={images.length >= maxImages}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-sm font-medium text-gray-600 transition-colors hover:border-rose-400 hover:bg-rose-50/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Add pictures
      </button>
      <p className="mt-1 text-xs text-gray-400">PNG, JPG or WEBP. You can choose several files at once.</p>
    </div>
  );
}
