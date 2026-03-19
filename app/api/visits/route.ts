import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { NextResponse } from "next/server";

// Environment-driven behavior: if VISITS_USE_UPSTASH is set to "true" (default)
// we'll attempt to use Upstash. If it's missing or Upstash fails, we fall back
// to CountAPI. Set VISITS_USE_UPSTASH="false" to disable Upstash attempts.
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
// Default to false so we don't attempt to use Upstash when the token/DB
// isn't changeable in the environment. Set VISITS_USE_UPSTASH="true"
// if you want to enable Upstash attempts.
const VISITS_USE_UPSTASH =
  (process.env.VISITS_USE_UPSTASH ?? "false") !== "false";

let redis: Redis | null = null;
if (VISITS_USE_UPSTASH && UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
  } catch (e) {
    // keep redis null and rely on fallback
    console.error("Failed to initialize Upstash Redis client:", e);
    redis = null;
  }
}

// Simple CountAPI fallback in case Upstash REST is unavailable.
async function countapiHit(namespace: string, key: string) {
  try {
    const res = await fetch(
      `https://api.countapi.xyz/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function getIp(req: Request) {
  // Prefer X-Forwarded-For (Vercel/proxies), fall back to other headers.
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

async function lookupCountry(ip: string) {
  try {
    if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
      return { code: "ZZ", name: "Local" };
    }
    const res = await fetch(`https://ipwho.is/${ip}`);
    if (!res.ok) return { code: "ZZ", name: "Unknown" };
    const json = await res.json();
    if (json && json.success === false) return { code: "ZZ", name: "Unknown" };
    return {
      code: (json.country_code || "ZZ").toUpperCase(),
      name: json.country || "Unknown",
    };
  } catch (err) {
    return { code: "ZZ", name: "Unknown" };
  }
}

export async function GET(req: Request) {
  try {
    const ip = await getIp(req);

    // short-circuit: compute a per-visitor key (hashed) to avoid double counting
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const recentKey = `visit:recent:${ipHash}`;

    // Try to set a short TTL key. If it did not exist, we will count the visit.
    // Prefer Upstash SDK if initialized, otherwise fall back to CountAPI.
    let shouldCount = false;
    let useFallback = false;
    try {
      if (redis) {
        // set with NX and expiry. The SDK returns "OK" when set or null when not set.
        // NOTE: depending on SDK version the return value can be boolean; handle both.
        const setRes: any = await redis
          .set(recentKey, "1", { ex: 3600, nx: true } as any)
          .catch((e: any) => {
            throw e;
          });
        if (setRes === "OK" || setRes === true) {
          shouldCount = true;
        }
      } else {
        // No redis client available -> use fallback counting
        useFallback = true;
        shouldCount = true;
      }
    } catch (e) {
      console.error("Upstash SET NX failed:", e);
      // Try a more conservative approach with the SDK: check if the key exists and set it.
      try {
        if (redis) {
          const exists = await redis.get(recentKey).catch(() => null);
          if (!exists) {
            await redis
              .set(recentKey, "1", { ex: 3600 } as any)
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

    // Determine country
    const country = await lookupCountry(ip);

    let global = 0;
    if (useFallback) {
      // Use CountAPI fallback for global and per-country counts
      try {
        const g = await countapiHit("krishna-portfolio", "global");
        global = Number(g?.value ?? 0);
        // increment country-specific key
        const c = await countapiHit(
          "krishna-portfolio",
          `country_${country.code}`
        );
        const countryCount = Number(c?.value ?? 0);
        // return only the current visitor country in fallback mode
        const countries = [
          { code: country.code, name: country.name, count: countryCount },
        ];
        return NextResponse.json(
          { global, countries },
          { headers: { "x-visits-backend": "countapi" } }
        );
      } catch (err: any) {
        console.error("CountAPI fallback failed:", err);
        return NextResponse.json(
          { error: String(err?.message || err), global: 0, countries: [] },
          { status: 500 }
        );
      }
    }

    if (shouldCount) {
      if (redis && !useFallback) {
        try {
          const g = await redis.incr("visits:global");
          global = Number(g || 0);
          await redis
            .hincrby("visits:country", country.code, 1)
            .catch(() => null);
          // set name mapping only if missing
          try {
            const existing = await redis
              .hget("visits:country_names", country.code)
              .catch(() => null);
            if (!existing) {
              await redis
                .hset("visits:country_names", { [country.code]: country.name })
                .catch(() => null);
            }
          } catch (e) {
            console.error("HSET/HGET for country names failed:", e);
          }
        } catch (e) {
          console.error("Upstash INCR/HINCRBY failed:", e);
          // fallback to CountAPI if redis operations fail
          useFallback = true;
        }
      } else {
        useFallback = true;
      }
    }

    // If we ended up using fallback, read via CountAPI; otherwise read from redis (if available)
    let countries: Array<{ code: string; name: string; count: number }> = [];
    if (useFallback) {
      try {
        const g = await countapiHit("krishna-portfolio", "global");
        global = Number(g?.value ?? 0);
        // Return only current visitor country count for the fallback mode
        const c = await countapiHit(
          "krishna-portfolio",
          `country_${country.code}`
        );
        const countryCount = Number(c?.value ?? 0);
        countries = [
          { code: country.code, name: country.name, count: countryCount },
        ];
        return NextResponse.json(
          { global, countries },
          { headers: { "x-visits-backend": "countapi" } }
        );
      } catch (err: any) {
        console.error("CountAPI fallback failed:", err);
        return NextResponse.json(
          { error: String(err?.message || err), global: 0, countries: [] },
          { status: 500 }
        );
      }
    } else {
      // read breakdown from redis
      try {
        // hgetall may return an object map or an array depending on client; handle both
        const raw = (await redis!
          .hgetall("visits:country")
          .catch(() => ({}))) as any;
        const namesObj = (await redis!
          .hgetall("visits:country_names")
          .catch(() => ({}))) as any;

        const rawMap: Record<string, string> = {};
        const namesMap: Record<string, string> = {};

        if (Array.isArray(raw)) {
          for (let i = 0; i < raw.length; i += 2) {
            rawMap[raw[i]] = raw[i + 1];
          }
        } else if (raw && typeof raw === "object") {
          Object.assign(rawMap, raw);
        }

        if (Array.isArray(namesObj)) {
          for (let i = 0; i < namesObj.length; i += 2) {
            namesMap[namesObj[i]] = namesObj[i + 1];
          }
        } else if (namesObj && typeof namesObj === "object") {
          Object.assign(namesMap, namesObj);
        }

        countries = Object.entries(rawMap).map(([code, val]) => ({
          code,
          count: Number(val),
          name: namesMap[code] || code,
        }));
      } catch (e) {
        console.error("Reading visit breakdown from Upstash failed:", e);
        // fall back to CountAPI if reads fail
        const g = await countapiHit("krishna-portfolio", "global");
        global = Number(g?.value ?? 0);
        const c = await countapiHit(
          "krishna-portfolio",
          `country_${country.code}`
        );
        const countryCount = Number(c?.value ?? 0);
        countries = [
          { code: country.code, name: country.name, count: countryCount },
        ];
      }
    }

    // sort descending
    countries.sort((a, b) => b.count - a.count);

    const backend = useFallback ? "countapi" : redis ? "upstash" : "none";
    return NextResponse.json(
      { global, countries },
      { headers: { "x-visits-backend": backend } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message || err), global: 0, countries: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // same as GET: increment and return counts
  return GET(req);
}
