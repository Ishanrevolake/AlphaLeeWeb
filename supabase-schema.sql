-- Alpha Lee Fitness Supabase schema
-- Run this in the Supabase SQL Editor for the project.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.app_role AS ENUM ('client', 'coach', 'admin');
CREATE TYPE public.payment_status AS ENUM ('pending_verification', 'verified', 'rejected');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'client',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  current_weight_kg NUMERIC,
  goal_weight_kg NUMERIC,
  experience_level TEXT,
  workout_location TEXT,
  workout_days TEXT,
  diet_preference TEXT,
  primary_goal TEXT,
  allergies TEXT,
  injuries TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.packages (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  letter TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  price_lkr INTEGER NOT NULL,
  old_price_text TEXT,
  strike_old_price BOOLEAN NOT NULL DEFAULT false,
  footer_text TEXT NOT NULL,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  detail_subtitle TEXT NOT NULL,
  example TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.packages (
  id,
  category,
  letter,
  title,
  subtitle,
  price_lkr,
  old_price_text,
  strike_old_price,
  footer_text,
  is_popular,
  detail_subtitle,
  example,
  features,
  sort_order
)
VALUES
  (
    'annual',
    'Annual',
    'A',
    'Annual Package',
    '12 Months',
    148500,
    'Rs. 360,000',
    true,
    '+ Top Tier Support',
    false,
    '12 Month service subscription. recommended for individuals with longterm goals',
    'Invest in the longer term & save yourself some dough',
    ARRAY[
      'Flexible meal plan adapted across the months',
      'Training plan personalized to goals & lifestyle',
      'Progress Check ins every 2 weeks for 3 months there on, every 4 weeks',
      'Dietary Supplementation guide',
      '48-72 Hour whatsapp reply guarantee',
      'Pause-resume service for legitimate reasons like health or travel',
      'Voice calls can be prescheduled'
    ],
    10
  ),
  (
    'rookie',
    'Bundles',
    'R',
    'Rookie Bundle',
    '03 Months',
    81500,
    null,
    false,
    '+ High Attention',
    true,
    '03 Month service subscription. recommended for individuals seeking higher levels of attention from the coaching service.',
    'Example: Beginners',
    ARRAY[
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every week for 4 weeks. There on, progress check ins every 2 weeks for continued plan adjustments',
      'Supplementation guide',
      '24-48 Hour whatsapp reply guarantee'
    ],
    20
  ),
  (
    'intermediate',
    'Bundles',
    'I',
    'Intermediate Bundle',
    '03 Months',
    66500,
    null,
    false,
    '+ Moderate Attention',
    false,
    '03 Month service subscription. recommended for individuals seeking moderate levels of attention from the coaching service.',
    'Example: experienced beginners or intermediates',
    ARRAY[
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every 2 weeks for 4 weeks. There on, progress check ins every 4 weeks for continued plan adjustments',
      'Supplementation guide',
      '48-72 Hour whatsapp reply guarantee'
    ],
    30
  ),
  (
    'advanced',
    'Bundles',
    'A',
    'Advanced Bundle',
    '06 Months',
    98500,
    null,
    false,
    '+ Lower Attention',
    false,
    '06 Month service subscription. recommended for individuals seeking lower levels of attention from the coaching service.',
    'Example: advanced or more independent intermediates',
    ARRAY[
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every 4 weeks for 3 months. There on, progress check ins every 6 weeks for continued plan adjustments',
      'Supplementation guide',
      '72-96 Hour whatsapp reply guarantee'
    ],
    40
  ),
  (
    'package-1',
    'Monthly',
    'P1',
    'Package 1',
    '1 Month',
    35500,
    'Rs. 33,500',
    false,
    '+ High Attention',
    false,
    '1 month service - charged monthly. High attention package.',
    'For maximum weekly accountability',
    ARRAY[
      'Meal plan personalized to your goals',
      '4 week training plan personalized to your fitness capacity and goals',
      'Weekly Progress Check ins for continued plan adjustments',
      'Alpha Chef recipe Ebook (30+ recipes)',
      'Supplementation guide',
      '24-48 Hour whatsapp reply guarantee'
    ],
    50
  ),
  (
    'package-2',
    'Monthly',
    'P2',
    'Package 2',
    '1 Month',
    32500,
    'Rs. 30,500',
    false,
    '+ Moderate Attention',
    false,
    '1 month service - charged monthly. moderate attention package.',
    'For standard accountability',
    ARRAY[
      'Meal plan personalized to your goals',
      '4 week training plan personalized to your fitness capacity and goals',
      'Progress Check ins every 2 weeks for continued plan adjustments',
      'Supplementation guide',
      '48-72 Hour whatsapp reply guarantee'
    ],
    60
  ),
  (
    'training-only',
    'One-Off',
    'T',
    'Training Plan Only',
    '6 Weeks',
    22500,
    null,
    false,
    'No Coaching',
    false,
    'One-time plans that include a customized training plan only.',
    '6 week training plan',
    ARRAY[
      'Built to your fitness levels',
      'Customised to your gym or home training environment',
      'Customised to your physique goals',
      'Not online coaching'
    ],
    70
  ),
  (
    'meal-only',
    'One-Off',
    'M',
    'Meal Plan Only',
    'One Time',
    22500,
    null,
    false,
    'No Coaching',
    false,
    'One-time plans that include a customized meal plan only.',
    'One time meal plan',
    ARRAY[
      'Meal plan personalized to your goals',
      'Meal options customised to your like and dislikes',
      'Supplementation guide',
      'Not online coaching'
    ],
    80
  )
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  letter = EXCLUDED.letter,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  price_lkr = EXCLUDED.price_lkr,
  old_price_text = EXCLUDED.old_price_text,
  strike_old_price = EXCLUDED.strike_old_price,
  footer_text = EXCLUDED.footer_text,
  is_popular = EXCLUDED.is_popular,
  detail_subtitle = EXCLUDED.detail_subtitle,
  example = EXCLUDED.example,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

CREATE TABLE public.package_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  onboarding_submission_id UUID REFERENCES public.onboarding_submissions(id) ON DELETE SET NULL,
  package_id TEXT NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
  package_title TEXT NOT NULL,
  package_category TEXT NOT NULL,
  package_subtitle TEXT NOT NULL,
  base_price_lkr INTEGER NOT NULL,
  reply_guarantee_addon BOOLEAN NOT NULL DEFAULT false,
  addon_price_lkr INTEGER NOT NULL DEFAULT 0,
  total_price_lkr INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_selection_id UUID REFERENCES public.package_selections(id) ON DELETE SET NULL,
  method TEXT NOT NULL DEFAULT 'bank',
  reference TEXT NOT NULL UNIQUE,
  amount_lkr INTEGER NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending_verification',
  slip_file_name TEXT,
  slip_storage_path TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT
);

