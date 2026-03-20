"use client";
import { Icons } from "@/components/common/icons";
import { useEffect, useState } from "react";

export default function VisitCounter() {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number | null>(null);

  async function fetchCount() {
    setLoading(true);
    try {
      const res = await fetch("/api/visits", { method: "POST" });
      const json = await res.json();
      const global = Number(json.global ?? 0);
      setCount(global ?? null);
    } catch (e) {
      // ignore errors; keep previous state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCount();
  }, []);

  // Poll the visits API every 15 seconds so the global count stays reasonably
  // Polling is optional. By default polling is disabled (manual refresh only).
  // Set NEXT_PUBLIC_VISITS_POLL_INTERVAL (seconds) in your environment to
  // enable periodic polling (e.g. 15 for 15s).
  useEffect(() => {
    const pollSec = Number(process.env.NEXT_PUBLIC_VISITS_POLL_INTERVAL ?? 0);
    if (!pollSec || pollSec <= 0) return;
    const id = setInterval(() => {
      fetchCount();
    }, pollSec * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      type="button"
      onClick={(e) => {
        // prevent navigation if this component is placed inside a link or form
        e.preventDefault();
        e.stopPropagation();
        fetchCount();
      }}
      className="inline-flex items-center bg-muted px-3 py-0.5 rounded-full text-sm font-medium gap-0 cursor-pointer select-none"
      aria-label="Visited"
    >
      <span className="inline-flex items-center justify-center w-4 h-4">
        {loading ? (
          <Icons.spinner className="w-3 h-3 animate-spin text-primary" />
        ) : (
          <Icons.user className="w-3 h-3 text-primary" />
        )}
      </span>
      <span className="ml-1 text-xs text-muted-foreground">Visited</span>
      <span className="font-mono ml-1">{loading ? "..." : (count ?? "—")}</span>
    </button>
  );
}
