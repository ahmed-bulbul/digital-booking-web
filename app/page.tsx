import Image from "next/image";
import Link from "next/link";
import TopNav from "./components/TopNav";
import SearchForm, { RouteLookup } from "./components/SearchForm";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

async function fetchRoutes(): Promise<RouteLookup[]> {
  try {
    const baseUrl = process.env.API_BASE_URL ?? "https://b84d-103-72-212-59.ngrok-free.app";
    const res = await fetch(`${baseUrl}/api/routes/public`, { cache: "no-store" });
    if (!res.ok) return [];
    const payload = (await res.json()) as ApiResponse<RouteLookup[]>;
    return payload.data ?? [];
  } catch {
    return [];
  }
}

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const STATS = [
  { value: "50K+", label: "Happy Travelers" },
  { value: "120+", label: "Routes Covered" },
  { value: "4.9★", label: "Average Rating" },
  { value: "24/7", label: "Live Support" }
];

const FEATURES = [
  {
    icon: "verified_user",
    title: "Safety First. Always.",
    desc: "Every journey is monitored in real-time. Our drivers undergo rigorous training and background checks.",
    colSpan: "md:col-span-2 md:row-span-2",
    dark: true
  },
  {
    icon: "confirmation_number",
    title: "Instant e-Tickets",
    desc: "Go paperless. Receive your tickets instantly via SMS and Email.",
    colSpan: "md:col-span-2",
    dark: false
  },
  {
    icon: "support_agent",
    title: "24/7 Support",
    desc: "Round-the-clock help whenever you need it.",
    colSpan: "",
    dark: false
  },
  {
    icon: "event_repeat",
    title: "Easy Reschedule",
    desc: "Change your plans without the hassle.",
    colSpan: "",
    dark: false
  }
];

