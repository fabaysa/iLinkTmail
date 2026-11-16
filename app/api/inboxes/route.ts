import { NextResponse } from "next/server";
import { listAvailableDomains } from "@/lib/domains";
import { consumeCreateLimit } from "@/lib/rate-limit";
import { generateAccessToken, hashToken, normalizeLocalPart, randomLocalPart } from "@/lib/security";
import { supabaseRest } from "@/lib/supabase-rest";

const ALLOWED_TTLS = new Set([10, 60, 360, 1440]);
const MAX_RANDOM_ATTEMPTS = 5;

async function createInbox(localPart: string, domain: string, ttlMinutes: number, replaceActive: boolean) {
  const token = generateAccessToken();
  const address = `${localPart}@${domain}`;
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

  // Reuse of a custom address closes any active/expired inbox at that address so the new inbox starts clean;
  // random generation only clears expired rows so it never displaces another active inbox.
  const closeFilter = replaceActive
    ? `inboxes?address=eq.${encodeURIComponent(address)}&deleted_at=is.null`
    : `inboxes?address=eq.${encodeURIComponent(address)}&expires_at=lt.${encodeURIComponent(nowIso)}&deleted_at=is.null`;

  await supabaseRest(closeFilter, {
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
    const domains = await listAvailableDomains();
    if (!domains.includes(domain)) return NextResponse.json({ error: "Domain email tidak tersedia." }, { status: 400 });
    if (!ALLOWED_TTLS.has(ttlMinutes)) return NextResponse.json({ error: "Masa aktif tidak valid." }, { status: 400 });

    const customLocalPart = isRandom ? null : normalizeLocalPart(rawLocalPart);
    const maxAttempts = isRandom ? MAX_RANDOM_ATTEMPTS : 2;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const localPart = customLocalPart ?? randomLocalPart();
      try {
        const created = await createInbox(localPart, domain, ttlMinutes, !isRandom);
        return NextResponse.json(created, { status: 201 });
      } catch (error) {
        const typed = error as Error & { code?: string };
        if (typed.code === "23505") {
          if (attempt < maxAttempts - 1) continue;
          break;
        }
        throw error;
      }
    }
    return NextResponse.json(
      { error: isRandom ? "Gagal membuat alamat acak unik. Coba lagi." : "Alamat email sedang diperbarui. Coba lagi." },
      { status: 409 },
    );
  } catch (error) {
    const typed = error as Error & { code?: string };
    return NextResponse.json({ error: typed.message || "Gagal membuat inbox." }, { status: 500 });
  }
}
