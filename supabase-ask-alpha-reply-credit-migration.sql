-- Run once in the Supabase SQL editor.
-- Allows the initial message in a newly-created thread, but requires an
-- unused verified credit for subsequent client replies.

BEGIN;

DROP POLICY IF EXISTS "Clients can message own Ask Alpha threads"
  ON public.ask_alpha_messages;

CREATE POLICY "Clients can message own Ask Alpha threads"
  ON public.ask_alpha_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'client'
    AND EXISTS (
      SELECT 1
      FROM public.ask_alpha_threads thread
      JOIN public.ask_alpha_orders ask_order ON ask_order.id = thread.order_id
      WHERE thread.id = thread_id
        AND thread.user_id = auth.uid()
        AND thread.status <> 'closed'
        AND ask_order.status = 'verified'
        AND (
          NOT EXISTS (
            SELECT 1
            FROM public.ask_alpha_messages existing_message
            WHERE existing_message.thread_id = thread.id
          )
          OR (
            SELECT COALESCE(SUM(verified_order.question_credits), 0)
            FROM public.ask_alpha_orders verified_order
            WHERE verified_order.user_id = auth.uid()
              AND verified_order.status = 'verified'
          ) > (
            SELECT COUNT(*)
            FROM public.ask_alpha_threads used_thread
            WHERE used_thread.user_id = auth.uid()
          )
        )
    )
  );

COMMIT;
