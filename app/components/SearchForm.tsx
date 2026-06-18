"use client";

import { useMemo, useState } from "react";
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

  const defaultRoute = routes[0];
  const [from, setFrom] = useState(defaultRoute?.sourceName ?? "");
  const [to, setTo] = useState(defaultRoute?.destinationName ?? "");
  const [date, setDate] = useState(defaultDate);
  const [error, setError] = useState<string | null>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const normalizeLocation = (value: string) =>
    value
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

  const filteredFrom = useMemo(() => {
    const term = normalizeLocation(from);
    if (!term) return locations;
    return locations.filter((location) => normalizeLocation(location).includes(term));
  }, [from, locations]);

  const filteredTo = useMemo(() => {
    const term = normalizeLocation(to);
    if (!term) return locations;
    return locations.filter((location) => normalizeLocation(location).includes(term));
  }, [to, locations]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!routes.length) {
      setError("Routes are unavailable right now. Please ensure the backend API is running.");
      return;
    }
    const fromValue = normalizeLocation(from);
    const toValue = normalizeLocation(to);
    if (!fromValue || !toValue) {
      setError("Please select both a departure and destination.");
      return;
    }
    const match = routes.find(
      (route) =>
        normalizeLocation(route.sourceName) === fromValue &&
        normalizeLocation(route.destinationName) === toValue
    );
    if (!match) {
      setError(`No route found from ${from.trim()} to ${to.trim()}.`);
      return;
    }
    setError(null);
    router.push(`/search?routeId=${match.id}&date=${date}`);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    if (error) setError(null);
  };

  const handlePickFrom = (value: string) => {
    setFrom(value);
    setFromOpen(false);
    if (error) setError(null);
  };

  const handlePickTo = (value: string) => {
    setTo(value);
    setToOpen(false);
    if (error) setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest rounded-[2rem] p-4 md:p-8 editorial-shadow flex flex-col md:flex-row md:flex-wrap gap-4 items-center md:items-end"
    >
      <div className="w-full md:flex-1 group">
        <label className="block text-xs font-label text-on-surface-variant mb-2 px-4">DEPARTURE</label>
        <div className="relative">
          <div className="flex items-center bg-surface-container-high rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-primary mr-3">location_on</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-on-surface font-medium placeholder:text-on-surface-variant/50"
              placeholder="From where?"
              type="text"
              autoComplete="off"
              value={from}
              onFocus={() => setFromOpen(true)}
              onBlur={() => setTimeout(() => setFromOpen(false), 120)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setFromOpen(false);
                }
              }}
              onChange={(event) => {
                setFrom(event.target.value);
                if (error) setError(null);
              }}
            />
          </div>
          {fromOpen && (
            <ul className="absolute left-0 right-0 mt-2 max-h-60 overflow-auto rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg z-50">
              {filteredFrom.length > 0 ? (
                filteredFrom.map((location) => (
                  <li key={location}>
                    <button
                      type="button"
                      onMouseDown={() => handlePickFrom(location)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-surface-container-high transition-colors"
                    >
                      {location}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-on-surface-variant">No matches found</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center p-2 mt-6">
        <button
          type="button"
          onClick={handleSwap}
          className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:rotate-180 transition-transform duration-500"
          aria-label="Swap"
        >
          <span className="material-symbols-outlined">swap_horiz</span>
        </button>
      </div>

      <div className="w-full md:flex-1">
        <label className="block text-xs font-label text-on-surface-variant mb-2 px-4">DESTINATION</label>
        <div className="relative">
          <div className="flex items-center bg-surface-container-high rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-primary mr-3">distance</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-on-surface font-medium placeholder:text-on-surface-variant/50"
              placeholder="To where?"
              type="text"
              autoComplete="off"
              value={to}
              onFocus={() => setToOpen(true)}
              onBlur={() => setTimeout(() => setToOpen(false), 120)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setToOpen(false);
                }
              }}
              onChange={(event) => {
                setTo(event.target.value);
                if (error) setError(null);
              }}
            />
          </div>
          {toOpen && (
            <ul className="absolute left-0 right-0 mt-2 max-h-60 overflow-auto rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg z-50">
              {filteredTo.length > 0 ? (
                filteredTo.map((location) => (
                  <li key={location}>
                    <button
                      type="button"
                      onMouseDown={() => handlePickTo(location)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-surface-container-high transition-colors"
                    >
                      {location}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-on-surface-variant">No matches found</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="w-full md:flex-1">
        <label className="block text-xs font-label text-on-surface-variant mb-2 px-4">TRAVEL DATE</label>
        <div className="flex items-center bg-surface-container-high rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
          <span className="material-symbols-outlined text-primary mr-3">calendar_month</span>
          <input
            className="bg-transparent border-none focus:ring-0 w-full text-on-surface font-medium placeholder:text-on-surface-variant/50"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </div>

      <div className="w-full md:w-auto mt-6">
        <button
          type="submit"
          disabled={!routes.length}
          className="w-full md:w-auto inline-flex items-center justify-center bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-10 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search Routes
        </button>
      </div>

      {error && (
        <div className="w-full text-sm text-error font-semibold text-center md:text-left">{error}</div>
      )}
    </form>
  );
}
