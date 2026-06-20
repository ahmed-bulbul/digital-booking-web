"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL, authFetch } from "../lib/authClient";

type PendingOrganization = {
  id: number;
  name: string;
  domain?: string | null;
  status: string;
  adminEmail: string;
  createdAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

function SuperAdminApprovalsPageInner() {
  const searchParams = useSearchParams();
  const [pendingOrgs, setPendingOrgs] = useState<PendingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const query = (searchParams.get("q") ?? "").toLowerCase();

  const hasItems = pendingOrgs.length > 0;

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/super-admin/organizations/pending`);
      if (!res.ok) {
        throw new Error("Failed to load pending organizations");
      }
      const payload = (await res.json()) as ApiResponse<PendingOrganization[]>;
      setPendingOrgs(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
  }, []);

  const formattedItems = useMemo(() => {
    return pendingOrgs
      .filter((org) => {
        if (!query) return true;
        return (
          org.name.toLowerCase().includes(query) ||
          (org.domain ?? "").toLowerCase().includes(query) ||
          org.adminEmail.toLowerCase().includes(query) ||
          String(org.id).includes(query)
        );
      })
      .map((org) => ({
        ...org,
        createdLabel: new Date(org.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
      }));
  }, [pendingOrgs, query]);

  const handleApprove = async (orgId: number) => {
    const adminPassword = passwords[orgId];
    if (!adminPassword || adminPassword.length < 8) {
      setError("Enter an admin password (min 8 characters) before approving.");
      return;
    }

    setSubmittingId(orgId);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/super-admin/organizations/${orgId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword })
      });
      if (!res.ok) {
        throw new Error("Approval failed");
      }
      setPendingOrgs((items) => items.filter((item) => item.id !== orgId));
      setPasswords((prev) => {
        const next = { ...prev };
        delete next[orgId];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (orgId: number) => {
    setSubmittingId(orgId);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/super-admin/organizations/${orgId}/reject`, {
        method: "POST"
      });
      if (!res.ok) {
        throw new Error("Rejection failed");
      }
      setPendingOrgs((items) => items.filter((item) => item.id !== orgId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Super Admin</p>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface mt-4">
            Organization Approvals
          </h1>
          <p className="text-on-surface-variant mt-2">
            Review pending organizations and create their admin accounts.
          </p>
        </div>
        <button
          className="px-5 py-3 rounded-xl border border-outline-variant/40 text-on-surface font-semibold hover:bg-surface-container-low"
          type="button"
          onClick={fetchPending}
        >
          Refresh
        </button>
      </div>

      {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_-24px_rgba(24,28,32,0.12)]">
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading pending organizations...</p>
        ) : hasItems ? (
          <div className="space-y-4">
            {formattedItems.map((org) => (
              <div
                key={org.id}
                className="border border-outline-variant/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{org.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {org.domain ? org.domain : "No domain"} • {org.adminEmail}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">Submitted: {org.createdLabel}</p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <input
                    className="bg-surface-container-high rounded-xl px-4 py-3 text-sm"
                    placeholder="Set admin password"
                    type="password"
                    value={passwords[org.id] ?? ""}
                    onChange={(event) =>
                      setPasswords((prev) => ({ ...prev, [org.id]: event.target.value }))
                    }
                  />
                  <div className="flex gap-3">
                    <button
                      className="primary-gradient text-white font-semibold px-5 py-2 rounded-xl disabled:opacity-60"
                      onClick={() => handleApprove(org.id)}
                      disabled={submittingId === org.id}
                    >
                      {submittingId === org.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      className="border border-outline-variant/40 text-on-surface font-semibold px-5 py-2 rounded-xl"
                      onClick={() => handleReject(org.id)}
                      disabled={submittingId === org.id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-on-surface-variant">No pending organizations.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminApprovalsPage() {
  return (
    <Suspense>
      <SuperAdminApprovalsPageInner />
    </Suspense>
  );
}
