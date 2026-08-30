"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import { buildWhatsAppUrl } from "@/lib/site";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const { payment, verifying, error, retry } = usePaymentStatus(ref);
  const isConfirmed = payment?.status === "success";
  const customerName =
    typeof payment?.metadata.customerName === "string"
      ? payment.metadata.customerName
      : "Customer";
  const orderLines = payment?.orderProducts?.length
    ? payment.orderProducts.map(
        (item) =>
          `- ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
      )
    : ["- Order items are attached to this payment reference"];
  const deliveryMessage = payment
    ? [
        "Hello Ades Aesthetics, I have completed payment for my order.",
        "",
        `Order reference: ${payment.reference}`,
        `Customer: ${customerName}`,
        "Items:",
        ...orderLines,
        `Total paid: ${formatPrice(payment.amount)}`,
        "",
        "Please help me arrange the delivery option that suits me best.",
      ].join("\n")
    : "";

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${isConfirmed ? "bg-green-100" : "bg-amber-100"}`}>
            <svg className={`h-10 w-10 ${isConfirmed ? "text-green-600" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {verifying ? "Verifying Your Payment…" : isConfirmed ? "Order Confirmed!" : "Payment Status"}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {isConfirmed
              ? "Your payment is confirmed. Arrange your preferred delivery option with us on WhatsApp."
              : verifying
                ? "Paystack is finalizing your payment. This page will update automatically."
                : error || "Paystack has not returned a completed payment yet."}
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          <dl className="mt-4 space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Reference</dt>
              <dd className="text-sm font-medium text-gray-900">{ref || "#AD-00000"}</dd>
            </div>
            {payment ? (
              <>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Items</dt>
                  <dd className="text-sm font-medium text-gray-900">{payment.orderItems ?? 0} items</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Paid</dt>
                  <dd className="text-sm font-bold text-rose-600">{formatPrice(payment.amount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className={`text-sm font-medium capitalize ${isConfirmed ? "text-green-600" : "text-amber-600"}`}>{payment.status}</dd>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Items</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {verifying ? <span className="inline-block h-4 w-12 animate-pulse rounded bg-gray-200" /> : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Paid</dt>
                  <dd className="text-sm font-bold text-rose-600">
                    {verifying ? <span className="inline-block h-4 w-16 animate-pulse rounded bg-gray-200" /> : "—"}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {isConfirmed ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
            <h3 className="text-base font-semibold text-green-900">
              Arrange Delivery on WhatsApp
            </h3>
            <p className="mt-2 text-sm text-green-800">
              Your verified order reference and product details are already included in the message.
            </p>
            <a
              href={buildWhatsAppUrl(deliveryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 sm:w-auto"
            >
              Message Us to Arrange Delivery
            </a>
          </div>
        ) : !verifying ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-semibold">Do not make another payment yet.</p>
            <p className="mt-2">Paystack will confirm a completed payment automatically.</p>
            <button type="button" onClick={retry} className="mt-4 rounded-full bg-amber-700 px-5 py-2 font-semibold text-white hover:bg-amber-800">
              Check Payment Status Again
            </button>
          </div>
        ) : null}

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
