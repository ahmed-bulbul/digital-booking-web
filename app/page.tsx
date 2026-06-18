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
    const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";
    const res = await fetch(`${baseUrl}/api/routes/public`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    const payload = (await res.json()) as ApiResponse<RouteLookup[]>;
    return payload.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const routes = await fetchRoutes();

  return (
    <>
      <TopNav active="search" />
      <main>
        <section className="relative min-h-[600px] flex items-center justify-center px-6 md:px-8 py-20 overflow-visible">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkfz8V5K3OeYApXwQdH_dr-dMoqT9bYBoMHRQRcxAZPCjiDWErf64FNNbnqDqeUOsPeU6Ljh64D4AtiJxYYyNmEz8kSoqHlhv_Q6-KVPhnGFjMwOF0UKv8tWHpoIdBp1k32DlyhlkIDxiSWi95BhN19qhE9i6lUfacT7TPVT328nsRzp02PvsGJNvZGwV8UDqWfmJP3pRnbw140yxjSXfKwHHioGwo_0qptPhVMakc08p0Oy-mGu_HTVRrA1jaYi8P8G0GLInfiw"
              alt="Luxury modern bus traveling on a winding coastal highway during golden hour"
              fill
              priority
              sizes="100vw"
              className="object-cover brightness-75 scale-105"
            />
          </div>
          <div className="relative z-10 w-full max-w-5xl">
            <div className="mb-12 text-center md:text-left">
              <h1 className="text-white font-headline text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-4">
                Your Journey,<br />
                <span className="text-primary-fixed">Reimagined.</span>
              </h1>
              <p className="text-white/90 font-body text-xl max-w-xl">
                Experience the pinnacle of intercity travel with premium amenities and curated routes.
              </p>
            </div>
            <SearchForm routes={routes} defaultDate="2026-04-01" />
          </div>
        </section>

        <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-6">
            <div>
              <h2 className="font-headline text-3xl font-bold text-on-surface">
                Exclusive JatraXpress Deals
              </h2>
              <p className="text-on-surface-variant mt-2">Premium comfort at unparalleled value.</p>
            </div>
            <button className="text-primary font-bold hover:underline flex items-center gap-2">
              View All Offers <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden rounded-[2rem] aspect-[21/9] bg-tertiary-container flex items-center p-8 md:p-12">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-tertiary/90 via-tertiary/40 to-transparent z-10"></div>
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeNHiI2l2VjmC38Z621loSToTxZf9jzSgtqv9U4sfpnyR-lssXG8Ba9GTl_2cRQU44mh8c1Mqzxf7d8FjcRud6_RASBZw5EdR4KOPRYJit4rKCgnXlIWqtcrvc3DxCYvLW36cECZZ6pS2Iau_1WVDRV5pMM5Q-gVqEGn011vKb5ypBIpKGydZm9jEclodlxLheMADEWV_Z7cEl77RapkBNyLkO4OYcWBYl9Uy2ad5nUkc4gfQIyxZ6gry6HLuV-xs-0-gCDvGhlQ"
                  alt="Abstract architectural glass building in teal hues"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="relative z-20 max-w-xs">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  FIRST RIDE
                </span>
                <h3 className="text-white text-3xl md:text-4xl font-headline font-extrabold mt-4">20% OFF</h3>
                <p className="text-white/80 mt-2 font-medium">Use code: KINETIC20</p>
                <button className="mt-6 bg-white text-tertiary font-bold px-6 py-2 rounded-xl text-sm">Claim Now</button>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-[2rem] aspect-[21/9] bg-secondary-container flex items-center p-8 md:p-12">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/40 to-transparent z-10"></div>
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2VoWMI5a60wkS2SXCIHpDsrBlCT8cir5q8vjo-Bb2V5waPPfZkwu9DR7GDtdO-OyfAx7kV6XJmUt2ZckNWBhuC0ynyguoar_lDhE_9bCLZ1_xNKUISHKHkaLfjg_StPmeuzGo8eTG3pcS2SQS7krqpQzYNhn5AxSDOnH-ln1AjQ54c5v8-DHvuudAQLUmYIGPVIXeDwambONbKhrv6TK17d9VgOzYpTPjQPYTAkyMGcJmhsolNUgvT6qDChGSLEjS3rmiLZnong"
                  alt="Urban bus stop at sunset with warm orange glow"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="relative z-20 max-w-xs">
                <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  WEEKEND GETAWAY
                </span>
                <h3 className="text-white text-3xl md:text-4xl font-headline font-extrabold mt-4">15% CASHBACK</h3>
                <p className="text-white/80 mt-2 font-medium">On all coastal routes</p>
                <button className="mt-6 bg-white text-secondary font-bold px-6 py-2 rounded-xl text-sm">Explore Routes</button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-24 px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">
                Top Travel Destinations
              </h2>
              <div className="w-24 h-1.5 bg-primary-fixed mx-auto mt-4 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden editorial-shadow group">
                <div className="h-64 relative overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMJS2YTj2tQE0WsStE2MA3mpON4t0zSqcbo6YClxIDs3p0tDRkOZEDnsUTol0pYC8uPVUUvjEuUmUO0sQaOaD35N-pj4cgu486Rj2VUG3lq7Mx_hCwYy_dDB3B02PoOo8VYCN2vpLePScIiLMi_wbLPAdz-ashdWGIVAoBePm0gz1We7QE1IZlVhjMTU5Z0UeCod6X5_EU8fDjQ-M8GT4qFBeh4GRfDbqrU4tGKhtabPMx0dKJsWJeO2ijBuMloqLizH7T7jw2Vg"
                    alt="Scenic Chittagong hill tracts with lush green mountains"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-glass px-4 py-2 rounded-full text-xs font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> LIVE TRACKING
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-on-surface-variant font-label text-[10px] tracking-widest uppercase mb-1">
                        MOST POPULAR
                      </h4>
                      <h3 className="font-headline text-2xl font-bold text-on-surface">Dhaka to Chittagong</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-on-surface-variant text-xs mb-1">Starting from</p>
                      <p className="text-primary font-extrabold text-xl">৳850</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mb-8">
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm bg-surface-container-low px-3 py-1.5 rounded-lg">
                      <span className="material-symbols-outlined text-lg">airline_seat_recline_extra</span> AC
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm bg-surface-container-low px-3 py-1.5 rounded-lg">
                      <span className="material-symbols-outlined text-lg">wifi</span> Free WiFi
                    </div>
                  </div>
                  <Link
                    href="/seat-selection"
                    className="w-full inline-flex items-center justify-center py-4 border-2 border-primary-container text-primary-container font-bold rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Select Seats
                  </Link>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden editorial-shadow group">
                <div className="h-64 relative overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu7s6rJpAO_A2MkRJh3ds2_Yyc0DVgNeiLH-wPRK39Sg-6-eYnuVWfbeGdxhsc_RmrCBN2Wy3enT5xu3XeN_8WZwDmjJ4Nw9JD2S8G8_ZKuBhwdkLlbcAbGv7XCAxW2IrWz5J18Q2MYCoLF335N6ue34ZgM2tAjSAstJdTkL8zs2_w4wrq0xQis7xW5WGOGhBpUShUtoru3MeXzDE_6UO6plwVMcft9FdWq5EYVVoFZpSUsj6DaJS6HwYsGybVEaemCAOj-DlVyw"
                    alt="Aerial drone shot of Cox's Bazar sea beach"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-glass px-4 py-2 rounded-full text-xs font-bold text-secondary flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">local_fire_department</span> SELLING FAST
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-on-surface-variant font-label text-[10px] tracking-widest uppercase mb-1">
                        COASTAL EXPRESS
                      </h4>
                      <h3 className="font-headline text-2xl font-bold text-on-surface">Dhaka to Cox&apos;s Bazar</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-on-surface-variant text-xs mb-1">Starting from</p>
                      <p className="text-primary font-extrabold text-xl">৳1,200</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mb-8">
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm bg-surface-container-low px-3 py-1.5 rounded-lg">
                      <span className="material-symbols-outlined text-lg">dinner_dining</span> Snacks
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm bg-surface-container-low px-3 py-1.5 rounded-lg">
                      <span className="material-symbols-outlined text-lg">hotel</span> Sleeper
                    </div>
                  </div>
                  <Link
                    href="/seat-selection"
                    className="w-full inline-flex items-center justify-center py-4 border-2 border-primary-container text-primary-container font-bold rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Select Seats
                  </Link>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden editorial-shadow group">
                <div className="h-64 relative overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoR-fTdG16bjL0kXgI3yBt_2mWBuhLa9CUatR8lDvhfjRqRs3VHO2tH7ChxwZ87c2XRZT9noGdsJU3chH7AwzPrRw5ds-Qu8hEYwzeBf3eOOb0VMQoRvniNz_toDrZRIgMq_2ib_z9kFaXy8YMApf01qgCN7k6LKuO9aua6Nv6fEJn0FUcPtU5b7xoo-yO-SNjVKVpWMo4qhywFfwRNVOmuzoQsmBoOJYr-JfPVdaO1VpedpVfnaqufgMGDNUzDDoPspg-XY8e4w"
                    alt="Sylhet tea garden estates with rolling hills"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-on-surface-variant font-label text-[10px] tracking-widest uppercase mb-1">
                        TEA GARDEN ROUTE
                      </h4>
                      <h3 className="font-headline text-2xl font-bold text-on-surface">Dhaka to Sylhet</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-on-surface-variant text-xs mb-1">Starting from</p>
                      <p className="text-primary font-extrabold text-xl">৳700</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mb-8">
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm bg-surface-container-low px-3 py-1.5 rounded-lg">
                      <span className="material-symbols-outlined text-lg">airline_seat_recline_extra</span> AC
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm bg-surface-container-low px-3 py-1.5 rounded-lg">
                      <span className="material-symbols-outlined text-lg">charging_station</span> USB Port
                    </div>
                  </div>
                  <Link
                    href="/seat-selection"
                    className="w-full inline-flex items-center justify-center py-4 border-2 border-primary-container text-primary-container font-bold rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Select Seats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto">
          <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-16 text-center">
            Why Book with JatraXpress?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            <div className="md:col-span-2 md:row-span-2 bg-primary text-on-primary p-12 rounded-[3rem] flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-12 right-12 opacity-20">
                <span className="material-symbols-outlined text-[120px]">verified_user</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-headline font-bold mb-4">Safety First. Always.</h3>
                <p className="text-primary-fixed text-lg leading-relaxed">
                  Every journey is monitored in real-time. Our drivers undergo rigorous training and background checks to ensure your sanctuary remains secure.
                </p>
              </div>
            </div>
            <div className="md:col-span-2 bg-surface-container-low p-10 rounded-[3rem] flex items-center gap-8 group">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-primary editorial-shadow group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">confirmation_number</span>
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold mb-2">Instant e-Tickets</h3>
                <p className="text-on-surface-variant text-sm">
                  Go paperless. Receive your tickets instantly via SMS and Email.
                </p>
              </div>
            </div>
            <div className="bg-surface-container-high p-8 rounded-[3rem] flex flex-col justify-center items-center text-center group">
              <span className="material-symbols-outlined text-4xl text-secondary mb-4 group-hover:-translate-y-2 transition-transform">
                support_agent
              </span>
              <h3 className="font-bold">24/7 Support</h3>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-[3rem] flex flex-col justify-center items-center text-center editorial-shadow group">
              <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:-translate-y-2 transition-transform">
                event_repeat
              </span>
              <h3 className="font-bold">Easy Reschedule</h3>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-low w-full py-12 px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
          <div>
            <div className="text-lg font-bold text-green-900 mb-4">JatraXpress</div>
            <p className="text-slate-500 font-body text-sm tracking-wide leading-relaxed">
              Redefining the standard of road travel across the nation. Luxury, safety, and reliability in every mile.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-on-surface mb-2">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link className="text-slate-500 hover:text-green-600 underline transition-all font-body text-sm tracking-wide" href="/about">
                About Us
              </Link>
              <Link className="text-slate-500 hover:text-green-600 underline transition-all font-body text-sm tracking-wide" href="/terms">
                Terms
              </Link>
              <Link className="text-slate-500 hover:text-green-600 underline transition-all font-body text-sm tracking-wide" href="/privacy">
                Privacy
              </Link>
              <Link className="text-slate-500 hover:text-green-600 underline transition-all font-body text-sm tracking-wide" href="/contact">
                Contact
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">Stay Connected</h4>
            <div className="flex gap-4 mb-6">
              <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all" aria-label="Website">
                <span className="material-symbols-outlined text-xl">public</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all" aria-label="Email">
                <span className="material-symbols-outlined text-xl">mail</span>
              </button>
            </div>
            <p className="text-slate-500 font-body text-sm tracking-wide">© 2024 JatraXpress. Premium Mobility.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
