"use client";

import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { API_BASE_URL, authFetch } from "../../lib/authClient";
import { labelForValue, providerStatuses, providerTypes } from "../../lib/adminEnums";

type PaginationInfo = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type ApiResponse<T> = { success: boolean; data: T; meta?: { pagination: PaginationInfo } };

type Organization = {
  id: number;
  name: string;
};

type Provider = {
  id: number;
  organizationId?: number | null;
  name: string;
  type: number;
  contactInfo?: string | null;
  status: number;
};

type ProviderForm = {
  id?: number;
  organizationId: string;
  name: string;
  type: string;
  contactInfo: string;
  status: string;
};

const emptyForm: ProviderForm = {
  organizationId: "",
  name: "",
  type: String(providerTypes[0].value),
  contactInfo: "",
  status: String(providerStatuses[0].value)
};

export default function BusManagementPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [items, setItems] = useState<Provider[]>([]);
  const [form, setForm] = useState<ProviderForm>(emptyForm);
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

  const loadProviders = async (pageValue = page) => {
    setLoading(true);
    setError(null);
    try {
      const [orgsRes, providersRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/organizations?page=0&size=100`),
        authFetch(`${API_BASE_URL}/api/admin/providers?page=${pageValue}&size=${pageSize}`)
      ]);
      if (!orgsRes.ok || !providersRes.ok) throw new Error("Failed to load providers");
      const orgsPayload = (await orgsRes.json()) as ApiResponse<Organization[]>;
      const providersPayload = (await providersRes.json()) as ApiResponse<Provider[]>;
      setOrganizations(orgsPayload.data ?? []);
      setItems(providersPayload.data ?? []);
      setPagination(
        providersPayload.meta?.pagination ?? {
          page: pageValue,
          size: pageSize,
          totalElements: providersPayload.data?.length ?? 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: pageValue > 0
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProviders(page);
  }, [page]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        organizationId: form.organizationId ? Number(form.organizationId) : null,
        name: form.name,
        type: Number(form.type),
        contactInfo: form.contactInfo || null,
        status: Number(form.status)
      };
      const isEdit = Boolean(form.id);
      const res = await authFetch(
        `${API_BASE_URL}/api/admin/providers${isEdit ? `/${form.id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Save failed");
      await loadProviders(page);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Provider) => {
    setForm({
      id: item.id,
      organizationId: item.organizationId ? String(item.organizationId) : "",
      name: item.name ?? "",
      type: String(item.type ?? providerTypes[0].value),
      contactInfo: item.contactInfo ?? "",
      status: String(item.status ?? providerStatuses[0].value)
    });
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/providers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (items.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadProviders(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Bus Management</h2>
        <p className="text-on-surface-variant mt-1">Manage providers (buses, airlines, rail).</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">{form.id ? "Edit Provider" : "Add Provider"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.organizationId}
            onChange={(event) => setForm((prev) => ({ ...prev, organizationId: event.target.value }))}
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} (#{org.id})
              </option>
            ))}
          </select>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Provider Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            {providerTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Contact Info"
            value={form.contactInfo}
            onChange={(event) => setForm((prev) => ({ ...prev, contactInfo: event.target.value }))}
          />
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            {providerStatuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="primary-gradient text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : form.id ? "Update Provider" : "Create Provider"}
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
        <h3 className="font-headline text-lg font-bold mb-4">Providers</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">{labelForValue(providerTypes, item.type)}</td>
                    <td className="py-3">{labelForValue(providerStatuses, item.status)}</td>
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
                      No providers yet.
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
