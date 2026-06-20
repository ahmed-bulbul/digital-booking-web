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
    page: number; size: number; totalElements: number;
    totalPages: number; hasNext: boolean; hasPrevious: boolean;
  };
};

type ApiResponse<T> = {
  success: boolean; data: T;
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

const currencySymbols: Record<string, string> = { BDT: "৳", USD: "$", EUR: "€" };

function formatPrice(amount?: number | null, currency?: string | null) {
  if (amount === null || amount === undefined) return "—";
  const symbol = currency ? (currencySymbols[currency] ?? "") : "";
  return `${symbol}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function bookingStatusConfig(status?: BookingStatus | null) {
  switch (status) {
    case 1: return { label: "Pending", icon: "schedule", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    case 2: return { label: "Confirmed", icon: "check_circle", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case 3: return { label: "Cancelled", icon: "cancel", cls: "bg-rose-50 text-rose-700 border-rose-200" };
    case 4: return { label: "Expired", icon: "timer_off", cls: "bg-slate-100 text-slate-600 border-slate-200" };
    case 5: return { label: "Refunded", icon: "currency_exchange", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    default: return { label: "Unknown", icon: "help", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  }
}

function paymentStatusConfig(status?: PaymentStatus | null) {
  switch (status) {
    case 1: return { label: "Payment Pending", cls: "bg-orange-50 text-orange-700 border-orange-200" };
    case 2: return { label: "Paid", cls: "bg-green-50 text-green-700 border-green-200" };
    case 3: return { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200" };
    case 4: return { label: "Refunded", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case 5: return { label: "Cancelled", cls: "bg-slate-100 text-slate-600 border-slate-200" };
    default: return { label: "Not Started", cls: "bg-slate-100 text-slate-500 border-slate-200" };
  }
}

function paymentMethodLabel(method?: PaymentMethod | null) {
  const map: Record<number, string> = { 1: "bKash", 2: "Nagad", 3: "Card", 4: "Bank Transfer", 5: "Cash", 6: "Wallet" };
  return method ? (map[method] ?? "—") : "—";
}

export default function BookingsClient() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta["pagination"] | null>(null);
  // Start false to match server render; set to real value after mount to avoid hydration mismatch
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page: String(page), size: String(size) });
      if (statusFilter) query.set("status", statusFilter);
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
    setIsAuthenticated(Boolean(getStoredToken()));
  }, []);

  useEffect(() => { fetchBookings(); }, [page, statusFilter, isAuthenticated]);

  const summary = useMemo(() => ({
    pending: bookings.filter((b) => b.status === 1).length,
    confirmed: bookings.filter((b) => b.status === 2).length,
    total: bookings.length
  }), [bookings]);

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">My Account</p>
          <h1 className="text-3xl font-headline font-bold text-on-surface">My Bookings</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Track journeys, complete payments, and download tickets.
          </p>
        </div>
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((item) => (
            <button
              key={item.label}
              onClick={() => { setStatusFilter(item.value); setPage(0); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                statusFilter === item.value
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-10 text-center card-shadow">
          <span className="material-symbols-outlined text-5xl text-outline block mb-4">lock</span>
          <p className="font-headline font-bold text-lg text-on-surface mb-2">Sign in to view bookings</p>
          <p className="text-on-surface-variant text-sm mb-5">Your travel history and upcoming trips will appear here.</p>
          <Link href="/login" className="inline-flex items-center gap-2 primary-gradient text-white px-7 py-3 rounded-xl font-bold text-sm shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-[18px]">login</span>
            Sign In
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "This Page", value: summary.total, icon: "confirmation_number", color: "text-on-surface" },
              { label: "Pending", value: summary.pending, icon: "schedule", color: "text-amber-600" },
              { label: "Confirmed", value: summary.confirmed, icon: "check_circle", color: "text-emerald-600" }
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 card-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{stat.label}</p>
                  <span className={`material-symbols-outlined text-[18px] ${stat.color}`} style={{ fontVariationSettings: '"FILL" 1' }}>
                    {stat.icon}
                  </span>
                </div>
                <p className={`text-2xl font-black font-headline ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-surface-container-high rounded w-1/3 mb-3" />
                  <div className="h-6 bg-surface-container-high rounded w-1/2 mb-2" />
                  <div className="h-3 bg-surface-container-high rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-error/8 border border-error/20 text-error rounded-2xl p-8 text-center font-semibold text-sm">
              <span className="material-symbols-outlined text-4xl block mb-3">error</span>
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-12 text-center card-shadow">
              <span className="material-symbols-outlined text-5xl text-outline block mb-4">confirmation_number</span>
              <p className="font-headline font-bold text-lg text-on-surface mb-2">No bookings found</p>
              <p className="text-on-surface-variant text-sm mb-5">
                {statusFilter ? "Try a different filter." : "Book your first journey to see it here."}
              </p>
              <Link href="/search" className="inline-flex items-center gap-2 primary-gradient text-white px-7 py-3 rounded-xl font-bold text-sm shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined text-[18px]">search</span>
                Find Buses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const bStatus = bookingStatusConfig(booking.status);
                const pStatus = paymentStatusConfig(booking.paymentStatus);
                const seats = booking.seats?.length ? booking.seats.join(", ") : "—";
                const route = `${booking.sourceName ?? "—"} → ${booking.destinationName ?? "—"}`;

                return (
                  <div
                    key={booking.bookingId}
                    className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden card-shadow hover:border-primary/20 transition-all duration-200"
                  >
                    {/* Status stripe */}
                    <div className={`h-1 w-full ${
                      booking.status === 2 ? "bg-emerald-400" :
                      booking.status === 1 ? "bg-amber-400" :
                      booking.status === 3 ? "bg-rose-400" : "bg-slate-300"
                    }`} />

                    <div className="p-5 md:p-6">
                      <div className="flex flex-col md:flex-row gap-5">
                        {/* Left: info */}
                        <div className="flex-1 space-y-3 min-w-0">
                          {/* Badges row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-on-surface-variant font-mono tracking-wider">
                              {booking.bookingRef}
                            </span>
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${bStatus.cls}`}>
                              <span className="material-symbols-outlined text-[12px]">{bStatus.icon}</span>
                              {bStatus.label}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${pStatus.cls}`}>
                              {pStatus.label}
                            </span>
                          </div>

                          {/* Route */}
                          <h3 className="font-headline font-bold text-lg text-on-surface leading-tight">{route}</h3>
                          <p className="text-sm text-on-surface-variant">
                            {booking.productName ?? "—"}{booking.providerName ? ` · ${booking.providerName}` : ""}
                          </p>

                          {/* Journey times */}
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-lg font-bold font-headline text-on-surface">{formatTime(booking.departureAt)}</p>
                              <p className="text-xs text-on-surface-variant">{formatDate(booking.departureAt)}</p>
                              <p className="text-xs text-on-surface-variant">{booking.sourceCity ?? ""}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex-1 h-px bg-outline-variant/40" />
                              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">directions_bus</span>
                              <div className="flex-1 h-px bg-outline-variant/40" />
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold font-headline text-on-surface">{formatTime(booking.arrivalAt)}</p>
                              <p className="text-xs text-on-surface-variant">{formatDate(booking.arrivalAt)}</p>
                              <p className="text-xs text-on-surface-variant">{booking.destinationCity ?? ""}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right: summary box */}
                        <div className="bg-surface-container-low rounded-xl p-4 min-w-[180px] space-y-3 flex-shrink-0">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Seats</p>
                            <p className="font-semibold text-on-surface text-sm mt-0.5">{seats}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total</p>
                            <p className="text-xl font-black font-headline text-on-surface">{formatPrice(booking.grandTotal, booking.currency)}</p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">via {paymentMethodLabel(booking.paymentMethod)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-outline-variant/15 flex flex-wrap gap-2">
                        <Link
                          href={`/booking-confirmation?bookingId=${booking.bookingId}`}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl primary-gradient text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          View Details
                        </Link>
                        {booking.status === 1 && (
                          <Link
                            href={`/checkout?bookingId=${booking.bookingId}`}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary text-primary text-xs font-bold hover:bg-primary/8 transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">payment</span>
                            Pay Now
                          </Link>
                        )}
                        {(booking.ticketAvailable || booking.status === 2) && (
                          <a
                            href={`${API_BASE_URL}/api/bookings/${booking.bookingId}/ticket`}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/40 text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            Ticket
                          </a>
                        )}
                        {booking.status === 1 && (
                          <button
                            type="button"
                            onClick={() => handleCancel(booking.bookingId)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface text-sm font-semibold disabled:opacity-40 hover:bg-surface-container-high transition-all"
                disabled={!meta.hasPrevious}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Previous
              </button>
              <p className="text-sm text-on-surface-variant font-medium">
                Page {(meta.page ?? page) + 1} of {meta.totalPages}
              </p>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface text-sm font-semibold disabled:opacity-40 hover:bg-surface-container-high transition-all"
                disabled={!meta.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
