"use client";

import { useState } from "react";
import { useI18n } from "../components/I18nProvider";

export default function HelpClient() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    { icon: "confirmation_number", title: t("help.card1Title"), desc: t("help.card1Desc"), color: "text-primary", bg: "bg-primary/8" },
    { icon: "payments", title: t("help.card2Title"), desc: t("help.card2Desc"), color: "text-secondary", bg: "bg-secondary/8" },
    { icon: "wifi", title: t("help.card3Title"), desc: t("help.card3Desc"), color: "text-tertiary", bg: "bg-tertiary/8" },
    { icon: "support_agent", title: t("help.card4Title"), desc: t("help.card4Desc"), color: "text-primary", bg: "bg-primary/8" }
  ];

  const faqs = [
    { q: t("help.faq1Q"), a: t("help.faq1A") },
    { q: t("help.faq2Q"), a: t("help.faq2A") },
    { q: t("help.faq3Q"), a: t("help.faq3A") }
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Hero search */}
      <section className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/8 text-primary rounded-full mb-5 text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[14px]">support_agent</span>
          Help Center
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 text-balance">
          {t("help.title")}
        </h1>
        <p className="text-on-surface-variant text-lg mb-8 max-w-md mx-auto">
          Find answers, track your journey, or reach our support team.
        </p>

        <div className="relative max-w-xl mx-auto group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary text-[22px]">search</span>
          </div>
          <input
            className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-outline-variant/30 bg-surface-container-lowest shadow-lg focus:ring-0 focus:border-primary/40 focus:bg-white text-base transition-all duration-200 placeholder:text-on-surface-variant/50"
            placeholder={t("help.searchPlaceholder")}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="text-xs text-on-surface-variant">Popular:</span>
          {[t("help.topicRefund"), t("help.topicLuggage"), t("help.topicTracking")].map((topic) => (
            <button
              key={topic}
              onClick={() => setSearchQuery(topic)}
              className="text-xs text-primary font-semibold hover:underline underline-offset-2 transition-all"
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="font-headline text-xl font-bold text-on-surface mb-5">Browse Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {helpCategories.map((card) => (
            <button
              key={card.title}
              className="group text-left bg-surface-container-lowest border border-outline-variant/20 p-5 rounded-2xl card-shadow hover:border-primary/30 hover:card-shadow-hover transition-all duration-200 active:scale-95"
            >
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <span className={`material-symbols-outlined ${card.color} text-[22px]`} style={{ fontVariationSettings: '"FILL" 1' }}>
                  {card.icon}
                </span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">{card.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">FAQ</p>
          <h2 className="font-headline text-2xl font-bold text-on-surface">{t("help.faqTitle")}</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className={`bg-surface-container-lowest border rounded-2xl overflow-hidden transition-all duration-200 ${
                openFaq === i ? "border-primary/30" : "border-outline-variant/20"
              }`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className={`font-semibold text-sm transition-colors ${openFaq === i ? "text-primary" : "text-on-surface"}`}>
                  {faq.q}
                </span>
                <span className={`material-symbols-outlined flex-shrink-0 text-[20px] transition-transform duration-200 ${
                  openFaq === i ? "rotate-180 text-primary" : "text-outline"
                }`}>
                  expand_more
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/15 pt-4 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="primary-gradient rounded-2xl p-8 text-white text-center card-shadow">
        <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
            headset_mic
          </span>
        </div>
        <h2 className="font-headline text-2xl font-bold mb-2">Still need help?</h2>
        <p className="text-white/75 mb-6 max-w-xs mx-auto text-sm">
          Our support team is available 24/7 to assist you with any questions.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/95 active:scale-95 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">call</span>
            Call 16222
          </button>
          <button className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white border border-white/25 font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/25 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Live Chat
          </button>
        </div>
      </section>
    </main>
  );
}
