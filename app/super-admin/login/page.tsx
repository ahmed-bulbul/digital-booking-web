"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuperAdminLoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") ?? "/super-admin";
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <p className="text-sm text-on-surface-variant font-medium">Redirecting to login…</p>
    </div>
  );
}
