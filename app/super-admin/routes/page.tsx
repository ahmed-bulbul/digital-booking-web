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

type Route = {
  id: number;
  sourceId: number;
  destinationId: number;
  durationMinutes?: number;
  distanceKm?: number;
};

type RouteForm = {
  id?: number;
  sourceId: string;
  destinationId: string;
  durationMinutes: string;
  distanceKm: string;
};

type PagedResponse<T> = ApiResponse<T[]>;

type Location = {
  id: number;
  name: string;
  city: string;
};

const emptyForm: RouteForm = {
  sourceId: "",
  destinationId: "",
  durationMinutes: "",
  distanceKm: ""
};

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState<RouteForm>(emptyForm);
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

  const loadRoutes = async (pageValue = page) => {
    setLoading(true);
    setError(null);
    try {
      const routesRes = await authFetch(
        `${API_BASE_URL}/api/admin/routes?page=${pageValue}&size=${pageSize}`
      );
      if (!routesRes.ok) throw new Error("Failed to load routes");
      const routesPayload = (await routesRes.json()) as PagedResponse<Route>;
      setRoutes(routesPayload.data ?? []);
      setPagination(
        routesPayload.meta?.pagination ?? {
          page: pageValue,
          size: pageSize,
          totalElements: routesPayload.data?.length ?? 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: pageValue > 0
        }
      );

      try {
        const locationsRes = await authFetch(`${API_BASE_URL}/api/admin/locations?page=0&size=100`);
        if (locationsRes.ok) {
          const locationsPayload = (await locationsRes.json()) as PagedResponse<Location>;
          setLocations(locationsPayload.data ?? []);
        } else {
          setLocations([]);
        }
      } catch {
        setLocations([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoutes(page);
  }, [page]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        sourceId: Number(form.sourceId),
        destinationId: Number(form.destinationId),
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : null
      };
      const isEdit = Boolean(form.id);
      const res = await authFetch(
        `${API_BASE_URL}/api/admin/routes${isEdit ? `/${form.id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Save failed");
      await loadRoutes(page);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (route: Route) => {
    setForm({
      id: route.id,
      sourceId: String(route.sourceId ?? ""),
      destinationId: String(route.destinationId ?? ""),
      durationMinutes: route.durationMinutes ? String(route.durationMinutes) : "",
      distanceKm: route.distanceKm ? String(route.distanceKm) : ""
    });
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/routes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (routes.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadRoutes(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Route Management</h2>
        <p className="text-on-surface-variant mt-1">Create and manage routes.</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <h3 className="font-headline text-lg font-bold mb-4">{form.id ? "Edit Route" : "Add Route"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.sourceId}
            onChange={(event) => setForm((prev) => ({ ...prev, sourceId: event.target.value }))}
          >
            <option value="">Select Source</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.city}
              </option>
            ))}
          </select>
          <select
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            value={form.destinationId}
            onChange={(event) => setForm((prev) => ({ ...prev, destinationId: event.target.value }))}
          >
            <option value="">Select Destination</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.city}
              </option>
            ))}
          </select>
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Duration (min)"
            value={form.durationMinutes}
            onChange={(event) => setForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
          />
          <input
            className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
            placeholder="Distance (km)"
            value={form.distanceKm}
            onChange={(event) => setForm((prev) => ({ ...prev, distanceKm: event.target.value }))}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="primary-gradient text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : form.id ? "Update Route" : "Create Route"}
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
        <h3 className="font-headline text-lg font-bold mb-4">Routes</h3>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Source</th>
                  <th className="py-2">Destination</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Distance</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{route.id}</td>
                    <td className="py-3">
                      {locations.find((loc) => loc.id === route.sourceId)?.name ?? route.sourceId}
                    </td>
                    <td className="py-3">
                      {locations.find((loc) => loc.id === route.destinationId)?.name ?? route.destinationId}
                    </td>
                    <td className="py-3">{route.durationMinutes ?? "-"}</td>
                    <td className="py-3">{route.distanceKm ?? "-"}</td>
                    <td className="py-3 flex gap-2">
                      <button className="text-primary font-semibold" onClick={() => handleEdit(route)}>
                        Edit
                      </button>
                      <button className="text-error font-semibold" onClick={() => handleDelete(route.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {routes.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-on-surface-variant" colSpan={6}>
                      No routes yet.
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
