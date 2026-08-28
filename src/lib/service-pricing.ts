import { formatPrice } from "@/lib/utils";

export interface ServicePriceOption {
  label: string;
  price: number;
}

export interface ServiceWithPricing {
  price: number;
  priceOptions?: ServicePriceOption[];
}

export function getServicePriceOptions(service: ServiceWithPricing) {
  return (service.priceOptions ?? []).filter(
    (option) => option.label.trim() && Number.isFinite(option.price) && option.price >= 0
  );
}

export function getServicePriceLabel(service: ServiceWithPricing) {
  const options = getServicePriceOptions(service);
  if (options.length === 0) return formatPrice(service.price);

  const prices = options.map((option) => option.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  return lowest === highest
    ? formatPrice(lowest)
    : `${formatPrice(lowest)} – ${formatPrice(highest)}`;
}

export function getSelectedServicePrice(
  service: ServiceWithPricing,
  selectedOption: ServicePriceOption | null
) {
  return selectedOption?.price ?? service.price;
}
