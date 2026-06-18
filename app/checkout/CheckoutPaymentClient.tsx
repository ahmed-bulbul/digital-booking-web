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
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createPayment = async (method: "manual" | "online") => {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const idempotencyKey = crypto.randomUUID();
      const payload = {
        bookingId,
        method: method === "manual" ? 1 : 3,
        transactionId: method === "manual" ? transactionId : undefined,
        gateway: method === "manual" ? "MANUAL" : "ONLINE"
      };
      const res = await fetch(`${API_BASE_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const payloadError = await res.json().catch(() => null);
        throw new Error(payloadError?.error?.message ?? "Payment creation failed");
      }
      const paymentPayload = await res.json();
      const paymentId = paymentPayload?.data?.paymentId as number;
      if (method === "online") {
        const successRes = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/success`, {
          method: "POST"
        });
        if (!successRes.ok) {
          throw new Error("Unable to confirm online payment");
        }
        router.push(`/booking-confirmation?bookingId=${bookingId}`);
      } else {
        router.push(`/booking-confirmation?bookingId=${bookingId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
        <h2 className="text-2xl font-bold font-headline tracking-tight text-on-surface">Payment Selection</h2>
      </div>

      {bookingStatus === 2 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 text-sm text-on-surface-variant">
          Booking is already confirmed.
        </div>
      ) : (
        <div className="space-y-6">
          {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}
          {status ? <p className="text-sm text-primary font-semibold">{status}</p> : null}

          <div
            className={`bg-surface-container-lowest p-8 rounded-xl shadow-sm border transition-all duration-300 ${
              paymentMethod === "manual" ? "border-primary/40" : "border-outline-variant/10"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">smartphone</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Manual Payment (bKash/Rocket)</h3>
                  <p className="text-sm text-on-surface-variant">Traditional mobile wallet transfer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentMethod("manual")}
                className="flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full"
              >
                <div className={`w-2 h-2 rounded-full ${paymentMethod === "manual" ? "bg-secondary" : "bg-outline"}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Awaiting Verification</span>
              </button>
            </div>
            <div className="bg-surface-container-low/50 p-6 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-outline text-lg">info</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Send money to{" "}
                  <span className="font-bold text-on-surface">
                    {paymentReceivedNumber?.trim() ? paymentReceivedNumber : "017XXXXXXXX"}
                  </span>{" "}
                  using the "Send Money" or "Payment" option. Once the transaction is successful, enter your Transaction
                  ID below.
                </p>
              </div>
              <div className="relative max-w-md">
                <input
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 px-5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  placeholder="Enter Transaction ID"
                  type="text"
                  value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">receipt_long</span>
              </div>
              <p className="text-[11px] text-outline italic">
                Your booking will be confirmed after admin verification (usually 15-30 mins).
              </p>
            </div>
          </div>

          <div
            className={`bg-surface-container-lowest p-8 rounded-xl shadow-sm border transition-all duration-300 ${
              paymentMethod === "online" ? "border-primary/40" : "border-outline-variant/10"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">credit_card</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Online Payment Gateway</h3>
                  <p className="text-sm text-on-surface-variant">Cards, Net Banking & Instant Transfer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full"
              >
                <span className="material-symbols-outlined text-primary text-xs">bolt</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Pay Now & Get Instant Ticket</span>
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => createPayment(paymentMethod)}
              disabled={loading || (paymentMethod === "manual" && !transactionId)}
              className="w-full md:w-auto px-12 py-5 primary-gradient text-white rounded-xl font-headline font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? "Processing..." : "Complete Booking"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="text-xs text-center md:text-left text-outline mt-4">
              By clicking complete booking, you agree to our Terms and Conditions.
            </p>
            <p className="text-xs text-on-surface-variant mt-2">
              Amount due: {currency} {amount.toFixed(0)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
