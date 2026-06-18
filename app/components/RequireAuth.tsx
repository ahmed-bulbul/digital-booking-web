"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getStoredRole, getStoredToken, type RoleLabel } from "../lib/authClient";

type RequireAuthProps = {
  children: React.ReactNode;
  requiredRole?: RoleLabel;
  redirectTo?: string;
};

export default function RequireAuth({ children, requiredRole, redirectTo }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  const fallbackRedirect = useMemo(() => {
    if (redirectTo) return redirectTo;
    if (requiredRole === "ADMIN" || requiredRole === "SUPER_ADMIN") return "/login";
    return "/login";
  }, [redirectTo, requiredRole]);

  useEffect(() => {
    const token = getStoredToken();
    const role = getStoredRole();

    if (!token) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`${fallbackRedirect}${next}`);
      return;
    }

    if (requiredRole && role !== requiredRole) {
      router.replace(fallbackRedirect);
      return;
    }

    setAllowed(true);
  }, [fallbackRedirect, pathname, requiredRole, router]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-sm text-on-surface-variant font-medium">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
