import Link from "next/link";
import TopNav from "../components/TopNav";

const currencySymbols: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€"
};

type SearchParams = {
  bookingId?: string;
};

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

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string } | null;
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

async function fetchBookingDetail(bookingId: number) {
  const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";
  const res = await fetch(`${baseUrl}/api/bookings/${bookingId}`, {
    cache: "no-store"
  });
  if (!res.ok) {
    return null;
  }
  const payload = (await res.json()) as ApiResponse<BookingDetail>;
  return payload.data ?? null;
}

function statusLabel(status?: number) {
  if (status === 2) return "Confirmed";
  if (status === 1) return "Pending Verification";
  if (status === 3) return "Cancelled";
  if (status === 4) return "Expired";
  if (status === 5) return "Refunded";
  return "Unknown";
}

export default async function BookingConfirmationPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const bookingId = Number(searchParams.bookingId ?? 0);
  const booking = bookingId ? await fetchBookingDetail(bookingId) : null;
  const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

  return (
    <>
      <TopNav active="bookings" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">confirmation_number</span>
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold text-on-surface">Booking Confirmation</h1>
              <p className="text-sm text-on-surface-variant">Your booking status and summary.</p>
            </div>
          </div>

          {!booking ? (
            <div className="text-sm text-on-surface-variant">Booking not found.</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-outline">Booking Ref</p>
                  <p className="text-lg font-semibold text-on-surface">{booking.bookingRef}</p>
                </div>
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {statusLabel(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-low p-5 rounded-2xl">
                  <p className="text-xs uppercase tracking-widest text-outline">Route</p>
                  <p className="text-base font-semibold">{booking.sourceName ?? "—"} → {booking.destinationName ?? "—"}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{booking.productName ?? "—"}</p>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl">
                  <p className="text-xs uppercase tracking-widest text-outline">Seats</p>
                  <p className="text-base font-semibold">
                    {booking.items?.length ? booking.items.map((item) => item.seatNumber).join(", ") : "—"}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Base Fare</span>
                  <span>{formatPrice(booking.subtotal, booking.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Service Fee</span>
                  <span>{formatPrice(booking.taxTotal, booking.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Discount</span>
                  <span>-{formatPrice(booking.discountTotal, booking.currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-outline-variant/30">
                  <span>Total</span>
                  <span>{formatPrice(booking.grandTotal, booking.currency)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {booking ? (
                  <a
                    href={`${baseUrl}/api/bookings/${booking.bookingId}/ticket`}
                    className="px-5 py-3 rounded-xl bg-secondary text-white font-semibold"
                  >
                    Download Ticket (PDF)
                  </a>
                ) : null}
                <Link
                  href="/search"
                  className="px-5 py-3 rounded-xl bg-primary text-white font-semibold"
                >
                  Book Another Trip
                </Link>
                <Link
                  href="/"
                  className="px-5 py-3 rounded-xl border border-outline-variant/40 text-on-surface font-semibold"
                >
                  Go Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
