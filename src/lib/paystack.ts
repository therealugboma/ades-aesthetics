declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        onClose?: () => void;
        callback: (response: { reference: string; status: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

let paystackScriptPromise: Promise<void> | null = null;

export function initializePaystackPayment({
  email,
  amount,
  reference,
  onSuccess,
  onClose,
}: {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (response: { reference: string; status: string }) => void;
  onClose?: () => void;
}) {
  if (typeof window === "undefined" || !window.PaystackPop) {
    throw new Error("Paystack script not loaded");
  }

  const handler = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    email,
    amount: amount * 100,
    currency: "NGN",
    ref: reference,
    onClose: onClose || (() => {}),
    callback: onSuccess,
  });

  handler.openIframe();
}

export function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cannot load script on server"));
  }
  if (window.PaystackPop) return Promise.resolve();
  if (paystackScriptPromise) return paystackScriptPromise;

  paystackScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="js.paystack.co/v1/inline.js"]'
    );
    const script = existing ?? document.createElement("script");

    const handleLoad = () => {
      if (window.PaystackPop) {
        resolve();
      } else {
        paystackScriptPromise = null;
        reject(new Error("Paystack loaded without exposing its checkout API"));
      }
    };
    const handleError = () => {
      paystackScriptPromise = null;
      reject(new Error("Failed to load Paystack script"));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!existing) {
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return paystackScriptPromise;
}
