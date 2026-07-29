import { NextResponse } from "next/server";
import { supabaseRpc } from "@/lib/supabase-rest";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authorization !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const removed = await supabaseRpc<number>("cleanup_expired_inboxes", {});
    return NextResponse.json({ ok: true, removed });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Cleanup failed" }, { status: 500 });
  }
}
