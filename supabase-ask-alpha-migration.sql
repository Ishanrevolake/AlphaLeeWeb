-- Ask Alpha paid Q&A migration
-- Run this in the Supabase SQL Editor for the existing Alpha Lee Fitness project.

CREATE TABLE IF NOT EXISTS public.ask_alpha_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  price_lkr INTEGER NOT NULL,
  question_credits INTEGER NOT NULL DEFAULT 1 CHECK (question_credits > 0),
  response_window_hours INTEGER NOT NULL DEFAULT 72,
  is_video_review BOOLEAN NOT NULL DEFAULT false,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.ask_alpha_products (
  id,
  title,
  subtitle,
  description,
  price_lkr,
  question_credits,
  response_window_hours,
  is_video_review,
  features,
  sort_order
)
VALUES
  (
    'single-question',
    '1 Question Credit',
    'One focused answer',
    'Best for one clear training, nutrition, or progress question.',
    3500,
    1,
    72,
    false,
    ARRAY[
      'One focused written response',
      'Training or nutrition clarification',
      'Reply inside your client dashboard',
      'No full programme design included'
    ],
    10
  ),
  (
    'three-question-pack',
    '3 Question Pack',
    'Save on follow-up questions',
    'Useful when you have a few connected questions to ask over time.',
    9000,
    3,
    72,
    false,
    ARRAY[
      'Three separate question credits',
      'Use credits when you need them',
      'Reply inside your client dashboard',
      'Best value for ongoing clarifications'
    ],
    20
  ),
  (
    'video-form-review',
    'Video Form Review',
    'Technique feedback',
    'Ask one question and include a lifting video link for form feedback.',
    6500,
    1,
    72,
    true,
    ARRAY[
      'One exercise technique review',
      'Submit a video link with your question',
      'Actionable form feedback',
      'Not a full training plan'
    ],
    30
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  price_lkr = EXCLUDED.price_lkr,
  question_credits = EXCLUDED.question_credits,
  response_window_hours = EXCLUDED.response_window_hours,
  is_video_review = EXCLUDED.is_video_review,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

CREATE TABLE IF NOT EXISTS public.ask_alpha_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.ask_alpha_products(id) ON DELETE RESTRICT,
  product_title TEXT NOT NULL,
  question_credits INTEGER NOT NULL CHECK (question_credits > 0),
  amount_lkr INTEGER NOT NULL,
  method TEXT NOT NULL DEFAULT 'bank',
  reference TEXT NOT NULL UNIQUE,
  status public.payment_status NOT NULL DEFAULT 'pending_verification',
  slip_file_name TEXT,
  slip_storage_path TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS public.ask_alpha_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ask_alpha_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ask_alpha_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.ask_alpha_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'coach', 'admin')),
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ask_alpha_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ask_alpha_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ask_alpha_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ask_alpha_messages ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS ask_alpha_products_touch_updated_at ON public.ask_alpha_products;
CREATE TRIGGER ask_alpha_products_touch_updated_at
  BEFORE UPDATE ON public.ask_alpha_products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS ask_alpha_threads_touch_updated_at ON public.ask_alpha_threads;
CREATE TRIGGER ask_alpha_threads_touch_updated_at
  BEFORE UPDATE ON public.ask_alpha_threads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.touch_ask_alpha_thread_from_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.ask_alpha_threads
  SET updated_at = NEW.created_at
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ask_alpha_messages_touch_thread ON public.ask_alpha_messages;
CREATE TRIGGER ask_alpha_messages_touch_thread
  AFTER INSERT ON public.ask_alpha_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_ask_alpha_thread_from_message();

