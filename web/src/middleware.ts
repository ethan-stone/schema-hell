import type { NextFetchEvent } from "next/server";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequestWithLogger } from "./utils/logging/middleware-logger";
import { withLogger } from "./utils/logging/middleware-logger";

const ratelimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  }),
  limiter: Ratelimit.fixedWindow(10, "10 s"),
});

async function middleware(
  req: NextRequestWithLogger,
  event: NextFetchEvent
): Promise<Response | undefined> {
  const { log } = req;

  const ip = req.ip ?? "127.0.0.1";

  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    `mw_${ip}`
  );

  if (!success)
    log.error(`RateLimit exceeded for IP: ${req.ip}`, {
      error: {
        code: "RATELIMIT_EXCEEDED",
      },
    });

  event.waitUntil(pending);

  const res = success
    ? NextResponse.next()
    : NextResponse.rewrite(new URL("/api/blocked", req.url));

  res.headers.set("X-RateLimit-Limit", limit.toString());
  res.headers.set("X-RateLimit-Remaining", remaining.toString());
  res.headers.set("X-RateLimit-Reset", reset.toString());
  return res;
}

export const config = {
  matcher: "/api/:path*",
};

export default withLogger(middleware);
