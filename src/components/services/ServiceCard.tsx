"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getServicePriceLabel, type ServicePriceOption } from "@/lib/service-pricing";

interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  imageUrl?: string;
  imageUrls?: string[];
  priceOptions?: ServicePriceOption[];
}

export default function ServiceCard({ service, eager = false }: { service: Service; eager?: boolean }) {
  const images = service.imageUrls?.length
    ? service.imageUrls
    : service.imageUrl
      ? [service.imageUrl]
      : [];
  const [activeImage, setActiveImage] = useState(0);
  const activeIndex = images.length > 0 ? activeImage % images.length : 0;
  const visibleIndexes = images.length <= 3
    ? images.map((_, index) => index)
    : Array.from(new Set([
        activeIndex,
        (activeIndex - 1 + images.length) % images.length,
        (activeIndex + 1) % images.length,
      ]));

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-50">
        {images[activeIndex] ? (
          visibleIndexes.map((index) => (
            <Image
              key={`${images[index]}-${index}`}
              src={images[index]}
              alt={index === activeIndex ? `${service.name} result ${index + 1}` : ""}
              fill
              sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 50vw, 33vw"
              quality={75}
              loading={eager && index === activeIndex ? "eager" : "lazy"}
              draggable={false}
              className={`object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-30">
              {service.category === "nails" && "💅"}
              {service.category === "lashes" && "👁️"}
              {service.category === "brows" && "✨"}
              {service.category === "skin" && "🧴"}
              {service.category === "other" && "✨"}
            </span>
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
          {service.duration} min
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveImage((current) => (current - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm hover:bg-white"
              aria-label="Previous service picture"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActiveImage((current) => (current + 1) % images.length)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm hover:bg-white"
              aria-label="Next service picture"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-1.5 w-1.5 rounded-full ${index === activeIndex ? "bg-white" : "bg-white/50"}`}
                  aria-label={`Show service picture ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-heading text-xl font-semibold text-gray-900">
          {service.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-500">
          {service.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-rose-600">
            {getServicePriceLabel(service)}
          </span>
          <Link
            href="/booking"
            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
