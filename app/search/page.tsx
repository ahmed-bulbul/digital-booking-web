import Image from "next/image";
import Link from "next/link";
import TopNav from "../components/TopNav";

type SearchParams = {
  routeId?: string;
  date?: string;
  page?: string;
  size?: string;
  time?: string | string[];
  provider?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  busType?: string;
};

type SearchResult = {
  scheduleId: number;
  routeId: number;
  productName: string;
  productImageUrl?: string | null;
  providerId?: number | null;
  providerName?: string | null;
  sourceName?: string | null;
  destinationName?: string | null;
  departureAt: string;
  arrivalAt: string;
  availableCount: number;
  durationMinutes?: number | null;
  minPrice?: number | null;
  currency?: string | null;
};

type PaginationMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string } | null;
  meta?: { pagination?: PaginationMeta } | null;
};

const fallbackLogo = "/images/default-product.svg";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const currencySymbols: Record<string, string> = { BDT: "৳", USD: "$", EUR: "€" };

function resolveImageUrl(url?: string | null) {
  if (!url) return fallbackLogo;
  if (url.startsWith("/uploads/")) return `${apiBaseUrl}${url}`;
  return url;
}

function arrayify(value?: string | string[]) {
  if (!value) return [] as string[];
  return Array.isArray(value) ? value : [value];
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    .format(new Date(`${dateString}T00:00:00Z`));
}

