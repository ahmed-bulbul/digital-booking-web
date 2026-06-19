"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clearAuth, getStoredToken } from "../lib/authClient";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useI18n } from "./I18nProvider";

const navItems = [
  { key: "search", labelKey: "nav.search", href: "/search", icon: "search" },
  { key: "bookings", labelKey: "nav.bookings", href: "/bookings", icon: "confirmation_number" },
  { key: "offers", labelKey: "nav.offers", href: "/offers", icon: "local_offer" },
  { key: "help", labelKey: "nav.help", href: "/help", icon: "help_outline" }
] as const;

type NavKey = (typeof navItems)[number]["key"] | undefined;

type TopNavProps = {
  active?: NavKey;
};

export default function TopNav({ active }: TopNavProps) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAuthed(Boolean(getStoredToken()));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const handleLogout = () => {
    clearAuth();
    setIsAuthed(false);
    window.location.href = "/login";
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/95 backdrop-blur-xl shadow-sm border-b border-outline-variant/20"
          : "bg-surface/80 backdrop-blur-xl"
      }`}
    >
      <nav className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-3.5 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <span
              className="material-symbols-outlined text-white text-[18px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              directions_bus
            </span>
          </div>
          <span className="text-xl font-extrabold text-on-surface font-headline tracking-tight">
            Jatra<span className="text-primary">Xpress</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 font-body">
          {navItems.map((item) => {
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {t(item.labelKey)}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {isAuthed ? (
            <button
              className="hidden md:inline-flex items-center gap-2 border border-outline-variant/40 text-on-surface px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-all duration-200 active:scale-95"
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t("auth.logout")}
            </button>
          ) : (
            <>
              <Link
                className="hidden md:inline-flex items-center border border-outline-variant/40 text-on-surface px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-all duration-200"
                href="/register"
              >
                {t("auth.register")}
              </Link>
              <Link
                className="hidden md:inline-flex items-center gap-1.5 primary-gradient text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm"
                href="/login"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                {t("auth.login")}
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant/40 text-on-surface hover:bg-surface-container-high transition-all duration-200"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined text-xl">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        ref={mobileNavRef}
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-outline-variant/20 bg-surface-container-lowest px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {t(item.labelKey)}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-outline-variant/20 mt-3 space-y-2">
            <div className="flex items-center gap-2 px-4 py-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            {isAuthed ? (
              <button
                className="w-full flex items-center justify-center gap-2 border border-outline-variant/40 text-on-surface px-4 py-3 rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-all"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                {t("auth.logout")}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  className="flex items-center justify-center border border-outline-variant/40 text-on-surface px-4 py-3 rounded-xl text-sm font-semibold text-center hover:bg-surface-container-high transition-all"
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("auth.register")}
                </Link>
                <Link
                  className="flex items-center justify-center gap-1.5 primary-gradient text-white px-4 py-3 rounded-xl text-sm font-semibold text-center hover:opacity-90 active:scale-95 transition-all"
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  {t("auth.login")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
