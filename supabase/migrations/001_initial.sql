create extension if not exists pgcrypto;

create table if not exists public.inboxes (
  id uuid primary key default gen_random_uuid(),
  local_part text not null,
  domain text not null,
  address text not null,
  access_token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_access_at timestamptz,
  deleted_at timestamptz,
  constraint inbox_address_format check (address = local_part || '@' || domain)
);

create unique index if not exists inboxes_active_address_unique
  on public.inboxes (lower(address))
  where deleted_at is null;
create index if not exists inboxes_expiry_idx on public.inboxes (expires_at);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  inbox_id uuid not null references public.inboxes(id) on delete cascade,
  external_message_id text,
  sender text not null default '',
  recipients text[] not null default '{}',
  subject text not null default '',
  snippet text not null default '',
  text_body text,
  html_body text,
  headers jsonb not null default '{}'::jsonb,
  size_bytes integer not null default 0,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists messages_external_id_unique
  on public.messages (external_message_id)
  where external_message_id is not null;
create index if not exists messages_inbox_received_idx on public.messages (inbox_id, received_at desc);

create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  request_count integer not null default 0
);

alter table public.inboxes enable row level security;
alter table public.messages enable row level security;
alter table public.rate_limits enable row level security;

revoke all on public.inboxes from anon, authenticated;
revoke all on public.messages from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;
grant all on public.inboxes to service_role;
grant all on public.messages to service_role;
grant all on public.rate_limits to service_role;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.rate_limits;
begin
  insert into public.rate_limits(key, window_start, request_count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case
      when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then now()
      else public.rate_limits.window_start
    end,
    request_count = case
      when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then 1
      else public.rate_limits.request_count + 1
    end
  returning * into current_row;

  return current_row.request_count <= p_limit;
end;
$$;

create or replace function public.cleanup_expired_inboxes()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  delete from public.inboxes
  where expires_at < now() - interval '24 hours'
     or deleted_at < now() - interval '1 hour';
  get diagnostics affected = row_count;

  delete from public.rate_limits
  where window_start < now() - interval '2 days';

  return affected;
end;
$$;

grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
grant execute on function public.cleanup_expired_inboxes() to service_role;
