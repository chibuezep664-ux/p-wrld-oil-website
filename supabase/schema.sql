-- Run in the Supabase SQL Editor. Do not expose the service-role key to clients.
create extension if not exists pgcrypto;

create table if not exists public.enquiries (
 id uuid primary key default gen_random_uuid(),
 customer_name text not null check (char_length(customer_name) between 2 and 120),
 company_name text check (company_name is null or char_length(company_name)<=120),
 email text not null check (char_length(email)<=254),
 telephone text check (telephone is null or char_length(telephone)<=40),
 enquiry_type text not null check (enquiry_type in ('quotation','product','bulk','general')),
 product_category text not null check (char_length(product_category) between 2 and 100),
 quantity text check (quantity is null or char_length(quantity)<=100),
 destination_country text check (destination_country is null or char_length(destination_country)<=100),
 message text not null check (char_length(message) between 10 and 4000),
 status text not null default 'new' check (status in ('new','in_progress','quoted','closed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists enquiries_created_at_idx on public.enquiries(created_at desc);
create index if not exists enquiries_status_created_idx on public.enquiries(status,created_at desc);
create index if not exists enquiries_email_idx on public.enquiries(email);
alter table public.enquiries enable row level security;
alter table public.enquiries force row level security;
-- No direct anon/authenticated read or write policies. Trusted server routes insert/read after checks.
revoke all on public.enquiries from anon, authenticated;
grant select,update on public.enquiries to authenticated;
grant select,insert,update on public.enquiries to service_role;

-- Admin identity registry; provision rows only from the SQL Editor (service role).
create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null unique,
 created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated, service_role;
create or replace function public.is_enquiry_admin() returns boolean
language sql stable security definer set search_path=public,auth
as $$ select exists(select 1 from public.admin_users a where a.user_id=auth.uid() and lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))) $$;
revoke all on function public.is_enquiry_admin() from public;
grant execute on function public.is_enquiry_admin() to authenticated;
create policy "Authorized administrators read enquiries" on public.enquiries for select to authenticated using (public.is_enquiry_admin());
create policy "Authorized administrators update enquiries" on public.enquiries for update to authenticated using (public.is_enquiry_admin()) with check (public.is_enquiry_admin());
create policy "Administrators view their registry entry" on public.admin_users for select to authenticated using (user_id=auth.uid());

create table if not exists public.admin_audit_log (
 id bigint generated always as identity primary key,
 admin_email text not null,
 action text not null,
 enquiry_id uuid references public.enquiries(id) on delete set null,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
alter table public.admin_audit_log force row level security;
revoke all on public.admin_audit_log from anon, authenticated;
grant insert,select on public.admin_audit_log to service_role;
create index if not exists admin_audit_created_at_idx on public.admin_audit_log(created_at desc);

-- Atomic shared rate limiter for serverless route handlers. Fail-closed if unavailable.
create table if not exists public.rate_limits (
 key text primary key,
 window_started_at timestamptz not null,
 request_count integer not null check(request_count>=0)
);
alter table public.rate_limits enable row level security;
alter table public.rate_limits force row level security;
revoke all on public.rate_limits from anon, authenticated;
grant all on public.rate_limits to service_role;
create or replace function public.consume_rate_limit(p_key text,p_limit integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path=public
as $$ declare current_count integer; started timestamptz; begin
 if p_limit<1 or p_window_seconds<1 or length(p_key)>200 then return false; end if;
 insert into public.rate_limits(key,window_started_at,request_count) values(p_key,now(),1)
 on conflict(key) do update set
  request_count=case when rate_limits.window_started_at <= now()-(p_window_seconds * interval '1 second') then 1 else rate_limits.request_count+1 end,
  window_started_at=case when rate_limits.window_started_at <= now()-(p_window_seconds * interval '1 second') then now() else rate_limits.window_started_at end
 returning request_count,window_started_at into current_count,started;
 return current_count<=p_limit;
end $$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;
