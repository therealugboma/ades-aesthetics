"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { usePaymentStatus } from "@/hooks/use-payment-status";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const { payment, verifying, error, retry } = usePaymentStatus(ref);
  const metadata = payment?.metadata ?? {};
  const customerName =
    typeof metadata.customerName === "string" ? metadata.customerName : "Customer";
  const serviceName =
    typeof metadata.serviceName === "string" ? metadata.serviceName : "Service";
  const serviceOptionLabel =
    typeof metadata.serviceOptionLabel === "string"
      ? metadata.serviceOptionLabel
      : undefined;
  const totalAmount =
    typeof metadata.totalAmount === "number" ? metadata.totalAmount : 0;
  const depositPercentage =
    typeof metadata.depositPercentage === "number"
      ? metadata.depositPercentage
      : 30;
  const paymentOption =
    typeof metadata.paymentOption === "string"
      ? metadata.paymentOption
      : depositPercentage === 100
        ? "full"
        : "deposit";
  const isConfirmed = payment?.status === "success";

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isConfirmed ? "bg-green-100" : "bg-amber-100"
          }`}>
            <svg
              className={`h-10 w-10 ${isConfirmed ? "text-green-600" : "text-amber-600"}`}
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
            {verifying
              ? "Verifying Your Payment…"
              : isConfirmed
                ? "Booking Confirmed!"
                : "Payment Status"}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {isConfirmed
              ? `Thank you for choosing Ades Aesthetics. Your ${paymentOption === "full" ? "full payment" : "deposit"} of ${formatPrice(payment.amount)} has been received and your appointment is confirmed.`
              : verifying
                ? "Paystack is finalizing your payment. This page will update automatically."
                : error ||
                  "Paystack has not returned a completed payment yet. You can check again without making another payment."}
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Booking Details
          </h2>
          <dl className="mt-4 space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Reference</dt>
              <dd className="text-sm font-medium text-gray-900">
                {ref || "—"}
              </dd>
            </div>
            {payment ? (
              <>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Customer</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {customerName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-gray-500">Service</dt>
                  <dd className="text-right text-sm font-medium text-gray-900">
                    {serviceName}
                    {serviceOptionLabel ? ` — ${serviceOptionLabel}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">
                    {paymentOption === "full"
                      ? "Full Payment"
                      : `Deposit (${depositPercentage}%)`}
                  </dt>
                  <dd className="text-sm font-bold text-rose-600">
                    {formatPrice(payment.amount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Service</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatPrice(totalAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className={`text-sm font-medium capitalize ${
                    isConfirmed ? "text-green-600" : "text-amber-600"
                  }`}>
                    {payment.status}
                  </dd>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Security deposit</dt>
                <dd className="text-sm font-bold text-rose-600">₦…</dd>
              </div>
            )}
          </dl>
        </div>

        {isConfirmed ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="text-base font-semibold text-amber-900">
            What&apos;s Next
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-amber-800">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900">
                1
              </span>
              Your Ades Aesthetics invoice is sent separately from Paystack to
              the email used for your booking. Please check your Inbox, Spam,
              or Promotions folder.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900">
                2
              </span>
              Please arrive 10 minutes before your scheduled time.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900">
                3
              </span>
              Bring a valid ID and your booking reference number.
            </li>
          </ul>
        </div>
        ) : !verifying ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-semibold">Do not make another payment yet.</p>
            <p className="mt-2">
              Paystack will confirm a completed payment automatically. Use the button below to check reference {ref || "—"} again.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-full bg-amber-700 px-5 py-2 font-semibold text-white hover:bg-amber-800"
            >
              Check Payment Status Again
            </button>
          </div>
        ) : null}

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="mt-8 text-gray-600">Loading booking details...</p>
        </div>
      </main>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
