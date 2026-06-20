"use client";

import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { API_BASE_URL, authFetch } from "../../lib/authClient";
import { labelForValue, scheduleStatuses } from "../../lib/adminEnums";

type PaginationInfo = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type ApiResponse<T> = { success: boolean; data: T; meta?: { pagination: PaginationInfo } };

type Location = {
  id: number;
  name: string;
  city: string;
};

type Schedule = {
  id: number;
  productId: number;
  routeId?: number | null;
  departureAt: string;
  arrivalAt: string;
  status: number;
  totalCapacity: number;
  availableCount: number;
};

type ScheduleForm = {
  id?: number;
  productId: string;
  routeId: string;
  departureAt: string;
  arrivalAt: string;
  status: string;
  totalCapacity: string;
  availableCount: string;
};

const emptyForm: ScheduleForm = {
  productId: "",
  routeId: "",
  departureAt: "",
  arrivalAt: "",
  status: String(scheduleStatuses[0].value),
  totalCapacity: "",
  availableCount: ""
};

const BST_OFFSET_MS = 6 * 60 * 60 * 1000; // Bangladesh Standard Time = UTC+6

// Convert UTC ISO string → "YYYY-MM-DDTHH:MM" in BST, independent of browser timezone
const toLocalDateTime = (isoString: string) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const bst = new Date(new Date(isoString).getTime() + BST_OFFSET_MS);
  return `${bst.getUTCFullYear()}-${pad(bst.getUTCMonth() + 1)}-${pad(bst.getUTCDate())}T${pad(bst.getUTCHours())}:${pad(bst.getUTCMinutes())}`;
};

// Convert "YYYY-MM-DDTHH:MM" entered as BST → UTC ISO string
const bstInputToUTC = (datetimeLocal: string): string | null => {
  if (!datetimeLocal) return null;
  return new Date(`${datetimeLocal}:00+06:00`).toISOString();
};

export default function TripSchedulingPage() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [routes, setRoutes] = useState<{ id: number; sourceId: number; destinationId: number }[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
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

  const loadSchedules = async (pageValue = page) => {
    setLoading(true);
    setError(null);
    try {
      const [schedulesRes, productsRes, routesRes, locationsRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/schedules?page=${pageValue}&size=${pageSize}`),
        authFetch(`${API_BASE_URL}/api/admin/products?page=0&size=100`),
        authFetch(`${API_BASE_URL}/api/admin/routes?page=0&size=100`),
        authFetch(`${API_BASE_URL}/api/admin/locations?page=0&size=100`)
      ]);
      if (!schedulesRes.ok || !productsRes.ok || !routesRes.ok) {
        throw new Error("Failed to load schedules");
      }
      const schedulesPayload = (await schedulesRes.json()) as ApiResponse<Schedule[]>;
      const productsPayload = (await productsRes.json()) as ApiResponse<{ id: number; name: string }[]>;
      const routesPayload = (await routesRes.json()) as ApiResponse<{ id: number; sourceId: number; destinationId: number }[]>;
      setItems(schedulesPayload.data ?? []);
      setProducts(productsPayload.data ?? []);
      setRoutes(routesPayload.data ?? []);
      if (locationsRes.ok) {
        const locationsPayload = (await locationsRes.json()) as ApiResponse<Location[]>;
        setLocations(locationsPayload.data ?? []);
      } else {
        setLocations([]);
      }
      setPagination(
        schedulesPayload.meta?.pagination ?? {
          page: pageValue,
          size: pageSize,
          totalElements: schedulesPayload.data?.length ?? 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: pageValue > 0
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSchedules(page);
  }, [page]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        productId: Number(form.productId),
        routeId: form.routeId ? Number(form.routeId) : null,
        departureAt: bstInputToUTC(form.departureAt),
        arrivalAt: bstInputToUTC(form.arrivalAt),
        status: Number(form.status),
        totalCapacity: form.totalCapacity ? Number(form.totalCapacity) : null,
        availableCount: form.availableCount ? Number(form.availableCount) : null
      };
      const isEdit = Boolean(form.id);
      const res = await authFetch(
        `${API_BASE_URL}/api/admin/schedules${isEdit ? `/${form.id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Save failed");
      await loadSchedules(page);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Schedule) => {
    setForm({
      id: item.id,
      productId: String(item.productId ?? ""),
      routeId: item.routeId ? String(item.routeId) : "",
      departureAt: item.departureAt ? toLocalDateTime(item.departureAt) : "",
      arrivalAt: item.arrivalAt ? toLocalDateTime(item.arrivalAt) : "",
      status: String(item.status ?? scheduleStatuses[0].value),
      totalCapacity: String(item.totalCapacity ?? ""),
      availableCount: String(item.availableCount ?? "")
    });
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (items.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadSchedules(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleSeedInventory = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/schedules/${id}/inventory/seed`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Seed failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Seed failed");
    }
  };

  const routeLabel = (route: { sourceId: number; destinationId: number }) => {
    const source = locations.find((loc) => loc.id === route.sourceId);
    const destination = locations.find((loc) => loc.id === route.destinationId);
    const sourceLabel = source ? `${source.name} (${source.city})` : `#${route.sourceId}`;
    const destLabel = destination ? `${destination.name} (${destination.city})` : `#${route.destinationId}`;
    return `${sourceLabel} → ${destLabel}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Trip Scheduling</h2>
        <p className="text-on-surface-variant mt-1">Manage schedules for products and routes.</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">{form.id ? "Edit Schedule" : "Add Schedule"}</h3>
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
            value={form.routeId}
            onChange={(event) => setForm((prev) => ({ ...prev, routeId: event.target.value }))}
          >
            <option value="">Route (optional)</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {routeLabel(route)}
              </option>
            ))}
          </select>
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            {scheduleStatuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-on-surface-variant font-medium px-1">Departure (BST, UTC+6)</label>
            <input
              className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
              type="datetime-local"
              value={form.departureAt}
              onChange={(event) => setForm((prev) => ({ ...prev, departureAt: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-on-surface-variant font-medium px-1">Arrival (BST, UTC+6)</label>
            <input
              className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
              type="datetime-local"
              value={form.arrivalAt}
              onChange={(event) => setForm((prev) => ({ ...prev, arrivalAt: event.target.value }))}
            />
          </div>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Total Capacity"
            value={form.totalCapacity}
            onChange={(event) => setForm((prev) => ({ ...prev, totalCapacity: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Available Count"
            value={form.availableCount}
            onChange={(event) => setForm((prev) => ({ ...prev, availableCount: event.target.value }))}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="primary-gradient text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : form.id ? "Update Schedule" : "Create Schedule"}
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
        <h3 className="font-headline text-lg font-bold mb-4">Schedules</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Product</th>
                  <th className="py-2">Route</th>
                  <th className="py-2">Departure</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">
                      {products.find((product) => product.id === item.productId)?.name ?? item.productId}
                    </td>
                    <td className="py-3">
                      {(() => {
                        if (!item.routeId) return "-";
                        const match = routes.find((route) => route.id === item.routeId);
                        return match ? routeLabel(match) : `Route #${item.routeId}`;
                      })()}
                    </td>
                    <td className="py-3 text-xs text-on-surface-variant">
                      {new Date(item.departureAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
                    </td>
                    <td className="py-3">{labelForValue(scheduleStatuses, item.status)}</td>
                    <td className="py-3 flex gap-2">
                      <button className="text-primary font-semibold" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className="text-outline font-semibold" onClick={() => handleSeedInventory(item.id)}>
                        Seed
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
                      No schedules yet.
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
