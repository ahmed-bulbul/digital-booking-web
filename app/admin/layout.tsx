"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RequireAuth from "../components/RequireAuth";
import ThemeToggle from "../components/ThemeToggle";
import { clearAuth } from "../lib/authClient";
import { useI18n } from "../components/I18nProvider";

const navItems = [
  { labelKey: "ui.adminDashboard", href: "/admin", icon: "dashboard" },
  { labelKey: "ui.adminProviders", href: "/admin/providers", icon: "directions_bus" },
  { labelKey: "ui.adminProducts", href: "/admin/products", icon: "inventory" },
  { labelKey: "ui.adminInventoryClasses", href: "/admin/inventory-classes", icon: "widgets" },
  { labelKey: "ui.adminInventory", href: "/admin/inventory", icon: "inventory_2" },
  { labelKey: "ui.adminPricingRules", href: "/admin/pricing", icon: "payments" },
  { labelKey: "ui.adminTripScheduling", href: "/admin/schedules", icon: "event_upcoming" },
  { labelKey: "ui.adminBookingManagement", href: "/admin/bookings", icon: "confirmation_number" },
  { labelKey: "ui.adminPaymentVerification", href: "/admin/payments", icon: "credit_card" },
  { labelKey: "ui.adminRefunds", href: "/admin/refunds", icon: "receipt_long" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <RequireAuth requiredRole="ADMIN">
      <div className="min-h-screen bg-surface text-on-surface">
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        <aside
          className={`h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col border-r border-transparent z-50 transition-transform md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:transition-none`}
        >
          <div className="p-6">

            <Link href="/"  className="text-2xl font-bold text-green-900 italic font-headline tracking-tight" >
                JatraXpress
            </Link>


            <div className="mt-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-green-900 font-semibold">
                A
              </div>
              <div>
                <p className="font-headline text-sm font-bold text-green-900">Admin Console</p>
                <p className="text-[10px] uppercase tracking-wider text-outline">Fleet Operations</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 mt-4 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "flex items-center gap-3 bg-green-50 text-green-800 rounded-r-full py-3 px-6 transition-all"
                      : "flex items-center gap-3 text-slate-500 py-3 px-6 hover:bg-slate-100 hover:text-green-700 transition-all"
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-medium">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 mt-auto space-y-4">
            <button
              className="md:hidden w-full border border-outline-variant/40 text-on-surface px-4 py-2 rounded-xl font-semibold hover:bg-surface-container-low transition-all"
              onClick={handleLogout}
            >
              Logout
            </button>
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{t("ui.systemHealth")}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <p className="text-xs font-medium text-on-surface-variant">{t("ui.allSystemsNominal")}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="md:pl-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-6 py-3 w-full border-b border-slate-100">
            <div className="flex items-center gap-3 flex-1 w-full">
              <button
                type="button"
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/40 text-on-surface"
                aria-label="Open navigation"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="relative w-full md:max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                  search
                </span>
                <input
                  className="w-full bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline/60"
                  placeholder="Search routes, buses, or bookings..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
              <ThemeToggle />
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors active:scale-95">
                <span className="material-symbols-outlined text-slate-600">notifications</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors active:scale-95">
                <span className="material-symbols-outlined text-slate-600">account_circle</span>
              </button>
              <button
                className="hidden md:inline-flex border border-outline-variant/40 text-on-surface px-4 py-2 rounded-xl font-semibold hover:bg-surface-container-low transition-all"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </header>

          <main className="p-6 md:p-8 w-full max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
