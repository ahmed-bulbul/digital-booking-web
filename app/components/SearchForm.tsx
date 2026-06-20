"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type RouteLookup = {
  id: number;
  sourceName: string;
  destinationName: string;
};

type SearchFormProps = {
  routes: RouteLookup[];
  defaultDate: string;
};

export default function SearchForm({ routes, defaultDate }: SearchFormProps) {
  const router = useRouter();
  const locations = useMemo(() => {
    const set = new Set<string>();
    routes.forEach((route) => {
      set.add(route.sourceName);
      set.add(route.destinationName);
    });
    return Array.from(set.values()).sort();
  }, [routes]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [error, setError] = useState<string | null>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const normalizeLocation = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const filteredFrom = useMemo(() => {
    const term = normalizeLocation(from);
    if (!term) return locations;
    return locations.filter((l) => normalizeLocation(l).includes(term));
  }, [from, locations]);

  const filteredTo = useMemo(() => {
    const term = normalizeLocation(to);
    if (!term) return locations;
    return locations.filter((l) => normalizeLocation(l).includes(term));
  }, [to, locations]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!routes.length) {
      setError("Routes unavailable — please ensure the backend is running.");
      return;
    }
    const fromValue = normalizeLocation(from);
    const toValue = normalizeLocation(to);
    if (!fromValue || !toValue) {
      setError("Please select both a departure and destination.");
      return;
    }
    const match = routes.find(
      (r) =>
        normalizeLocation(r.sourceName) === fromValue &&
        normalizeLocation(r.destinationName) === toValue
    );
    if (!match) {
      setError(`No route found from ${from.trim()} to ${to.trim()}.`);
      return;
    }
    setError(null);
    router.push(`/search?routeId=${match.id}&date=${date}`);
  };

  const handleSwap = () => {
    setSwapping(true);
    setTimeout(() => setSwapping(false), 400);
    setFrom(to);
    setTo(from);
    if (error) setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/10 border border-white/60"
    >
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
        {/* From */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-1.5 px-1">
            From
          </label>
          <div className="relative">
            <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-3 border-2 border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all duration-200">
              <span className="material-symbols-outlined text-primary mr-2.5 flex-shrink-0 text-[20px]">
                trip_origin
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface font-semibold placeholder:text-on-surface-variant/40 text-sm min-w-0"
                placeholder="Departure city"
                type="text"
                autoComplete="off"
                value={from}
                onFocus={() => setFromOpen(true)}
                onBlur={() => setTimeout(() => setFromOpen(false), 150)}
                onKeyDown={(e) => { if (e.key === "Escape") setFromOpen(false); }}
                onChange={(e) => { setFrom(e.target.value); if (error) setError(null); }}
              />
              {from && (
                <button
                  type="button"
                  onClick={() => { setFrom(""); setFromOpen(true); }}
                  className="ml-1 text-outline hover:text-on-surface transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            {fromOpen && filteredFrom.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1.5 max-h-52 overflow-auto rounded-xl bg-white border border-outline-variant/20 shadow-xl z-50 animate-slide-down">
                {filteredFrom.map((location) => (
                  <li key={location}>
                    <button
                      type="button"
                      onMouseDown={() => { setFrom(location); setFromOpen(false); if (error) setError(null); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low transition-colors flex items-center gap-2.5 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                      {location}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Swap */}
        <div className="flex md:flex-col items-center justify-center md:pb-2 md:flex-shrink-0">
          <button
            type="button"
            onClick={handleSwap}
            className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 active:scale-90"
            aria-label="Swap departure and destination"
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${swapping ? "rotate-180" : ""}`}
            >
              swap_horiz
            </span>
          </button>
        </div>

        {/* To */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-1.5 px-1">
            To
          </label>
          <div className="relative">
            <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-3 border-2 border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all duration-200">
              <span className="material-symbols-outlined text-primary mr-2.5 flex-shrink-0 text-[20px]">
                place
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface font-semibold placeholder:text-on-surface-variant/40 text-sm min-w-0"
                placeholder="Destination city"
                type="text"
                autoComplete="off"
                value={to}
                onFocus={() => setToOpen(true)}
                onBlur={() => setTimeout(() => setToOpen(false), 150)}
                onKeyDown={(e) => { if (e.key === "Escape") setToOpen(false); }}
                onChange={(e) => { setTo(e.target.value); if (error) setError(null); }}
              />
              {to && (
                <button
                  type="button"
                  onClick={() => { setTo(""); setToOpen(true); }}
                  className="ml-1 text-outline hover:text-on-surface transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            {toOpen && filteredTo.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1.5 max-h-52 overflow-auto rounded-xl bg-white border border-outline-variant/20 shadow-xl z-50 animate-slide-down">
                {filteredTo.map((location) => (
                  <li key={location}>
                    <button
                      type="button"
                      onMouseDown={() => { setTo(location); setToOpen(false); if (error) setError(null); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low transition-colors flex items-center gap-2.5 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                      {location}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex-1 min-w-0 md:max-w-[210px]">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-1.5 px-1">
            Travel Date
          </label>
          <div
            className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-3 border-2 border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all duration-200 cursor-pointer"
            onClick={() => {
              const input = dateInputRef.current;
              if (!input) return;
              try { input.showPicker(); } catch { input.focus(); }
            }}
          >
            <span className="material-symbols-outlined text-primary mr-2.5 flex-shrink-0 text-[20px]">
              calendar_month
            </span>
            <input
              ref={dateInputRef}
              className="bg-transparent border-none focus:ring-0 w-full text-on-surface font-semibold text-sm min-w-0 cursor-pointer"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="md:flex-shrink-0">
          <button
            type="submit"
            disabled={!routes.length}
            className="w-full md:w-auto flex items-center justify-center gap-2 primary-gradient text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:opacity-95 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-error font-medium bg-error/8 rounded-xl px-4 py-2.5">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
          {error}
        </div>
      )}
    </form>
  );
}
