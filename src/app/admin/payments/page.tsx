"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminPaymentsPage() {
  const { sessionToken } = useAdminAuth();
  const payments = useQuery(api.payments.list, sessionToken ? { sessionToken } : "skip");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Reference</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Breakdown</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments?.map((p: any) => {
              const meta = p.metadata ? (() => { try { return JSON.parse(p.metadata); } catch { return {}; } })() : {};
              return (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-900">{p.reference}</td>
                <td className="px-4 py-3 text-gray-700">₦{p.amount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {meta.subtotal ? `Products ₦${Number(meta.subtotal).toLocaleString()}; ` : ""}
                  {meta.shippingFee ? `Delivery ₦${Number(meta.shippingFee).toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {p.appointmentId ? "Booking" : p.orderId ? "Order" : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    p.status === "success" ? "bg-green-100 text-green-700" :
                    p.status === "failed" ? "bg-red-100 text-red-700" :
                    p.status === "abandoned" ? "bg-gray-100 text-gray-500" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
