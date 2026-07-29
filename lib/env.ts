export function getMailDomains(): string[] {
  return (process.env.NEXT_PUBLIC_MAIL_DOMAINS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function requireServerEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY" | "RATE_LIMIT_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} belum diatur.`);
  return value;
}
