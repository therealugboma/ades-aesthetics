"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { useState, useRef } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";

const categories = ["nails", "lashes", "brows", "skin", "other"] as const;

interface ServiceForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  duration: string;
  category: typeof categories[number];
}

const emptyForm: ServiceForm = {
  name: "", slug: "", description: "", price: "", duration: "", category: "nails",
};

export default function AdminServicesPage() {
  const { sessionToken } = useAdminAuth();
  const services = useQuery(
    api.services.getAll,
    sessionToken ? { sessionToken } : "skip"
  );
  const createService = useMutation(api.services.create);
  const updateService = useMutation(api.services.update);
  const removeService = useMutation(api.services.remove);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useAction(api.upload.generateUploadUrl);
  const getStorageUrl = useAction(api.upload.getStorageUrl);

  const slugify = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setPreview("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      name: s.name,
      slug: s.slug,
      description: s.description || "",
      price: String(s.price),
      duration: String(s.duration),
      category: s.category,
    });
    setFile(null);
    setPreview(s.imageUrl || "");
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      let imageUrl = editing?.imageUrl || "";

      if (file) {
        const uploadUrl = await generateUploadUrl({ sessionToken: sessionToken! });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        imageUrl = await getStorageUrl({
          sessionToken: sessionToken!,
          storageId: storageId as string,
        });
      }

      if (editing) {
        await updateService({
          sessionToken: sessionToken!,
          id: editing._id,
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description,
          price: Number(form.price),
          duration: Number(form.duration),
          category: form.category,
          imageUrl,
        });
      } else {
        await createService({
          sessionToken: sessionToken!,
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description,
          price: Number(form.price),
          duration: Number(form.duration),
          category: form.category,
          imageUrl,
          sortOrder: services?.length ?? 0,
        });
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditing(null);
      setFile(null);
      setPreview("");
    } catch (err: any) {
      setError(err.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: any) => {
    if (!confirm(`Deactivate "${s.name}"?`)) return;
    await removeService({ sessionToken: sessionToken!, id: s._id });
  };

  const handleToggleActive = async (s: any) => {
    await updateService({ sessionToken: sessionToken!, id: s._id, isActive: !s.isActive });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <button onClick={openAdd}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
          + Add Service
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? "Edit Service" : "Add Service"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Photo</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-rose-400 hover:bg-rose-50/50 transition-colors">
                  {preview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={preview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
                      <span className="text-xs text-gray-500">Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">Click to upload photo</span>
                      <span className="text-xs text-gray-400">PNG, JPG, WEBP</span>
                    </div>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                  placeholder="auto-generated from name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
                  <input type="number" required min={0} value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min) *</label>
                  <input type="number" required min={1} value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as typeof categories[number] })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm">
                  {categories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Service</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Duration</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services?.map((s: any) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                      {s.imageUrl ? <img src={s.imageUrl} alt="" className="h-full w-full object-cover" /> : "IMG"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.description?.slice(0, 60)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 capitalize">{s.category}</td>
                <td className="px-4 py-3 text-gray-700">₦{s.price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700">{s.duration} min</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleActive(s)}
                    className={`rounded-full px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                      s.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}>{s.isActive ? "Active" : "Inactive"}</button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(s)}
                      className="text-rose-600 hover:text-rose-700 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(s)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium">Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
