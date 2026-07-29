-- Run once in the Supabase SQL editor.
-- Makes Ask Alpha purchases visible to dashboards that verify public.payments.

BEGIN;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS ask_alpha_order_id UUID
  REFERENCES public.ask_alpha_orders(id) ON DELETE CASCADE;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS service_type TEXT NOT NULL DEFAULT 'programme'
  CHECK (service_type IN ('programme', 'ask_alpha'));

CREATE UNIQUE INDEX IF NOT EXISTS payments_ask_alpha_order_id_key
  ON public.payments(ask_alpha_order_id)
  WHERE ask_alpha_order_id IS NOT NULL;

INSERT INTO public.payments (
  user_id,
  ask_alpha_order_id,
  service_type,
  method,
  reference,
  amount_lkr,
  status,
  slip_file_name,
  slip_storage_path,
  submitted_at,
  verified_at,
  verified_by,
  rejection_reason
)
SELECT
  ask_order.user_id,
  ask_order.id,
  'ask_alpha',
  ask_order.method,
  ask_order.reference,
  ask_order.amount_lkr,
  ask_order.status,
  ask_order.slip_file_name,
  ask_order.slip_storage_path,
  ask_order.submitted_at,
  ask_order.verified_at,
  ask_order.verified_by,
  ask_order.rejection_reason
FROM public.ask_alpha_orders ask_order
WHERE NOT EXISTS (
  SELECT 1
  FROM public.payments payment
  WHERE payment.ask_alpha_order_id = ask_order.id
);

CREATE OR REPLACE FUNCTION public.sync_ask_alpha_order_from_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ask_alpha_order_id IS NOT NULL THEN
    UPDATE public.ask_alpha_orders
    SET
      status = NEW.status,
      verified_at = NEW.verified_at,
      verified_by = NEW.verified_by,
      rejection_reason = NEW.rejection_reason
    WHERE id = NEW.ask_alpha_order_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payments_sync_ask_alpha_order ON public.payments;
CREATE TRIGGER payments_sync_ask_alpha_order
  AFTER INSERT OR UPDATE OF status, verified_at, verified_by, rejection_reason
  ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_ask_alpha_order_from_payment();

COMMIT;