CREATE TABLE public.ask_alpha_products (
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

CREATE TABLE public.ask_alpha_orders (
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

CREATE TABLE public.ask_alpha_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ask_alpha_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ask_alpha_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.ask_alpha_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'coach', 'admin')),
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  starts_on DATE,
  ends_on DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_label TEXT,
  meal_label TEXT NOT NULL,
  food_items TEXT NOT NULL,
  calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fats_g NUMERIC,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.exercise_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  starts_on DATE,
  ends_on DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.exercise_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_plan_id UUID NOT NULL REFERENCES public.exercise_plans(id) ON DELETE CASCADE,
  day_label TEXT,
  exercise_name TEXT NOT NULL,
  sets TEXT,
  reps TEXT,
  tempo TEXT,
  rest_seconds INTEGER,
  notes TEXT,
  video_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.client_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_on DATE,
  status public.task_status NOT NULL DEFAULT 'todo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tracking_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT current_date,
  body_weight_kg NUMERIC,
  adherence_score INTEGER CHECK (adherence_score BETWEEN 1 AND 10),
  energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.progress_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  measured_on DATE NOT NULL DEFAULT current_date,
  body_weight_kg NUMERIC,
  waist_cm NUMERIC,
  chest_cm NUMERIC,
  hips_cm NUMERIC,
  thigh_cm NUMERIC,
  arm_cm NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_touch_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER onboarding_touch_updated_at
  BEFORE UPDATE ON public.onboarding_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER packages_touch_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ask_alpha_products_touch_updated_at
  BEFORE UPDATE ON public.ask_alpha_products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ask_alpha_threads_touch_updated_at
  BEFORE UPDATE ON public.ask_alpha_threads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER meal_plans_touch_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER exercise_plans_touch_updated_at
  BEFORE UPDATE ON public.exercise_plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER client_tasks_touch_updated_at
  BEFORE UPDATE ON public.client_tasks
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

