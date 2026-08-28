"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  imageUrls?: string[];
  stock: number;
  description?: string;
  isActive?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const coverImage = product.imageUrls?.[0] || product.imageUrl;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: coverImage,
      stock: product.stock,
    });
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className="relative h-56 bg-gradient-to-br from-rose-50 to-pink-50 cursor-pointer"
        onClick={() => router.push(`/shop/${product.slug}`)}
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0H3.75m16.5 0A2.25 2.25 0 0018 5.25H6A2.25 2.25 0 003.75 7.5m16.5 0v1.5c0 .621-.504 1.125-1.125 1.125H6.875c-.621 0-1.125-.504-1.125-1.125v-1.5" />
            </svg>
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900">
              Out of Stock
            </span>
          </div>
        )}
        {(product.imageUrls?.length ?? 0) > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {product.imageUrls!.length} photos
          </span>
        )}
      </div>
      <div className="p-5">
        <h3
          className="font-heading text-lg font-semibold text-gray-900 cursor-pointer hover:text-rose-600 transition-colors"
          onClick={() => router.push(`/shop/${product.slug}`)}
        >
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-rose-600">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
