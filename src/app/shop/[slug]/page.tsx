"use client";

import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const ProductDetailPage = dynamic(
  () => import("@/components/shop/ProductDetailClient"),
  { ssr: false }
);

export default function ShopProductPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <ProductDetailPage />
      </main>
      <Footer />
    </>
  );
}
