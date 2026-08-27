"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [booking, setBooking] = useState<{
    reference: string;
    amount: number;
    status: string;
    customerName: string;
    totalAmount: number;
    appointmentId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/payment/status?ref=${encodeURIComponent(ref)}`);
        const data = await res.json();
        if (res.ok && data.payment) {
          setBooking({
            reference: data.payment.reference,
            amount: data.payment.amount,
            status: data.payment.status,
            customerName: data.payment.metadata?.customerName || "Customer",
            totalAmount: data.payment.metadata?.totalAmount || 0,
            appointmentId: data.payment.metadata?.appointmentId || "",
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
            <svg
              className="h-10 w-10 text-green-600"
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
            Booking Confirmed!
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Thank you for choosing Ades Aesthetics. Your deposit of{" "}
            {booking && !loading ? formatPrice(booking.amount) : ""} has been
            received and your appointment is confirmed.
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
            {booking && !loading ? (
              <>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Customer</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {booking.customerName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Deposit Paid (30%)</dt>
                  <dd className="text-sm font-bold text-rose-600">
                    {formatPrice(booking.amount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Service</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatPrice(booking.totalAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="text-sm font-medium capitalize text-green-600">
                    {booking.status}
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

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="text-base font-semibold text-amber-900">
            What&apos;s Next
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-amber-800">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900">
                1
              </span>
              A confirmation email has been sent to your inbox.
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
