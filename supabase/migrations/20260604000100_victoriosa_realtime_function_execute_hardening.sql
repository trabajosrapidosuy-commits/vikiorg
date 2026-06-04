-- Victoriosa realtime function hardening
-- Local-only until explicit remote authorization.
-- Revokes public execution on SECURITY DEFINER realtime broadcast helpers while
-- preserving internal trigger-based execution semantics.

do $$
declare
  target_function regprocedure;
begin
  for target_function in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'autopilot_discovery_runs_realtime_broadcast',
        'marketplace_orders_realtime_broadcast',
        'marketplace_products_realtime_broadcast'
      )
  loop
    execute format('revoke all on function %s from public;', target_function);
    execute format('revoke execute on function %s from anon;', target_function);
    execute format('revoke execute on function %s from authenticated;', target_function);
  end loop;
end
$$;
