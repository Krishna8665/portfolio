import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { NextResponse } from "next/server";

// Environment-driven behavior: if VISITS_USE_UPSTASH is set to "true"
// we'll attempt to use Upstash for a persistent global counter. Otherwise
// we fall back to CountAPI which stores a single global counter.
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const VISITS_USE_UPSTASH =
  (process.env.VISITS_USE_UPSTASH ?? "false") === "true";

let redis: Redis | null = null;
if (VISITS_USE_UPSTASH && UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
  } catch (e) {
    console.error("Failed to initialize Upstash Redis client:", e);
    redis = null;
  }
}

// CountAPI fallback for a single global counter
async function countapiHitGlobal(namespace: string) {
  try {
    const res = await fetch(
      `https://api.countapi.xyz/hit/${encodeURIComponent(namespace)}/global`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export async function GET(req: Request) {
  try {
    const ip = await getIp(req);
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const recentKey = `visit:recent:${ipHash}`;
    // Dedupe TTL (seconds). Set VISITS_DEDUPE_TTL_SECONDS=0 to disable deduping
    // and count every request.
    const DEDUPE_TTL = Number(process.env.VISITS_DEDUPE_TTL_SECONDS ?? "3600");

    let shouldCount = false;
    let useFallback = false;
    try {
      // If dedupe TTL is <= 0, count every request (no dedupe).
      if (DEDUPE_TTL <= 0) {
        shouldCount = true;
      } else if (redis) {
        const setRes: any = await redis.set(recentKey, "1", {
          ex: DEDUPE_TTL,
          nx: true,
        } as any);
        if (setRes === "OK" || setRes === true) {
          shouldCount = true;
        }
      } else {
        useFallback = true;
        shouldCount = true;
      }
    } catch (e) {
      console.error("SET NX failed:", e);
      try {
        if (redis && DEDUPE_TTL > 0) {
          const exists = await redis.get(recentKey).catch(() => null);
          if (!exists) {
            await redis
              .set(recentKey, "1", { ex: DEDUPE_TTL } as any)
              .catch(() => null);
            shouldCount = true;
          }
        } else {
          useFallback = true;
          shouldCount = true;
        }
      } catch (_err) {
        useFallback = true;
        shouldCount = true;
      }
    }

    let global = 0;
    if (shouldCount) {
      if (redis && !useFallback) {
        try {
          const g = await redis.incr("visits:global");
          global = Number(g || 0);
        } catch (e) {
          console.error("Upstash INCR failed:", e);
          useFallback = true;
        }
      } else {
        useFallback = true;
      }
    }

    if (useFallback) {
      const g = await countapiHitGlobal("krishna-portfolio");
      global = Number(g?.value ?? 0);
      return NextResponse.json(
        { global },
        { headers: { "x-visits-backend": "countapi" } }
      );
    }

    return NextResponse.json(
      { global },
      { headers: { "x-visits-backend": redis ? "upstash" : "none" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message || err), global: 0 },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
