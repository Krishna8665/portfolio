
"use client";
import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface CountryCount {
  code: string;
  name: string;
  count: number;
}

export default function VisitCounter() {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number | null>(null);
  const [countries, setCountries] = useState<CountryCount[]>([]);
  const [open, setOpen] = useState(false);
  const [simulated, setSimulated] = useState<CountryCount[] | null>(null);
  const [failedFlags, setFailedFlags] = useState<string[]>([]);

  const ref = useRef<HTMLDivElement | null>(null);

  function countryCodeToEmoji(code: string) {
    if (!code || code.length !== 2) return "";
    const chars = Array.from(code.toUpperCase());
    return String.fromCodePoint(
      ...chars.map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  }

  async function fetchCount() {
    setLoading(true);
    try {
      const res = await fetch("/api/visits");
      const json = await res.json();
      const global = Number(json.global ?? 0);
      const got = (json.countries ?? []).map((c: any) => ({
        code: String(c.code),
        name: String(c.name),
        count: Number(c.count || 0),
      }));
      setCount(global ?? null);
      setCountries(got);
    } catch (e) {
      // ignore errors; keep previous state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCount();
  }, []);

  // refresh when opening the panel so counts are fresh
  useEffect(() => {
    if (open) fetchCount();
  }, [open]);

  // click-outside & escape to close
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const displayList = simulated ?? countries;

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-8 w-8 px-0"
        aria-label="View visitors"
      >
        <Icons.user className="w-4 h-4" />
      </Button>

      <span className="inline-flex ml-2 items-center gap-2 px-2 py-0.5 rounded-md bg-muted text-sm">
        {loading ? "..." : (count ?? "—")}
      </span>

      {open && (
        <>
          {/* mobile backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
          />

          {/* desktop popover */}
          <div className="absolute right-0 top-full z-50 mt-2 hidden md:block w-[min(20rem,90vw)] rounded-md border border-border bg-card p-4 text-sm shadow-lg">
            <div className="mb-2 font-medium">Visitors by country</div>
            <div className="max-h-64 overflow-auto">
              {/* If server returns only Local/ZZ and no simulation chosen, show helpful message */}
              {displayList.length === 1 &&
              displayList[0].code === "ZZ" &&
              !simulated ? (
                <div className="space-y-3">
                  <div className="text-muted-foreground">
                    You're viewing locally — the server detected a local IP.
                    Country lookup returns "Local" which is expected when
                    testing on localhost.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md bg-primary px-3 py-1 text-sm text-white"
                      onClick={() => {
                        const sim = [
                          { code: "US", name: "United States", count: 42 },
                        ];
                        setSimulated(sim);
                        // update the visible global count to the simulated total
                        setCount(sim.reduce((s, c) => s + c.count, 0));
                        // reset any flag failures so emoji toggles update
                        setFailedFlags([]);
                      }}
                    >
                      Simulate United States
                    </button>
                    <button
                      className="rounded-md border border-border px-3 py-1 text-sm"
                      onClick={async () => {
                        setSimulated(null);
                        // refetch real counts from the API
                        await fetchCount();
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tip: to test with a real public IP locally use curl with an
                    X-Forwarded-For header:
                    <div className="mt-2 rounded bg-muted/40 p-2 font-mono text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <code className="truncate">
                          curl -H "x-forwarded-for: 8.8.8.8"
                          http://localhost:3000/api/visits
                        </code>
                        <button
                          className="ml-2 rounded-md border border-border px-2 py-1 text-xs"
                          onClick={() =>
                            navigator.clipboard?.writeText(
                              'curl -H "x-forwarded-for: 8.8.8.8" http://localhost:3000/api/visits'
                            )
                          }
                          aria-label="Copy curl command"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : displayList.length === 0 ? (
                <div className="text-muted-foreground">No data yet.</div>
              ) : (
                <ul className="space-y-2">
                  {displayList.map((c) => (
                    <li
                      key={c.code}
                      className="flex items-center justify-between gap-3"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        {!failedFlags.includes(c.code) ? (
                          <img
                            src={`/flags/${c.code.toLowerCase()}.svg`}
                            alt={c.name}
                            className="h-4 w-6 rounded-sm object-cover"
                            onError={() =>
                              setFailedFlags((s) =>
                                s.includes(c.code) ? s : [...s, c.code]
                              )
                            }
                          />
                        ) : (
                          <span className="text-lg">
                            {countryCodeToEmoji(c.code)}
                          </span>
                        )}
                        <span>{c.name}</span>
                      </div>
                      <span className="font-mono">{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* mobile sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-lg border-t border-border bg-card p-4 text-sm shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Visitors by country</div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close visitors panel"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted/50"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[40vh] overflow-auto">
              {displayList.length === 0 ? (
                <div className="text-muted-foreground">No data yet.</div>
              ) : (
                <ul className="space-y-2">
                  {displayList.map((c) => (
                    <li
                      key={c.code}
                      className="flex items-center justify-between gap-3"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        {!failedFlags.includes(c.code) ? (
                          <img
                            src={`/flags/${c.code.toLowerCase()}.svg`}
                            alt={c.name}
                            className="h-4 w-6 rounded-sm object-cover"
                            onError={() =>
                              setFailedFlags((s) =>
                                s.includes(c.code) ? s : [...s, c.code]
                              )
                            }
                          />
                        ) : (
                          <span className="text-lg">
                            {countryCodeToEmoji(c.code)}
                          </span>
                        )}
                        <span>{c.name}</span>
                      </div>
                      <span className="font-mono">{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
