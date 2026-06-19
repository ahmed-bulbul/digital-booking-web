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

type PricingRule = {
  id: number;
  productId: number;
  classId?: number | null;
  basePrice: number;
  currency: string;
  validFrom: string;
  validUntil?: string | null;
};

type PricingForm = {
  id?: number;
  productId: string;
  classId: string;
  basePrice: string;
  currency: string;
  validFrom: string;
  validUntil: string;
  conditions: string;
};

const emptyForm: PricingForm = {
  productId: "",
  classId: "",
  basePrice: "",
  currency: "BDT",
  validFrom: "",
  validUntil: "",
  conditions: ""
};

export default function PricingRulesPage() {
  const [items, setItems] = useState<PricingRule[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string; productId: number }[]>([]);
  const [form, setForm] = useState<PricingForm>(emptyForm);
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
      const [rulesRes, productsRes, classesRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/pricing-rules?page=${pageValue}&size=${pageSize}`),
        authFetch(`${API_BASE_URL}/api/admin/products?page=0&size=100`),
        authFetch(`${API_BASE_URL}/api/admin/inventory-classes?page=0&size=100`)
      ]);
      if (!rulesRes.ok || !productsRes.ok || !classesRes.ok) {
        throw new Error("Failed to load pricing rules");
      }
      const rulesPayload = (await rulesRes.json()) as ApiResponse<PricingRule[]>;
      const productsPayload = (await productsRes.json()) as ApiResponse<{ id: number; name: string }[]>;
      const classesPayload = (await classesRes.json()) as ApiResponse<{ id: number; name: string; productId: number }[]>;
      setItems(rulesPayload.data ?? []);
      setProducts(productsPayload.data ?? []);
      setClasses(classesPayload.data ?? []);
      setPagination(
        rulesPayload.meta?.pagination ?? {
          page: pageValue,
          size: pageSize,
          totalElements: rulesPayload.data?.length ?? 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: pageValue > 0
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pricing rules");
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
        classId: form.classId ? Number(form.classId) : null,
        basePrice: Number(form.basePrice),
        currency: form.currency || "BDT",
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
        conditions: form.conditions ? JSON.parse(form.conditions) : null
      };
      const isEdit = Boolean(form.id);
      const res = await authFetch(
        `${API_BASE_URL}/api/admin/pricing-rules${isEdit ? `/${form.id}` : ""}`,
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

  const handleEdit = (item: PricingRule) => {
    setForm({
      id: item.id,
      productId: String(item.productId ?? ""),
      classId: item.classId ? String(item.classId) : "",
      basePrice: String(item.basePrice ?? ""),
      currency: item.currency ?? "BDT",
      validFrom: item.validFrom ?? "",
      validUntil: item.validUntil ?? "",
      conditions: ""
    });
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/pricing-rules/${id}`, { method: "DELETE" });
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

  const filteredClasses = form.productId
    ? classes.filter((cls) => String(cls.productId) === form.productId)
    : classes;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Pricing Rules</h2>
        <p className="text-on-surface-variant mt-1">Set base pricing by product and class.</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">{form.id ? "Edit Rule" : "Add Rule"}</h3>
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
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.classId}
            onChange={(event) => setForm((prev) => ({ ...prev, classId: event.target.value }))}
          >
            <option value="">Class (optional)</option>
            {filteredClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (#{cls.id})
              </option>
            ))}
          </select>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Base Price"
            value={form.basePrice}
            onChange={(event) => setForm((prev) => ({ ...prev, basePrice: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Currency"
            value={form.currency}
            onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Valid From (ISO)"
            value={form.validFrom}
            onChange={(event) => setForm((prev) => ({ ...prev, validFrom: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Valid Until (ISO)"
            value={form.validUntil}
            onChange={(event) => setForm((prev) => ({ ...prev, validUntil: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder='Conditions JSON (optional)'
            value={form.conditions}
            onChange={(event) => setForm((prev) => ({ ...prev, conditions: event.target.value }))}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="primary-gradient text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : form.id ? "Update Rule" : "Create Rule"}
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
        <h3 className="font-headline text-lg font-bold mb-4">Pricing Rules</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Product</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Currency</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">#{item.productId}</td>
                    <td className="py-3">{item.classId ?? "-"}</td>
                    <td className="py-3">{item.basePrice}</td>
                    <td className="py-3">{item.currency}</td>
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
                    <td className="py-4 text-sm text-on-surface-variant" colSpan={6}>
                      No pricing rules yet.
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
