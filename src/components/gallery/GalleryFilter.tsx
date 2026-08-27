"use client";

import { cn } from "@/lib/utils";

interface GalleryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function GalleryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: GalleryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300",
            activeCategory === category
              ? "bg-rose-gold text-white shadow-lg shadow-rose-gold/25"
              : "bg-blush-light text-foreground/70 hover:bg-blush hover:text-foreground"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
