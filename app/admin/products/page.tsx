"use client";

import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { API_BASE_URL, authFetch } from "../../lib/authClient";
import { labelForValue, productStatuses, productTypes } from "../../lib/adminEnums";

type PaginationInfo = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type ApiResponse<T> = { success: boolean; data: T; meta?: { pagination: PaginationInfo } };

type Provider = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  providerId: number;
  organizationId: number;
  name: string;
  type: number;
  description?: string | null;
  imageUrl?: string | null;
  meta?: Record<string, unknown> | null;
  status: number;
};

type ProductForm = {
  id?: number;
  providerId: string;
  name: string;
  type: string;
  description: string;
  status: string;
  meta: string;
  imageUrl?: string;
};

const emptyForm: ProductForm = {
  providerId: "",
  name: "",
  type: String(productTypes[0].value),
  description: "",
  status: String(productStatuses[0].value),
  meta: ""
};

function resolveImageUrl(url?: string | null) {
  if (!url) return "/images/default-product.svg";
  if (url.startsWith("/uploads/")) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}

export default function ProductsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  });

  const pageSize = 10;

  const loadAll = async (pageValue = page) => {
    setLoading(true);
    setError(null);
    try {
      const [providersRes, productsRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/providers?page=0&size=100`),
        authFetch(`${API_BASE_URL}/api/admin/products?page=${pageValue}&size=${pageSize}`)
      ]);
      if (!providersRes.ok || !productsRes.ok) throw new Error("Failed to load data");
      const providersPayload = (await providersRes.json()) as ApiResponse<Provider[]>;
      const productsPayload = (await productsRes.json()) as ApiResponse<Product[]>;
      setProviders(providersPayload.data ?? []);
      setItems(productsPayload.data ?? []);
      setPagination(
        productsPayload.meta?.pagination ?? {
          page: pageValue,
          size: pageSize,
          totalElements: productsPayload.data?.length ?? 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: pageValue > 0
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll(page);
  }, [page]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const uploadImage = async (productId: number) => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("file", imageFile);
    const res = await authFetch(`${API_BASE_URL}/api/admin/products/${productId}/image`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      throw new Error("Image upload failed");
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        providerId: Number(form.providerId),
        name: form.name,
        type: Number(form.type),
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        status: Number(form.status),
        meta: form.meta ? JSON.parse(form.meta) : null
      };
      const isEdit = Boolean(form.id);
      const res = await authFetch(
        `${API_BASE_URL}/api/admin/products${isEdit ? `/${form.id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Save failed");
      const savedPayload = (await res.json()) as ApiResponse<Product>;
      const savedProduct = savedPayload.data;
      if (savedProduct?.id && imageFile) {
        await uploadImage(savedProduct.id);
      }
      await loadAll(page);
      setForm(emptyForm);
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed (check JSON fields)");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Product) => {
    setImageFile(null);
    setImagePreview(resolveImageUrl(item.imageUrl));
    setForm({
      id: item.id,
      providerId: String(item.providerId ?? ""),
      name: item.name ?? "",
      type: String(item.type ?? productTypes[0].value),
      description: item.description ?? "",
      status: String(item.status ?? productStatuses[0].value),
      meta: item.meta ? JSON.stringify(item.meta) : "",
      imageUrl: item.imageUrl ?? ""
    });
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (items.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadAll(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Products</h2>
        <p className="text-on-surface-variant mt-1">Create and manage products (buses, flights, hotels).</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">{form.id ? "Edit Product" : "Add Product"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.providerId}
            onChange={(event) => setForm((prev) => ({ ...prev, providerId: event.target.value }))}
          >
            <option value="">Select Provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} (#{provider.id})
              </option>
            ))}
          </select>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Product Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            {productTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            {productStatuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <div className="bg-surface-container-high rounded-xl px-4 py-3 text-sm">
            <label className="text-xs font-semibold text-on-surface-variant block mb-2">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setImageFile(file);
                if (file) {
                  const nextUrl = URL.createObjectURL(file);
                  setImagePreview(nextUrl);
                } else {
                  setImagePreview(resolveImageUrl(form.imageUrl ?? ""));
                }
              }}
            />
          </div>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder='Meta JSON (optional)'
            value={form.meta}
            onChange={(event) => setForm((prev) => ({ ...prev, meta: event.target.value }))}
          />
        </div>
        {imagePreview ? (
          <div className="mt-4 flex items-center gap-4">
            <img
              src={imagePreview}
              alt="Product preview"
              className="h-20 w-32 rounded-xl object-cover border border-outline-variant/30"
            />
            <button
              type="button"
              className="text-xs font-semibold text-error"
              onClick={() => {
                setImageFile(null);
                setImagePreview("");
                setForm((prev) => ({ ...prev, imageUrl: "" }));
              }}
            >
              Remove image
            </button>
          </div>
        ) : null}
        <div className="flex gap-3 mt-4">
          <button
            className="primary-gradient text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : form.id ? "Update Product" : "Create Product"}
          </button>
          {form.id ? (
            <button
              className="border border-outline-variant/40 text-on-surface font-semibold px-6 py-3 rounded-xl"
              onClick={() => {
                setForm(emptyForm);
                setImageFile(null);
                setImagePreview("");
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">Products</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Image</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Provider</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt={item.name}
                        className="h-10 w-14 rounded-lg object-cover border border-outline-variant/30"
                      />
                    </td>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">#{item.providerId}</td>
                    <td className="py-3">{labelForValue(productTypes, item.type)}</td>
                    <td className="py-3">{labelForValue(productStatuses, item.status)}</td>
                    <td className="py-3 flex gap-2">
                      <button className="text-primary font-semibold" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className="text-error font-semibold" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-on-surface-variant" colSpan={7}>
                      No products yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
