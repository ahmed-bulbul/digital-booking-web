"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

type Organization = {
  id: number;
  name: string;
  domain?: string | null;
  adminName?: string | null;
  adminEmail?: string | null;
  adminPhone?: string | null;
  paymentReceivedNumber?: string | null;
  status?: string | null;
};

type OrganizationForm = {
  id?: number;
  name: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  paymentReceivedNumber: string;
  status: string;
};

const emptyForm: OrganizationForm = {
  name: "",
  domain: "",
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  paymentReceivedNumber: "",
  status: "PENDING"
};

export default function SuperAdminOrganizationsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Organization[]>([]);
  const [form, setForm] = useState<OrganizationForm>(emptyForm);
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
  const query = (searchParams.get("q") ?? "").toLowerCase();

  const loadOrganizations = async (pageValue = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/super-admin/organizations?page=${pageValue}&size=${pageSize}`);
      if (!res.ok) throw new Error("Failed to load organizations");
      const payload = (await res.json()) as ApiResponse<Organization[]>;
      setItems(payload.data ?? []);
      setPagination(
        payload.meta?.pagination ?? {
          page: pageValue,
          size: pageSize,
          totalElements: payload.data?.length ?? 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: pageValue > 0
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrganizations(page);
  }, [page]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        domain: form.domain || null,
        adminName: form.adminName || null,
        adminEmail: form.adminEmail || null,
        adminPhone: form.adminPhone || null,
        paymentReceivedNumber: form.paymentReceivedNumber || null,
        status: form.status || null
      };
      const isEdit = Boolean(form.id);
      const res = await authFetch(
        `${API_BASE_URL}/api/super-admin/organizations${isEdit ? `/${form.id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Save failed");
      await loadOrganizations(page);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Organization) => {
    setForm({
      id: item.id,
      name: item.name ?? "",
      domain: item.domain ?? "",
      adminName: item.adminName ?? "",
      adminEmail: item.adminEmail ?? "",
      adminPhone: item.adminPhone ?? "",
      paymentReceivedNumber: item.paymentReceivedNumber ?? "",
      status: item.status ?? "PENDING"
    });
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/super-admin/organizations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (items.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadOrganizations(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const filteredItems = useMemo(() => {
    if (!query) return items;
    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        (item.domain ?? "").toLowerCase().includes(query) ||
        (item.adminEmail ?? "").toLowerCase().includes(query) ||
        String(item.id).includes(query)
      );
    });
  }, [items, query]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Organizations</h2>
        <p className="text-on-surface-variant mt-1">Create and manage organizations.</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">{form.id ? "Edit Organization" : "Add Organization"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Organization Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Domain"
            value={form.domain}
            onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
          />
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            {["PENDING", "APPROVED", "REJECTED", "ACTIVE", "INACTIVE"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Admin Name"
            value={form.adminName}
            onChange={(event) => setForm((prev) => ({ ...prev, adminName: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Admin Email"
            value={form.adminEmail}
            onChange={(event) => setForm((prev) => ({ ...prev, adminEmail: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Admin Phone"
            value={form.adminPhone}
            onChange={(event) => setForm((prev) => ({ ...prev, adminPhone: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Payment Receive Number"
            value={form.paymentReceivedNumber}
            onChange={(event) => setForm((prev) => ({ ...prev, paymentReceivedNumber: event.target.value }))}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="primary-gradient text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : form.id ? "Update Organization" : "Create Organization"}
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
        <h3 className="font-headline text-lg font-bold mb-4">Organizations</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Domain</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Admin Email</th>
                  <th className="py-2">Payment Number</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">{item.domain ?? "-"}</td>
                    <td className="py-3">{item.status ?? "-"}</td>
                    <td className="py-3">{item.adminEmail ?? "-"}</td>
                    <td className="py-3">{item.paymentReceivedNumber ?? "-"}</td>
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
                {filteredItems.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-on-surface-variant" colSpan={7}>
                      No organizations yet.
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
