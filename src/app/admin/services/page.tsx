"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export default function AdminServicesPage() {
  const services = useQuery(api.services.getAll);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Services</h1>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Service</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Duration</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services?.map((s: any) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.description?.slice(0, 60)}...</p>
                </td>
                <td className="px-4 py-3 text-gray-700 capitalize">{s.category}</td>
                <td className="px-4 py-3 text-gray-700">₦{s.price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700">{s.duration} min</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>{s.isActive ? "Active" : "Inactive"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
