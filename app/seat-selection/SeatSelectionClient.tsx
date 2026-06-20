"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const seatMapRef = useRef<HTMLDivElement>(null);
  const passengerFormRef = useRef<HTMLElement>(null);
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
      if (selectedSeats.length === 0) {
        seatMapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        passengerFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8 space-y-8">

          {/* Page header */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Seat Selection</p>
            <h1 className="text-3xl font-headline font-bold text-on-surface">Choose Your Seat</h1>
            {scheduleDetail?.sourceName && scheduleDetail?.destinationName && (
              <p className="text-on-surface-variant mt-1 text-sm">
                {scheduleDetail.sourceName} → {scheduleDetail.destinationName}
              </p>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 bg-error/8 border border-error/20 text-error rounded-xl px-4 py-3 text-sm font-semibold animate-fade-in">
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">error</span>
              {error}
            </div>
          )}

          {/* Seat map */}
          <div ref={seatMapRef} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden card-shadow">
            {/* Map header */}
            <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">airline_seat_recline_extra</span>
                <span className="font-bold text-on-surface text-sm">Seat Map</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {availableItems.length} available
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-8 items-start">
              {/* Grid */}
              <div className="flex-1">
                {sortedItems.length === 0 ? (
                  <div className="text-sm text-on-surface-variant py-8 text-center">No inventory found for this schedule.</div>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5 max-w-xs">
                    {sortedItems.map((seat) => {
                      const isBooked = seat.status === STATUS_BOOKED;
                      const isLocked = seat.status === STATUS_LOCKED;
                      const isSelected = selectedSeats.includes(seat.itemNumber);
                      const isDisabled = isBooked || isLocked;
                      return (
                        <button
                          key={seat.scheduleInventoryId}
                          type="button"
                          onClick={() => !isDisabled && toggleSeat(seat.itemNumber)}
                          title={isBooked ? "Booked" : isLocked ? "Temporarily locked" : isSelected ? "Selected — click to deselect" : "Available"}
                          className={`w-12 h-12 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center border-2 ${
                            isBooked
                              ? "border-outline-variant/30 bg-surface-container-high text-on-surface-variant/30 cursor-not-allowed opacity-50"
                              : isLocked
                              ? "border-amber-200 bg-amber-50 text-amber-400 cursor-not-allowed"
                              : isSelected
                              ? "border-primary bg-primary text-white shadow-md shadow-primary/30 scale-105"
                              : "border-primary/30 bg-primary/8 text-primary hover:bg-primary hover:text-white hover:border-primary hover:scale-105 active:scale-95"
                          }`}
                        >
                          {seat.itemNumber}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Legend + amenities */}
              <div className="flex-shrink-0 space-y-6">
                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Legend</p>
                  {[
                    { label: "Available", cls: "border-primary/30 bg-primary/8" },
                    { label: "Selected", cls: "border-primary bg-primary" },
                    { label: "Locked", cls: "border-amber-200 bg-amber-50" },
                    { label: "Booked", cls: "border-outline-variant/30 bg-surface-container-high opacity-50" }
                  ].map(({ label, cls }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 ${cls}`} />
                      <span className="text-xs text-on-surface-variant font-medium">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-outline-variant/15 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Amenities</p>
                  {[
                    { icon: "wifi", label: "Free WiFi" },
                    { icon: "ac_unit", label: "Air Conditioned" },
                    { icon: "usb", label: "USB Charging" }
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">{icon}</span>
                      <span className="text-xs text-on-surface-variant">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selection summary bar */}
            {selectedSeats.length > 0 && (
              <div className="px-6 py-3 border-t border-outline-variant/20 bg-primary/4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                <span className="text-sm font-semibold text-primary">
                  {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected: {selectedSeats.join(", ")}
                </span>
                <span className="ml-auto text-xs text-on-surface-variant">Up to 4 seats</span>
              </div>
            )}
          </div>

          {/* Passenger details */}
          <section ref={passengerFormRef} className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface">Passenger Details</h2>
                <p className="text-sm text-on-surface-variant mt-0.5">Enter details for each selected seat</p>
              </div>
              {selectedSeats.length > 0 && (
                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {selectedSeats.length} passenger{selectedSeats.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {selectedSeats.length === 0 ? (
              <div className="bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-3 block">airline_seat_recline_normal</span>
                <p className="font-semibold text-on-surface-variant">No seats selected yet</p>
                <p className="text-sm text-on-surface-variant/70 mt-1">Click a green seat above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedSeats.map((seatNumber, index) => {
                  const passenger = passengers[seatNumber];
                  return (
                    <div
                      key={seatNumber}
                      className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden card-shadow"
                    >
                      <div className="flex items-center gap-3 px-5 py-3.5 bg-primary/4 border-b border-outline-variant/15">
                        <div className="w-7 h-7 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">Passenger {index + 1}</p>
                          <p className="text-xs text-on-surface-variant">Seat {seatNumber}</p>
                        </div>
                        <span className="ml-auto px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                          Seat {seatNumber}
                        </span>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Full Name <span className="text-error">*</span>
                          </label>
                          <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-3 border-2 border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
                            <span className="material-symbols-outlined text-outline text-[18px] mr-2.5">person</span>
                            <input
                              className="bg-transparent border-none focus:ring-0 w-full text-on-surface text-sm font-medium placeholder:text-outline/40"
                              placeholder={`Passenger ${index + 1} name`}
                              type="text"
                              value={passenger?.fullName ?? ""}
                              onChange={(e) => updatePassenger(seatNumber, { fullName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Phone
                          </label>
                          <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-3 border-2 border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
                            <span className="material-symbols-outlined text-outline text-[18px] mr-2.5">phone</span>
                            <input
                              className="bg-transparent border-none focus:ring-0 w-full text-on-surface text-sm font-medium placeholder:text-outline/40"
                              placeholder="Optional"
                              type="tel"
                              value={passenger?.phone ?? ""}
                              onChange={(e) => updatePassenger(seatNumber, { phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Email
                          </label>
                          <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-3 border-2 border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
                            <span className="material-symbols-outlined text-outline text-[18px] mr-2.5">mail</span>
                            <input
                              className="bg-transparent border-none focus:ring-0 w-full text-on-surface text-sm font-medium placeholder:text-outline/40"
                              placeholder="Optional"
                              type="email"
                              value={passenger?.email ?? ""}
                              onChange={(e) => updatePassenger(seatNumber, { email: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Journey info */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 card-shadow">
              <h3 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">route</span>
                Journey Details
              </h3>
              <div className="relative pl-5">
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-gradient-to-b from-primary to-secondary rounded-full" />
                <div className="absolute -left-1 top-0 w-3 h-3 rounded-full bg-primary ring-2 ring-primary/20" />
                <div className="absolute -left-1 bottom-0 w-3 h-3 rounded-full bg-secondary ring-2 ring-secondary/20" />
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">From</p>
                  <p className="font-bold text-on-surface">{boardingLabel}</p>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {departureAt ? departureAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">To</p>
                  <p className="font-bold text-on-surface">{droppingLabel}</p>
                  <p className="text-xs text-secondary font-medium mt-0.5">
                    {arrivalAt ? arrivalAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Fare summary */}
            <div className="primary-gradient rounded-2xl p-5 text-white card-shadow overflow-hidden relative">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">receipt_long</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline font-bold text-lg">Fare Summary</h3>
                  <span className="text-xs text-white/70 font-medium">
                    {selectedSeats.length ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""}` : "No seats"}
                  </span>
                </div>
                <div className="space-y-2.5 pt-4 border-t border-white/15">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Base Fare</span>
                    <span className="font-semibold">{formatPrice(baseFare, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Service Fee</span>
                    <span className="font-semibold">{formatPrice(serviceFee, currency)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 mt-1 border-t border-white/15">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-black font-headline tracking-tight">{formatPrice(totalFare, currency)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={loading}
                  className="w-full mt-5 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-white/95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Proceed to Pay
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <div>
                <p className="text-xs font-bold text-on-surface">Secure Booking</p>
                <p className="text-[10px] text-on-surface-variant">256-bit SSL encrypted checkout</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="bg-surface-container-low border-t border-outline-variant/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-headline font-extrabold text-on-surface">
              Jatra<span className="text-primary">Xpress</span>
            </span>
            <div className="flex flex-wrap gap-5 text-sm text-on-surface-variant">
              {[["About", "/about"], ["Terms", "/terms"], ["Privacy", "/privacy"], ["Contact", "/contact"]].map(([label, href]) => (
                <a key={href} className="hover:text-primary transition-colors duration-200" href={href}>{label}</a>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant">© 2024 JatraXpress</p>
          </div>
        </div>
      </footer>
    </>
  );
}
