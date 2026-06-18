"use client";

import Image from "next/image";
import { useI18n } from "../components/I18nProvider";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBDMu829uz1H6SkAXb0NoW4KYBna0djFyFQSbsCi5Tec-Tz7dQMtsFQ0z-SK9MN5GqkHubhXVJEkhubRRajt6l9VZIwWg2dw4-2MyutBbhi_NhZO9bv5gCmkwbE4_9rbN9tCD-j69-BFezCjEGihez1Y2XAb3F7eYAARupSFXHOyu-t6G835kLkAA3FTOy3ceXtA9MbZtajXUPwwxGMEZ9Kc3jFNic-11kgXmSa09H_jKGQhwv9FQpYw11tP-pt9PdoaNjHQHzsZg";

export default function HelpClient() {
  const { t } = useI18n();

  return (
    <main className="pt-8 pb-16">
      <section className="relative px-6 pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="Help hero" fill className="object-cover opacity-10" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            {t("help.title")}
          </h1>
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-primary">
              <span className="material-symbols-outlined text-3xl">search</span>
            </div>
            <input
              className="w-full pl-16 pr-8 py-5 rounded-full border-none bg-surface-container-lowest shadow-2xl focus:ring-2 focus:ring-primary/20 text-lg transition-all duration-300"
              placeholder={t("help.searchPlaceholder")}
              type="text"
            />
          </div>
          <p className="mt-5 text-on-surface-variant font-medium">
            {t("help.popular")} <span className="underline cursor-pointer">{t("help.topicRefund")}</span>,{" "}
            <span className="underline cursor-pointer">{t("help.topicLuggage")}</span>,{" "}
            <span className="underline cursor-pointer">{t("help.topicTracking")}</span>
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: "confirmation_number", title: t("help.card1Title"), desc: t("help.card1Desc") },
          { icon: "payments", title: t("help.card2Title"), desc: t("help.card2Desc") },
          { icon: "wifi", title: t("help.card3Title"), desc: t("help.card3Desc") },
          { icon: "support_agent", title: t("help.card4Title"), desc: t("help.card4Desc") }
        ].map((card) => (
          <div
            key={card.title}
            className="group bg-surface-container-lowest p-6 rounded-2xl cursor-pointer hover:bg-primary transition-all duration-500"
          >
            <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-container">
              <span className="material-symbols-outlined text-primary group-hover:text-white text-2xl">{card.icon}</span>
            </div>
            <h3 className="font-headline text-lg font-bold mb-2 group-hover:text-white">{card.title}</h3>
            <p className="text-on-surface-variant text-sm group-hover:text-white/80">{card.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20">
          <h2 className="font-headline text-2xl font-bold mb-6">{t("help.faqTitle")}</h2>
          <div className="space-y-4">
            {[
              { q: t("help.faq1Q"), a: t("help.faq1A") },
              { q: t("help.faq2Q"), a: t("help.faq2A") },
              { q: t("help.faq3Q"), a: t("help.faq3A") }
            ].map((faq) => (
              <div key={faq.q} className="p-4 rounded-2xl bg-surface-container-low">
                <p className="font-semibold text-on-surface">{faq.q}</p>
                <p className="text-on-surface-variant text-sm mt-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