CREATE OR REPLACE FUNCTION public.ask_alpha_used_credits(target_order_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::INTEGER
  FROM public.ask_alpha_threads
  WHERE order_id = target_order_id;
$$;

DROP POLICY IF EXISTS "Ask Alpha products are publicly visible" ON public.ask_alpha_products;
CREATE POLICY "Ask Alpha products are publicly visible"
  ON public.ask_alpha_products FOR SELECT
  USING (is_active OR public.is_staff());

DROP POLICY IF EXISTS "Staff can manage Ask Alpha products" ON public.ask_alpha_products;
CREATE POLICY "Staff can manage Ask Alpha products"
  ON public.ask_alpha_products FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Clients can create own Ask Alpha orders" ON public.ask_alpha_orders;
CREATE POLICY "Clients can create own Ask Alpha orders"
  ON public.ask_alpha_orders FOR INSERT
  WITH CHECK (public.is_record_owner(user_id));

DROP POLICY IF EXISTS "Ask Alpha orders visible to owner and staff" ON public.ask_alpha_orders;
CREATE POLICY "Ask Alpha orders visible to owner and staff"
  ON public.ask_alpha_orders FOR SELECT
  USING (public.is_record_owner(user_id) OR public.is_staff());

DROP POLICY IF EXISTS "Staff can manage Ask Alpha orders" ON public.ask_alpha_orders;
CREATE POLICY "Staff can manage Ask Alpha orders"
  ON public.ask_alpha_orders FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Ask Alpha threads visible to owner and staff" ON public.ask_alpha_threads;
CREATE POLICY "Ask Alpha threads visible to owner and staff"
  ON public.ask_alpha_threads FOR SELECT
  USING (public.is_record_owner(user_id) OR public.is_staff());

DROP POLICY IF EXISTS "Clients can create own verified Ask Alpha threads" ON public.ask_alpha_threads;
CREATE POLICY "Clients can create own verified Ask Alpha threads"
  ON public.ask_alpha_threads FOR INSERT
  WITH CHECK (
    public.is_record_owner(user_id)
    AND EXISTS (
      SELECT 1
      FROM public.ask_alpha_orders aao
      WHERE aao.id = order_id
        AND aao.user_id = auth.uid()
        AND aao.status = 'verified'
        AND public.ask_alpha_used_credits(aao.id) < aao.question_credits
    )
  );

DROP POLICY IF EXISTS "Clients can update own Ask Alpha threads" ON public.ask_alpha_threads;
CREATE POLICY "Clients can update own Ask Alpha threads"
  ON public.ask_alpha_threads FOR UPDATE
  USING (public.is_record_owner(user_id))
  WITH CHECK (public.is_record_owner(user_id));

DROP POLICY IF EXISTS "Staff can manage Ask Alpha threads" ON public.ask_alpha_threads;
CREATE POLICY "Staff can manage Ask Alpha threads"
  ON public.ask_alpha_threads FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Ask Alpha messages visible through thread" ON public.ask_alpha_messages;
CREATE POLICY "Ask Alpha messages visible through thread"
  ON public.ask_alpha_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.ask_alpha_threads aat
      WHERE aat.id = thread_id
        AND (aat.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "Clients can message own Ask Alpha threads" ON public.ask_alpha_messages;
CREATE POLICY "Clients can message own Ask Alpha threads"
  ON public.ask_alpha_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'client'
    AND EXISTS (
      SELECT 1
      FROM public.ask_alpha_threads aat
      WHERE aat.id = thread_id
        AND aat.user_id = auth.uid()
        AND aat.status <> 'closed'
    )
  );

DROP POLICY IF EXISTS "Staff can manage Ask Alpha messages" ON public.ask_alpha_messages;
CREATE POLICY "Staff can manage Ask Alpha messages"
  ON public.ask_alpha_messages FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE INDEX IF NOT EXISTS ask_alpha_orders_user_id_idx ON public.ask_alpha_orders(user_id);
CREATE INDEX IF NOT EXISTS ask_alpha_orders_status_idx ON public.ask_alpha_orders(status);
CREATE INDEX IF NOT EXISTS ask_alpha_threads_user_id_idx ON public.ask_alpha_threads(user_id);
CREATE INDEX IF NOT EXISTS ask_alpha_threads_order_id_idx ON public.ask_alpha_threads(order_id);
CREATE INDEX IF NOT EXISTS ask_alpha_threads_updated_at_idx ON public.ask_alpha_threads(updated_at);
CREATE INDEX IF NOT EXISTS ask_alpha_messages_thread_id_idx ON public.ask_alpha_messages(thread_id);
