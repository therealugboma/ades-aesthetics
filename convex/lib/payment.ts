export function serviceSecretIsValid(
  provided: string,
  configured: string | undefined
) {
  if (!configured || provided.length !== configured.length) return false;

  let difference = 0;
  for (let index = 0; index < configured.length; index += 1) {
    difference |= provided.charCodeAt(index) ^ configured.charCodeAt(index);
  }
  return difference === 0;
}

function parseMetadata(value: string | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export function mergePaymentMetadata(
  checkoutMetadata: string | undefined,
  verifiedMetadata: string | undefined
) {
  const checkout = parseMetadata(checkoutMetadata);
  const verified = parseMetadata(verifiedMetadata);
  const merged = { ...checkout, ...verified };
  return Object.keys(merged).length > 0 ? JSON.stringify(merged) : undefined;
}