CREATE TRIGGER ask_alpha_messages_touch_thread
  AFTER INSERT ON public.ask_alpha_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_ask_alpha_thread_from_message();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    TRIM(CONCAT(
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
    )),
    COALESCE(NEW.email, ''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
      AND role IN ('coach', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_record_owner(owner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() = owner_id;
$$;

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ask_alpha_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ask_alpha_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ask_alpha_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ask_alpha_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are visible to owner and staff"
  ON public.profiles FOR SELECT
  USING (public.is_record_owner(id) OR public.is_staff());

CREATE POLICY "Clients can update their own profile"
  ON public.profiles FOR UPDATE
  USING (public.is_record_owner(id))
  WITH CHECK (public.is_record_owner(id) AND role = 'client');

CREATE POLICY "Staff can manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Clients can create own onboarding"
  ON public.onboarding_submissions FOR INSERT
  WITH CHECK (public.is_record_owner(user_id));

CREATE POLICY "Onboarding visible to owner and staff"
  ON public.onboarding_submissions FOR SELECT
  USING (public.is_record_owner(user_id) OR public.is_staff());

CREATE POLICY "Staff can manage onboarding"
  ON public.onboarding_submissions FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Packages are publicly visible"
  ON public.packages FOR SELECT
  USING (is_active OR public.is_staff());

CREATE POLICY "Staff can manage packages"
  ON public.packages FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Clients can create own package selections"
  ON public.package_selections FOR INSERT
  WITH CHECK (public.is_record_owner(user_id));

CREATE POLICY "Package selections visible to owner and staff"
  ON public.package_selections FOR SELECT
  USING (public.is_record_owner(user_id) OR public.is_staff());

CREATE POLICY "Staff can manage package selections"
  ON public.package_selections FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Clients can create own payment records"
  ON public.payments FOR INSERT
  WITH CHECK (public.is_record_owner(user_id));

CREATE POLICY "Payments visible to owner and staff"
  ON public.payments FOR SELECT
  USING (public.is_record_owner(user_id) OR public.is_staff());

CREATE POLICY "Staff can manage payments"
  ON public.payments FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Ask Alpha products are publicly visible"
  ON public.ask_alpha_products FOR SELECT
  USING (is_active OR public.is_staff());

CREATE POLICY "Staff can manage Ask Alpha products"
  ON public.ask_alpha_products FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Clients can create own Ask Alpha orders"
  ON public.ask_alpha_orders FOR INSERT
  WITH CHECK (public.is_record_owner(user_id));

CREATE POLICY "Ask Alpha orders visible to owner and staff"
  ON public.ask_alpha_orders FOR SELECT
  USING (public.is_record_owner(user_id) OR public.is_staff());

CREATE POLICY "Staff can manage Ask Alpha orders"
  ON public.ask_alpha_orders FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Ask Alpha threads visible to owner and staff"
  ON public.ask_alpha_threads FOR SELECT
  USING (public.is_record_owner(user_id) OR public.is_staff());

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

CREATE POLICY "Clients can update own Ask Alpha threads"
  ON public.ask_alpha_threads FOR UPDATE
  USING (public.is_record_owner(user_id))
  WITH CHECK (public.is_record_owner(user_id));

CREATE POLICY "Staff can manage Ask Alpha threads"
  ON public.ask_alpha_threads FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

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

CREATE POLICY "Staff can manage Ask Alpha messages"
  ON public.ask_alpha_messages FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Meal plans visible to owner and staff"
  ON public.meal_plans FOR SELECT
  USING (public.is_record_owner(client_id) OR public.is_staff());

CREATE POLICY "Staff can manage meal plans"
  ON public.meal_plans FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Meal items visible through meal plan"
  ON public.meal_plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      WHERE mp.id = meal_plan_id
        AND (mp.client_id = auth.uid() OR public.is_staff())
    )
  );

CREATE POLICY "Staff can manage meal items"
  ON public.meal_plan_items FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Exercise plans visible to owner and staff"
  ON public.exercise_plans FOR SELECT
  USING (public.is_record_owner(client_id) OR public.is_staff());

CREATE POLICY "Staff can manage exercise plans"
  ON public.exercise_plans FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Exercise items visible through exercise plan"
  ON public.exercise_plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exercise_plans ep
      WHERE ep.id = exercise_plan_id
        AND (ep.client_id = auth.uid() OR public.is_staff())
    )
  );

