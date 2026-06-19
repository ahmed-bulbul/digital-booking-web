"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuperAdminLoginRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") ?? "/super-admin";
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [router, searchParams]);

  return null;
}

export default function SuperAdminLoginRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <p className="text-sm text-on-surface-variant font-medium">Redirecting to login…</p>
      <Suspense>
        <SuperAdminLoginRedirectInner />
      </Suspense>
    </div>
  );
}
