import { createHash } from "node:crypto";
import { requireServerEnv } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase-rest";

async function consumeRateLimit(request: Request, scope: string, limit: number, windowSeconds: number) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const secret = requireServerEnv("RATE_LIMIT_SECRET");
  const rawKey = scope ? `${secret}:${scope}:${ip}` : `${secret}:${ip}`;
  const key = createHash("sha256").update(rawKey).digest("hex");
  return Boolean(await supabaseRpc<boolean>("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  }));
}

export async function consumeCreateLimit(request: Request) {
  return consumeRateLimit(request, "", 12, 3600);
}

export async function consumeDomainAddLimit(request: Request) {
  return consumeRateLimit(request, "domain", 15, 3600);
}
