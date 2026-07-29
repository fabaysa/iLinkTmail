import { NextResponse } from "next/server";
import { getMailDomains } from "@/lib/env";
import { consumeCreateLimit } from "@/lib/rate-limit";
import { generateAccessToken, hashToken, normalizeLocalPart } from "@/lib/security";
import { supabaseRest } from "@/lib/supabase-rest";

const ALLOWED_TTLS = new Set([10, 60, 360, 1440]);

export async function POST(request: Request) {
  try {
    if (!(await consumeCreateLimit(request))) return NextResponse.json({ error: "Batas pembuatan inbox tercapai. Coba lagi nanti." }, { status: 429 });
    const body = await request.json().catch(() => ({}));
    const localPart = normalizeLocalPart(body.localPart);
    const domain = String(body.domain || "").trim().toLowerCase();
    const ttlMinutes = Number(body.ttlMinutes);
    const domains = getMailDomains();
    if (!domains.includes(domain)) return NextResponse.json({ error: "Domain email tidak tersedia." }, { status: 400 });
    if (!ALLOWED_TTLS.has(ttlMinutes)) return NextResponse.json({ error: "Masa aktif tidak valid." }, { status: 400 });

    const token = generateAccessToken();
    const address = `${localPart}@${domain}`;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
    await supabaseRest(`inboxes?address=eq.${encodeURIComponent(address)}&expires_at=lt.${encodeURIComponent(new Date().toISOString())}&deleted_at=is.null`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    });
    await supabaseRest("inboxes", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ local_part: localPart, domain, address, access_token_hash: hashToken(token), expires_at: expiresAt }),
    });
    return NextResponse.json({ address, expiresAt, inboxUrl: `/inbox/${token}` }, { status: 201 });
  } catch (error) {
    const typed = error as Error & { code?: string };
    if (typed.code === "23505") return NextResponse.json({ error: "Alamat tersebut sedang digunakan. Pilih nama lain." }, { status: 409 });
    return NextResponse.json({ error: typed.message || "Gagal membuat inbox." }, { status: 500 });
  }
}
