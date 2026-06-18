"use client";

import { useEffect } from "react";
import { I18nProvider } from "./I18nProvider";
import { Toaster } from "react-hot-toast";
import TopBarLoader from "./TopBarLoader";
import { beginLoading, endLoading } from "../lib/loadingBar";
import { API_BASE_URL } from "../lib/authClient";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as Window & { __fetchPatched?: boolean }).__fetchPatched) return;

    const originalFetch = window.fetch.bind(window);
    const shouldTrack = (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      return url.includes("/api/") || url.startsWith(API_BASE_URL);
    };

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const track = shouldTrack(input);
      if (track) beginLoading();
      try {
        return await originalFetch(input, init);
      } finally {
        if (track) endLoading();
      }
    };

    (window as Window & { __fetchPatched?: boolean }).__fetchPatched = true;
  }, []);

  return (
    <>
      <I18nProvider>{children}</I18nProvider>
      <TopBarLoader />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--color-surface-container-lowest)",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-outline-variant)",
            boxShadow: "0 12px 30px -20px rgba(0, 0, 0, 0.35)"
          },
          error: {
            iconTheme: {
              primary: "var(--color-error)",
              secondary: "var(--color-on-error)"
            },
            style: {
              border: "1px solid var(--color-error)",
              background: "var(--color-error-container)",
              color: "var(--color-on-error-container)"
            }
          }
        }}
      />
    </>
  );
}
