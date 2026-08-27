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
        onClick={() => setCartOpen(true)}
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
      <ProductGrid products={products ?? []} />
    </>
  );
}
