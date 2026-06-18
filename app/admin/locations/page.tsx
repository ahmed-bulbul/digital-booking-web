"use client";

import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { API_BASE_URL, authFetch } from "../../lib/authClient";
import { labelForValue, locationTypes } from "../../lib/adminEnums";

type PaginationInfo = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type ApiResponse<T> = { success: boolean; data: T; meta?: { pagination: PaginationInfo } };

type LocationItem = {
  id: number;
  name: string;
  city: string;
  countryCode: string;
  timezone: string;
  type: number;
};

type LocationForm = {
  id?: number;
  name: string;
  city: string;
  countryCode: string;
  timezone: string;
  type: string;
};

const emptyForm: LocationForm = {
  name: "",
  city: "",
  countryCode: "BD",
  timezone: "Asia/Dhaka",
  type: String(locationTypes[0].value)
};

export default function LocationsPage() {
  const [items, setItems] = useState<LocationItem[]>([]);
  const [form, setForm] = useState<LocationForm>(emptyForm);
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

  const loadItems = async (pageValue = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/admin/locations?page=${pageValue}&size=${pageSize}`
      );
      if (!res.ok) throw new Error("Failed to load locations");
      const payload = (await res.json()) as ApiResponse<LocationItem[]>;
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
      setError(err instanceof Error ? err.message : "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems(page);
  }, [page]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        city: form.city,
        countryCode: form.countryCode,
        timezone: form.timezone,
        type: Number(form.type)
      };
      const isEdit = Boolean(form.id);
      const res = await authFetch(
        `${API_BASE_URL}/api/admin/locations${isEdit ? `/${form.id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Save failed");
      await loadItems(page);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: LocationItem) => {
    setForm({
      id: item.id,
      name: item.name,
      city: item.city,
      countryCode: item.countryCode,
      timezone: item.timezone,
      type: String(item.type)
    });
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (items.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadItems(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Locations</h2>
        <p className="text-on-surface-variant mt-1">Manage cities, terminals, airports, and stations.</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">{form.id ? "Edit Location" : "Add Location"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="City"
            value={form.city}
            onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Country Code"
            value={form.countryCode}
            onChange={(event) => setForm((prev) => ({ ...prev, countryCode: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Timezone"
            value={form.timezone}
            onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
          />
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            {locationTypes.map((option) => (
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
            {saving ? "Saving..." : form.id ? "Update Location" : "Create Location"}
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
        <h3 className="font-headline text-lg font-bold mb-4">Locations</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">City</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">{item.city}</td>
                    <td className="py-3">{labelForValue(locationTypes, item.type)}</td>
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
                      No locations yet.
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
