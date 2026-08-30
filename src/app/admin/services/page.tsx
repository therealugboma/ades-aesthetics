"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import MultiImageManager, {
  existingManagedImages,
  releaseManagedImagePreviews,
  type ManagedImage,
} from "@/components/admin/MultiImageManager";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { getServicePriceLabel } from "@/lib/service-pricing";
import Image from "next/image";

const categories = ["nails", "lashes", "brows", "skin", "other"] as const;
type ServiceCategory = (typeof categories)[number];

interface ServiceForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  duration: string;
  category: ServiceCategory;
}

interface PriceOptionForm {
  id: string;
  label: string;
  price: string;
}

const emptyForm: ServiceForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  duration: "",
  category: "nails",
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
  const generateUploadUrl = useAction(api.upload.generateUploadUrl);
  const getStorageUrl = useAction(api.upload.getStorageUrl);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Doc<"services"> | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [hasPriceOptions, setHasPriceOptions] = useState(false);
  const [priceOptions, setPriceOptions] = useState<PriceOptionForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const resetModal = () => {
    releaseManagedImagePreviews(images);
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setHasPriceOptions(false);
    setPriceOptions([]);
    setError("");
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setHasPriceOptions(false);
    setPriceOptions([]);
    setError("");
    setShowModal(true);
  };

  const openEdit = (service: Doc<"services">) => {
    const urls = service.imageUrls?.length
      ? service.imageUrls
      : service.imageUrl
        ? [service.imageUrl]
        : [];
    const options = service.priceOptions ?? [];
    setEditing(service);
    setForm({
      name: service.name,
      slug: service.slug,
      description: service.description || "",
      price: String(service.price),
      duration: String(service.duration),
      category: service.category,
    });
    setImages(existingManagedImages(urls));
    setHasPriceOptions(options.length > 0);
    setPriceOptions(
      options.map((option) => ({
        id: crypto.randomUUID(),
        label: option.label,
        price: String(option.price),
      }))
    );
    setError("");
    setShowModal(true);
  };

  const uploadImages = async () => {
    return Promise.all(images.map(async (image) => {
      if (image.kind === "existing") return image.url;
      const uploadUrl = await generateUploadUrl({ sessionToken: sessionToken! });
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": image.file.type },
        body: image.file,
      });
      if (!response.ok) throw new Error(`Could not upload ${image.file.name}`);
      const { storageId } = (await response.json()) as {
        storageId?: Id<"_storage">;
      };
      if (!storageId) throw new Error(`Upload failed for ${image.file.name}`);
      const url = await getStorageUrl({ sessionToken: sessionToken!, storageId });
      if (!url) throw new Error(`Could not save ${image.file.name}`);
      return url;
    }));
  };

  const normalizePriceOptions = () => {
    if (!hasPriceOptions) return [];
    if (priceOptions.length < 2) throw new Error("Add at least two price options");
    const normalized = priceOptions.map((option) => ({
      label: option.label.trim(),
      price: Number(option.price),
    }));
    if (normalized.some((option) => !option.label || !Number.isFinite(option.price) || option.price < 0)) {
      throw new Error("Every price option needs a label and valid price");
    }
    return normalized;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const normalizedOptions = normalizePriceOptions();
      const price = normalizedOptions.length
        ? Math.min(...normalizedOptions.map((option) => option.price))
        : Number(form.price);
      if (!Number.isFinite(price) || price < 0) throw new Error("Enter a valid service price");

      const imageUrls = await uploadImages();
      const values = {
        name: form.name.trim(),
        slug: form.slug || slugify(form.name),
        description: form.description.trim(),
        price,
        priceOptions: normalizedOptions,
        duration: Number(form.duration),
        category: form.category,
        imageUrl: imageUrls[0] ?? "",
        imageUrls,
      };

      if (editing) {
        await updateService({ sessionToken: sessionToken!, id: editing._id, ...values });
      } else {
        await createService({
          sessionToken: sessionToken!,
          ...values,
          sortOrder: services?.length ?? 0,
        });
      }
      resetModal();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service: Doc<"services">) => {
    if (!confirm(`Deactivate "${service.name}"?`)) return;
    await removeService({ sessionToken: sessionToken!, id: service._id });
  };

  const handleToggleActive = async (service: Doc<"services">) => {
    await updateService({
      sessionToken: sessionToken!,
      id: service._id,
      isActive: !service.isActive,
    });
  };

  const togglePriceOptions = (enabled: boolean) => {
    setHasPriceOptions(enabled);
    if (enabled && priceOptions.length === 0) {
      setPriceOptions([
        { id: crypto.randomUUID(), label: "Short Nails", price: form.price },
        { id: crypto.randomUUID(), label: "Long Nails", price: "" },
      ]);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <button onClick={openAdd} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
          + Add Service
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editing ? "Edit Service" : "Add Service"}</h2>
              <button onClick={resetModal} className="text-2xl text-gray-400 hover:text-gray-600" aria-label="Close">&times;</button>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <MultiImageManager label="Service pictures" images={images} onChange={setImages} />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                <input type="text" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: slugify(event.target.value) })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                <input type="text" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" placeholder="auto-generated from name" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
                <textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={hasPriceOptions} onChange={(event) => togglePriceOptions(event.target.checked)} className="rounded border-gray-300 text-rose-600" />
                  Use different price options
                </label>
                <p className="mt-1 text-xs text-gray-500">Use this for choices such as short and long acrylic nails.</p>

                {hasPriceOptions ? (
                  <div className="mt-4 space-y-3">
                    {priceOptions.map((option, index) => (
                      <div key={option.id} className="grid grid-cols-[1fr_140px_auto] gap-2">
                        <input type="text" required value={option.label} onChange={(event) => setPriceOptions((current) => current.map((item) => item.id === option.id ? { ...item, label: event.target.value } : item))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder={`Option ${index + 1} label`} />
                        <input type="number" required min={0} value={option.price} onChange={(event) => setPriceOptions((current) => current.map((item) => item.id === option.id ? { ...item, price: event.target.value } : item))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Price (₦)" />
                        <button type="button" disabled={priceOptions.length <= 2} onClick={() => setPriceOptions((current) => current.filter((item) => item.id !== option.id))} className="px-2 text-lg text-red-500 disabled:opacity-25" aria-label={`Remove ${option.label || `option ${index + 1}`}`}>×</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setPriceOptions((current) => [...current, { id: crypto.randomUUID(), label: "", price: "" }])} className="text-sm font-medium text-rose-600 hover:text-rose-700">+ Add another price option</button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Price (₦) *</label>
                    <input type="number" required min={0} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Duration (min) *</label>
                  <input type="number" required min={1} value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                  <select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ServiceCategory })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm">
                    {categories.map((category) => <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetModal} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
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
            {services?.map((service) => {
              const cover = service.imageUrls?.[0] || service.imageUrl;
              const imageCount = service.imageUrls?.length ?? (service.imageUrl ? 1 : 0);
              return (
                <tr key={service._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-xs text-gray-400">
                        {cover ? (
                          <Image
                            src={cover}
                            alt=""
                            width={40}
                            height={40}
                            sizes="40px"
                            className="h-full w-full object-cover"
                          />
                        ) : "IMG"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-500">{imageCount} picture{imageCount === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-700">{service.category}</td>
                  <td className="px-4 py-3 text-gray-700">{getServicePriceLabel(service)}</td>
                  <td className="px-4 py-3 text-gray-700">{service.duration} min</td>
                  <td className="px-4 py-3"><button onClick={() => handleToggleActive(service)} className={`rounded-full px-2 py-1 text-xs font-medium ${service.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{service.isActive ? "Active" : "Inactive"}</button></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(service)} className="text-sm font-medium text-rose-600 hover:text-rose-700">Edit</button><button onClick={() => handleDelete(service)} className="text-sm font-medium text-red-600 hover:text-red-700">Deactivate</button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
