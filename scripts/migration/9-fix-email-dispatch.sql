-- ---------------------------------------------------------------------------
-- 9-fix-email-dispatch.sql
-- Self-hosted Stacks haben kein Supabase Vault. email_queue_dispatch()/
-- email_queue_wake() lesen den Service-Role-Key daher aus einer geschuetzten
-- Config-Tabelle statt aus vault.decrypted_secrets.
--
-- Vor dem Ausfuehren die beiden \set-Werte anpassen (oder per -v uebergeben).
-- ---------------------------------------------------------------------------

create table if not exists public.email_dispatch_config (
  id                integer primary key default 1,
  functions_base_url text not null,
  service_role_key   text not null,
  updated_at         timestamptz not null default now(),
  constraint email_dispatch_config_singleton check (id = 1)
);

-- Niemand ausser dem Superuser/Owner darf den Key lesen.
revoke all on public.email_dispatch_config from public, anon, authenticated;
alter table public.email_dispatch_config enable row level security;

insert into public.email_dispatch_config (id, functions_base_url, service_role_key)
values (1, :'functions_base_url', :'service_role_key')
on conflict (id) do update
  set functions_base_url = excluded.functions_base_url,
      service_role_key   = excluded.service_role_key,
      updated_at         = now();

create or replace function public.email_queue_dispatch()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  cfg record;
begin
  if not exists (select 1 from pgmq.q_auth_emails)
     and not exists (select 1 from pgmq.q_transactional_emails) then
    begin
      perform pg_catalog.pg_advisory_xact_lock(7700000000000001);
      if exists (select 1 from pgmq.q_auth_emails)
         or exists (select 1 from pgmq.q_transactional_emails) then
        return;
      end if;
      perform cron.unschedule('process-email-queue');
    exception when others then
      raise warning 'email_queue_dispatch: cron unschedule failed: %', sqlerrm;
    end;
    return;
  end if;

  if (select retry_after_until from public.email_send_state where id = 1) > now() then
    return;
  end if;

  select functions_base_url, service_role_key into cfg
  from public.email_dispatch_config where id = 1;

  if cfg is null then
    raise warning 'email_queue_dispatch: keine Config in public.email_dispatch_config';
    return;
  end if;

  perform net.http_post(
    url := cfg.functions_base_url || '/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'Authorization', 'Bearer ' || cfg.service_role_key
    ),
    body := '{}'::jsonb
  );
end;
$function$;

create or replace function public.email_queue_wake()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  cfg record;
begin
  perform pg_catalog.pg_advisory_xact_lock(7700000000000001);
  if not exists (select 1 from cron.job where jobname = 'process-email-queue') then
    begin
      perform cron.schedule('process-email-queue', '5 seconds', $cron$ select public.email_queue_dispatch(); $cron$);
    exception when others then
      raise warning 'email_queue_wake: cron schedule failed: %', sqlerrm;
    end;
  end if;

  begin
    select functions_base_url, service_role_key into cfg
    from public.email_dispatch_config where id = 1;

    if cfg is not null then
      perform net.http_post(
        url := cfg.functions_base_url || '/process-email-queue',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Lovable-Context', 'cron',
          'Authorization', 'Bearer ' || cfg.service_role_key
        ),
        body := '{}'::jsonb
      );
    end if;
  exception when others then null;
  end;

  return null;
exception when others then
  raise warning 'email_queue_wake failed (enqueue preserved): %', sqlerrm;
  return null;
end;
$function$;

-- Sofort einmal anstossen, damit wartende Mails rausgehen.
select public.email_queue_dispatch();
