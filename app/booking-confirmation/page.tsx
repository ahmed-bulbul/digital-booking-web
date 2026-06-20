import Link from "next/link";
import TopNav from "../components/TopNav";
import { API_BASE_URL } from "../lib/config";

const currencySymbols: Record<string, string> = { BDT: "৳", USD: "$", EUR: "€" };

type SearchParams = { bookingId?: string };

type BookingDetailItem = {
  scheduleInventoryId: number;
  seatNumber: string;
  passengerName: string;
  unitPrice: number;
  taxAmount: number;
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
  departureAt?: string | null;
  sourceName?: string | null;
  destinationName?: string | null;
  productName?: string | null;
  items: BookingDetailItem[];
};

type ApiResponse<T> = { success: boolean; data: T; error?: { code: string; message: string } | null };

function formatPrice(price?: number | null, currency?: string | null) {
  if (price === null || price === undefined) return "—";
  const symbol = currency ? (currencySymbols[currency] ?? "") : "";
  return `${symbol}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price)}`;
}

async function fetchBookingDetail(bookingId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const payload = (await res.json()) as ApiResponse<BookingDetail>;
    return payload.data ?? null;
  } catch {
    return null;
  }
}

function statusConfig(status?: number) {
  switch (status) {
    case 2: return { label: "Confirmed", icon: "check_circle", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case 1: return { label: "Pending Verification", icon: "schedule", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    case 3: return { label: "Cancelled", icon: "cancel", cls: "bg-rose-50 text-rose-700 border-rose-200" };
    case 4: return { label: "Expired", icon: "timer_off", cls: "bg-slate-100 text-slate-600 border-slate-200" };
    case 5: return { label: "Refunded", icon: "currency_exchange", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    default: return { label: "Unknown", icon: "help", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  }
}

export default async function BookingConfirmationPage({ searchParams }: { searchParams: SearchParams }) {
  const bookingId = Number(searchParams.bookingId ?? 0);
  const booking = bookingId ? await fetchBookingDetail(bookingId) : null;
  const status = booking ? statusConfig(booking.status) : null;
  const isConfirmed = booking?.status === 2;
  const isPending = booking?.status === 1;

  return (
    <>
      <TopNav active="bookings" />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">

        {/* Success / status header */}
        <div className={`rounded-2xl border p-6 text-center ${
          isConfirmed
            ? "bg-emerald-50 border-emerald-200"
            : isPending
            ? "bg-amber-50 border-amber-200"
            : "bg-surface-container-low border-outline-variant/20"
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isConfirmed ? "bg-emerald-100" : isPending ? "bg-amber-100" : "bg-surface-container-high"
          }`}>
            <span className={`material-symbols-outlined text-4xl ${
              isConfirmed ? "text-emerald-600" : isPending ? "text-amber-600" : "text-on-surface-variant"
            }`} style={{ fontVariationSettings: '"FILL" 1' }}>
              {isConfirmed ? "check_circle" : isPending ? "schedule" : "confirmation_number"}
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            {isConfirmed ? "Booking Confirmed!" : isPending ? "Awaiting Verification" : "Booking Summary"}
          </h1>
          <p className={`text-sm mt-2 ${
            isConfirmed ? "text-emerald-700" : isPending ? "text-amber-700" : "text-on-surface-variant"
          }`}>
            {isConfirmed
              ? "Your seats are reserved. Check your email for the e-ticket."
              : isPending
              ? "Your booking is under review. Usually confirmed within 15–30 minutes."
              : "Here are the details of your booking."}
          </p>
        </div>

        {!booking ? (
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-outline block mb-3">search_off</span>
            <p className="font-semibold text-on-surface-variant">Booking not found.</p>
            <Link href="/search" className="inline-flex items-center gap-2 mt-4 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold">
              Search Buses
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden card-shadow">
            {/* Ticket header */}
            <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Booking Reference</p>
                <p className="text-xl font-black font-headline text-on-surface tracking-wider mt-0.5">{booking.bookingRef}</p>
              </div>
              {status && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${status.cls}`}>
                  <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
                  {status.label}
                </span>
              )}
            </div>

            {/* Route */}
            <div className="px-6 py-5 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="text-center flex-shrink-0">
                  <p className="font-headline font-bold text-base text-on-surface">{booking.sourceName ?? "—"}</p>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-px bg-outline-variant/40" />
                  <span className="material-symbols-outlined text-primary text-[20px]">directions_bus</span>
                  <div className="flex-1 h-px bg-outline-variant/40" />
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="font-headline font-bold text-base text-on-surface">{booking.destinationName ?? "—"}</p>
                </div>
              </div>
              {booking.productName && (
                <p className="text-center text-xs text-on-surface-variant mt-2">{booking.productName}</p>
              )}
            </div>

            {/* Seat & passenger summary */}
            {booking.items?.length > 0 && (
              <div className="px-6 py-5 border-b border-outline-variant/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Passengers</p>
                <div className="space-y-2">
                  {booking.items.map((item, i) => (
                    <div key={item.scheduleInventoryId} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{item.passengerName}</p>
                          <p className="text-xs text-on-surface-variant">Seat {item.seatNumber}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-on-surface">
                        {formatPrice(item.unitPrice + item.taxAmount, booking.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fare breakdown */}
            <div className="px-6 py-5 border-b border-outline-variant/20 bg-surface-container-low/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Fare Breakdown</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Base Fare</span>
                  <span className="font-medium">{formatPrice(booking.subtotal, booking.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Service Fee</span>
                  <span className="font-medium">{formatPrice(booking.taxTotal, booking.currency)}</span>
                </div>
                {booking.discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(booking.discountTotal, booking.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
                  <span className="font-bold text-on-surface">Total Paid</span>
                  <span className="text-xl font-black font-headline text-primary">{formatPrice(booking.grandTotal, booking.currency)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 flex flex-wrap gap-3">
              {booking && (
                <a
                  href={`${API_BASE_URL}/api/bookings/${booking.bookingId}/ticket`}
                  className="flex items-center gap-2 primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-95 active:scale-95 transition-all shadow-sm shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download Ticket
                </a>
              )}
              <Link
                href="/search"
                className="flex items-center gap-2 bg-surface-container-high text-on-surface px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                Book Another
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 border border-outline-variant/40 text-on-surface px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                Home
              </Link>
            </div>
          </div>
        )}

        {/* Support */}
        <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">headset_mic</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Need help?</p>
            <p className="text-xs text-on-surface-variant">Call our 24/7 support line: <span className="font-semibold text-primary">16222</span></p>
          </div>
        </div>
      </main>
    </>
  );
}
