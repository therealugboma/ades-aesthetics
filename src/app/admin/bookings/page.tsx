"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminBookingsPage() {
  const { sessionToken } = useAdminAuth();
  const appointments = useQuery(
    api.appointments.list,
    sessionToken ? { sessionToken } : "skip"
  );
  const updateStatus = useMutation(api.appointments.updateStatus);
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? appointments : appointments?.filter((a: any) => a.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Service</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date & Time</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments === undefined ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading bookings...
                </td>
              </tr>
            ) : filtered?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No bookings found. Bookings will appear here after customers complete the booking flow.
                </td>
              </tr>
            ) : (
              filtered?.map((a: any) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{a.customer?.name ?? "Unknown"}</td>
                  <td className="px-4 py-3 text-gray-700">{a.service?.name ?? "Unknown"}</td>
                  <td className="px-4 py-3 text-gray-500">{a.date} {a.time}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      a.status === "confirmed" ? "bg-green-100 text-green-700" :
                      a.status === "completed" ? "bg-blue-100 text-blue-700" :
                      a.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={async (e) => {
                        await updateStatus({
                          sessionToken: sessionToken!,
                          id: a._id,
                          status: e.target.value as any,
                        });
                      }}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
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
