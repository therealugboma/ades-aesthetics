"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { useState, useRef } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminGalleryPage() {
  const { sessionToken } = useAdminAuth();
  const images = useQuery(api.gallery.list, {});
  const createImage = useMutation(api.gallery.create);
  const removeImage = useMutation(api.gallery.remove);
  const generateUploadUrl = useAction(api.upload.generateUploadUrl);
  const getStorageUrl = useAction(api.upload.getStorageUrl);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ alt: "", category: "all" as const, isFeatured: false });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    try {
      const uploadUrl = await generateUploadUrl({ sessionToken: sessionToken! });
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const url = await getStorageUrl({
        sessionToken: sessionToken!,
        storageId: storageId as string,
      });

      await createImage({
        sessionToken: sessionToken!,
        url,
        alt: form.alt,
        category: form.category as any,
        isFeatured: form.isFeatured,
        sortOrder: images?.length ?? 0,
      });
      setShowAdd(false);
      setForm({ alt: "", category: "all", isFeatured: false });
      setFile(null);
      setPreview("");
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
        <button onClick={() => setShowAdd(true)}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
          + Add Image
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Gallery Image</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo *</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-rose-400 hover:bg-rose-50/50 transition-colors">
                  {preview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={preview} alt="Preview" className="h-40 w-40 rounded-lg object-cover" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text *</label>
                <input type="text" required value={form.alt}
                  onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" placeholder="Describe the image" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm">
                  <option value="all">All</option>
                  <option value="nails">Nails</option>
                  <option value="lashes">Lashes</option>
                  <option value="brows">Brows</option>
                  <option value="skin">Skin</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-rose-600" />
                Featured
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">
                  {saving ? "Uploading..." : "Add Image"}
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
                <button onClick={async () => {
                    if (confirm("Delete this image?")) {
                      await removeImage({ sessionToken: sessionToken!, id: img._id });
                    }
                  }} className="text-red-500 hover:text-red-600 text-xs">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
