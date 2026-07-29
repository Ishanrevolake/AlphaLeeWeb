-- Run once in the Supabase SQL editor.
-- The application supports exactly two profile roles: client and trainer.

BEGIN;

ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TYPE public.app_role RENAME TO app_role_legacy;
CREATE TYPE public.app_role AS ENUM ('client', 'trainer');

ALTER TABLE public.profiles
  ALTER COLUMN role TYPE public.app_role
  USING (
    CASE
      WHEN role::text = 'client' THEN 'client'
      ELSE 'trainer'
    END
  )::public.app_role;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'client'::public.app_role;

DROP TYPE public.app_role_legacy;

UPDATE public.ask_alpha_messages
SET sender_role = 'trainer'
WHERE sender_role IN ('coach', 'admin');

ALTER TABLE public.ask_alpha_messages
  DROP CONSTRAINT IF EXISTS ask_alpha_messages_sender_role_check;

ALTER TABLE public.ask_alpha_messages
  ADD CONSTRAINT ask_alpha_messages_sender_role_check
  CHECK (sender_role IN ('client', 'trainer'));

CREATE OR REPLACE FUNCTION public.is_staff(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
      AND role = 'trainer'
  );
$$;

COMMIT;
