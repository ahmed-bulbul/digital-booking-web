"use client";

import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { API_BASE_URL, authFetch } from "../../lib/authClient";

type PaginationInfo = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type ApiResponse<T> = { success: boolean; data: T; meta?: { pagination: PaginationInfo } };

type Product = {
  id: number;
  name: string;
};

type InventoryClass = {
  id: number;
  productId: number;
  name: string;
  code: string;
  amenities?: Record<string, unknown> | null;
  displayOrder: number;
};

type InventoryClassForm = {
  id?: number;
  productId: string;
  name: string;
  code: string;
  amenities: string;
  displayOrder: string;
};

const emptyForm: InventoryClassForm = {
  productId: "",
  name: "",
  code: "",
  amenities: "",
  displayOrder: "0"
};

export default function InventoryClassesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<InventoryClass[]>([]);
  const [form, setForm] = useState<InventoryClassForm>(emptyForm);
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
      const [productsRes, classesRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/products?page=0&size=100`),
        authFetch(`${API_BASE_URL}/api/admin/inventory-classes?page=${pageValue}&size=${pageSize}`)
      ]);
      if (!productsRes.ok || !classesRes.ok) throw new Error("Failed to load data");
      const productsPayload = (await productsRes.json()) as ApiResponse<Product[]>;
      const classesPayload = (await classesRes.json()) as ApiResponse<InventoryClass[]>;
      setProducts(productsPayload.data ?? []);
      setItems(classesPayload.data ?? []);
      setPagination(
        classesPayload.meta?.pagination ?? {
          page: pageValue,
          size: pageSize,
          totalElements: classesPayload.data?.length ?? 0,
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

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        productId: Number(form.productId),
        name: form.name,
        code: form.code,
        amenities: form.amenities ? JSON.parse(form.amenities) : null,
        displayOrder: form.displayOrder ? Number(form.displayOrder) : 0
      };
      const isEdit = Boolean(form.id);
      const res = await authFetch(
        `${API_BASE_URL}/api/admin/inventory-classes${isEdit ? `/${form.id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Save failed");
      await loadAll(page);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed (check JSON fields)");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: InventoryClass) => {
    setForm({
      id: item.id,
      productId: String(item.productId ?? ""),
      name: item.name ?? "",
      code: item.code ?? "",
      amenities: item.amenities ? JSON.stringify(item.amenities) : "",
      displayOrder: String(item.displayOrder ?? 0)
    });
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/inventory-classes/${id}`, {
        method: "DELETE"
      });
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
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Inventory Classes</h2>
        <p className="text-on-surface-variant mt-1">Define seating classes, cabins, room tiers.</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">{form.id ? "Edit Class" : "Add Class"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.productId}
            onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (#{product.id})
              </option>
            ))}
          </select>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Class Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Code"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Display Order"
            value={form.displayOrder}
            onChange={(event) => setForm((prev) => ({ ...prev, displayOrder: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder='Amenities JSON (optional)'
            value={form.amenities}
            onChange={(event) => setForm((prev) => ({ ...prev, amenities: event.target.value }))}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="primary-gradient text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : form.id ? "Update Class" : "Create Class"}
          </button>
          {form.id ? (
            <button
              className="border border-outline-variant/40 text-on-surface font-semibold px-6 py-3 rounded-xl"
              onClick={() => setForm(emptyForm)}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">Classes</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Product</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Code</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">#{item.productId}</td>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">{item.code}</td>
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
                    <td className="py-4 text-sm text-on-surface-variant" colSpan={5}>
                      No classes yet.
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
