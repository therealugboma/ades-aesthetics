"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { initializePaystackPayment, loadPaystackScript } from "@/lib/paystack";

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

type CheckoutStep = "details" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [step, setStep] = useState<CheckoutStep>("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadPaystackScript().catch(() => {});
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCustomer((current) => ({ ...current, [name]: value }));
    setCheckoutError("");
  };

  const handleReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) {
      setCheckoutError("Your cart is empty. Add a product before checking out.");
      return;
    }
    setCheckoutError("");
    setStep("payment");
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      setCheckoutError("Your cart is empty. Add a product before checking out.");
      setStep("details");
      return;
    }

    setIsProcessing(true);
    setCheckoutError("");
    let checkoutReference: string | undefined;

    const releaseCheckout = (reference: string) => {
      void fetch("/api/checkout/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
        keepalive: true,
      }).catch(() => {});
    };

    try {
      await loadPaystackScript();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customer,
        }),
      });

      const data = (await response.json()) as {
        reference?: string;
        amount?: number;
        error?: string;
        code?: string;
        productId?: string;
        availableStock?: number;
      };
      if (!response.ok || !data.reference || !data.amount) {
        if (
          data.productId &&
          typeof data.availableStock === "number" &&
          (data.code === "INSUFFICIENT_STOCK" ||
            data.code === "PRODUCT_UNAVAILABLE")
        ) {
          if (data.availableStock > 0) {
            updateQuantity(data.productId, data.availableStock);
          } else {
            removeItem(data.productId);
          }
          setCheckoutError(
            `${data.error || "The available stock changed."} Your cart has been updated.`
          );
        } else {
          setCheckoutError(data.error || "Checkout failed. Please try again.");
        }
        setIsProcessing(false);
        return;
      }

      checkoutReference = data.reference;

      initializePaystackPayment({
        email: customer.email,
        amount: data.amount,
        reference: data.reference,
        onSuccess: () => {
          clearCart();
          router.push(`/order/success?ref=${encodeURIComponent(data.reference!)}`);
        },
        onClose: () => {
          releaseCheckout(data.reference!);
          setIsProcessing(false);
        },
      });
    } catch {
      if (checkoutReference) releaseCheckout(checkoutReference);
      setCheckoutError(
        "We could not open the secure payment window. Please try again."
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Your cart is empty
            </h1>
            <p className="mt-4 text-gray-600">
              Add a product before continuing to checkout.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex rounded-full bg-rose-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Checkout
        </h1>

        <nav className="mt-8" aria-label="Checkout progress">
          <ol className="flex items-center">
            <li className="flex items-center">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step === "details" ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-600"}`}>
                {step === "payment" ? "✓" : "1"}
              </span>
              <span className="ml-2 text-sm font-medium text-gray-900">
                Your Details
              </span>
            </li>
            <li className="ml-4 flex items-center">
              <div className="h-px w-8 bg-gray-300" />
              <span className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step === "payment" ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                2
              </span>
              <span className={`ml-2 text-sm font-medium ${step === "payment" ? "text-gray-900" : "text-gray-500"}`}>
                Payment
              </span>
            </li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {step === "details" ? (
              <form
                onSubmit={handleReview}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Information
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  After payment is confirmed, WhatsApp will open so you can
                  arrange the delivery option that suits you best.
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="checkout-name" className="block text-sm font-medium text-gray-900">
                      Full Name
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      name="fullName"
                      value={customer.fullName}
                      onChange={handleInputChange}
                      autoComplete="name"
                      required
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-900">
                        Email
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        required
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-phone" className="block text-sm font-medium text-gray-900">
                        Phone
                      </label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        name="phone"
                        value={customer.phone}
                        onChange={handleInputChange}
                        autoComplete="tel"
                        required
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        placeholder="+234 801 234 5678"
                      />
                    </div>
                  </div>
                </div>

                {checkoutError && (
                  <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {checkoutError}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-6 w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500"
                >
                  Review and Pay
                </button>
              </form>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutError("");
                      setStep("details");
                    }}
                    className="text-sm font-medium text-rose-600 transition-colors hover:text-rose-500"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="mt-6 rounded-xl bg-gray-50 p-4">
                  <h3 className="text-sm font-medium text-gray-900">Customer</h3>
                  <p className="mt-1 text-sm text-gray-600">{customer.fullName}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>

                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                  <p className="font-semibold">Delivery is arranged on WhatsApp after payment.</p>
                  <p className="mt-1">
                    Your confirmed order details will be added to the message automatically.
                  </p>
                </div>

                {checkoutError && (
                  <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {checkoutError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="mt-6 w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? "Opening Secure Payment…" : `Pay ${formatPrice(total)}`}
                </button>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1" aria-label="Order summary">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              <ul className="mt-4 divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-4 py-3 text-sm">
                    <span className="text-gray-600">{item.name} ×{item.quantity}</span>
                    <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-base font-semibold">
                  <dt className="text-gray-900">Product Total</dt>
                  <dd className="text-gray-900">{formatPrice(total)}</dd>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Delivery cost will be agreed separately on WhatsApp.
                </p>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