function formatDuration(minutes?: number | null, departureAt?: string, arrivalAt?: string) {
  let duration = minutes ?? null;
  if (duration === null && departureAt && arrivalAt) {
    duration = Math.max(0, Math.round((new Date(arrivalAt).getTime() - new Date(departureAt).getTime()) / 60000));
  }
  if (duration === null) return "";
  const h = Math.floor(duration / 60);
  const m = duration % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function formatPrice(price?: number | null, currency?: string | null) {
  if (price === null || price === undefined) return "";
  const symbol = currency ? (currencySymbols[currency] ?? "") : "";
  return `${symbol}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price)}`;
}

async function fetchSearchResults(
  routeId: number,
  travelDate: string,
  page: number,
  size: number,
  filters: { providerIds?: number[]; minPrice?: number; maxPrice?: number; timeSlots?: string[]; sortBy?: string; busType?: string }
) {
  try {
    const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";
    const res = await fetch(`${baseUrl}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, travelDate, page, size, ...filters }),
      cache: "no-store"
    });
    if (!res.ok) return { success: false, data: [] } as ApiResponse<SearchResult[]>;
    return (await res.json()) as ApiResponse<SearchResult[]>;
  } catch {
    return { success: false, data: [] } as ApiResponse<SearchResult[]>;
  }
}

export default async function SearchResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const routeId = Number(searchParams.routeId ?? 1);
  const travelDate = searchParams.date ?? "2026-04-01";
  const page = Number(searchParams.page ?? 0);
  const size = Number(searchParams.size ?? 10);
  const timeSlots = arrayify(searchParams.time);
  const providerIds = arrayify(searchParams.provider).map(Number).filter(Number.isFinite);
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const sortBy = searchParams.sort ?? "departure";
  const busType = searchParams.busType ?? "";

  const response = await fetchSearchResults(routeId, travelDate, page, size, {
    providerIds: providerIds.length ? providerIds : undefined,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    timeSlots: timeSlots.length ? timeSlots : undefined,
    sortBy,
    busType: busType || undefined
  });

  const results = response.success ? response.data : [];
  const pagination = response.meta?.pagination;
  const total = pagination?.totalElements ?? results.length;

  const providers = Array.from(
    new Map(results.filter((r) => r.providerId && r.providerName).map((r) => [r.providerId!, r.providerName!])).entries()
  ).map(([id, name]) => ({ id, name }));

  const titleRoute = results[0]?.sourceName && results[0]?.destinationName
    ? `${results[0].sourceName} → ${results[0].destinationName}`
    : "Search Results";
  const formattedDate = formatDate(travelDate);

  const timeOptions = [
    { label: "Morning", sublabel: "06:00 – 12:00", icon: "wb_sunny", value: "morning" },
    { label: "Afternoon", sublabel: "12:00 – 18:00", icon: "light_mode", value: "afternoon" },
    { label: "Night", sublabel: "18:00 – 06:00", icon: "bedtime", value: "night" }
  ];

  return (
    <>
      <TopNav active="search" />
      <form method="get" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        <input type="hidden" name="routeId" value={routeId} />
        <input type="hidden" name="date" value={travelDate} />

        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="md:sticky md:top-24">
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 card-shadow">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline text-base font-bold text-on-surface">Filters</h2>
                <button
                  className="text-primary text-xs font-bold hover:underline underline-offset-2 transition-all"
                  type="reset"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-6">
                {/* Departure time */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3">
                    Departure Time
                  </h3>
                  <div className="space-y-1.5">
                    {timeOptions.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container-high transition-colors duration-150 group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-primary text-[18px]">{item.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-on-surface leading-none">{item.label}</p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{item.sublabel}</p>
                          </div>
                        </div>
                        <input
                          className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                          type="checkbox"
                          name="time"
                          value={item.value}
                          defaultChecked={timeSlots.includes(item.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bus type */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3">
                    Bus Type
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: "AC", value: "ac" }, { label: "Non-AC", value: "non-ac" }].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center justify-center py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-150 ${
                          busType === opt.value
                            ? "border-primary bg-primary/8 text-primary"
                            : "border-outline-variant/50 text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                        }`}
                      >
                        <input type="radio" name="busType" value={opt.value} className="sr-only" defaultChecked={busType === opt.value} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3">
                    Price Range (৳)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      defaultValue={searchParams.minPrice ?? ""}
                    />
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      defaultValue={searchParams.maxPrice ?? ""}
                    />
                  </div>
                </div>

                {/* Operators */}
                {providers.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3">
                      Operators
                    </h3>
                    <div className="space-y-2">
                      {providers.map((provider) => (
                        <label key={provider.id} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                            type="checkbox"
                            name="provider"
                            value={provider.id}
                            defaultChecked={providerIds.includes(provider.id)}
                          />
                          <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                            {provider.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3">
                    Sort By
                  </h3>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    name="sort"
                    defaultValue={sortBy}
                  >
                    <option value="departure">Earliest Departure</option>
                    <option value="price">Lowest Price</option>
                    <option value="duration">Fastest Duration</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full primary-gradient text-white font-bold py-3 rounded-xl hover:opacity-95 active:scale-95 transition-all duration-200 shadow-sm shadow-primary/20 text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="flex-1 min-w-0 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
            <div>
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">
                {total} {total === 1 ? "Journey" : "Journeys"} Available
              </p>
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">{titleRoute}</h1>
              <p className="text-on-surface-variant text-sm mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* No results */}
          {results.length === 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-14 text-center">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">search_off</span>
              <p className="font-headline font-bold text-lg text-on-surface mb-2">No journeys found</p>
              <p className="text-on-surface-variant text-sm">Try adjusting your filters or selecting a different date.</p>
            </div>
          )}

          {/* Cards */}
          {results.map((result) => {
            const operator = result.providerName ?? result.productName;
            const price = formatPrice(result.minPrice ?? null, result.currency ?? null);
            const duration = formatDuration(result.durationMinutes ?? null, result.departureAt, result.arrivalAt);
            const isUrgent = result.availableCount <= 2;
            const isLow = result.availableCount > 2 && result.availableCount <= 10;
            const acTag = /ac/i.test(result.productName) ? "AC" : "Standard";
            const imageUrl = result.productImageUrl ? resolveImageUrl(result.productImageUrl) : fallbackLogo;

            return (
              <article
                key={result.scheduleId}
                className={`group relative bg-surface-container-lowest rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isUrgent
                    ? "border-secondary/30 hover:shadow-lg hover:shadow-secondary/10"
                    : "border-outline-variant/20 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/8"
                }`}
              >
                {/* Urgency stripe */}
                {isUrgent && (
                  <div className="h-1 w-full bg-gradient-to-r from-secondary to-secondary-container" />
                )}

                <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6">
                  {/* Operator */}
                  <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 w-full md:w-44 flex-shrink-0">
                    <div className="w-14 h-10 bg-surface-container-low rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0">
                      <Image src={imageUrl} alt={`${operator} logo`} fill sizes="56px" className="object-contain p-1" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm leading-tight">{operator}</h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          isUrgent ? "bg-secondary/15 text-secondary" : "bg-primary/10 text-primary"
                        }`}>
                          {acTag}
                        </span>
                        {isUrgent ? (
                          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[9px] font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                            Hot
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/8 text-primary text-[9px] font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block flex-shrink-0" />
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Journey timeline */}
                  <div className="flex-1 grid grid-cols-3 gap-2 items-center w-full">
                    <div>
                      <p className="text-2xl font-bold font-headline text-on-surface">{formatTime(result.departureAt)}</p>
                      <p className="text-sm text-on-surface-variant mt-0.5 truncate">{result.sourceName ?? "—"}</p>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      {duration && (
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isUrgent ? "text-secondary" : "text-primary"}`}>
                          {duration}
                        </p>
                      )}
                      <div className="relative w-full flex items-center">
                        <div className={`w-2 h-2 rounded-full border-2 flex-shrink-0 ${isUrgent ? "border-secondary" : "border-primary"}`} />
                        <div className={`flex-1 h-px mx-1 ${isUrgent ? "bg-secondary/30" : "bg-primary/20"}`} />
                        <span className={`material-symbols-outlined text-base flex-shrink-0 ${isUrgent ? "text-secondary" : "text-primary"}`}>
                          directions_bus
                        </span>
                        <div className={`flex-1 h-px mx-1 ${isUrgent ? "bg-secondary/30" : "bg-primary/20"}`} />
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isUrgent ? "bg-secondary" : "bg-primary"}`} />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold font-headline text-on-surface">{formatTime(result.arrivalAt)}</p>
                      <p className="text-sm text-on-surface-variant mt-0.5 truncate">{result.destinationName ?? "—"}</p>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="w-full md:w-48 flex-shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-2 md:border-l md:border-outline-variant/20 md:pl-6">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Starting from</p>
                      <p className="text-2xl font-black font-headline text-on-surface tracking-tight">{price || "—"}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                        isUrgent ? "text-secondary" : isLow ? "text-amber-600" : "text-on-surface-variant"
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">{isUrgent ? "bolt" : "event_seat"}</span>
                        {isUrgent
                          ? `Last ${result.availableCount} seats`
                          : isLow
                          ? `${result.availableCount} seats left`
                          : `${result.availableCount} available`}
                      </span>
                      <Link
                        href={`/seat-selection?scheduleId=${result.scheduleId}`}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 whitespace-nowrap ${
                          isUrgent
                            ? "bg-secondary text-white hover:opacity-90 shadow-sm shadow-secondary/20"
                            : "primary-gradient text-white hover:opacity-95 shadow-sm shadow-primary/20"
                        }`}
                      >
                        {isUrgent ? "Book Fast" : "Select Seats"}
                      </Link>
                    </div>
                  </div>
                </div>

              </article>
            );
          })}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Link
                href={`?routeId=${routeId}&date=${travelDate}&page=${page - 1}&sort=${sortBy}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  !pagination.hasPrevious
                    ? "border-outline-variant/20 text-on-surface-variant opacity-40 pointer-events-none"
                    : "border-outline-variant/40 text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Previous
              </Link>
              <p className="text-sm text-on-surface-variant font-medium">
                Page {page + 1} of {pagination.totalPages}
              </p>
              <Link
                href={`?routeId=${routeId}&date=${travelDate}&page=${page + 1}&sort=${sortBy}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  !pagination.hasNext
                    ? "border-outline-variant/20 text-on-surface-variant opacity-40 pointer-events-none"
                    : "border-outline-variant/40 text-on-surface hover:bg-surface-container-high"
                }`}
              >
                Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Link>
            </div>
          )}
        </section>
      </form>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-headline font-extrabold text-on-surface">
              Jatra<span className="text-primary">Xpress</span>
            </span>
            <div className="flex flex-wrap gap-5 text-sm text-on-surface-variant">
              {["/about", "/terms", "/privacy", "/contact"].map((href) => (
                <Link key={href} className="hover:text-primary transition-colors duration-200 capitalize" href={href}>
                  {href.slice(1)}
                </Link>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant">© 2024 JatraXpress</p>
          </div>
        </div>
      </footer>
    </>
  );
}
