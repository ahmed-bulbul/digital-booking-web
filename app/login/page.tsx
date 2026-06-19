"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredRole, getStoredToken, login, storeAuth } from "../lib/authClient";
import { useI18n } from "../components/I18nProvider";
import LanguageToggle from "../components/LanguageToggle";

const avatarImages = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAntAL2XoVvnvzzGlwBmoKJHhP7EhE53jC35b0oB5kFVOVuHwwsQ0TAqZC15dc5SFhFP-QOnLS8TfqzUyF_vLft9cdMO8gHTM7BDduWNnRDQeua3j0WvoptAajP0gvO9qB2MTSqco3CWPyiz-x8K9avRaf1XpJF9BV0jNx8IgyoWinQhS6fvzHDn9hGRFk2_cJDNaXTlgurd8rWRLX7B96UdOGgL86nQvLLFMUK1ixqXXB2VQrqOgO0b8VuMX2z95x3ioN92xSkcA",
    alt: "Portrait of a young professional woman smiling"
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4i8aOzJ8R09YF1nfJWo5ry2X2hfFEeIkCjH_gVpN54jgdrRhCQbQI16Injp1TAl-snM8HBbeaIX90dOAxQJApRaE3w5S834iB7qlOPc1A8B5CYHjs7hlddna962fqCcEcYqLZsv7cjseL-eBzCTJFYBKK7jPLIvcloRmYLqQY8aCS6xvWNL3oFh96fa5AJrol6TFYegjAxJ_deZ3fQPy016YH8LgNP-tkDPjaZsMJyqzLnn0stjFQcCapOfE-zDP4GSO1pKqDjA",
    alt: "Close-up portrait of a businessman with a friendly expression"
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCENN86E46xKny744o8gLj9fSh8M7u719BufHOoJtm_rd4nqB9UOLQ1WZf3Y7IumlmSIaovGQzb6dAKD3lS0m8kXaKIrZQBW0FJxYTupcDqlDrI4AISS79SIIwiTIVm5B7_UoNv4A63grap5G-UYBNGjVYsMS5UXQBFcLt-Ztr28JhoApdYL49j83hU_lX_hvFVq3_QEc2I_YZi9vuGeJl1kDxTr-IqnTq6c2jmPl1ZtKeQ32SAjtWYkARbNgTgWTUy_oyNDcmlaA",
    alt: "Headshot of a cheerful man outdoors"
  }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    const role = getStoredRole();
    if (role === "SUPER_ADMIN") {
      router.replace("/super-admin");
      return;
    }
    if (role === "ADMIN" || role === "PROVIDER") {
      router.replace("/admin");
      return;
    }
    router.replace("/");
  }, [router]);

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!emailRegex.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password.trim().length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const auth = await login({ email, password });
      const roleLabel = storeAuth(auth);
      if (remember) {
        localStorage.setItem("auth_remember", "true");
      } else {
        localStorage.removeItem("auth_remember");
      }
      const next = searchParams.get("next");
      if (next) {
        const isAdminPath = next.startsWith("/admin");
        const isSuperAdminPath = next.startsWith("/super-admin");
        const isAllowed =
          (isSuperAdminPath && roleLabel === "SUPER_ADMIN") ||
          (isAdminPath && (roleLabel === "ADMIN" || roleLabel === "PROVIDER")) ||
          (!isAdminPath && !isSuperAdminPath);
        if (isAllowed) {
          router.push(next);
          return;
        }
      }
      if (roleLabel === "SUPER_ADMIN") {
        router.push("/super-admin");
        return;
      }
      if (roleLabel === "ADMIN" || roleLabel === "PROVIDER") {
        router.push("/admin");
        return;
      }
      router.push("/");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-surface-container-lowest rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(24,28,32,0.08)] relative z-10">
        <div className="hidden md:flex flex-col justify-between p-12 bg-surface-container-low relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  route
                </span>
              </div>

              <Link href="/"  className="text-2xl font-bold text-green-900 italic font-headline tracking-tight" >
                        JatraXpress
              </Link>

            </div>
            <h1 className="font-headline text-4xl lg:text-5xl text-on-surface leading-[1.1] mb-6 font-bold">
              The journey <br />
              <span className="text-primary italic">begins</span> here.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-[320px] font-medium opacity-80">
              Experience premium mobility curated for the modern traveler.
            </p>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="flex -space-x-3 mb-4">
              {avatarImages.map((avatar) => (
                <div
                  key={avatar.src}
                  className="w-10 h-10 rounded-full border-2 border-surface-container-lowest overflow-hidden"
                >
                  <Image
                    src={avatar.src}
                    alt={avatar.alt}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Trusted by 20k+ travelers
            </p>
          </div>

          <div className="absolute right-[-15%] bottom-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="flex md:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center text-white">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                route
              </span>
            </div>
            <span className="font-headline font-extrabold text-lg tracking-tighter text-primary">
              JatraXpress
            </span>
          </div>

          <div className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">{t("auth.welcome")}</h2>
            <p className="text-on-surface-variant font-medium">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          <div className="bg-surface-container rounded-2xl px-4 py-3 mb-8 flex items-center gap-3 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">verified_user</span>
            {t("auth.loginNote")}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                {t("auth.email")}
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary">
                  alternate_email
                </span>
              </div>
              {fieldErrors.email ? (
                <p className="text-xs text-error font-medium">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {t("auth.password")}
                </label>
                <Link
                  className="text-xs font-bold text-primary hover:text-primary-container transition-colors"
                  href="#"
                >
                  {t("auth.forgot")}
                </Link>
              </div>
              <div className="relative group">
                <input
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary">
                  lock
                </span>
              </div>
              {fieldErrors.password ? (
                <p className="text-xs text-error font-medium">{fieldErrors.password}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <label
                className="text-sm font-medium text-on-surface-variant cursor-pointer"
                htmlFor="remember"
              >
                {t("auth.remember")}
              </label>
            </div>

            {formError ? <p className="text-sm text-error font-semibold">{formError}</p> : null}

            <button
              className="w-full primary-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : t("auth.loginButton")}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
            <span className="text-xs font-bold text-outline uppercase tracking-widest">
              Or continue with
            </span>
            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors group"
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span className="text-sm font-semibold text-on-surface">Google</span>
            </button>
            <button
              className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors group"
              type="button"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
              <span className="text-sm font-semibold text-on-surface">Facebook</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-on-surface-variant">
              Don&apos;t have an account?
              <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1" href="/register">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-glass rounded-full border border-outline-variant/20 shadow-xl">
        <span className="flex h-2 w-2 rounded-full bg-primary-fixed-dim relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed-dim opacity-75"></span>
        </span>
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Secure connection established
        </span>
      </div>
    </main>
  );
}
