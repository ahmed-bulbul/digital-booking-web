"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "../components/I18nProvider";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzdhhqYgaKLlv-Fh0ev0-2ZkOSdyZPNQxdOL70NCbH33x0a2VFlDFu0a6CQs_J7yLOjBnQNQQWC0vVWqGGIr674rvCDFv5tpcTt_ZK96grxfmz47MNeDcJLnd_qPPsyDGq3GYQvLU0jgc_Rk_2FUgSLyZrCGFz0tGM6y6WSIEEAwUCanTMuQbWs91AOk8cJ5MwprUsjVGNa8veoVQI4f8W5ygoyMoCc2Ap7DU-hmMOlC1Wz5yFox9i5jHkcMXF20cCJP9NF_q1HQ";

export default function OffersClient() {
  const { t } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => null);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const offers = [
    {
      title: t("offers.card1Title"),
      desc: t("offers.card1Desc"),
      code: "FIRSTTRIP",
      discount: "20% OFF",
      tag: "New User",
      tagColor: "bg-primary/10 text-primary",
      icon: "celebration"
    },
    {
      title: t("offers.card2Title"),
      desc: t("offers.card2Desc"),
      code: "BKASH200",
      discount: "৳200 OFF",
      tag: "bKash",
      tagColor: "bg-pink-50 text-pink-600",
      icon: "smartphone"
    },
    {
      title: t("offers.card3Title"),
      desc: t("offers.card3Desc"),
      code: "WEEKEND15",
      discount: "15% OFF",
      tag: "Weekend",
      tagColor: "bg-amber-50 text-amber-600",
      icon: "weekend"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl min-h-[320px] flex items-center card-shadow">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="Offer banner" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 px-8 md:px-14 py-12 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/90 text-white rounded-full mb-5 text-xs font-bold tracking-wider uppercase">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            {t("offers.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white leading-tight mb-3">
            {t("offers.title")}
          </h1>
          <p className="text-white/75 mb-6 text-base leading-relaxed">{t("offers.subtitle")}</p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 primary-gradient text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-95 active:scale-95 transition-all">
              {t("offers.claim")}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
              {t("offers.viewTerms")}
            </button>
          </div>
        </div>
      </section>

      {/* Offer cards */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Available Now</p>
            <h2 className="font-headline text-2xl font-bold text-on-surface">Exclusive Promo Codes</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden card-shadow hover:border-primary/30 hover:card-shadow-hover transition-all duration-200 group"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {offer.icon}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${offer.tagColor}`}>
                    {offer.tag}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black font-headline text-primary">{offer.discount}</p>
                  <h3 className="font-headline font-bold text-base text-on-surface mt-0.5">{offer.title}</h3>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{offer.desc}</p>
                </div>
              </div>

              {/* Code row */}
              <div className="mx-4 mb-4 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Promo Code</p>
                  <p className="font-black text-primary font-mono tracking-widest text-sm mt-0.5">{offer.code}</p>
                </div>
                <button
                  onClick={() => copyCode(offer.code)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150 ${
                    copied === offer.code
                      ? "bg-primary text-white"
                      : "text-primary hover:bg-primary/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied === offer.code ? "check" : "content_copy"}
                  </span>
                  {copied === offer.code ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info banner */}
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-11 h-11 rounded-xl primary-gradient flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white text-[20px]">info</span>
        </div>
        <div>
          <p className="font-bold text-on-surface text-sm">Terms & Conditions Apply</p>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Promo codes are valid for a limited time and cannot be combined with other offers. Maximum one use per account.
          </p>
        </div>
      </section>
    </main>
  );
}
