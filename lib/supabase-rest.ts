import { requireServerEnv } from "@/lib/env";

const baseHeaders = () => {
  const key = requireServerEnv("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
};

export async function supabaseRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${requireServerEnv("SUPABASE_URL")}/rest/v1/${path}`, {
    ...init,
    headers: { ...baseHeaders(), ...(init.headers || {}) },
    cache: "no-store",
  });
  const text = await response.text();
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = { message: text }; }
  }
  if (!response.ok) {
    const message = data?.message || data?.error_description || data?.hint || `Supabase request failed (${response.status})`;
    const error = new Error(message) as Error & { code?: string; status?: number };
    error.code = data?.code;
    error.status = response.status;
    throw error;
  }
  return data as T;
}

export async function supabaseRpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  return supabaseRest<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}
