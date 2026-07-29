import { createHash } from "node:crypto";
import { requireServerEnv } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase-rest";

export async function consumeCreateLimit(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const key = createHash("sha256").update(`${requireServerEnv("RATE_LIMIT_SECRET")}:${ip}`).digest("hex");
  return Boolean(await supabaseRpc<boolean>("consume_rate_limit", {
    p_key: key,
    p_limit: 12,
    p_window_seconds: 3600,
  }));
}
