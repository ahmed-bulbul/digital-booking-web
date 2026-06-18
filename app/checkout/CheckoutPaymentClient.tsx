"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../lib/authClient";

type CheckoutPaymentClientProps = {
  bookingId: number;
  amount: number;
  currency: string;
  bookingStatus?: number;
  paymentReceivedNumber?: string | null;
};

export default function CheckoutPaymentClient({
  bookingId,
  amount,
  currency,
  bookingStatus,
  paymentReceivedNumber
}: CheckoutPaymentClientProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"manual" | "online">("manual");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createPayment = async (method: "manual" | "online") => {
    setLoading(true);
    setError(null);
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await fetch(`${API_BASE_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          bookingId,
          method: method === "manual" ? 1 : 3,
          transactionId: method === "manual" ? transactionId : undefined,
          gateway: method === "manual" ? "MANUAL" : "ONLINE"
        })
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error?.message ?? "Payment creation failed");
      }
      const paymentPayload = await res.json();
      const paymentId = paymentPayload?.data?.paymentId as number;
      if (method === "online") {
        const successRes = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/success`, { method: "POST" });
        if (!successRes.ok) throw new Error("Unable to confirm online payment");
      }
      router.push(`/booking-confirmation?bookingId=${bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (bookingStatus === 2) {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-emerald-700">
        <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
        <div>
          <p className="font-bold text-sm">Booking already confirmed</p>
          <p className="text-xs text-emerald-600 mt-0.5">No further payment action needed.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[18px]">account_balance_wallet</span>
        </div>
        <div>
          <h2 className="text-xl font-bold font-headline text-on-surface">Payment</h2>
          <p className="text-xs text-on-surface-variant">Select your preferred payment method</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-error/8 border border-error/20 text-error rounded-xl px-4 py-3 text-sm font-semibold">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Manual payment */}
        <div
          className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
            paymentMethod === "manual"
              ? "border-primary bg-primary/4"
              : "border-outline-variant/30 hover:border-outline-variant/60"
          }`}
          onClick={() => setPaymentMethod("manual")}
        >
          <div className="flex items-center gap-4 p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              paymentMethod === "manual" ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant"
            }`}>
              <span className="material-symbols-outlined text-[20px]">smartphone</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface text-sm">Mobile Banking</p>
              <p className="text-xs text-on-surface-variant mt-0.5">bKash, Rocket, Nagad transfer</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              paymentMethod === "manual" ? "border-primary" : "border-outline-variant"
            }`}>
              {paymentMethod === "manual" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
          </div>

          {paymentMethod === "manual" && (
            <div className="px-5 pb-5 space-y-3 animate-fade-in">
              <div className="bg-surface-container-low rounded-xl p-4 text-sm text-on-surface-variant flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-outline flex-shrink-0 mt-0.5">info</span>
                <p>
                  Send{" "}
                  <span className="font-bold text-on-surface">
                    {currency} {amount.toFixed(0)}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-on-surface">
                    {paymentReceivedNumber?.trim() || "017XXXXXXXX"}
                  </span>{" "}
                  via bKash/Rocket "Send Money", then enter your Transaction ID below.
                </p>
              </div>
              <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-3 border-2 border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
                <span className="material-symbols-outlined text-outline text-[18px] mr-2.5">receipt_long</span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-on-surface text-sm font-medium placeholder:text-outline/40"
                  placeholder="Transaction ID (e.g. 8N9ABC123)"
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant/70 italic">
                Booking confirmed after admin verification — usually within 15–30 minutes.
              </p>
            </div>
          )}
        </div>

        {/* Online payment */}
        <div
          className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
            paymentMethod === "online"
              ? "border-primary bg-primary/4"
              : "border-outline-variant/30 hover:border-outline-variant/60"
          }`}
          onClick={() => setPaymentMethod("online")}
        >
          <div className="flex items-center gap-4 p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              paymentMethod === "online" ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant"
            }`}>
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-on-surface text-sm">Online Payment</p>
                <span className="flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[10px]">bolt</span>
                  Instant
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">Cards, Net Banking & Instant Transfer</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              paymentMethod === "online" ? "border-primary" : "border-outline-variant"
            }`}>
              {paymentMethod === "online" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
          </div>

          {paymentMethod === "online" && (
            <div className="px-5 pb-5 animate-fade-in">
              <div className="bg-surface-container-low rounded-xl p-4 text-sm text-on-surface-variant flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                <p>Your ticket will be issued instantly after payment confirmation.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => createPayment(paymentMethod)}
          disabled={loading || (paymentMethod === "manual" && !transactionId.trim())}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 primary-gradient text-white px-10 py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Complete Booking
            </>
          )}
        </button>
        <p className="text-xs text-on-surface-variant/70 mt-3">
          By completing, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
        </p>
      </div>
    </section>
  );
}
