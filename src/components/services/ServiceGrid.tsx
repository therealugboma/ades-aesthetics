"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import ServiceCard from "./ServiceCard";

export default function ServiceGrid() {
  const services = useQuery(api.services.list);

  if (services === undefined) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">No services available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service: any) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
}
