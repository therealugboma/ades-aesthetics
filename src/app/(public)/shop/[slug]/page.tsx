"use client";

import dynamic from "next/dynamic";

const ProductDetailPage = dynamic(
  () => import("@/components/shop/ProductDetailClient"),
  { ssr: false }
);

export default function ShopProductPage() {
  return (
    <main className="flex-1 bg-gray-50">
        <ProductDetailPage />
      </main>
  );
}
