"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal;

  return (
    <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="mt-16 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <h2 className="mt-6 text-xl font-semibold text-gray-900">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Start shopping to add items to your cart.
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex items-center rounded-full bg-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.productId} className="flex py-6">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-amber-100 to-rose-50">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="ml-4 text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatPrice(item.price)} each
                        </p>
                        <div className="mt-2 flex flex-1 items-end justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>
                <dl className="mt-4 space-y-4">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4 text-base font-semibold">
                    <dt className="text-gray-900">Total</dt>
                    <dd className="text-gray-900">{formatPrice(total)}</dd>
                  </div>
                </dl>
                <Link
                  href="/checkout"
                  className="mt-6 block w-full rounded-full bg-rose-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop"
                  className="mt-4 block text-center text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
  );
}
