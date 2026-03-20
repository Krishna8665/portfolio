#!/usr/bin/env node
// Simple migration script to sum per-country counts into visits:global for Upstash
// Usage: UPSTASH_REDIS_REST_URL=<url> UPSTASH_REDIS_REST_TOKEN=<token> node scripts/migrate-upstash.js
const { Redis } = require("@upstash/redis");

async function run() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.error(
      "Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars"
    );
    process.exit(1);
  }

  const redis = new Redis({ url, token });
  try {
    console.log("Fetching per-country counts (visits:country)...");
    const raw = await redis.hgetall("visits:country");
    let sum = 0;
    if (raw) {
      if (Array.isArray(raw)) {
        for (let i = 0; i < raw.length; i += 2) {
          const v = Number(raw[i + 1] ?? 0);
          sum += v;
        }
      } else if (typeof raw === "object") {
        Object.values(raw).forEach((v) => {
          sum += Number(v ?? 0);
        });
      }
    }

    console.log("Current summed total from countries:", sum);
    console.log("Writing to visits:global...");
    await redis.set("visits:global", String(sum));

    console.log("Deleting visits:country and visits:country_names keys...");
    await redis.del("visits:country");
    await redis.del("visits:country_names");

    console.log("Migration complete. visits:global set to", sum);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
