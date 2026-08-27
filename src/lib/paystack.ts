declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key?: string;
        access_code?: string;
        email?: string;
        amount?: number;
        currency?: string;
        ref?: string;
        onClose?: () => void;
        callback: (response: { reference: string; status: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

export function initializePaystackPayment({
  accessCode,
  onSuccess,
  onClose,
}: {
  accessCode: string;
  onSuccess: (response: { reference: string; status: string }) => void;
  onClose?: () => void;
}) {
  if (typeof window === "undefined" || !window.PaystackPop) {
    throw new Error("Paystack script not loaded");
  }

  const handler = window.PaystackPop.setup({
    access_code: accessCode,
    onClose: onClose || (() => {}),
    callback: onSuccess,
  });

  handler.openIframe();
}

export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot load script on server"));
      return;
    }

    if (document.querySelector('script[src*="paystack"]')) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
}
