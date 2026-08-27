"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminCustomersPage() {
  const { sessionToken } = useAdminAuth();
  const result = useQuery(
    api.customers.list,
    sessionToken ? { sessionToken } : "skip"
  );
  const customers = result?.customers ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c: any) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-700">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
