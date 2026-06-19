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

type Refund = {
  id: number;
  bookingId: number;
  paymentId: number;
  amount: number;
  reason?: string | null;
  status: string;
  createdAt: string;
  processedAt?: string | null;
};

type PagedResponse<T> = ApiResponse<T[]>;

export default function RefundsPage() {
  const [items, setItems] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>({});
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
      const res = await authFetch(`${API_BASE_URL}/api/admin/refunds?page=${pageValue}&size=${pageSize}`);
      if (!res.ok) throw new Error("Failed to load refunds");
      const payload = (await res.json()) as PagedResponse<Refund>;
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
      setError(err instanceof Error ? err.message : "Failed to load refunds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems(page);
  }, [page]);

  const handleApprove = async (id: number) => {
    setActionId(id);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/refunds/${id}/approve`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Approve failed");
      await loadItems(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionId(id);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/refunds/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReasons[id] || "" })
      });
      if (!res.ok) throw new Error("Reject failed");
      await loadItems(page);
      setRejectReasons((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Refund Verification</h2>
        <p className="text-on-surface-variant mt-1">Approve or reject refund requests.</p>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-outline">
                  <th className="py-2">ID</th>
                  <th className="py-2">Booking</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">{item.bookingId}</td>
                    <td className="py-3">{item.amount}</td>
                    <td className="py-3">{item.status}</td>
                    <td className="py-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            className="text-primary font-semibold disabled:opacity-60"
                            onClick={() => handleApprove(item.id)}
                            disabled={actionId === item.id}
                          >
                            Approve
                          </button>
                          <button
                            className="text-error font-semibold disabled:opacity-60"
                            onClick={() => handleReject(item.id)}
                            disabled={actionId === item.id}
                          >
                            Reject
                          </button>
                        </div>
                        <input
                          className="bg-surface-container-high rounded-xl px-3 py-2 text-xs"
                          placeholder="Reject reason (optional)"
                          value={rejectReasons[item.id] ?? ""}
                          onChange={(event) =>
                            setRejectReasons((prev) => ({ ...prev, [item.id]: event.target.value }))
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-on-surface-variant" colSpan={5}>
                      No refund requests.
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
