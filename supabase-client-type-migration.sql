-- Run once in the Supabase SQL editor.
-- Separates coaching clients from Ask Alpha-only clients without changing trainer access.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_access_type') THEN
    CREATE TYPE public.client_access_type AS ENUM ('main', 'ask_alpha', 'both');
  END IF;
END
$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS client_type public.client_access_type NOT NULL DEFAULT 'main';

UPDATE public.profiles profile
SET client_type = CASE
  WHEN EXISTS (SELECT 1 FROM public.payments payment WHERE payment.user_id = profile.id)
   AND EXISTS (SELECT 1 FROM public.ask_alpha_orders ask_order WHERE ask_order.user_id = profile.id)
    THEN 'both'::public.client_access_type
  WHEN EXISTS (SELECT 1 FROM public.ask_alpha_orders ask_order WHERE ask_order.user_id = profile.id)
    THEN 'ask_alpha'::public.client_access_type
  ELSE 'main'::public.client_access_type
END
WHERE profile.role = 'client';

COMMIT;
