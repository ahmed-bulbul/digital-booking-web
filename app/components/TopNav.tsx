"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuth, getStoredToken } from "../lib/authClient";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useI18n } from "./I18nProvider";

const navItems = [
  { key: "search", labelKey: "nav.search", href: "/search" },
  { key: "bookings", labelKey: "nav.bookings", href: "/bookings" },
  { key: "offers", labelKey: "nav.offers", href: "/offers" },
  { key: "help", labelKey: "nav.help", href: "/help" }
] as const;

type NavKey = (typeof navItems)[number]["key"] | undefined;

type TopNavProps = {
  active?: NavKey;
};

export default function TopNav({ active }: TopNavProps) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setIsAuthed(Boolean(getStoredToken()));
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsAuthed(false);
    window.location.href = "/login";
  };

  return (
    <header className="bg-surface/80 backdrop-blur-xl top-0 sticky z-50">
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 w-full max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-2xl font-bold text-green-900 italic font-headline tracking-tight"
        >
          JatraXpress
        </Link>
        <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
          {navItems.map((item) => {
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={
                  isActive
                    ? "text-green-700 border-b-2 border-green-700 pb-1"
                    : "text-slate-600 hover:text-green-800 transition-colors duration-300"
                }
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <button className="material-symbols-outlined text-slate-700" aria-label="Account">
            account_circle
          </button>
          <button
            type="button"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/40 text-on-surface"
            aria-label="Toggle navigation"
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
          </button>
          {isAuthed ? (
            <button
              className="hidden md:inline-flex border border-outline-variant/40 text-on-surface px-4 py-2 rounded-xl font-semibold hover:bg-surface-container-low transition-all"
              onClick={handleLogout}
            >
              {t("auth.logout")}
            </button>
          ) : (
            <>
              <Link
                className="hidden md:inline-flex border border-outline-variant/40 text-on-surface px-4 py-2 rounded-xl font-semibold hover:bg-surface-container-low transition-all"
                href="/register"
              >
                {t("auth.register")}
              </Link>
              <Link
                className="hidden md:inline-flex bg-primary-container text-on-primary-container px-6 py-2 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all"
                href="/login"
              >
                {t("auth.login")}
              </Link>
            </>
          )}
        </div>
      </nav>

      <div
        id="mobile-nav"
        className={`md:hidden border-t border-outline-variant/20 bg-surface ${mobileOpen ? "block" : "hidden"}`}
      >
        <div className="px-6 py-4 space-y-4">
          <div className="flex flex-col gap-3 font-headline font-bold tracking-tight">
            {navItems.map((item) => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={
                    isActive
                      ? "text-green-700 border-l-4 border-green-700 pl-3"
                      : "text-slate-600 hover:text-green-800 transition-colors duration-300 pl-3"
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>

          {isAuthed ? (
            <button
              className="w-full border border-outline-variant/40 text-on-surface px-4 py-3 rounded-xl font-semibold hover:bg-surface-container-low transition-all"
              onClick={handleLogout}
            >
              {t("auth.logout")}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                className="border border-outline-variant/40 text-on-surface px-4 py-3 rounded-xl font-semibold text-center hover:bg-surface-container-low transition-all"
                href="/register"
                onClick={() => setMobileOpen(false)}
              >
                {t("auth.register")}
              </Link>
              <Link
                className="bg-primary-container text-on-primary-container px-4 py-3 rounded-xl font-semibold text-center hover:opacity-90 active:scale-95 transition-all"
                href="/login"
                onClick={() => setMobileOpen(false)}
              >
                {t("auth.login")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
