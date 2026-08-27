"use client";

import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const BookingForm = dynamic(
  () => import("@/components/booking/BookingForm"),
  { ssr: false }
);

export default function BookingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <section className="bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Book Your Appointment
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
              Select your service, choose a time, and confirm your booking in just a few steps.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <BookingForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
