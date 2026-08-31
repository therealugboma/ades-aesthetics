type CheckoutErrorData = {
  code?: unknown;
  message?: unknown;
  productId?: unknown;
  availableStock?: unknown;
};

type CheckoutFailure = {
  status: number;
  body: {
    code: string;
    error: string;
    productId?: string;
    availableStock?: number;
  };
};

function errorDataFrom(error: unknown): CheckoutErrorData | null {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return null;
  }
  const data = (error as { data?: unknown }).data;
  return typeof data === "object" && data !== null
    ? (data as CheckoutErrorData)
    : null;
}

export function getCheckoutFailure(error: unknown): CheckoutFailure {
  const data = errorDataFrom(error);
  const code = typeof data?.code === "string" ? data.code : "";
  const message =
    typeof data?.message === "string" ? data.message : "";

  if (code === "INSUFFICIENT_STOCK" || code === "PRODUCT_UNAVAILABLE") {
    return {
      status: 409,
      body: {
        code,
        error:
          message ||
          "One of these products is no longer available in the requested quantity.",
        ...(typeof data?.productId === "string"
          ? { productId: data.productId }
          : {}),
        ...(typeof data?.availableStock === "number"
          ? { availableStock: data.availableStock }
          : {}),
      },
    };
  }

  if (code === "INVALID_CART") {
    return {
      status: 400,
      body: {
        code,
        error: message || "Please review your cart and try again.",
      },
    };
  }

  return {
    status: 500,
    body: {
      code: "CHECKOUT_FAILED",
      error: "Checkout failed. Please review your cart and try again.",
    },
  };
}
