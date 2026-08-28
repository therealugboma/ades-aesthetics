"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import GalleryGrid from "./GalleryGrid";
import GalleryFilter from "./GalleryFilter";
import { premiumGalleryImages } from "@/lib/gallery-images";

type Category = "nails" | "lashes" | "brows" | "skin" | "all";

export default function GalleryClient() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const images = useQuery(
    api.gallery.list,
    activeCategory === "all" ? {} : { category: activeCategory }
  );

  const fallbackImages = premiumGalleryImages
    .filter(
      (image) =>
        activeCategory === "all" || image.category === activeCategory
    )
    .map((image) => ({
      _id: `fallback-${image.src}`,
      url: image.src,
      alt: image.alt,
      category: image.category,
      isFeatured: true,
    }));
  const uploadedImages = images?.filter(
    (image) => !image.url.startsWith("/images/gallery/")
  );
  const displayImages = uploadedImages?.length
    ? uploadedImages
    : fallbackImages;

  return (
    <>
      <GalleryFilter
        categories={["all", "nails", "lashes", "brows", "skin"]}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat as Category)}
      />
      <div className="mt-8">
        <GalleryGrid images={displayImages} />
      </div>
    </>
  );
}
