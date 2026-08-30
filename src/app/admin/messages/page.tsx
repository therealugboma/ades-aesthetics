"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import type { Doc } from "convex/_generated/dataModel";

export default function AdminMessagesPage() {
  const { sessionToken } = useAdminAuth();
  const messages = useQuery(
    api.contactMessages.list,
    sessionToken ? { sessionToken } : "skip"
  );
  const markRead = useMutation(api.contactMessages.markRead);
  const removeMessage = useMutation(api.contactMessages.remove);
  const [selected, setSelected] = useState<Doc<"contactMessages"> | null>(null);

  const unread = messages?.filter((message) => !message.isRead).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        {unread > 0 && (
          <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
            {unread} unread
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message list */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
          {messages?.length === 0 && (
            <p className="p-6 text-sm text-gray-500 text-center">No messages yet</p>
          )}
          {messages?.map((m) => (
            <button
              key={m._id}
              onClick={() => {
                setSelected(m);
                if (!m.isRead) markRead({ sessionToken: sessionToken!, id: m._id });
              }}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                selected?._id === m._id ? "bg-rose-50" : ""
              } ${!m.isRead ? "border-l-4 border-rose-500" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`text-sm ${!m.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                  {m.name}
                </p>
                <span className="text-xs text-gray-400">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{m.subject}</p>
            </button>
          ))}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.subject}</h2>
                  <p className="text-sm text-gray-500">
                    From: {selected.name} ({selected.email})
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm("Delete this message?")) {
                      await removeMessage({ sessionToken: sessionToken!, id: selected._id });
                      setSelected(null);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="mt-4">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <p className="text-gray-500">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
