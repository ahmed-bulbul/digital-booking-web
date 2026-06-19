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

type PaymentReview = {
  paymentId: number;
  bookingId: number;
  bookingRef: string;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  amount: number;
  currency: string;
  method: string;
  transactionId?: string | null;
  status: string;
  createdAt: string;
};

export default function PaymentManagementPage() {
  const [items, setItems] = useState<PaymentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const loadPayments = async (pageValue = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/payments?page=${pageValue}&size=${pageSize}&status=PENDING`);
      if (!res.ok) throw new Error("Failed to load payments");
      const payload = (await res.json()) as ApiResponse<PaymentReview[]>;
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
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (paymentId: number) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/payments/${paymentId}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Approval failed");
      await loadPayments(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    }
  };

  useEffect(() => {
    void loadPayments(page);
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Payment Approvals</h2>
        <p className="text-on-surface-variant mt-1">Review pending manual payments and approve them.</p>
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
                  <th className="py-2">Booking</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Method</th>
                  <th className="py-2">Txn ID</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Submitted</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.paymentId} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.bookingRef}</td>
                    <td className="py-3">
                      <div className="font-medium text-on-surface">{item.userName ?? "—"}</div>
                      <div className="text-xs text-on-surface-variant">{item.userPhone ?? "—"}</div>
                    </td>
                    <td className="py-3">{item.method}</td>
                    <td className="py-3">{item.transactionId ?? "—"}</td>
                    <td className="py-3">
                      {item.amount} {item.currency}
                    </td>
                    <td className="py-3 text-xs text-on-surface-variant">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
                        onClick={() => approvePayment(item.paymentId)}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-on-surface-variant" colSpan={7}>
                      No pending payments.
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
