"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, getCurrentUser, getStoredToken } from "../lib/authClient";
import { toast } from "react-hot-toast";

const STATUS_AVAILABLE = 1;
const STATUS_LOCKED = 2;
const STATUS_BOOKED = 3;

const currencySymbols: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€"
};

type ScheduleInventoryItem = {
  scheduleInventoryId: number;
  inventoryId: number;
  itemNumber: string;
  classId: number;
  className: string;
  type: number;
  attributes?: Record<string, unknown> | null;
  status: number;
  lockVersion: number;
  lockedUntil?: string | null;
  finalPrice?: number | null;
  taxAmount?: number | null;
  currency?: string | null;
};

type ScheduleDetail = {
  scheduleId: number;
  productId?: number | null;
  productName?: string | null;
  providerId?: number | null;
  providerName?: string | null;
  routeId?: number | null;
  sourceName?: string | null;
  sourceCity?: string | null;
  destinationName?: string | null;
  destinationCity?: string | null;
  departureAt?: string | null;
  arrivalAt?: string | null;
  availableCount?: number | null;
};

type PassengerInput = {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  documentType: 1 | 2 | 3 | 4;
  documentNumber: string;
  email: string;
  phone: string;
  nationality: string;
};

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

type SeatSelectionClientProps = {
  items: ScheduleInventoryItem[];
  scheduleDetail: ScheduleDetail | null;
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

function splitName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  const firstName = parts.shift() ?? "";
  const lastName = parts.length ? parts.join(" ") : firstName;
  return { firstName, lastName };
}

