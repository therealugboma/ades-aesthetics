import type { Metadata } from "next";
import ProductDetailPage from "@/components/shop/ProductDetailClient";

export const metadata: Metadata = {
  title: "Beauty Product | Ades Aesthetics",
};

export default function ShopProductPage() {
  return (
    <main className="flex-1 bg-gray-50">
        <ProductDetailPage />
      </main>
  );
}
