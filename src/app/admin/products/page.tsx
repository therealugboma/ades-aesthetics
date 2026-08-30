"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useState } from "react";
import MultiImageManager, {
  existingManagedImages,
  releaseManagedImagePreviews,
  type ManagedImage,
} from "@/components/admin/MultiImageManager";
import { useAdminAuth } from "@/lib/admin-auth-context";
import Image from "next/image";

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  isFeatured: boolean;
}

const emptyForm: ProductForm = {
  name: "", slug: "", description: "", price: "", categoryId: "", stock: "", isFeatured: false,
};

export default function AdminProductsPage() {
  const { sessionToken } = useAdminAuth();
  const products = useQuery(
    api.products.listAll,
    sessionToken ? { sessionToken } : "skip"
  );
  const categories = useQuery(
    api.products.listCategories,
    sessionToken ? { sessionToken } : "skip"
  );
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const generateUploadUrl = useAction(api.upload.generateUploadUrl);
  const getStorageUrl = useAction(api.upload.getStorageUrl);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Doc<"products"> | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = search
    ? products?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setError("");
    setShowModal(true);
  };

  const openEdit = (p: Doc<"products">) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      price: String(p.price),
      categoryId: p.categoryId || "",
      stock: String(p.stock),
      isFeatured: p.isFeatured || false,
    });
    setImages(existingManagedImages(p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : []));
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    releaseManagedImagePreviews(images);
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setError("");
  };

  const uploadImages = async () => {
    return Promise.all(images.map(async (image) => {
      if (image.kind === "existing") return image.url;
      const uploadUrl = await generateUploadUrl({ sessionToken: sessionToken! });
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": image.file.type },
        body: image.file,
      });
      if (!result.ok) throw new Error(`Could not upload ${image.file.name}`);
      const { storageId } = (await result.json()) as {
        storageId?: Id<"_storage">;
      };
      if (!storageId) throw new Error(`Upload failed for ${image.file.name}`);
      const url = await getStorageUrl({ sessionToken: sessionToken!, storageId });
      if (!url) throw new Error(`Could not save ${image.file.name}`);
      return url;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const imageUrls = await uploadImages();
      if (imageUrls.length === 0) throw new Error("Add at least one product picture");

      if (editing) {
        await updateProduct({
          sessionToken: sessionToken!,
          id: editing._id,
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description,
          price: Number(form.price),
          categoryId: form.categoryId as Id<"productCategories">,
          imageUrl: imageUrls[0],
          imageUrls,
          stock: Number(form.stock),
          isFeatured: form.isFeatured,
        });
      } else {
        await createProduct({
          sessionToken: sessionToken!,
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description,
          price: Number(form.price),
          categoryId: form.categoryId as Id<"productCategories">,
          imageUrl: imageUrls[0],
          imageUrls,
          stock: Number(form.stock),
          isFeatured: form.isFeatured,
        });
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Doc<"products">) => {
    if (!confirm(`Deactivate "${p.name}"?`)) return;
    await deleteProduct({ sessionToken: sessionToken!, id: p._id });
  };

  const handleToggleActive = async (p: Doc<"products">) => {
    await updateProduct({ sessionToken: sessionToken!, id: p._id, isActive: !p.isActive });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-3">
          <input
            type="text" placeholder="Search..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm w-64"
          />
          <button onClick={openAdd}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
            + Add Product
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <MultiImageManager label="Product pictures" images={images} onChange={setImages} />

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input type="number" required min={0} value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm">
                  <option value="">Select category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-rose-600" />
                Featured product
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
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
              <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered?.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                      {(p.imageUrls?.[0] || p.imageUrl) ? (
                        <Image
                          src={p.imageUrls?.[0] || p.imageUrl}
                          alt=""
                          width={40}
                          height={40}
                          sizes="40px"
                          className="h-full w-full object-cover"
                        />
                      ) : "IMG"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.imageUrls?.length ?? (p.imageUrl ? 1 : 0)} picture{(p.imageUrls?.length ?? (p.imageUrl ? 1 : 0)) === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">₦{p.price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700">{p.stock}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleActive(p)}
                    className={`rounded-full px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                      p.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}>{p.isActive ? "Active" : "Inactive"}</button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)}
                      className="text-rose-600 hover:text-rose-700 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(p)}
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
