"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import GalleryGrid from "./GalleryGrid";
import GalleryFilter from "./GalleryFilter";

type Category = "nails" | "lashes" | "brows" | "skin" | "all";

export default function GalleryClient() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const images = useQuery(
    api.gallery.list,
    activeCategory === "all" ? {} : { category: activeCategory }
  );

  if (images === undefined) {
    return (
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="mb-4 h-48 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <>
      <GalleryFilter
        categories={["all", "nails", "lashes", "brows", "skin"]}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat as Category)}
      />
      <div className="mt-8">
        <GalleryGrid images={images} />
      </div>
    </>
  );
}
