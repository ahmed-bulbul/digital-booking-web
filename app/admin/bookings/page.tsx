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

type Booking = {
  id: number;
  bookingRef: string;
  status: number;
  grandTotal: number;
  currency: string;
  createdAt: string;
};

type PagedResponse<T> = ApiResponse<T[]>;

type BookingDetailItem = {
  scheduleInventoryId: number;
  seatNumber?: string | null;
  passengerId?: number | null;
  passengerName?: string | null;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  ticketNumber?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  unitPrice?: number | null;
  taxAmount?: number | null;
};

type BookingDetail = {
  bookingId: number;
  bookingRef: string;
  status: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  createdAt?: string | null;
  scheduleId?: number | null;
  productName?: string | null;
  providerName?: string | null;
  sourceName?: string | null;
  sourceCity?: string | null;
  destinationName?: string | null;
  destinationCity?: string | null;
  departureAt?: string | null;
  arrivalAt?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  items: BookingDetailItem[];
};

const currencySymbols: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€"
};

function formatPrice(price?: number | null, currency?: string | null) {
  if (price === null || price === undefined) {
    return "—";
  }
  const symbol = currency ? currencySymbols[currency] ?? "" : "";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
  return `${symbol}${formatted}`;
}

function statusLabel(status?: number) {
  if (status === 2) return { label: "Confirmed", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (status === 1) return { label: "Pending", tone: "bg-amber-50 text-amber-700 border-amber-200" };
  if (status === 3) return { label: "Cancelled", tone: "bg-rose-50 text-rose-700 border-rose-200" };
  if (status === 4) return { label: "Expired", tone: "bg-slate-100 text-slate-600 border-slate-200" };
  if (status === 5) return { label: "Refunded", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  return { label: "Unknown", tone: "bg-slate-100 text-slate-600 border-slate-200" };
}

export default function BookingManagementPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  });

  const pageSize = 10;

  const loadBookings = async (pageValue = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/bookings?page=${pageValue}&size=${pageSize}`);
      if (!res.ok) throw new Error("Failed to load bookings");
      const payload = (await res.json()) as PagedResponse<Booking>;
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
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings(page);
  }, [page]);

  const loadBookingDetail = async (bookingId: number) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Failed to load booking details");
      const payload = (await res.json()) as ApiResponse<BookingDetail>;
      setDetail(payload.data ?? null);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to load booking details");
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (bookingId: number) => {
    setDetailId(bookingId);
    void loadBookingDetail(bookingId);
  };

  const closeDetail = () => {
    setDetailId(null);
    setDetail(null);
    setDetailError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Booking Management</h2>
        <p className="text-on-surface-variant mt-1">Review latest bookings and statuses.</p>
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
                  <th className="py-2">Ref</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Created</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{item.bookingRef}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          statusLabel(item.status).tone
                        }`}
                      >
                        {statusLabel(item.status).label}
                      </span>
                    </td>
                    <td className="py-3">
                      {formatPrice(item.grandTotal, item.currency)}
                    </td>
                    <td className="py-3 text-xs text-on-surface-variant">
                      {new Date(item.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(item.id)}
                        className="px-4 py-2 rounded-xl border border-outline-variant/40 text-on-surface text-xs font-semibold hover:border-primary/60"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-on-surface-variant" colSpan={5}>
                      No bookings found.
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

      {detailId !== null ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-4xl rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={closeDetail}
              className="absolute right-6 top-6 text-on-surface-variant hover:text-on-surface"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant">Booking Details</p>
                  <h3 className="text-2xl font-headline font-bold text-on-surface">
                    {detail?.bookingRef ?? "Loading..."}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    statusLabel(detail?.status).tone
                  }`}
                >
                  {statusLabel(detail?.status).label}
                </span>
              </div>

              {detailLoading ? (
                <div className="text-sm text-on-surface-variant">Loading booking details…</div>
              ) : detailError ? (
                <div className="text-sm text-error font-semibold">{detailError}</div>
              ) : detail ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-container-low rounded-2xl p-4">
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant">Passenger</p>
                      <p className="text-sm font-semibold text-on-surface mt-2">{detail.userName ?? "—"}</p>
                      <p className="text-xs text-on-surface-variant">{detail.userEmail ?? "—"}</p>
                      <p className="text-xs text-on-surface-variant">{detail.userPhone ?? "—"}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-2xl p-4">
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant">Route</p>
                      <p className="text-sm font-semibold text-on-surface mt-2">
                        {detail.sourceName ?? "—"} → {detail.destinationName ?? "—"}
                      </p>
                      <p className="text-xs text-on-surface-variant">{detail.productName ?? "—"}</p>
                      <p className="text-xs text-on-surface-variant">{detail.providerName ?? "—"}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-2xl p-4">
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant">Schedule</p>
                      <p className="text-sm font-semibold text-on-surface mt-2">
                        {detail.departureAt ? new Date(detail.departureAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) : "—"}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {detail.arrivalAt ? new Date(detail.arrivalAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) : "—"}
                      </p>
                      <p className="text-xs text-on-surface-variant">Schedule #{detail.scheduleId ?? "—"}</p>
                    </div>
                  </div>

                  <div className="bg-surface-container-low rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-3">Passenger List</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-widest text-outline">
                            <th className="py-2">Seat</th>
                            <th className="py-2">Passenger</th>
                            <th className="py-2">Ticket</th>
                            <th className="py-2">Document</th>
                            <th className="py-2">Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.items?.map((item) => (
                            <tr key={item.scheduleInventoryId} className="border-t border-outline-variant/20">
                              <td className="py-2 font-semibold">{item.seatNumber ?? "—"}</td>
                              <td className="py-2">
                                <div className="font-semibold">{item.passengerName ?? "—"}</div>
                                <div className="text-[10px] text-on-surface-variant">{item.gender ?? "—"}</div>
                              </td>
                              <td className="py-2">{item.ticketNumber ?? "—"}</td>
                              <td className="py-2">
                                <div>{item.documentType ?? "—"}</div>
                                <div className="text-[10px] text-on-surface-variant">{item.documentNumber ?? "—"}</div>
                              </td>
                              <td className="py-2">
                                <div>{item.email ?? "—"}</div>
                                <div className="text-[10px] text-on-surface-variant">{item.phone ?? "—"}</div>
                              </td>
                            </tr>
                          ))}
                          {detail.items?.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-3 text-on-surface-variant">
                                No passengers found.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Base Fare</span>
                      <span>{formatPrice(detail.subtotal, detail.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Service Fee</span>
                      <span>{formatPrice(detail.taxTotal, detail.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Discount</span>
                      <span>-{formatPrice(detail.discountTotal, detail.currency)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-outline-variant/30">
                      <span>Total</span>
                      <span>{formatPrice(detail.grandTotal, detail.currency)}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
