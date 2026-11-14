import { NextResponse } from "next/server";
import { getMailDomains } from "@/lib/env";
import { consumeCreateLimit } from "@/lib/rate-limit";
import { generateAccessToken, hashToken, normalizeLocalPart, randomLocalPart } from "@/lib/security";
import { supabaseRest } from "@/lib/supabase-rest";

const ALLOWED_TTLS = new Set([10, 60, 360, 1440]);
const MAX_RANDOM_ATTEMPTS = 5;

async function createUniqueInbox(localPart: string, domain: string, ttlMinutes: number) {
  const token = generateAccessToken();
  const address = `${localPart}@${domain}`;
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

  await supabaseRest(`inboxes?address=eq.${encodeURIComponent(address)}&expires_at=lt.${encodeURIComponent(nowIso)}&deleted_at=is.null`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ deleted_at: nowIso }),
  });
  await supabaseRest("inboxes", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ local_part: localPart, domain, address, access_token_hash: hashToken(token), expires_at: expiresAt }),
  });
  return { address, expiresAt, inboxUrl: `/inbox/${token}` };
}

export async function POST(request: Request) {
  try {
    if (!(await consumeCreateLimit(request))) return NextResponse.json({ error: "Batas pembuatan inbox tercapai. Coba lagi nanti." }, { status: 429 });
    const body = await request.json().catch(() => ({}));
    const rawLocalPart = typeof body.localPart === "string" ? body.localPart.trim() : "";
    const isRandom = !rawLocalPart;
    const domain = String(body.domain || "").trim().toLowerCase();
    const ttlMinutes = Number(body.ttlMinutes);
    const domains = getMailDomains();
    if (!domains.includes(domain)) return NextResponse.json({ error: "Domain email tidak tersedia." }, { status: 400 });
    if (!ALLOWED_TTLS.has(ttlMinutes)) return NextResponse.json({ error: "Masa aktif tidak valid." }, { status: 400 });

    const maxAttempts = isRandom ? MAX_RANDOM_ATTEMPTS : 1;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const localPart = isRandom ? randomLocalPart() : normalizeLocalPart(rawLocalPart);
      try {
        const created = await createUniqueInbox(localPart, domain, ttlMinutes);
        return NextResponse.json(created, { status: 201 });
      } catch (error) {
        const typed = error as Error & { code?: string };
        if (typed.code === "23505" && isRandom) {
          if (attempt < maxAttempts - 1) continue;
          break;
        }
        throw error;
      }
    }
    return NextResponse.json({ error: "Gagal membuat alamat acak unik. Coba lagi." }, { status: 409 });
  } catch (error) {
    const typed = error as Error & { code?: string };
    if (typed.code === "23505") return NextResponse.json({ error: "Alamat tersebut sedang digunakan. Pilih nama lain." }, { status: 409 });
    return NextResponse.json({ error: typed.message || "Gagal membuat inbox." }, { status: 500 });
  }
}