CREATE POLICY "Staff can manage exercise items"
  ON public.exercise_plan_items FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Tasks visible to owner and staff"
  ON public.client_tasks FOR SELECT
  USING (public.is_record_owner(client_id) OR public.is_staff());

CREATE POLICY "Clients can update their own task status"
  ON public.client_tasks FOR UPDATE
  USING (public.is_record_owner(client_id))
  WITH CHECK (public.is_record_owner(client_id));

CREATE POLICY "Staff can manage tasks"
  ON public.client_tasks FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Clients can create own checkins"
  ON public.tracking_checkins FOR INSERT
  WITH CHECK (public.is_record_owner(client_id));

CREATE POLICY "Checkins visible to owner and staff"
  ON public.tracking_checkins FOR SELECT
  USING (public.is_record_owner(client_id) OR public.is_staff());

CREATE POLICY "Staff can manage checkins"
  ON public.tracking_checkins FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Clients can create own measurements"
  ON public.progress_measurements FOR INSERT
  WITH CHECK (public.is_record_owner(client_id));

CREATE POLICY "Measurements visible to owner and staff"
  ON public.progress_measurements FOR SELECT
  USING (public.is_record_owner(client_id) OR public.is_staff());

CREATE POLICY "Staff can manage measurements"
  ON public.progress_measurements FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-slips',
  'payment-slips',
  false,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Clients can upload own payment slips"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-slips'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Clients can view own payment slips"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-slips'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_staff()
    )
  );

CREATE INDEX onboarding_submissions_user_id_idx ON public.onboarding_submissions(user_id);
CREATE INDEX packages_category_idx ON public.packages(category);
CREATE INDEX package_selections_user_id_idx ON public.package_selections(user_id);
CREATE INDEX payments_user_id_idx ON public.payments(user_id);
CREATE INDEX ask_alpha_orders_user_id_idx ON public.ask_alpha_orders(user_id);
CREATE INDEX ask_alpha_orders_status_idx ON public.ask_alpha_orders(status);
CREATE INDEX ask_alpha_threads_user_id_idx ON public.ask_alpha_threads(user_id);
CREATE INDEX ask_alpha_threads_order_id_idx ON public.ask_alpha_threads(order_id);
CREATE INDEX ask_alpha_threads_updated_at_idx ON public.ask_alpha_threads(updated_at);
CREATE INDEX ask_alpha_messages_thread_id_idx ON public.ask_alpha_messages(thread_id);
CREATE INDEX meal_plans_client_id_idx ON public.meal_plans(client_id);
CREATE INDEX exercise_plans_client_id_idx ON public.exercise_plans(client_id);
CREATE INDEX client_tasks_client_id_idx ON public.client_tasks(client_id);
CREATE INDEX tracking_checkins_client_id_idx ON public.tracking_checkins(client_id);
CREATE INDEX progress_measurements_client_id_idx ON public.progress_measurements(client_id);
