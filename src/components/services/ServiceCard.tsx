"use client";

import Link from "next/link";

interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  imageUrl?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-50">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover"
          />
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
            {formatPrice(service.price)}
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
