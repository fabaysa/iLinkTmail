create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists domains_lower_unique
  on public.domains (lower(domain));

alter table public.domains enable row level security;

revoke all on public.domains from anon, authenticated;
grant all on public.domains to service_role;
