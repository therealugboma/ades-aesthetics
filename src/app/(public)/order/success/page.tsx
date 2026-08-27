"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface OrderDetails {
  reference: string;
  amount: number;
  status: string;
  customerName: string;
  deliveryAddress: string;
  itemCount: number;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(ref));

  useEffect(() => {
    if (!ref) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/payment/status?ref=${encodeURIComponent(ref)}`);
        const data = await res.json();
        if (res.ok && data.payment) {
          setOrder({
            reference: data.payment.reference,
            amount: data.payment.amount,
            status: data.payment.status,
            customerName: data.payment.metadata?.customerName || "Customer",
            deliveryAddress: data.payment.metadata?.deliveryAddress || "",
            itemCount: data.payment.orderItems?.length || 0,
          });
        }
      } catch {
        // Payment might still be processing
      } finally {
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [ref]);

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          <dl className="mt-4 space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Reference</dt>
              <dd className="text-sm font-medium text-gray-900">{ref || "#AD-00000"}</dd>
            </div>
            {!loading && order ? (
              <>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Items</dt>
                  <dd className="text-sm font-medium text-gray-900">{order.itemCount} items</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Paid</dt>
                  <dd className="text-sm font-bold text-rose-600">{formatPrice(order.amount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="text-sm font-medium text-green-600 capitalize">{order.status}</dd>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Items</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {loading ? <span className="inline-block h-4 w-12 animate-pulse rounded bg-gray-200" /> : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Paid</dt>
                  <dd className="text-sm font-bold text-rose-600">
                    {loading ? <span className="inline-block h-4 w-16 animate-pulse rounded bg-gray-200" /> : "—"}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-base font-semibold text-blue-900">Delivery Information</h3>
          <p className="mt-2 text-sm text-blue-800">
            Your order will be delivered within 2-3 business days. You will receive a tracking link via email once your order is dispatched.
          </p>
          {order?.deliveryAddress && (
            <p className="mt-2 text-sm text-blue-800">
              <span className="font-medium">Address:</span> {order.deliveryAddress}
            </p>
          )}
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

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="mt-8 text-gray-600">Loading order details...</p>
        </div>
      </main>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
