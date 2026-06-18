"use client";

import Image from "next/image";
import { useI18n } from "../components/I18nProvider";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzdhhqYgaKLlv-Fh0ev0-2ZkOSdyZPNQxdOL70NCbH33x0a2VFlDFu0a6CQs_J7yLOjBnQNQQWC0vVWqGGIr674rvCDFv5tpcTt_ZK96grxfmz47MNeDcJLnd_qPPsyDGq3GYQvLU0jgc_Rk_2FUgSLyZrCGFz0tGM6y6WSIEEAwUCanTMuQbWs91AOk8cJ5MwprUsjVGNa8veoVQI4f8W5ygoyMoCc2Ap7DU-hmMOlC1Wz5yFox9i5jHkcMXF20cCJP9NF_q1HQ";

export default function OffersClient() {
  const { t } = useI18n();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-low min-h-[360px] flex items-center">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="Offer banner" fill className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent"></div>
        </div>
        <div className="relative z-10 px-10 md:px-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-5">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span className="text-xs font-bold tracking-widest uppercase">{t("offers.badge")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface leading-tight mb-4">
            {t("offers.title")}
          </h1>
          <p className="text-on-surface-variant mb-6">{t("offers.subtitle")}</p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
              {t("offers.claim")}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="bg-surface-container-lowest text-primary px-6 py-3 rounded-xl font-semibold border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
              {t("offers.viewTerms")}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: t("offers.card1Title"),
            desc: t("offers.card1Desc"),
            code: "FIRSTTRIP",
            tone: "bg-surface-container-low"
          },
          {
            title: t("offers.card2Title"),
            desc: t("offers.card2Desc"),
            code: "BKASH200",
            tone: "bg-secondary-fixed"
          },
          {
            title: t("offers.card3Title"),
            desc: t("offers.card3Desc"),
            code: "WEEKEND15",
            tone: "bg-surface-container-low"
          }
        ].map((offer) => (
          <div key={offer.code} className={`${offer.tone} rounded-3xl p-6 border border-outline-variant/20`}>
            <h3 className="text-xl font-headline font-bold mb-2">{offer.title}</h3>
            <p className="text-on-surface-variant mb-6">{offer.desc}</p>
            <div className="flex items-center justify-between bg-surface-container-lowest/80 border border-outline-variant/20 rounded-2xl px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-on-surface-variant">{t("offers.promo")}</p>
                <p className="text-lg font-bold text-primary">{offer.code}</p>
              </div>
              <button className="text-primary font-semibold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">content_copy</span>
                {t("offers.copy")}
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
