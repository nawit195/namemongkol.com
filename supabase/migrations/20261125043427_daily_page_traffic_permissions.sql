-- Reset Supabase's default service-role grants; reporting events are append-only.
REVOKE ALL ON public.page_view_events FROM service_role;
GRANT SELECT, INSERT ON public.page_view_events TO service_role;