const DESTINATIONS = [
  {
    title: "Dhaka to Chittagong",
    badge: "Most Popular",
    badgeIcon: "bolt",
    price: "৳850",
    features: ["AC Coach", "Free WiFi"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMJS2YTj2tQE0WsStE2MA3mpON4t0zSqcbo6YClxIDs3p0tDRkOZEDnsUTol0pYC8uPVUUvjEuUmUO0sQaOaD35N-pj4cgu486Rj2VUG3lq7Mx_hCwYy_dDB3B02PoOo8VYCN2vpLePScIiLMi_wbLPAdz-ashdWGIVAoBePm0gz1We7QE1IZlVhjMTU5Z0UeCod6X5_EU8fDjQ-M8GT4qFBeh4GRfDbqrU4tGKhtabPMx0dKJsWJeO2ijBuMloqLizH7T7jw2Vg",
    alt: "Scenic Chittagong hill tracts"
  },
  {
    title: "Dhaka to Cox's Bazar",
    badge: "Selling Fast",
    badgeIcon: "local_fire_department",
    price: "৳1,200",
    features: ["Sleeper", "Snacks"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDu7s6rJpAO_A2MkRJh3ds2_Yyc0DVgNeiLH-wPRK39Sg-6-eYnuVWfbeGdxhsc_RmrCBN2Wy3enT5xu3XeN_8WZwDmjJ4Nw9JD2S8G8_ZKuBhwdkLlbcAbGv7XCAxW2IrWz5J18Q2MYCoLF335N6ue34ZgM2tAjSAstJdTkL8zs2_w4wrq0xQis7xW5WGOGhBpUShUtoru3MeXzDE_6UO6plwVMcft9FdWq5EYVVoFZpSUsj6DaJS6HwYsGybVEaemCAOj-DlVyw",
    alt: "Aerial shot of Cox's Bazar sea beach"
  },
  {
    title: "Dhaka to Sylhet",
    badge: "Tea Garden Route",
    badgeIcon: "eco",
    price: "৳700",
    features: ["AC Coach", "USB Charging"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoR-fTdG16bjL0kXgI3yBt_2mWBuhLa9CUatR8lDvhfjRqRs3VHO2tH7ChxwZ87c2XRZT9noGdsJU3chH7AwzPrRw5ds-Qu8hEYwzeBf3eOOb0VMQoRvniNz_toDrZRIgMq_2ib_z9kFaXy8YMApf01qgCN7k6LKuO9aua6Nv6fEJn0FUcPtU5b7xoo-yO-SNjVKVpWMo4qhywFfwRNjVOmuzoQsmBoOJYr-JfPVdaO1VpedpVfnaqufgMGDNUzDDoPspg-XY8e4w",
    alt: "Sylhet tea garden estates"
  }
];

export default async function HomePage() {
  const routes = await fetchRoutes();

  return (
    <>
      <TopNav active="search" />
      <main>
        {/* Hero */}
        <section className="relative min-h-[620px] flex items-center justify-center px-4 sm:px-6 md:px-8 py-20">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkfz8V5K3OeYApXwQdH_dr-dMoqT9bYBoMHRQRcxAZPCjiDWErf64FNNbnqDqeUOsPeU6Ljh64D4AtiJxYYyNmEz8kSoqHlhv_Q6-KVPhnGFjMwOF0UKv8tWHpoIdBp1k32DlyhlkIDxiSWi95BhN19qhE9i6lUfacT7TPVT328nsRzp02PvsGJNvZGwV8UDqWfmJP3pRnbw140yxjSXfKwHHioGwo_0qptPhVMakc08p0Oy-mGu_HTVRrA1jaYi8P8G0GLInfiw"
              alt="Luxury modern bus on a coastal highway"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-5xl">
            <div className="mb-10 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-5">
                <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
                <span className="text-white/90 text-xs font-semibold tracking-wider uppercase">
                  Live Seat Availability
                </span>
              </div>
              <h1 className="text-white font-headline text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-4 text-balance">
                Your Journey,<br />
                <span className="text-primary-fixed">Reimagined.</span>
              </h1>
              <p className="text-white/80 font-body text-lg md:text-xl max-w-xl leading-relaxed">
                Experience premium intercity travel with curated routes, instant tickets, and unmatched comfort.
              </p>
            </div>

            <div className="animate-fade-up delay-150">
              <SearchForm routes={routes} defaultDate={getTomorrowDate()} />
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex flex-wrap justify-center gap-8 animate-fade-up delay-300">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="font-headline font-bold text-lg text-on-surface">{stat.value}</span>
                <span className="text-on-surface-variant text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Deals */}
        <section className="py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Limited Time
              </p>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface">
                Exclusive Deals
              </h2>
              <p className="text-on-surface-variant mt-1.5">Premium comfort at unparalleled value.</p>
            </div>
            <Link
              href="/offers"
              className="inline-flex items-center gap-1.5 text-primary font-bold hover:gap-3 transition-all duration-200 text-sm"
            >
              View All Offers
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deal 1 */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[21/9] flex items-center p-8 md:p-10">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#006950]/90 via-[#006950]/60 to-transparent z-10" />
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeNHiI2l2VjmC38Z621loSToTxZf9jzSgtqv9U4sfpnyR-lssXG8Ba9GTl_2cRQU44mh8c1Mqzxf7d8FjcRud6_RASBZw5EdR4KOPRYJit4rKCgnXlIWqtcrvc3DxCYvLW36cECZZ6pS2Iau_1WVDRV5pMM5Q-gVqEGn011vKb5ypBIpKGydZm9jEclodlxLheMADEWV_Z7cEl77RapkBNyLkO4OYcWBYl9Uy2ad5nUkc4gfQIyxZ6gry6HLuV-xs-0-gCDvGhlQ"
                  alt="First ride offer"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="relative z-20 max-w-xs">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white/30 mb-3">
                  First Ride
                </span>
                <h3 className="text-white text-3xl md:text-4xl font-headline font-extrabold">20% OFF</h3>
                <p className="text-white/80 mt-1 font-medium text-sm">Use code: <span className="font-bold text-white">KINETIC20</span></p>
                <button className="mt-5 bg-white text-[#006950] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg">
                  Claim Now
                </button>
              </div>
            </div>

            {/* Deal 2 */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[21/9] flex items-center p-8 md:p-10">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#934b00]/90 via-[#934b00]/60 to-transparent z-10" />
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2VoWMI5a60wkS2SXCIHpDsrBlCT8cir5q8vjo-Bb2V5waPPfZkwu9DR7GDtdO-OyfAx7kV6XJmUt2ZckNWBhuC0ynyguoar_lDhE_9bCLZ1_xNKUISHKHkaLfjg_StPmeuzGo8eTG3pcS2SQS7krqpQzYNhn5AxSDOnH-ln1AjQ54c5v8-DHvuudAQLUmYIGPVIXeDwambONbKhrv6TK17d9VgOzYpTPjQPYTAkyMGcJmhsolNUgvT6qDChGSLEjS3rmiLZnong"
                  alt="Weekend getaway offer"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="relative z-20 max-w-xs">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white/30 mb-3">
                  Weekend Getaway
                </span>
                <h3 className="text-white text-3xl md:text-4xl font-headline font-extrabold">15% Cashback</h3>
                <p className="text-white/80 mt-1 font-medium text-sm">On all coastal routes</p>
                <button className="mt-5 bg-white text-[#934b00] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg">
                  Explore Routes
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Top Destinations */}
        <section className="bg-surface-container-low py-20 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Top Routes
              </p>
              <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
                Popular Destinations
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DESTINATIONS.map((dest) => (
                <div
                  key={dest.title}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 group"
                >
                  <div className="h-56 relative overflow-hidden">
                    <Image
                      src={dest.img}
                      alt={dest.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">{dest.badgeIcon}</span>
                        {dest.badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-headline text-lg font-bold text-on-surface leading-tight">
                        {dest.title}
                      </h3>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-[10px] text-on-surface-variant">from</p>
                        <p className="text-primary font-extrabold text-xl font-headline">{dest.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-5">
                      {dest.features.map((f) => (
                        <span
                          key={f}
                          className="flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-lg font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <Link
                      href="/search"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 primary-gradient text-white font-bold rounded-xl text-sm hover:opacity-95 active:scale-95 transition-all duration-200 shadow-sm shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">search</span>
                      Find Buses
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us — bento grid */}
        <section className="py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Why JatraXpress
            </p>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
              Built Around You
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[520px]">
            {/* Large featured card */}
            <div className="md:col-span-2 md:row-span-2 primary-gradient text-white p-10 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute -right-4 -bottom-4 w-60 h-60 bg-white/5 rounded-full" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                    verified_user
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-headline font-bold mb-3 leading-tight">
                  Safety First. Always.
                </h3>
                <p className="text-white/75 leading-relaxed">
                  Every journey is monitored in real-time. Our drivers undergo rigorous training and background checks to ensure your comfort and safety.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs font-bold"
                    >
                      {["A","R","S","M"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-white/70 text-sm">Trusted by 50K+ travelers</p>
              </div>
            </div>

            {/* e-Tickets */}
            <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/20 p-7 rounded-2xl flex items-center gap-5 group hover:border-primary/30 hover:shadow-md transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  confirmation_number
                </span>
              </div>
              <div>
                <h3 className="text-lg font-headline font-bold mb-1">Instant e-Tickets</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Go paperless. Receive your tickets instantly via SMS and Email right after booking.
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-surface-container-low border border-outline-variant/20 p-7 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-primary/30 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary transition-colors duration-200">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  support_agent
                </span>
              </div>
              <h3 className="font-headline font-bold text-base">24/7 Support</h3>
              <p className="text-on-surface-variant text-xs mt-1">Always here when you need us</p>
            </div>

            {/* Reschedule */}
            <div className="bg-surface-container-low border border-outline-variant/20 p-7 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-primary/30 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary transition-colors duration-200">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  event_repeat
                </span>
              </div>
              <h3 className="font-headline font-bold text-base">Easy Reschedule</h3>
              <p className="text-on-surface-variant text-xs mt-1">Change plans without stress</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    directions_bus
                  </span>
                </div>
                <span className="text-xl font-extrabold font-headline text-on-surface">
                  Jatra<span className="text-primary">Xpress</span>
                </span>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                Redefining the standard of intercity travel across Bangladesh. Luxury, safety, and reliability in every mile.
              </p>
              <div className="flex gap-3 mt-5">
                <button className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all duration-200" aria-label="Website">
                  <span className="material-symbols-outlined text-lg">public</span>
                </button>
                <button className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all duration-200" aria-label="Email">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Search Buses", href: "/search" },
                  { label: "My Bookings", href: "/bookings" },
                  { label: "Offers", href: "/offers" },
                  { label: "Help Center", href: "/help" }
                ].map((link) => (
                  <Link
                    key={link.href}
                    className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider mb-4">Company</h4>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Contact", href: "/contact" }
                ].map((link) => (
                  <Link
                    key={link.href}
                    className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-on-surface-variant text-xs">
              © 2024 JatraXpress. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-on-surface-variant font-medium">
                Live tracking active across all routes
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
