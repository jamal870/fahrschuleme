REVOKE EXECUTE ON FUNCTION public.auto_decrement_spots() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.auto_decrement_spots() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;