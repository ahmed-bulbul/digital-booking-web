"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  routeId: number;
  travelDate: string;
  initTimeSlots: string[];
  initProviderIds: number[];
  initMinPrice: string;
  initMaxPrice: string;
  initSortBy: string;
  initBusType: string;
  providers: { id: number; name: string }[];
};

const timeOptions = [
  { label: "Morning", sublabel: "06:00 – 12:00", icon: "wb_sunny", value: "morning" },
  { label: "Afternoon", sublabel: "12:00 – 18:00", icon: "light_mode", value: "afternoon" },
  { label: "Night", sublabel: "18:00 – 06:00", icon: "bedtime", value: "night" },
];

export default function FilterSidebar({
  routeId,
  travelDate,
  initTimeSlots,
  initProviderIds,
  initMinPrice,
  initMaxPrice,
  initSortBy,
  initBusType,
  providers,
}: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState(initTimeSlots);
  const [providerIds, setProviderIds] = useState(initProviderIds);
  const [minPrice, setMinPrice] = useState(initMinPrice);
  const [maxPrice, setMaxPrice] = useState(initMaxPrice);
  const [sortBy, setSortBy] = useState(initSortBy);
  const [busType, setBusType] = useState(initBusType);

  const activeCount =
    timeSlots.length +
    providerIds.length +
    (busType ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  const push = useCallback(
    (overrides: {
      timeSlots?: string[];
      providerIds?: number[];
      minPrice?: string;
      maxPrice?: string;
      sortBy?: string;
      busType?: string;
    }) => {
      const ts = overrides.timeSlots ?? timeSlots;
      const pi = overrides.providerIds ?? providerIds;
      const min = overrides.minPrice ?? minPrice;
      const max = overrides.maxPrice ?? maxPrice;
      const sort = overrides.sortBy ?? sortBy;
      const bt = overrides.busType ?? busType;

      const params = new URLSearchParams();
      params.set("routeId", String(routeId));
      params.set("date", travelDate);
      ts.forEach((t) => params.append("time", t));
      pi.forEach((p) => params.append("provider", String(p)));
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
      if (sort && sort !== "departure") params.set("sort", sort);
      if (bt) params.set("busType", bt);

      router.push(`/search?${params.toString()}`);
    },
    [timeSlots, providerIds, minPrice, maxPrice, sortBy, busType, routeId, travelDate, router]
  );

  const toggleTime = (value: string) => {
    const next = timeSlots.includes(value)
      ? timeSlots.filter((t) => t !== value)
      : [...timeSlots, value];
    setTimeSlots(next);
    push({ timeSlots: next });
  };

  const toggleProvider = (id: number) => {
    const next = providerIds.includes(id)
      ? providerIds.filter((p) => p !== id)
      : [...providerIds, id];
    setProviderIds(next);
    push({ providerIds: next });
  };

  const handleBusType = (value: string) => {
    const next = busType === value ? "" : value;
    setBusType(next);
    push({ busType: next });
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    push({ sortBy: value });
  };

  const handlePriceBlur = () => push({});

  const handleReset = () => {
    setTimeSlots([]);
    setProviderIds([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("departure");
    setBusType("");
    router.push(`/search?routeId=${routeId}&date=${travelDate}`);
  };

  const filterContent = (
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
              className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container-high transition-colors duration-150"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px]">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-on-surface leading-none">{item.label}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{item.sublabel}</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                checked={timeSlots.includes(item.value)}
                onChange={() => toggleTime(item.value)}
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
            <button
              key={opt.value}
              type="button"
              onClick={() => handleBusType(opt.value)}
              className={`py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                busType === opt.value
                  ? "border-primary bg-primary/8 text-primary"
                  : "border-outline-variant/50 text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              {opt.label}
            </button>
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
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={handlePriceBlur}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={handlePriceBlur}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
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
                  type="checkbox"
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  checked={providerIds.includes(provider.id)}
                  onChange={() => toggleProvider(provider.id)}
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
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="departure">Earliest Departure</option>
          <option value="price">Lowest Price</option>
          <option value="duration">Fastest Duration</option>
        </select>
      </div>
    </div>
  );

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      {/* Mobile toggle button */}
      <button
        type="button"
        className="md:hidden w-full flex items-center justify-between gap-3 px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl card-shadow"
        onClick={() => setMobileOpen((o) => !o)}
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
            tune
          </span>
          <span className="font-bold text-on-surface text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="h-5 min-w-[20px] px-1.5 rounded-full primary-gradient text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <span
          className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-300 ${
            mobileOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Mobile collapsible panel */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl card-shadow overflow-hidden animate-slide-down">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-outline-variant/15">
            <h2 className="font-headline text-base font-bold text-on-surface">Filters</h2>
            <div className="flex items-center gap-3">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-primary text-xs font-bold hover:underline underline-offset-2"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
          <div className="px-5 py-5">{filterContent}</div>
        </div>
      )}

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block md:sticky md:top-24">
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline text-base font-bold text-on-surface">Filters</h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-primary text-xs font-bold hover:underline underline-offset-2 transition-all"
            >
              Clear all
            </button>
          </div>
          {filterContent}
        </div>
      </div>
    </aside>
  );
}