function getStoredUserId() {
  if (typeof window === "undefined") return 1;
  const stored = localStorage.getItem("auth_user_id");
  const parsed = stored ? Number(stored) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getSessionId() {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("booking_session_id");
  if (stored) return stored;
  const next = crypto.randomUUID();
  localStorage.setItem("booking_session_id", next);
  return next;
}

export default function SeatSelectionClient({ items, scheduleDetail }: SeatSelectionClientProps) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Record<string, PassengerInput>>({});
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.itemNumber.localeCompare(b.itemNumber, undefined, { numeric: true }));
  }, [items]);

  const availableItems = useMemo(() => sortedItems.filter((item) => item.status === STATUS_AVAILABLE), [sortedItems]);
  const selectedItems = useMemo(
    () => sortedItems.filter((item) => selectedSeats.includes(item.itemNumber)),
    [sortedItems, selectedSeats]
  );

  const baseFare = selectedItems.reduce((sum, item) => sum + (item.finalPrice ?? 0), 0);
  const serviceFee = selectedItems.reduce((sum, item) => sum + (item.taxAmount ?? 0), 0);
  const totalFare = baseFare + serviceFee;
  const currency = selectedItems[0]?.currency ?? availableItems[0]?.currency ?? "BDT";

  const boardingLabel = scheduleDetail?.sourceName
    ? `${scheduleDetail.sourceName}${scheduleDetail.sourceCity ? `, ${scheduleDetail.sourceCity}` : ""}`
    : "Boarding Point";
  const droppingLabel = scheduleDetail?.destinationName
    ? `${scheduleDetail.destinationName}${scheduleDetail.destinationCity ? `, ${scheduleDetail.destinationCity}` : ""}`
    : "Dropping Point";
  const departureAt = scheduleDetail?.departureAt ? new Date(scheduleDetail.departureAt) : null;
  const arrivalAt = scheduleDetail?.arrivalAt ? new Date(scheduleDetail.arrivalAt) : null;

  useEffect(() => {
    if (!getStoredToken()) return;
    let active = true;
    getCurrentUser()
      .then((user) => {
        if (active) setCurrentUser(user);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    toast.error(error, { id: "seat-selection-error" });
  }, [error]);

  useEffect(() => {
    if (!currentUser || selectedSeats.length === 0) return;
    const primarySeat = selectedSeats[0];
    setPassengers((prev) => {
      const existing = prev[primarySeat];
      if (!existing) return prev;
      const next = { ...prev };
      next[primarySeat] = {
        ...existing,
        fullName: existing.fullName.trim() ? existing.fullName : currentUser.name ?? "",
        email: existing.email.trim() ? existing.email : currentUser.email ?? "",
        phone: existing.phone.trim() ? existing.phone : currentUser.phone ?? ""
      };
      return next;
    });
  }, [currentUser, selectedSeats]);

  const toggleSeat = (seatNumber: string) => {
    setError(null);
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        const next = prev.filter((seat) => seat !== seatNumber);
        return next;
      }
      if (prev.length >= 4) {
        setError("You can select up to 4 seats at a time.");
        return prev;
      }
      const next = [...prev, seatNumber];
      return next;
    });
    setPassengers((prev) => {
      if (prev[seatNumber]) return prev;
      return {
        ...prev,
        [seatNumber]: {
          fullName: "",
          gender: "",
          documentType: 2,
          documentNumber: "N/A",
          email: "",
          phone: "",
          nationality: "BD"
        }
      };
    });
  };

  const updatePassenger = (seatNumber: string, patch: Partial<PassengerInput>) => {
    setPassengers((prev) => ({
      ...prev,
      [seatNumber]: {
        ...prev[seatNumber],
        ...patch
      }
    }));
  };

  const validate = () => {
    if (selectedSeats.length === 0) return "Select at least one seat.";
    for (const seat of selectedSeats) {
      const passenger = passengers[seat];
      if (!passenger || !passenger.fullName.trim()) return `Passenger name required for seat ${seat}.`;
    }
    return null;
  };

  const handleProceed = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    const sessionId = getSessionId();

    try {
      await Promise.all(
        selectedItems.map((item) =>
          fetch(`${API_BASE_URL}/api/inventory/${item.scheduleInventoryId}/lock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, lockVersion: item.lockVersion })
          }).then(async (res) => {
            if (!res.ok) {
              const payload = await res.json().catch(() => null);
              throw new Error(payload?.error?.message ?? "Seat lock failed");
            }
          })
        )
      );

      const passengerIds = await Promise.all(
        selectedItems.map(async (item) => {
          const passenger = passengers[item.itemNumber];
          const { firstName, lastName } = splitName(passenger.fullName);
          const res = await fetch(`${API_BASE_URL}/api/passengers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: getStoredUserId(),
              firstName,
              lastName,
              documentType: passenger.documentType ?? 2,
              documentNumber: passenger.documentNumber?.trim() ? passenger.documentNumber : "N/A",
              gender: passenger.gender || null,
              email: passenger.email?.trim() || null,
              phone: passenger.phone?.trim() || null,
              age: null,
              nationality: passenger.nationality
            })
          });
          if (!res.ok) {
            const payload = await res.json().catch(() => null);
            throw new Error(payload?.error?.message ?? "Failed to save passenger");
          }
          const payload = await res.json();
          return payload?.data?.passengerId as number;
        })
      );

      const bookingPayload = {
        userId: getStoredUserId(),
        sessionId,
        items: selectedItems.map((item, idx) => ({
          scheduleInventoryId: item.scheduleInventoryId,
          passengerId: passengerIds[idx],
          lockVersion: item.lockVersion
        }))
      };

      const bookingRes = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });
      if (!bookingRes.ok) {
        const payload = await bookingRes.json().catch(() => null);
        throw new Error(payload?.error?.message ?? "Failed to create booking");
      }
      const bookingJson = await bookingRes.json();
      const bookingId = bookingJson?.data?.bookingId;
      router.push(`/checkout?bookingId=${bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to proceed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-4">
            <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Select Your Seat</h1>
            <p className="text-on-surface-variant font-medium">
              {scheduleDetail?.scheduleId ? `Schedule #${scheduleDetail.scheduleId}` : "Choose a schedule to continue"}
            </p>
          </section>

          {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

          <div className="bg-surface-container-low rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[300px]">directions_bus</span>
            </div>
            <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
              <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm border border-outline-variant/10 w-full md:w-auto">
                <div className="flex justify-between items-center mb-8 border-b border-surface-container-high pb-4">
                  <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Seat Map</span>
                  <span className="material-symbols-outlined text-outline">settings</span>
                </div>
                {sortedItems.length === 0 ? (
                  <div className="text-sm text-on-surface-variant">No inventory found.</div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {sortedItems.map((seat) => {
                      const isBooked = seat.status === STATUS_BOOKED;
                      const isLocked = seat.status === STATUS_LOCKED;
                      const isSelected = selectedSeats.includes(seat.itemNumber);
                      const isDisabled = isBooked || isLocked;
                      return (
                        <button
                          key={seat.scheduleInventoryId}
                          type="button"
                          onClick={() => (!isDisabled ? toggleSeat(seat.itemNumber) : null)}
                          className={
                            isDisabled
                              ? isBooked
                                ? "w-12 h-12 rounded-lg border-2 border-outline-variant bg-surface-container-high cursor-not-allowed opacity-40 flex items-center justify-center"
                                : "w-12 h-12 rounded-lg border-2 border-outline-variant bg-surface-container-high text-on-surface-variant opacity-70 flex items-center justify-center cursor-not-allowed"
                              : isSelected
                                ? "w-12 h-12 rounded-lg border-2 border-secondary bg-secondary text-white flex items-center justify-center shadow-md"
                                : "w-12 h-12 rounded-lg border-2 border-primary-fixed-dim bg-primary-fixed-dim/20 flex items-center justify-center hover:bg-primary-container hover:text-white transition-all"
                          }
                        >
                          {seat.itemNumber}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-primary-fixed-dim/20 border-2 border-primary-fixed-dim"></div>
                  <span className="text-sm font-medium text-on-surface">Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-surface-container-high border-2 border-outline-variant opacity-70"></div>
                  <span className="text-sm font-medium text-on-surface">Locked</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-surface-container-high border-2 border-outline-variant opacity-40"></div>
                  <span className="text-sm font-medium text-on-surface">Booked</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-secondary border-2 border-secondary shadow-sm"></div>
                  <span className="text-sm font-medium text-on-surface">Selected</span>
                </div>

                <div className="mt-8 pt-8 border-t border-outline-variant/20">
                  <div className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Journey Highlights</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm">wifi</span>
                    <span className="text-xs">Premium Connectivity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">chair</span>
                    <span className="text-xs">180° Flat-bed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-headline font-bold text-on-surface">Passenger Details</h2>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                Seats {selectedSeats.length ? selectedSeats.join(", ") : "-"}
              </span>
            </div>

            {selectedSeats.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 text-sm text-on-surface-variant">
                Select one or more seats to add passenger details.
              </div>
            ) : (
              <div className="space-y-6">
                {selectedSeats.map((seatNumber, index) => {
                  const passenger = passengers[seatNumber];
                  return (
                    <div
                      key={seatNumber}
                      className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] font-bold text-outline">Passenger {index + 1}</p>
                          <p className="text-lg font-semibold text-on-surface">Seat {seatNumber}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                          Seat {seatNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold ml-1">Full Name</label>
                          <input
                            className="w-full bg-surface-container-high border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                            placeholder={`Passenger ${index + 1} name`}
                            type="text"
                            value={passenger?.fullName ?? ""}
                            onChange={(event) => updatePassenger(seatNumber, { fullName: event.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold ml-1">Phone</label>
                          <input
                            className="w-full bg-surface-container-high border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                            placeholder="Phone number (optional)"
                            type="tel"
                            value={passenger?.phone ?? ""}
                            onChange={(event) => updatePassenger(seatNumber, { phone: event.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold ml-1">Email</label>
                          <input
                            className="w-full bg-surface-container-high border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                            placeholder="Email address (optional)"
                            type="email"
                            value={passenger?.email ?? ""}
                            onChange={(event) => updatePassenger(seatNumber, { email: event.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4 mt-12 lg:mt-0">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10 space-y-6">
              <div className="space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-primary/20 rounded-full"></div>
                  <div className="absolute left-[-4px] top-0 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                  <div className="absolute left-[-4px] bottom-0 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-secondary/10"></div>
                  <div className="mb-8">
                    <label className="text-xs font-bold text-on-surface-variant block mb-1">Boarding Point</label>
                    <div className="text-lg font-bold text-on-surface">{boardingLabel}</div>
                    <span className="text-xs text-primary font-medium">
                      {departureAt ? departureAt.toLocaleString() : "—"}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant block mb-1">Dropping Point</label>
                    <div className="text-lg font-bold text-on-surface">{droppingLabel}</div>
                    <span className="text-xs text-secondary font-medium">
                      {arrivalAt ? arrivalAt.toLocaleString() : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-3xl p-8 shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-50"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline text-xl font-bold">Fare Summary</h3>
                    <p className="text-primary-fixed text-sm">
                      Selected Seats: {selectedSeats.length ? selectedSeats.join(", ") : "-"}
                    </p>
                  </div>
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Base Fare</span>
                    <span>{formatPrice(baseFare, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Service Fee</span>
                    <span>{formatPrice(serviceFee, currency)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-white/20">
                    <span>Total Fare</span>
                    <span className="text-2xl">{formatPrice(totalFare, currency)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={loading}
                  className="w-full py-5 bg-secondary-container text-on-secondary-container font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Proceed to Pay"}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-bright/60 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10 flex items-center justify-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary-container relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              </span>
              <span className="text-xs font-bold text-primary tracking-wide uppercase">
                {availableItems.length} seats available
              </span>
            </div>
          </div>
        </aside>
      </main>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6B8misLQJDxR3ixB5FgommLfxMXxauswKwXXECn4ptsKjftZ7iYgUVGXzDrtDw9e7G2Rsi2cQNsutv7OZzZ-FZDgD5j2HNXv8EpIi3kD7iewhKcPRZjU22-nYNPtSs_4gjUUbxqMlp0Kc6nKI7KgmeDXbeZEySJCxyLFOsedlyZO4P73RVua5UOVaXbCjfkTgTrBXoiIIlUGG6lDUdErMffr2i4N504WX71IYla8cexR-AfGfferZllsCec5Ze3HPYxTm9zKv9w"
              alt="Abstract aerial top-down view of a modern highway curving through a forest"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="text-sm font-bold text-on-surface">Route Experience: Scenic Coastal Corridor</span>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">The JatraXpress Standard</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-surface-container-low transition-all hover:bg-surface-container-high group">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <h4 className="font-bold">Safe Passage</h4>
                  <p className="text-sm text-on-surface-variant">Real-time GPS tracking and 24/7 security monitoring for peace of mind.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl bg-surface-container-low transition-all hover:bg-surface-container-high group">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">coffee</span>
                </div>
                <div>
                  <h4 className="font-bold">Luxury Refreshments</h4>
                  <p className="text-sm text-on-surface-variant">Complimentary gourmet snacks and artisan coffee served at your seat.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-low w-full py-12 px-6 md:px-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
          <div>
            <div className="text-lg font-bold text-green-900 mb-4 font-headline">JatraXpress</div>
            <p className="text-slate-500 font-body text-sm tracking-wide leading-relaxed">
              Redefining mobility through the lens of premium sanctuary and kinetic efficiency. Every journey is an editorial experience.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-green-700 font-semibold mb-2">Navigation</div>
            <div className="flex flex-col gap-2">
              <a className="text-slate-500 hover:text-green-600 underline transition-all font-body text-sm tracking-wide" href="/about">
                About Us
              </a>
              <a className="text-slate-500 hover:text-green-600 underline transition-all font-body text-sm tracking-wide" href="/terms">
                Terms
              </a>
              <a className="text-slate-500 hover:text-green-600 underline transition-all font-body text-sm tracking-wide" href="/privacy">
                Privacy
              </a>
              <a className="text-slate-500 hover:text-green-600 underline transition-all font-body text-sm tracking-wide" href="/contact">
                Contact
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="text-slate-500 font-body text-sm tracking-wide">
              Subscribe to our editorial journal for curated travel guides.
            </div>
            <div className="mt-8 text-slate-500 font-body text-sm tracking-wide">© 2024 JatraXpress. Premium Mobility.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
