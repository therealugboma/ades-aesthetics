"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";

export default function AdminGalleryPage() {
  const images = useQuery(api.gallery.list, {});
  const createImage = useMutation(api.gallery.create);
  const removeImage = useMutation(api.gallery.remove);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ url: "", alt: "", category: "all" as const, isFeatured: false });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createImage({
        url: form.url,
        alt: form.alt,
        category: form.category as any,
        isFeatured: form.isFeatured,
        sortOrder: images?.length ?? 0,
      });
      setShowAdd(false);
      setForm({ url: "", alt: "", category: "all", isFeatured: false });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          + Add Image
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Gallery Image</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text *</label>
                <input type="text" required value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" placeholder="Describe the image" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm">
                  <option value="all">All</option>
                  <option value="nails">Nails</option>
                  <option value="lashes">Lashes</option>
                  <option value="brows">Brows</option>
                  <option value="skin">Skin</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-rose-600" />
                Featured
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">
                  {saving ? "Adding..." : "Add Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images?.map((img: any) => (
          <div key={img._id} className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 truncate">{img.alt}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400 capitalize">{img.category}</span>
                <button
                  onClick={async () => {
                    if (confirm("Delete this image?")) await removeImage({ id: img._id });
                  }}
                  className="text-red-500 hover:text-red-600 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
