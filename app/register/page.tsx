"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { registerOrganization, registerPassenger, storeAuth } from "../lib/authClient";
import { useI18n } from "../components/I18nProvider";
import LanguageToggle from "../components/LanguageToggle";

type RegistrationRole = "PASSENGER" | "ORGANIZATION";

type FieldErrors = Record<string, string>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s]*$/;
const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<RegistrationRole>("PASSENGER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [organizationName, setOrganizationName] = useState("");
  const [organizationDomain, setOrganizationDomain] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isOrganizationFlow = role === "ORGANIZATION";
  const totalSteps = isOrganizationFlow ? 2 : 1;

  const stepTitle = useMemo(() => {
    if (!isOrganizationFlow) return t("auth.createAccount");
    return step === 1 ? t("auth.createAccount") : t("auth.orgDetails");
  }, [isOrganizationFlow, step]);

  const validateStepOne = () => {
    const nextErrors: FieldErrors = {};
    if (fullName.trim().length < 2) {
      nextErrors.fullName = "Name must be at least 2 characters.";
    }
    if (!emailRegex.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (phone && !phoneRegex.test(phone)) {
      nextErrors.phone = "Phone can only contain numbers, spaces, +, or -.";
    }
    if (!isOrganizationFlow) {
      if (password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }
      if (password !== confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }
    if (!agree) {
      nextErrors.agree = "You must accept the terms to continue.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepTwo = () => {
    const nextErrors: FieldErrors = {};
    if (organizationName.trim().length < 2) {
      nextErrors.organizationName = "Organization name is required.";
    }
    if (organizationDomain && !domainRegex.test(organizationDomain)) {
      nextErrors.organizationDomain = "Enter a valid domain (e.g., example.com).";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    setFormError(null);
    setFormSuccess(null);
    if (validateStepOne()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setFormError(null);
    setFormSuccess(null);
    setStep(1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!validateStepOne()) {
      return;
    }

    if (isOrganizationFlow && step === 1) {
      setStep(2);
      return;
    }

    if (isOrganizationFlow && !validateStepTwo()) {
      return;
    }

    try {
        setIsSubmitting(true);
        if (isOrganizationFlow) {
          await registerOrganization({
          contactName: fullName,
          adminEmail: email,
          adminPhone: phone || undefined,
          organizationName,
          organizationDomain: organizationDomain || undefined
        });
        setFormSuccess(t("auth.orgSubmitSuccess"));
        return;
      }

      const auth = await registerPassenger({
        name: fullName,
        email,
        phone: phone || undefined,
        password
      });

      const roleLabel = storeAuth(auth);
      const next = searchParams.get("next");
      if (next) {
        router.push(next);
        return;
      }
      if (roleLabel === "ADMIN" || roleLabel === "PROVIDER") {
        router.push("/admin");
        return;
      }
      router.push("/");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="w-full top-0 left-0 sticky z-50 bg-[#f7f9ff] flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
                  <span className="text-xl font-bold text-[#079D49] tracking-tighter font-headline">
                    JatraXpress
                  </span>
              </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full hover:bg-[#dfe3e8] transition-colors active:scale-95 duration-200"
            type="button"
            aria-label="Help"
          >
            <span className="material-symbols-outlined text-slate-500">help_outline</span>
          </button>
          <LanguageToggle />
        </div>
      </header>

      <main className="relative flex flex-col md:flex-row min-h-[calc(100vh-72px)] overflow-hidden">
        <section className="hidden md:flex flex-1 relative flex-col justify-end p-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJilncNd0i22YdUYaJhneOCVdC33rCE9LgsG5emADqG4FBI4cD437IhAEyutriUzMMLi4Anxpor5GtZl5HAYAlLAGyVDWeXvB9JeCmsAWk_Xz60_UaJ6zffdp2N_QFBqMuAJ8GOIloZS2wV-ev82ShXaJifO72VnL7qMBe7LKG3qjbK4pXRBUkxjnTvz2OlGwKJitPSogjQYbNJl9SlnLBIuax_TQ0ndiyNm-KpfXlsfBW_0K6VHE1-eDsbs1UoyOB56XR3XwyAQ"
              alt="Luxury coach bus interior with panoramic windows"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-lowest/20 backdrop-blur-md border border-white/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse mr-2"></span>
              <span className="text-white text-[10px] font-medium uppercase tracking-widest font-label">
                The Emerald Route Experience
              </span>
            </div>
            <h1 className="text-white font-headline font-bold text-5xl leading-tight mb-4 tracking-tight">
              Your peaceful journey begins here.
            </h1>
            <p className="text-primary-fixed text-lg font-medium opacity-90 max-w-sm">
              Join the sanctuary of high-end mobility and rediscover the joy of travel.
            </p>
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-surface">
          <div className="w-full max-w-md">
            <header className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Step {step} of {totalSteps}
              </p>
              <h2 className="font-headline font-extrabold text-3xl text-on-background tracking-tight mb-2">
                {stepTitle}
              </h2>
              <p className="text-on-surface-variant font-medium">
                {isOrganizationFlow && step === 2
                  ? "Tell us about your organization to set up admin access."
                  : "Join our community of premium travelers."}
              </p>
            </header>

            <div className="grid grid-cols-2 p-1.5 bg-surface-container rounded-2xl mb-8">
              <button
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                  role === "PASSENGER"
                    ? "bg-surface-container-lowest shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                type="button"
                onClick={() => {
                  setRole("PASSENGER");
                  setStep(1);
                }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  person
                </span>
                <span className="text-sm">Passenger</span>
              </button>
              <button
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                  role === "ORGANIZATION"
                    ? "bg-surface-container-lowest shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                type="button"
                onClick={() => {
                  setRole("ORGANIZATION");
                  setStep(1);
                }}
              >
                <span className="material-symbols-outlined text-xl">corporate_fare</span>
                <span className="text-sm">Organization</span>
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1 font-label">
                      {t("auth.fullName")}
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                        placeholder="Johnathan Doe"
                        type="text"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </div>
                    {fieldErrors.fullName ? (
                      <p className="text-xs text-error font-medium">{fieldErrors.fullName}</p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1 font-label">
                        {t("auth.email")}
                      </label>
                      <input
                        className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                        placeholder="john@sanctuary.com"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                      {fieldErrors.email ? (
                        <p className="text-xs text-error font-medium">{fieldErrors.email}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1 font-label">
                        {t("auth.phone")}
                      </label>
                      <input
                        className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                      />
                      {fieldErrors.phone ? (
                        <p className="text-xs text-error font-medium">{fieldErrors.phone}</p>
                      ) : null}
                    </div>
                  </div>

                  {!isOrganizationFlow ? (
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1 font-label">
                          {t("auth.password")}
                        </label>
                        <div className="relative">
                          <input
                            className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                            placeholder="********"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                          />
                          <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                            type="button"
                            aria-label="Toggle password visibility"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        </div>
                        {fieldErrors.password ? (
                          <p className="text-xs text-error font-medium">{fieldErrors.password}</p>
                        ) : null}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1 font-label">
                          {t("auth.confirmPassword")}
                        </label>
                        <input
                          className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                          placeholder="********"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                        {fieldErrors.confirmPassword ? (
                          <p className="text-xs text-error font-medium">{fieldErrors.confirmPassword}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-start gap-3 py-2">
                    <input
                      className="mt-1 rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                      id="terms"
                      type="checkbox"
                      checked={agree}
                      onChange={(event) => setAgree(event.target.checked)}
                    />
                    <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="terms">
                      {t("auth.agreeTerms")}{" "}
                      <Link className="text-primary font-semibold hover:underline" href="#">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link className="text-primary font-semibold hover:underline" href="#">
                        Privacy Policy
                      </Link>
                      , including the use of high-standard sanctuary protocols.
                    </label>
                  </div>
                  {fieldErrors.agree ? (
                    <p className="text-xs text-error font-medium">{fieldErrors.agree}</p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1 font-label">
                      Organization Name
                    </label>
                    <input
                      className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                      placeholder="Emerald Routes Ltd."
                      type="text"
                      value={organizationName}
                      onChange={(event) => setOrganizationName(event.target.value)}
                    />
                    {fieldErrors.organizationName ? (
                      <p className="text-xs text-error font-medium">{fieldErrors.organizationName}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1 font-label">
                      Organization Domain (Optional)
                    </label>
                    <input
                      className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                      placeholder="emeraldroutes.com"
                      type="text"
                      value={organizationDomain}
                      onChange={(event) => setOrganizationDomain(event.target.value)}
                    />
                    {fieldErrors.organizationDomain ? (
                      <p className="text-xs text-error font-medium">{fieldErrors.organizationDomain}</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
                    Organization approvals are reviewed by a super admin. Your admin account will be created after approval.
                  </div>
                </div>
              )}

              {formSuccess ? <p className="text-sm text-primary font-semibold">{formSuccess}</p> : null}
              {formError ? <p className="text-sm text-error font-semibold">{formError}</p> : null}

              <div className="flex items-center gap-3">
                {isOrganizationFlow && step === 2 ? (
                  <button
                    className="flex-1 border border-outline-variant/40 text-on-surface font-semibold py-4 rounded-xl hover:bg-surface-container-low transition-all"
                    type="button"
                    onClick={handleBack}
                  >
                    {t("auth.back")}
                  </button>
                ) : null}

                {isOrganizationFlow && step === 1 ? (
                  <button
                    className="flex-1 primary-gradient text-white font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200"
                    type="button"
                    onClick={handleNext}
                  >
                    {t("auth.next")}
                  </button>
                ) : (
                  <button
                    className="flex-1 primary-gradient text-white font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Account..." : t("auth.registerButton")}
                  </button>
                )}
              </div>

              <div className="pt-4 text-center">
                <p className="text-on-surface-variant font-medium">
                  Already part of the sanctuary?
                  <Link className="text-primary font-bold hover:underline ml-1" href="/login">
                    Login instead
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-10 pt-10 border-t border-outline-variant/10">
              <div className="flex items-center gap-4 justify-center grayscale opacity-50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  Trusted by over 50,000 travelers
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed top-1/4 -right-10 w-40 h-40 bg-primary-fixed/30 blur-[100px] pointer-events-none rounded-full"></div>
      <div className="fixed bottom-1/4 -left-10 w-60 h-60 bg-secondary-fixed/20 blur-[120px] pointer-events-none rounded-full"></div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
