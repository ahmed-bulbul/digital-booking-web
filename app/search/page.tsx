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

const currencySymbols: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€"
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function resolveImageUrl(url?: string | null) {
  if (!url) return fallbackLogo;
  if (url.startsWith("/uploads/")) {
    return `${apiBaseUrl}${url}`;
  }
  return url;
}

function arrayify(value?: string | string[]) {
  if (!value) {
    return [] as string[];
  }
  return Array.isArray(value) ? value : [value];
}

function formatTime(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatDuration(minutes?: number | null, departureAt?: string, arrivalAt?: string) {
  let duration = minutes ?? null;
  if (duration === null && departureAt && arrivalAt) {
    duration = Math.max(0, Math.round((new Date(arrivalAt).getTime() - new Date(departureAt).getTime()) / 60000));
  }
  if (duration === null) {
    return "";
  }
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
}

function formatPrice(price?: number | null, currency?: string | null) {
  if (price === null || price === undefined) {
    return "";
  }
  const symbol = currency ? currencySymbols[currency] ?? "" : "";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
  return `${symbol}${formatted}`;
}

async function fetchSearchResults(
  routeId: number,
  travelDate: string,
  page: number,
  size: number,
  filters: {
    providerIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    timeSlots?: string[];
    sortBy?: string;
    busType?: string;
  }
) {
  const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";
  const res = await fetch(`${baseUrl}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      routeId,
      travelDate,
      page,
      size,
      providerIds: filters.providerIds,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      timeSlots: filters.timeSlots,
      sortBy: filters.sortBy,
      busType: filters.busType
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    return { success: false, data: [], error: { code: "HTTP_ERROR", message: "Failed to load search results" } } as ApiResponse<
      SearchResult[]
    >;
  }

  return (await res.json()) as ApiResponse<SearchResult[]>;
}

export default async function SearchResultsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const routeId = Number(searchParams.routeId ?? 1);
  const travelDate = searchParams.date ?? "2026-04-01";
  const page = Number(searchParams.page ?? 0);
  const size = Number(searchParams.size ?? 10);

  const timeSlots = arrayify(searchParams.time);
  const providerIds = arrayify(searchParams.provider)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
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
  console.log('Results::::',results);
  const pagination = response.meta?.pagination;
  const total = pagination?.totalElements ?? results.length;

  const providers = Array.from(
    new Map(
      results
        .filter((item) => item.providerId && item.providerName)
        .map((item) => [item.providerId!, item.providerName!])
    ).entries()
  ).map(([id, name]) => ({ id, name }));

  const titleRoute = results[0]?.sourceName && results[0]?.destinationName
    ? `${results[0]?.sourceName} to ${results[0]?.destinationName}`
    : "Search Results";

  const formattedDate = formatDate(travelDate);

  return (
    <>
      <TopNav active="search" />
      <form
        method="get"
        className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col md:flex-row gap-10"
      >
        <input type="hidden" name="routeId" value={routeId} />
        <input type="hidden" name="date" value={travelDate} />

        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="md:sticky md:top-24 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-bold text-on-surface">Filters</h2>
              <button className="text-primary text-sm font-semibold hover:underline" type="reset">
                Clear all
              </button>
            </div>

            <section className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Departure Time
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "Morning", icon: "wb_sunny", value: "morning" },
                  { label: "Afternoon", icon: "light_mode", value: "afternoon" },
                  { label: "Night", icon: "bedtime", value: "night" }
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <input
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                      type="checkbox"
                      name="time"
                      value={item.value}
                      defaultChecked={timeSlots.includes(item.value)}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Bus Type</h3>
              <div className="flex gap-2">
                <label className="flex-1 py-2 px-4 rounded-full border border-outline-variant text-sm font-medium hover:bg-primary-container hover:text-white hover:border-transparent transition-all text-center">
                  <input
                    type="radio"
                    name="busType"
                    value="ac"
                    className="sr-only"
                    defaultChecked={busType === "ac"}
                  />
                  AC
                </label>
                <label className="flex-1 py-2 px-4 rounded-full border border-outline-variant text-sm font-medium hover:bg-primary-container hover:text-white hover:border-transparent transition-all text-center">
                  <input
                    type="radio"
                    name="busType"
                    value="non-ac"
                    className="sr-only"
                    defaultChecked={busType === "non-ac"}
                  />
                  Non-AC
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Price Range</h3>
                <span className="text-sm font-bold text-primary">৳700 - ৳1,200</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={searchParams.minPrice ?? ""}
                />
                <input
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={searchParams.maxPrice ?? ""}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Operators</h3>
              <div className="space-y-2">
                {providers.length === 0 && (
                  <p className="text-sm text-on-surface-variant">No operators found.</p>
                )}
                {providers.map((provider) => (
                  <label key={provider.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                      type="checkbox"
                      name="provider"
                      value={provider.id}
                      defaultChecked={providerIds.includes(provider.id)}
                    />
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface">{provider.name}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Sort by</h3>
              <select
                className="bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:ring-0 cursor-pointer"
                name="sort"
                defaultValue={sortBy}
              >
                <option value="departure">Earliest Departure</option>
                <option value="price">Lowest Price</option>
                <option value="duration">Fastest Duration</option>
              </select>
            </section>

            <button
              type="submit"
              className="w-full primary-gradient text-white font-bold py-3 px-6 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        <section className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                {total} Available Journeys
              </span>
              <h1 className="font-headline text-3xl font-extrabold text-on-surface mt-1">{titleRoute}</h1>
              <p className="text-on-surface-variant text-sm mt-1">{formattedDate}</p>
            </div>
          </div>

          {results.length === 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-10 text-center text-on-surface-variant">
              No journeys found for this route and date.
            </div>
          )}

          {results.map((result) => {
            const operator = result.providerName ?? result.productName;
            const price = formatPrice(result.minPrice ?? null, result.currency ?? null);
            const duration = formatDuration(result.durationMinutes ?? null, result.departureAt, result.arrivalAt);
            const isUrgent = result.availableCount <= 2;
            const isLow = result.availableCount > 2 && result.availableCount <= 10;
            const tag = result.productName;
            const acTag = /ac/i.test(result.productName) ? "AC" : "Standard";
            const imageUrl = result.productImageUrl
              ? resolveImageUrl(result.productImageUrl)
              : fallbackLogo;
            const badgeText = isUrgent
              ? `Last ${result.availableCount} Seats`
              : isLow
                ? `${result.availableCount} Seats Left`
                : `${result.availableCount} Seats Available`;
            const badgeClass = isUrgent ? "text-error" : isLow ? "text-secondary" : "text-on-surface-variant";
            const badgeIcon = isUrgent ? "bolt" : "event_seat";
            const buttonClass = isUrgent
              ? "w-full bg-secondary-container text-on-secondary-container font-bold py-3 px-6 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-secondary/20"
              : "w-full primary-gradient text-white font-bold py-3 px-6 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20";

            return (
              <article
                key={result.scheduleId}
                className={`group relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 transition-all duration-300 ring-1 ring-inset ring-black/[0.03] ${
                  isUrgent
                    ? "hover:shadow-[0_20px_50px_rgba(147,75,0,0.08)] ring-2 ring-inset ring-secondary/10 bg-gradient-to-br from-white to-secondary/5"
                    : "hover:shadow-[0_20px_50px_rgba(0,107,47,0.08)]"
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="w-full md:w-48 space-y-2">
                    <div className="h-12 w-32 bg-surface-container-low rounded-lg flex items-center justify-center overflow-hidden relative">
                      <Image
                        src={imageUrl}
                        alt={`${operator} logo`}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-on-surface">{operator}</h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isUrgent ? "bg-secondary-fixed text-on-secondary-fixed-variant" : "bg-primary-fixed text-on-primary-fixed-variant"
                        }`}
                      >
                        {tag}
                      </span>
                      <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {acTag}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Departure</p>
                      <p className={`text-xl font-bold font-headline ${isUrgent ? "text-secondary" : ""}`}>{formatTime(result.departureAt)}</p>
                      <p className="text-sm text-on-surface-variant">{result.sourceName ?? "-"}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center relative">
                      <p className={`text-[10px] font-bold mb-1 uppercase tracking-widest ${isUrgent ? "text-secondary" : "text-primary"}`}>{duration}</p>
                      <div className="w-full flex items-center gap-2">
                        <div className={`h-[2px] flex-1 relative ${isUrgent ? "bg-secondary/20" : "bg-surface-container-high"}`}>
                          <div className={`absolute -left-1 -top-1 w-2 h-2 rounded-full border-2 ${isUrgent ? "border-secondary" : "border-primary"} bg-white`}></div>
                          <div
                            className={`absolute -right-1 -top-1 w-2 h-2 rounded-full border-2 ${
                              isUrgent ? "border-secondary bg-secondary" : "border-primary bg-primary"
                            }`}
                          ></div>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-lg mt-2 ${isUrgent ? "text-secondary" : "text-primary"}`}>
                        {isUrgent ? "airline_seat_flat" : "directions_bus"}
                      </span>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Arrival</p>
                      <p className="text-xl font-bold font-headline">{formatTime(result.arrivalAt)}</p>
                      <p className="text-sm text-on-surface-variant">{result.destinationName ?? "-"}</p>
                    </div>
                  </div>

                  <div className="w-full md:w-56 flex flex-col items-start md:items-end gap-3 pt-4 md:pt-0 md:border-l md:border-surface-container-high md:pl-8">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-on-surface-variant font-medium">Starting from</p>
                      <p className="text-2xl sm:text-3xl font-black text-on-surface tracking-tighter">{price || "—"}</p>
                    </div>
                    <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${badgeClass}`}>
                      <span className="material-symbols-outlined text-sm">{badgeIcon}</span>
                      {badgeText}
                    </div>
                    <Link href={`/seat-selection?scheduleId=${result.scheduleId}`} className={`${buttonClass} text-center`}>
                      {isUrgent ? "Book Fast" : "View Seats"}
                    </Link>
                  </div>
                </div>

                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full flex items-center gap-1.5 ring-1 ${
                    isUrgent
                      ? "bg-secondary-fixed/80 backdrop-blur-md ring-secondary/20"
                      : "bg-surface-bright/60 backdrop-blur-md ring-white/50"
                  }`}
                >
                  {isUrgent ? (
                    <span className="text-[10px] font-bold text-on-secondary-container tracking-wider uppercase">Selling Fast</span>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-[10px] font-bold text-primary tracking-wider uppercase">Live Tracking</span>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </form>

      <footer className="bg-surface-container-low w-full py-12 px-6 md:px-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto font-body text-sm tracking-wide">
          <div className="space-y-4">
            <div className="text-lg font-bold text-green-900">JatraXpress</div>
            <p className="text-slate-500 leading-relaxed max-w-xs">
              Elevating your travel experience through premium mobility and effortless booking journeys.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="font-bold text-green-900 uppercase text-xs tracking-widest mb-1">Company</h5>
            <Link className="text-slate-500 hover:text-green-600 underline transition-all" href="/about">
              About Us
            </Link>
            <Link className="text-slate-500 hover:text-green-600 underline transition-all" href="/terms">
              Terms
            </Link>
            <Link className="text-slate-500 hover:text-green-600 underline transition-all" href="/privacy">
              Privacy
            </Link>
            <Link className="text-slate-500 hover:text-green-600 underline transition-all" href="/contact">
              Contact
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <h5 className="font-bold text-green-900 uppercase text-xs tracking-widest mb-3">Language</h5>
              <div className="flex gap-4">
                <button className="text-green-700 font-semibold">EN</button>
                <button className="text-slate-500 hover:text-green-600 transition-all">BN</button>
              </div>
            </div>
            <div className="text-slate-500">© 2024 JatraXpress. Premium Mobility.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
