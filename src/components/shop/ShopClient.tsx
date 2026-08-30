"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import ProductGrid from "./ProductGrid";
import CartDrawer from "./CartDrawer";
import { useCartStore } from "@/lib/cart-store";

export default function ShopClient() {
  const [cartOpen, setCartOpen] = useState(false);
  const products = useQuery(api.products.list);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label="Open shopping cart"
        className="fixed bottom-6 right-6 z-40 rounded-full bg-rose-600 p-4 text-white shadow-lg transition-colors hover:bg-rose-700"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {items.reduce((sum, i) => sum + i.quantity, 0)}
          </span>
        )}
      </button>
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        onUpdateQuantity={(id, qty) => updateQuantity(id, qty)}
        onRemoveItem={(id) => removeItem(id)}
      />
      {products === undefined ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading products">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="h-56 animate-pulse bg-gray-100" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-9 w-1/3 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  );
}
