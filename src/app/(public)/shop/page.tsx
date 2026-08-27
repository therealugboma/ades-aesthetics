"use client";

import dynamic from "next/dynamic";
const ShopClient = dynamic(
  () => import("@/components/shop/ShopClient"),
  { ssr: false }
);

export default function ShopPage() {
  return (
    <main className="flex-1">
        <section className="bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Shop Our Products
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Professional-grade beauty products handpicked by our experts.
            </p>
          </div>
        </section>
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ShopClient />
          </div>
        </section>
      </main>
  );
}
