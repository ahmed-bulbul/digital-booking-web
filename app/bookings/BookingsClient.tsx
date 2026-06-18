"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE_URL, authFetch, getStoredToken } from "../lib/authClient";

type BookingStatus = 1 | 2 | 3 | 4 | 5;
type PaymentStatus = 1 | 2 | 3 | 4 | 5;
type PaymentMethod = 1 | 2 | 3 | 4 | 5 | 6;

type BookingItem = {
  bookingId: number;
  bookingRef: string;
  status: BookingStatus;
  createdAt?: string | null;
  departureAt?: string | null;
  arrivalAt?: string | null;
  sourceName?: string | null;
  sourceCity?: string | null;
  destinationName?: string | null;
  destinationCity?: string | null;
  productName?: string | null;
  providerName?: string | null;
  seats?: string[] | null;
  grandTotal?: number | null;
  currency?: string | null;
  paymentStatus?: PaymentStatus | null;
  paymentMethod?: PaymentMethod | null;
  ticketAvailable?: boolean | null;
};

type PaginationMeta = {
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { code?: string; message?: string };
  meta?: PaginationMeta;
};

const statusFilters = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Refunded", value: "REFUNDED" }
];

const currencySymbols: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€"
};

function formatPrice(amount?: number | null, currency?: string | null) {
  if (amount === null || amount === undefined) return "—";
  const symbol = currency ? currencySymbols[currency] ?? "" : "";
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
  return `${symbol}${formatted}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function statusLabel(status?: BookingStatus | null) {
  switch (status) {
    case 1:
      return { label: "Pending", tone: "bg-amber-50 text-amber-700 border-amber-200" };
    case 2:
      return { label: "Confirmed", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case 3:
      return { label: "Cancelled", tone: "bg-rose-50 text-rose-700 border-rose-200" };
    case 4:
      return { label: "Expired", tone: "bg-slate-100 text-slate-600 border-slate-200" };
    case 5:
      return { label: "Refunded", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    default:
      return { label: "Unknown", tone: "bg-slate-100 text-slate-600 border-slate-200" };
  }
}

function paymentLabel(status?: PaymentStatus | null) {
  switch (status) {
    case 1:
      return { label: "Payment Pending", tone: "bg-orange-50 text-orange-700 border-orange-200" };
    case 2:
      return { label: "Payment Successful", tone: "bg-green-50 text-green-700 border-green-200" };
    case 3:
      return { label: "Payment Failed", tone: "bg-red-50 text-red-700 border-red-200" };
    case 4:
      return { label: "Payment Refunded", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case 5:
      return { label: "Payment Cancelled", tone: "bg-slate-100 text-slate-600 border-slate-200" };
    default:
      return { label: "Payment Not Started", tone: "bg-slate-100 text-slate-600 border-slate-200" };
  }
}

function paymentMethodLabel(method?: PaymentMethod | null) {
  switch (method) {
    case 1:
      return "bKash";
    case 2:
      return "Nagad";
    case 3:
      return "Card";
    case 4:
      return "Bank Transfer";
    case 5:
      return "Cash";
    case 6:
      return "Wallet";
    default:
      return "—";
  }
}

export default function BookingsClient() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta["pagination"] | null>(null);

  const isAuthenticated = typeof window !== "undefined" && Boolean(getStoredToken());

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(page),
        size: String(size)
      });
      if (status) query.set("status", status);
      const res = await authFetch(`${API_BASE_URL}/api/bookings/my?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to load bookings");
      const payload = (await res.json()) as ApiResponse<BookingItem[]>;
      setBookings(payload.data ?? []);
      setMeta(payload.meta?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, status]);

  const summary = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 1).length;
    const confirmed = bookings.filter((b) => b.status === 2).length;
    return { pending, confirmed, total: bookings.length };
  }, [bookings]);

  const handleCancel = async (bookingId: number) => {
    const reason = window.prompt("Reason for cancellation?");
    if (!reason) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error("Failed to cancel booking");
      await fetchBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">My Bookings</p>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mt-2">Manage Your Trips</h1>
          <p className="text-on-surface-variant mt-2">
            Track upcoming departures, complete payments, and download tickets.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {statusFilters.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setStatus(item.value);
                setPage(0);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                status === item.value
                  ? "bg-primary text-white border-primary"
                  : "border-outline-variant/40 text-on-surface-variant hover:border-primary/60"
              }`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {!isAuthenticated ? (
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-8 text-center">
          <p className="text-on-surface-variant">Please log in to view your bookings.</p>
          <Link
            href="/login"
            className="inline-flex mt-4 px-6 py-3 rounded-xl bg-primary text-white font-bold"
          >
            Login
          </Link>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">Total on page</p>
              <p className="text-2xl font-bold text-on-surface mt-2">{summary.total}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">{summary.pending}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">Confirmed</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{summary.confirmed}</p>
            </div>
          </section>

          {loading ? (
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-10 text-center text-on-surface-variant">
              Loading bookings...
            </div>
          ) : error ? (
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-10 text-center text-error font-semibold">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-10 text-center text-on-surface-variant">
              No bookings found.
            </div>
          ) : (
            <section className="space-y-6">
              {bookings.map((booking) => {
                const statusInfo = statusLabel(booking.status);
                const paymentInfo = paymentLabel(booking.paymentStatus ?? null);
                const seatList = booking.seats?.length ? booking.seats.join(", ") : "—";
                const routeLabel = `${booking.sourceName ?? "—"} → ${booking.destinationName ?? "—"}`;
                const depTime = formatTime(booking.departureAt);
                const depDate = formatDate(booking.departureAt);
                const arrTime = formatTime(booking.arrivalAt);
                const arrDate = formatDate(booking.arrivalAt);

                return (
                  <div
                    key={booking.bookingId}
                    className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-6 md:p-8 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                            Booking Ref
                          </span>
                          <span className="font-bold text-on-surface">{booking.bookingRef}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.tone}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${paymentInfo.tone}`}
                          >
                            {paymentInfo.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface">{routeLabel}</h3>
                        <p className="text-sm text-on-surface-variant">
                          {booking.productName ?? "—"} · {booking.providerName ?? "—"}
                        </p>
                        <div className="flex flex-wrap gap-6 text-sm text-on-surface-variant">
                          <div>
                            <p className="font-semibold text-on-surface">{depTime}</p>
                            <p className="text-xs">{depDate}</p>
                            <p>{booking.sourceCity ?? "—"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface text-right">{arrTime}</p>
                            <p className="text-xs text-right">{arrDate}</p>
                            <p className="text-right">{booking.destinationCity ?? "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-surface-container-low rounded-2xl p-4 min-w-[220px] space-y-2">
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant">Seats</p>
                        <p className="font-semibold text-on-surface">{seatList}</p>
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant">Total</p>
                        <p className="text-xl font-bold text-on-surface">
                          {formatPrice(booking.grandTotal, booking.currency)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Paid by {paymentMethodLabel(booking.paymentMethod)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/booking-confirmation?bookingId=${booking.bookingId}`}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
                      >
                        View Details
                      </Link>
                      {booking.status === 1 ? (
                        <Link
                          href={`/checkout?bookingId=${booking.bookingId}`}
                          className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold"
                        >
                          Complete Payment
                        </Link>
                      ) : null}
                      {booking.ticketAvailable || booking.status === 2 ? (
                        <a
                          href={`${API_BASE_URL}/api/bookings/${booking.bookingId}/ticket`}
                          className="px-4 py-2 rounded-xl border border-outline-variant/50 text-on-surface text-sm font-semibold"
                        >
                          Download Ticket
                        </a>
                      ) : null}
                      {booking.status === 1 ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(booking.bookingId)}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold"
                        >
                          Cancel Booking
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-outline-variant/40 text-on-surface disabled:opacity-40"
              disabled={!meta?.hasPrevious}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              Previous
            </button>
            <p className="text-sm text-on-surface-variant">
              Page {meta?.page ? meta.page + 1 : page + 1} of {meta?.totalPages ?? 1}
            </p>
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-outline-variant/40 text-on-surface disabled:opacity-40"
              disabled={!meta?.hasNext}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
