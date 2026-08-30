"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminSettingsPage() {
  const { sessionToken } = useAdminAuth();
  const settings = useQuery(api.settings.get);
  const updateSetting = useMutation(api.settings.update);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(form)) {
        await updateSetting({ sessionToken: sessionToken!, key, value });
      }
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-gray-500">Loading...</div>;

  const fields = [
    { key: "business_name", label: "Business Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "whatsapp_number", label: "WhatsApp Number" },
    { key: "instagram", label: "Instagram Handle" },
    { key: "deposit_percentage", label: "Deposit Percentage (%)" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-rose-600 px-6 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="space-y-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                type="text"
                defaultValue={settings[f.key] ?? ""}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
