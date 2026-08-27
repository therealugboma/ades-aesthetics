import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Confirmed | Ades Aesthetics",
  description:
    "Your order has been confirmed. Thank you for shopping at Ades Aesthetics.",
};

export default function OrderSuccessPage() {
  return (
    <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Order Confirmed!
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Thank you for your purchase. We&apos;re preparing your order now.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>
            <dl className="mt-4 space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Order Number</dt>
                <dd className="text-sm font-medium text-gray-900">#AD-00000</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Items</dt>
                <dd className="text-sm font-medium text-gray-900">
                  0 items
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Total Paid</dt>
                <dd className="text-sm font-bold text-rose-600">₦0</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-base font-semibold text-blue-900">
              Delivery Information
            </h3>
            <p className="mt-2 text-sm text-blue-800">
              Your order will be delivered within 2-5 business days. You will
              receive a tracking link via email and SMS once your order is
              dispatched.
            </p>
            <dl className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <dt className="text-blue-600">Estimated Delivery</dt>
                <dd className="font-medium text-blue-900">
                  2-5 business days
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-blue-600">Delivery Address</dt>
                <dd className="font-medium text-blue-900">
                  Your selected address
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full bg-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
  );
}
