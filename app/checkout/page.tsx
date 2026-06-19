import Link from "next/link";
import TopNav from "../components/TopNav";
import CheckoutPaymentClient from "./CheckoutPaymentClient";

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
  passengerId: number;
  passengerName: string;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
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
  createdAt: string;
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
  paymentReceivedNumber?: string | null;
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

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const bookingId = Number(searchParams.bookingId ?? 0);
  const bookingDetail = bookingId ? await fetchBookingDetail(bookingId) : null;
  const seatLabels = bookingDetail?.items?.map((item) => item.seatNumber).filter(Boolean) ?? [];

  const departureAt = bookingDetail?.departureAt ? new Date(bookingDetail.departureAt) : null;
  const departureDateLabel = departureAt
    ? departureAt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const departureTimeLabel = departureAt
    ? departureAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <>
      <TopNav active="bookings" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">person_check</span>
                <h2 className="text-2xl font-bold font-headline tracking-tight text-on-surface">Passenger Review</h2>
              </div>
              {!bookingDetail ? (
                <div className="bg-surface-container-low p-8 rounded-xl text-sm text-on-surface-variant">
                  Booking not found. Please return to seat selection.
                </div>
              ) : (
                <div className="space-y-6">
                  {bookingDetail.items.map((item, index) => (
                    <div key={item.scheduleInventoryId} className="bg-surface-container-low p-8 rounded-xl space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-outline">Passenger {index + 1}</p>
                          <p className="text-lg font-semibold text-on-surface">Seat {item.seatNumber}</p>
                          <p className="text-sm text-on-surface-variant">{item.gender ?? "—"}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                          Seat {item.seatNumber}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-outline">Primary Passenger</p>
                          <p className="text-lg font-semibold text-on-surface">{item.passengerName}</p>
                          <p className="text-sm text-on-surface-variant">{item.documentType ?? "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-outline">Contact Details</p>
                          <p className="text-on-surface font-medium">{item.phone ?? "—"}</p>
                          <p className="text-sm text-on-surface-variant">{item.email ?? "—"}</p>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-outline-variant/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">verified</span>
                        <span className="text-xs text-on-surface-variant">Verification will be sent via SMS and Email</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {bookingDetail ? (
              <CheckoutPaymentClient
                bookingId={bookingDetail.bookingId}
                amount={bookingDetail.grandTotal ?? 0}
                currency={bookingDetail.currency ?? "BDT"}
                bookingStatus={bookingDetail.status}
                paymentReceivedNumber={bookingDetail.paymentReceivedNumber ?? null}
              />
            ) : null}
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h3 className="text-xl font-bold font-headline mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                Your Trip
              </h3>
              <div className="space-y-8 relative">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center py-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                    <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-outline-variant/30 my-1"></div>
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-white"></div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Departure</p>
                      <p className="font-bold text-on-surface">{bookingDetail?.sourceName ?? "—"}</p>
                      <p className="text-xs text-on-surface-variant">{bookingDetail?.sourceCity ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Destination</p>
                      <p className="font-bold text-on-surface">{bookingDetail?.destinationName ?? "—"}</p>
                      <p className="text-xs text-on-surface-variant">{bookingDetail?.destinationCity ?? "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low p-3 rounded-xl text-center">
                    <span className="material-symbols-outlined text-outline text-sm mb-1">calendar_today</span>
                    <p className="text-[10px] uppercase font-bold text-outline">Date</p>
                    <p className="text-sm font-bold">{departureDateLabel}</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl text-center">
                    <span className="material-symbols-outlined text-outline text-sm mb-1">schedule</span>
                    <p className="text-[10px] uppercase font-bold text-outline">Time</p>
                    <p className="text-sm font-bold">{departureTimeLabel}</p>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">chair</span>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-primary/70">Seats</p>
                      <p className="text-sm font-bold text-on-surface">{seatLabels.length ? seatLabels.join(", ") : "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-outline">Bus Type</p>
                    <p className="text-sm font-bold text-on-surface">{bookingDetail?.productName ?? "—"}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/30 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Base Fare ({seatLabels.length || "—"}x)</span>
                    <span className="font-medium">{formatPrice(bookingDetail?.subtotal, bookingDetail?.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Service Fee</span>
                    <span className="font-medium">{formatPrice(bookingDetail?.taxTotal, bookingDetail?.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">sell</span> Discount
                    </span>
                    <span className="font-medium">-{formatPrice(bookingDetail?.discountTotal ?? 0, bookingDetail?.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-dashed border-outline-variant/50">
                    <span className="font-bold text-on-surface">Total Amount</span>
                    <span className="text-xl font-extrabold text-primary font-headline">
                      {formatPrice(bookingDetail?.grandTotal, bookingDetail?.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-high/50 p-6 rounded-xl border border-outline-variant/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-lg">headset_mic</span>
              </div>
              <div>
                <p className="text-sm font-bold">Need assistance?</p>
                <p className="text-xs text-on-surface-variant">Call our 24/7 helpline 16222</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="w-full mt-auto bg-surface-container-low border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto gap-4 font-body text-sm text-slate-500">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline font-bold text-slate-900 text-lg">JatraXpress</span>
            <p>© 2024 JatraXpress Mobility. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="text-slate-500 hover:text-green-700 transition-colors opacity-80 hover:opacity-100" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="text-slate-500 hover:text-green-700 transition-colors opacity-80 hover:opacity-100" href="/terms">
              Terms of Service
            </Link>
            <Link className="text-slate-500 hover:text-green-700 transition-colors opacity-80 hover:opacity-100" href="/refunds">
              Refund Policy
            </Link>
            <Link className="text-slate-500 hover:text-green-700 transition-colors opacity-80 hover:opacity-100" href="/contact">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
