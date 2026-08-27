"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { nigeriaStates, getLgas } from "@/lib/nigeria-states";

interface DeliveryInfo {
  fullName: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  postalCode: string;
  streetAddress: string;
  notes: string;
}

interface ShippingRate {
  name: string;
  code: string;
  fee: number;
  delivery_window: string;
  sla_description: string;
  description: string;
}

type CheckoutStep = "details" | "shipping" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [step, setStep] = useState<CheckoutStep>("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    lga: "",
    postalCode: "",
    streetAddress: "",
    notes: "",
  });

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = selectedRate?.fee || 0;
  const total = subtotal + deliveryFee;

  const availableLgas = useMemo(() => {
    if (!delivery.state) return [];
    return getLgas(delivery.state);
  }, [delivery.state]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDelivery((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "state") {
        updated.lga = "";
      }
      return updated;
    });
  };

  const handleProceedToShipping = async () => {
    if (
      !delivery.fullName ||
      !delivery.email ||
      !delivery.phone ||
      !delivery.state ||
      !delivery.lga ||
      !delivery.streetAddress
    ) {
      return;
    }

    setStep("shipping");
    setLoadingRates(true);
    setRatesError("");
    setSelectedRate(null);

    try {
      const response = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: {
            fullName: delivery.fullName,
            email: delivery.email,
            phone: delivery.phone,
            state: delivery.state,
            lga: delivery.lga,
            postalCode: delivery.postalCode,
            streetAddress: delivery.streetAddress,
          },
          weight: 1,
          totalValue: subtotal,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRatesError(data.error || "Failed to fetch shipping rates");
        return;
      }

      if (data.rates && data.rates.length > 0) {
        setShippingRates(data.rates);
        setSelectedRate(data.rates[0]);
      } else {
        setRatesError("No shipping options available for this location");
      }
    } catch {
      setRatesError("Could not connect to shipping service. Please try again.");
    } finally {
      setLoadingRates(false);
    }
  };

  const handleProceedToPayment = () => {
    if (selectedRate) {
      setStep("payment");
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      clearCart();
      router.push("/order/success");
    } catch {
      router.push("/order/failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const fullAddress = `${delivery.streetAddress}, ${delivery.lga}, ${delivery.state}${delivery.postalCode ? " " + delivery.postalCode : ""}`;

  return (
    <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Checkout
          </h1>

          <div className="mt-8">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {(["details", "shipping", "payment"] as const).map((s, i) => (
                  <li key={s} className={`flex items-center ${i > 0 ? "ml-4" : ""}`}>
                    {i > 0 && <div className="h-px w-8 bg-gray-300" />}
                    <span className={`${i > 0 ? "ml-2" : ""} flex items-center`}>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          step === s || (["details", "shipping", "payment"] as const).indexOf(step) > i
                            ? "bg-rose-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {(["details", "shipping", "payment"] as const).indexOf(step) > i ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                        step === s ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {s === "details" ? "Details" : s === "shipping" ? "Shipping" : "Payment"}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {step === "details" && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delivery Information
                  </h2>
                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Full Name</label>
                      <input type="text" name="fullName" value={delivery.fullName} onChange={handleInputChange} required
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        placeholder="Enter your full name" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Email</label>
                        <input type="email" name="email" value={delivery.email} onChange={handleInputChange} required
                          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          placeholder="you@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Phone</label>
                        <input type="tel" name="phone" value={delivery.phone} onChange={handleInputChange} required
                          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          placeholder="+234 801 234 5678" />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">State *</label>
                        <select name="state" value={delivery.state} onChange={handleInputChange} required
                          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none">
                          <option value="">Select State</option>
                          {nigeriaStates
                            .filter((s, i, arr) => arr.findIndex((x) => x.name === s.name) === i)
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((state) => (
                              <option key={state.name} value={state.name}>{state.name}</option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">LGA *</label>
                        <select name="lga" value={delivery.lga} onChange={handleInputChange} required disabled={!delivery.state}
                          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400">
                          <option value="">{delivery.state ? "Select LGA" : "Select state first"}</option>
                          {availableLgas.map((lga) => (
                            <option key={lga} value={lga}>{lga}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Postal Code (Optional)</label>
                        <input type="text" name="postalCode" value={delivery.postalCode} onChange={handleInputChange}
                          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          placeholder="e.g. 100001" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Street Address *</label>
                      <input type="text" name="streetAddress" value={delivery.streetAddress} onChange={handleInputChange} required
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        placeholder="House number, street name, area" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Delivery Notes (Optional)</label>
                      <textarea name="notes" value={delivery.notes} onChange={handleInputChange} rows={3}
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        placeholder="Any special delivery instructions" />
                    </div>
                    <button type="button" onClick={handleProceedToShipping}
                      className="w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors">
                      Calculate Shipping
                    </button>
                  </div>
                </div>
              )}

              {step === "shipping" && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Choose Delivery Option</h2>
                    <button type="button" onClick={() => setStep("details")}
                      className="text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors">
                      Edit Details
                    </button>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      Delivering to: <span className="font-medium text-gray-900">{fullAddress}</span>
                    </p>
                  </div>

                  {loadingRates && (
                    <div className="mt-6 flex flex-col items-center justify-center py-12">
                      <svg className="h-10 w-10 animate-spin text-rose-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="mt-3 text-sm text-gray-500">Fetching delivery options...</p>
                    </div>
                  )}

                  {ratesError && (
                    <div className="mt-6 rounded-lg bg-red-50 p-4">
                      <p className="text-sm text-red-600">{ratesError}</p>
                      <button onClick={() => setStep("details")} className="mt-2 text-sm font-medium text-rose-600 hover:text-rose-500">
                        Go back and edit
                      </button>
                    </div>
                  )}

                  {!loadingRates && !ratesError && shippingRates.length > 0 && (
                    <div className="mt-6 space-y-3">
                      {shippingRates.map((rate) => (
                        <label
                          key={rate.code}
                          className={`flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                            selectedRate?.code === rate.code
                              ? "border-rose-600 bg-rose-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={rate.code}
                              checked={selectedRate?.code === rate.code}
                              onChange={() => setSelectedRate(rate)}
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{rate.name}</p>
                              <p className="text-xs text-gray-500">{rate.sla_description}</p>
                              {rate.delivery_window && (
                                <p className="text-xs text-green-600 mt-0.5">{rate.delivery_window}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{formatPrice(rate.fee)}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {!loadingRates && !ratesError && shippingRates.length > 0 && (
                    <button type="button" onClick={handleProceedToPayment}
                      className="mt-6 w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors">
                      Continue to Payment
                    </button>
                  )}
                </div>
              )}

              {step === "payment" && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
                    <button type="button" onClick={() => setStep("shipping")}
                      className="text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors">
                      Edit Shipping
                    </button>
                  </div>

                  <div className="mt-6 rounded-xl bg-gray-50 p-4">
                    <h3 className="text-sm font-medium text-gray-900">Delivering to</h3>
                    <p className="mt-1 text-sm text-gray-600">{delivery.fullName}</p>
                    <p className="text-sm text-gray-600">{fullAddress}</p>
                    <p className="text-sm text-gray-600">{delivery.phone}</p>
                    {selectedRate && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedRate.name} — {formatPrice(selectedRate.fee)}
                        </p>
                        <p className="text-xs text-green-600">{selectedRate.sla_description}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      Payment will be processed securely via Paystack.
                    </p>
                  </div>

                  <button type="button" onClick={handlePayment}
                    disabled={isProcessing || items.length === 0}
                    className="mt-6 w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing Payment...
                      </span>
                    ) : (
                      `Pay ${formatPrice(total)}`
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                <ul className="mt-4 divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <li className="py-4 text-sm text-gray-500 text-center">Your cart is empty</li>
                  ) : (
                    items.map((item) => (
                      <li key={item.productId} className="flex justify-between py-3 text-sm">
                        <span className="text-gray-600">{item.name} x{item.quantity}</span>
                        <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))
                  )}
                </ul>
                <dl className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">{formatPrice(subtotal)}</dd>
                  </div>
                  {selectedRate && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Delivery ({selectedRate.name})</dt>
                      <dd className="font-medium text-gray-900">{formatPrice(deliveryFee)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold">
                    <dt className="text-gray-900">Total</dt>
                    <dd className="text-gray-900">{formatPrice(total)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
