-- Harden legacy public intake policies without changing existing data.
-- Anonymous execution of is_marketplace_admin remains required because
-- admin policies coexist with public SELECT policies on catalog tables.

create or replace function private.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select role from public.marketplace_profiles where id = auth.uid()),
    auth.role(),
    'anon'
  )
$$;

create or replace function private.is_marketplace_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_app_role() in (
    'admin',
    'marketplace_admin',
    'reviewer',
    'support',
    'internal_job'
  )
$$;

revoke all on function private.current_app_role() from public;
revoke execute on function private.current_app_role() from anon;
grant execute on function private.current_app_role() to authenticated;

revoke all on function private.is_marketplace_admin() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_marketplace_admin() to anon, authenticated;

drop policy if exists "click events public insert"
  on public.marketplace_click_events;
drop policy if exists "click events constrained public insert"
  on public.marketplace_click_events;

create policy "click events constrained public insert"
  on public.marketplace_click_events
  for insert
  with check (
    (user_id is null or user_id = auth.uid())
    and (source is null or char_length(source) between 1 and 100)
    and jsonb_typeof(metadata) = 'object'
    and (
      (product_id is null and supplier_id is null)
      or exists (
        select 1
        from public.marketplace_products product
        where product.id = marketplace_click_events.product_id
          and product.publication_status = 'published'
          and product.compliance_status = 'approved'
          and product.risk_level = 'low'
          and (
            marketplace_click_events.supplier_id is null
            or marketplace_click_events.supplier_id = product.supplier_id
          )
      )
    )
  );

drop policy if exists "consultations public insert"
  on public.beauty_consultations;
drop policy if exists "consultations constrained public insert"
  on public.beauty_consultations;

create policy "consultations constrained public insert"
  on public.beauty_consultations
  for insert
  with check (
    (user_id is null or user_id = auth.uid())
    and status = 'submitted'
    and admin_notes is null
    and cardinality(recommended_product_ids) = 0
    and jsonb_typeof(answers) = 'object'
  );

alter table public.autopilot_research_runs enable row level security;
alter table public.autopilot_brand_candidates enable row level security;
alter table public.autopilot_supplier_contacts enable row level security;
alter table public.autopilot_import_requirements enable row level security;

revoke all on public.autopilot_research_runs from anon;
revoke all on public.autopilot_brand_candidates from anon;
revoke all on public.autopilot_supplier_contacts from anon;
revoke all on public.autopilot_import_requirements from anon;
