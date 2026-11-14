import { getMailDomains } from "@/lib/env";
import { supabaseRest } from "@/lib/supabase-rest";

const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
const BLOCKED_SUFFIXES = [".local", ".localhost", ".internal", ".invalid"];

type DomainRow = { domain: string };

export class DomainInputError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DomainInputError";
    this.status = status;
  }
}

function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(error: unknown): boolean {
  const typed = error as { code?: string; status?: number } | null;
  return typed?.code === "42P01" || typed?.code === "PGRST205" || typed?.status === 404;
}

/**
 * Normalizes and validates a user-supplied email domain (strips leading "@").
 */
export function normalizeDomain(value: unknown): string {
  const cleaned = typeof value === "string" ? value.trim().toLowerCase().replace(/^@+/, "") : "";
  if (!cleaned) throw new DomainInputError("Masukkan nama domain terlebih dahulu.");
  if (cleaned.length < 4 || cleaned.length > 120) {
    throw new DomainInputError("Panjang domain harus 4–120 karakter.");
  }
  if (!DOMAIN_PATTERN.test(cleaned)) {
    throw new DomainInputError("Format domain tidak valid. Contoh: mail.domainanda.com");
  }
  if (BLOCKED_SUFFIXES.some((suffix) => cleaned.endsWith(suffix))) {
    throw new DomainInputError("Domain lokal/internal tidak dapat digunakan.");
  }
  return cleaned;
}

function mergeDomains(envDomains: string[], storedDomains: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const item of [...envDomains, ...storedDomains]) {
    const normalized = item.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    merged.push(normalized);
  }
  return merged;
}

/**
 * Returns the deduplicated list of configured env domains and stored Supabase domains.
 */
export async function listAvailableDomains(): Promise<string[]> {
  const envDomains = getMailDomains();
  if (!hasSupabaseConfig()) return envDomains;

  try {
    const rows = await supabaseRest<DomainRow[]>("domains?select=domain&order=created_at.asc");
    return mergeDomains(
      envDomains,
      rows.map((row) => row.domain),
    );
  } catch (error) {
    if (isMissingTableError(error)) return envDomains;
    throw error;
  }
}

/**
 * Validates and persists a new custom domain in Supabase, returning the updated domain list.
 */
export async function addCustomDomain(value: unknown): Promise<{ domain: string; domains: string[] }> {
  const domain = normalizeDomain(value);
  const existing = await listAvailableDomains();
  if (existing.includes(domain)) {
    throw new DomainInputError("Domain tersebut sudah tersedia di daftar.", 409);
  }

  try {
    await supabaseRest("domains", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ domain }),
    });
  } catch (error) {
    const typed = error as Error & { code?: string; status?: number };
    if (typed.code === "23505") {
      throw new DomainInputError("Domain tersebut sudah tersedia di daftar.", 409);
    }
    if (isMissingTableError(error)) {
      throw new DomainInputError(
        "Tabel domains belum dibuat di Supabase. Jalankan supabase/migrations/002_domains.sql terlebih dahulu.",
        503,
      );
    }
    throw error;
  }

  const domains = await listAvailableDomains();
  return { domain, domains: domains.includes(domain) ? domains : [...domains, domain] };
}
