"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminOrdersPage() {
  const { sessionToken } = useAdminAuth();
  const orders = useQuery(api.orders.list, sessionToken ? { sessionToken } : "skip");
  const updateStatus = useMutation(api.orders.updateStatus);
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? orders : orders?.filter((o: any) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Order ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Products</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Delivery</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders === undefined ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading orders...
                  </td>
                </tr>
            ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No orders found. Orders will appear here after customers complete checkout.
                  </td>
                </tr>
            ) : (
              filtered?.map((o: any) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-mono text-xs">#{o._id.slice(-8)}</td>
                  <td className="px-4 py-3 text-gray-700">₦{(o.subtotal ?? (o.totalAmount ?? 0) - (o.deliveryFee ?? 0)).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{o.deliveryFee ? `₦${o.deliveryFee.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">₦{o.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      o.status === "paid" || o.status === "delivered" ? "bg-green-100 text-green-700" :
                      o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      o.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={async (e) => {
                        await updateStatus({
                          sessionToken: sessionToken!,
                          orderId: o._id,
                          status: e.target.value as any,
                        });
                      }}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
