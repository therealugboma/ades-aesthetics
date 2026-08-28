"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { getServicePriceLabel } from "@/lib/service-pricing";

function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`;
}

export function HomeServices() {
  const services = useQuery(api.services.list);

  if (!services || services.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500">
        <p>Loading services...</p>
      </div>
    );
  }

  const featured = services.slice(0, 3);

  return (
    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((service) => (
        <div
          key={service._id}
          className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-rose-100 to-pink-50 mb-4">
            {(service.imageUrls?.[0] || service.imageUrl) && (
              <img
                src={service.imageUrls?.[0] || service.imageUrl}
                alt={`${service.name} result`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {service.name}
          </h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {service.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-rose-600">
              {getServicePriceLabel(service)}
            </span>
            <span className="text-sm text-gray-500">
              {service.duration} min
            </span>
          </div>
          <Link
            href="/booking"
            className="mt-4 block w-full rounded-lg bg-rose-50 py-2 text-center text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors"
          >
            Book Now
          </Link>
        </div>
      ))}
    </div>
  );
}

export function HomeProducts() {
  const products = useQuery(api.products.list);

  if (!products || products.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500">
        <p>Loading products...</p>
      </div>
    );
  }

  const featured = products.slice(0, 4);

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {featured.map((product) => (
        <Link
          key={product._id}
          href={`/shop/${product.slug}`}
          className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-100 to-rose-50">
            {(product.imageUrls?.[0] || product.imageUrl) && (
              <img
                src={product.imageUrls?.[0] || product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-rose-600">
            {formatPrice(product.price)}
          </p>
        </Link>
      ))}
    </div>
  );
}
