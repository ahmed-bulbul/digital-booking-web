"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, authFetch } from "../lib/authClient";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type RevenueReport = {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  paymentCount: number;
};

type OccupancyReport = {
  totalCapacity: number;
  totalAvailable: number;
  totalBooked: number;
  occupancyRate: number;
};

type BookingSummary = {
  id: number;
  bookingRef: string;
  status: string;
  grandTotal: number;
  currency: string;
  createdAt: string;
};

type PagedResponse<T> = ApiResponse<T[]> & {
  meta?: { pagination?: { totalElements?: number } };
};

export default function AdminDashboardPage() {
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyReport | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [revenueRes, occupancyRes, bookingsRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/admin/reports/revenue`),
          authFetch(`${API_BASE_URL}/api/admin/reports/occupancy`),
          authFetch(`${API_BASE_URL}/api/admin/bookings?page=0&size=6`)
        ]);

        if (!revenueRes.ok || !occupancyRes.ok || !bookingsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const revenuePayload = (await revenueRes.json()) as ApiResponse<RevenueReport>;
        const occupancyPayload = (await occupancyRes.json()) as ApiResponse<OccupancyReport>;
        const bookingsPayload = (await bookingsRes.json()) as PagedResponse<BookingSummary>;

        setRevenue(revenuePayload.data);
        setOccupancy(occupancyPayload.data);
        setBookings(bookingsPayload.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            Fleet Dashboard
          </h2>
          <p className="text-on-surface-variant mt-1">
            Operational overview for <span className="text-primary font-semibold">GreenLine Transits</span>
          </p>
        </div>
      </section>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
          <p className="text-xs uppercase tracking-widest text-outline">Total Revenue</p>
          <p className="mt-4 text-3xl font-headline font-extrabold text-on-surface">
            {revenue ? `${revenue.totalRevenue.toFixed(2)}` : "--"}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">Payments: {revenue?.paymentCount ?? "--"}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
          <p className="text-xs uppercase tracking-widest text-outline">Net Revenue</p>
          <p className="mt-4 text-3xl font-headline font-extrabold text-on-surface">
            {revenue ? `${revenue.netRevenue.toFixed(2)}` : "--"}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">Refunds: {revenue?.totalRefunds ?? "--"}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
          <p className="text-xs uppercase tracking-widest text-outline">Occupancy Rate</p>
          <p className="mt-4 text-3xl font-headline font-extrabold text-on-surface">
            {occupancy ? `${(occupancy.occupancyRate * 100).toFixed(1)}%` : "--"}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            Booked: {occupancy?.totalBooked ?? "--"}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
          <p className="text-xs uppercase tracking-widest text-outline">Capacity</p>
          <p className="mt-4 text-3xl font-headline font-extrabold text-on-surface">
            {occupancy?.totalCapacity ?? "--"}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            Available: {occupancy?.totalAvailable ?? "--"}
          </p>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-xl font-bold">Recent Bookings</h3>
          <span className="text-xs text-on-surface-variant">Latest 6</span>
        </div>
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
                </tr>
              </thead>
              <tbody className="text-on-surface">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-outline-variant/30">
                    <td className="py-3 font-semibold">{booking.bookingRef}</td>
                    <td className="py-3">{booking.status}</td>
                    <td className="py-3">
                      {booking.grandTotal} {booking.currency}
                    </td>
                    <td className="py-3 text-xs text-on-surface-variant">
                      {new Date(booking.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 ? (
                  <tr>
                    <td className="py-3 text-sm text-on-surface-variant" colSpan={4}>
                      No bookings found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
