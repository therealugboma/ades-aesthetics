"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { initializePaystackPayment, loadPaystackScript } from "@/lib/paystack";

interface FormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export default function BookingForm() {
  const router = useRouter();
  const services = useQuery(api.services.list);
  const depositSetting = useQuery(api.settings.getByKey, {
    key: "deposit_percentage",
  });
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Doc<"services"> | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const availableSlots = useQuery(
    api.availability.getAvailableSlots,
    selectedService && selectedDate
      ? { serviceId: selectedService._id, date: selectedDate }
      : "skip"
  );

  useEffect(() => {
    loadPaystackScript().catch(() => {});
  }, []);

  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const depositPercentage = Number(depositSetting?.value) || 30;

  if (services === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    setCheckoutError("");
    let reference: string | undefined;

    try {
      await loadPaystackScript();
      const res = await fetch("/api/booking/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService._id,
          date: selectedDate,
          time: selectedTime,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || "Booking failed. Please try again.");
        if (res.status === 409) {
          setSelectedTime("");
          setStep(2);
        }
        setIsSubmitting(false);
        return;
      }

      reference = data.reference;
      initializePaystackPayment({
        email: formData.email,
        amount: data.amount,
        reference: data.reference,
        onSuccess: () => {
          router.push(`/booking/success?ref=${encodeURIComponent(data.reference)}`);
        },
        onClose: () => {
          void releaseBookingReservation(data.reference);
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      console.error(err);
      if (reference) await releaseBookingReservation(reference);
      setCheckoutError(
        "We could not open the secure payment window. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s
                  ? "bg-rose-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`mx-1 h-0.5 w-8 ${
                  step > s ? "bg-rose-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mb-6 text-center text-sm text-gray-500">
        {step === 1 && "Select a Service"}
        {step === 2 && "Choose Date & Time"}
        {step === 3 && "Your Details"}
        {step === 4 && "Confirm & Pay"}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <button
              key={service._id}
              onClick={() => {
                setSelectedService(service);
                setSelectedDate("");
                setSelectedTime("");
                setCheckoutError("");
                setStep(2);
              }}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                selectedService?._id === service._id
                  ? "border-rose-600 bg-rose-50"
                  : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
              }`}
            >
              <h3 className="font-heading font-semibold text-gray-900">
                {service.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{service.description}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-bold text-rose-600">
                  {formatPrice(service.price)}
                </span>
                <span className="text-sm text-gray-400">
                  {service.duration} min
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <div className="mb-4 text-center">
              <span className="text-sm font-medium text-gray-600">
                {new Date(today.getFullYear(), today.getMonth()).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 font-medium text-gray-500">
                  {d}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <button
                  key={i}
                  disabled={
                    !day ||
                    day < today.getDate()
                  }
                  onClick={() => {
                    if (!day) return;
                    setSelectedDate(
                      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    );
                    setSelectedTime("");
                    setCheckoutError("");
                  }}
                  className={`aspect-square rounded-lg p-2 text-sm transition-colors ${
                    !day
                      ? ""
                      : day < today.getDate()
                        ? "text-gray-300"
                        : selectedDate ===
                            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                          ? "bg-rose-600 text-white"
                          : "text-gray-700 hover:bg-rose-50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <h3 className="mb-3 font-medium text-gray-900">Available Times</h3>
              {availableSlots === undefined ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Loading available times">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-10 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800" role="status">
                  No times are available on this date. Please choose another day.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setStep(3);
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selectedTime === time
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
                </div>
              )}
              {checkoutError && step === 2 && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {checkoutError}
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setStep(1)}
            className="mt-6 text-sm text-rose-600 hover:text-rose-700"
          >
            ← Back to services
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              placeholder="+234 xxx xxx xxxx"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              placeholder="Any special requests..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!formData.name || !formData.email || !formData.phone}
              className="flex-1 rounded-lg bg-rose-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {step === 4 && selectedService && (
        <div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-4 font-heading text-lg font-semibold text-gray-900">
              Booking Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium text-gray-900">
                  {selectedService.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-900">
                  {selectedService.duration} min
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">
                    Deposit ({depositPercentage}%)
                  </span>
                  <span className="font-bold text-rose-600">
                    {formatPrice(
                      Math.round(selectedService.price * (depositPercentage / 100))
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Total</span>
                  <span>{formatPrice(selectedService.price)}</span>
                </div>
              </div>
            </div>
          </div>
          {checkoutError && step === 4 && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {checkoutError}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-rose-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
            >
              {isSubmitting ? "Processing Payment..." : "Pay Deposit & Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

async function releaseBookingReservation(reference: string) {
  try {
    await fetch("/api/booking/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
      keepalive: true,
    });
  } catch {
    // The server-side expiry is the fallback if release cannot be delivered.
  }
}
