"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/formatters";
import { getServicePriceLabel, type ServicePriceOption } from "@/lib/service-pricing";

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  priceOptions?: ServicePriceOption[];
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

export default function ServiceSelector({
  services,
  selectedServiceId,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Choose a Service
      </h2>
      <p className="mt-1 text-sm text-muted">
        Select the service you&apos;d like to book
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <button
            key={service._id}
            onClick={() => onSelect(service._id)}
            className={cn(
              "flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all duration-200",
              selectedServiceId === service._id
                ? "border-rose-gold bg-blush-light shadow-md"
                : "border-border-light bg-white hover:border-rose-gold-light hover:shadow-sm"
            )}
          >
            <h3 className="font-heading text-base font-semibold text-foreground">
              {service.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted">
              {service.description}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm font-semibold text-rose-gold">
                {getServicePriceLabel(service)}
              </span>
              <span className="text-xs text-muted">
                {formatDuration(service.duration)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
