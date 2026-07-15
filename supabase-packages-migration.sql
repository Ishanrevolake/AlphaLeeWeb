-- Add a master packages table and seed it from the current app package list.
-- Run this in Supabase SQL Editor for an existing project.

CREATE TABLE IF NOT EXISTS public.packages (
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
  ('annual', 'Annual', 'A', 'Annual Package', '12 Months', 148500, 'Rs. 360,000', true, '+ Top Tier Support', false, '12 Month service subscription. recommended for individuals with longterm goals', 'Invest in the longer term & save yourself some dough', ARRAY['Flexible meal plan adapted across the months', 'Training plan personalized to goals & lifestyle', 'Progress Check ins every 2 weeks for 3 months there on, every 4 weeks', 'Dietary Supplementation guide', '48-72 Hour whatsapp reply guarantee', 'Pause-resume service for legitimate reasons like health or travel', 'Voice calls can be prescheduled'], 10),
  ('rookie', 'Bundles', 'R', 'Rookie Bundle', '03 Months', 81500, null, false, '+ High Attention', true, '03 Month service subscription. recommended for individuals seeking higher levels of attention from the coaching service.', 'Example: Beginners', ARRAY['Meal plan personalized to your goals', 'Training plan personalized to your fitness capacity', 'Progress Check ins every week for 4 weeks. There on, progress check ins every 2 weeks for continued plan adjustments', 'Supplementation guide', '24-48 Hour whatsapp reply guarantee'], 20),
  ('intermediate', 'Bundles', 'I', 'Intermediate Bundle', '03 Months', 66500, null, false, '+ Moderate Attention', false, '03 Month service subscription. recommended for individuals seeking moderate levels of attention from the coaching service.', 'Example: experienced beginners or intermediates', ARRAY['Meal plan personalized to your goals', 'Training plan personalized to your fitness capacity', 'Progress Check ins every 2 weeks for 4 weeks. There on, progress check ins every 4 weeks for continued plan adjustments', 'Supplementation guide', '48-72 Hour whatsapp reply guarantee'], 30),
  ('advanced', 'Bundles', 'A', 'Advanced Bundle', '06 Months', 98500, null, false, '+ Lower Attention', false, '06 Month service subscription. recommended for individuals seeking lower levels of attention from the coaching service.', 'Example: advanced or more independent intermediates', ARRAY['Meal plan personalized to your goals', 'Training plan personalized to your fitness capacity', 'Progress Check ins every 4 weeks for 3 months. There on, progress check ins every 6 weeks for continued plan adjustments', 'Supplementation guide', '72-96 Hour whatsapp reply guarantee'], 40),
  ('package-1', 'Monthly', 'P1', 'Package 1', '1 Month', 35500, 'Rs. 33,500', false, '+ High Attention', false, '1 month service - charged monthly. High attention package.', 'For maximum weekly accountability', ARRAY['Meal plan personalized to your goals', '4 week training plan personalized to your fitness capacity and goals', 'Weekly Progress Check ins for continued plan adjustments', 'Alpha Chef recipe Ebook (30+ recipes)', 'Supplementation guide', '24-48 Hour whatsapp reply guarantee'], 50),
  ('package-2', 'Monthly', 'P2', 'Package 2', '1 Month', 32500, 'Rs. 30,500', false, '+ Moderate Attention', false, '1 month service - charged monthly. moderate attention package.', 'For standard accountability', ARRAY['Meal plan personalized to your goals', '4 week training plan personalized to your fitness capacity and goals', 'Progress Check ins every 2 weeks for continued plan adjustments', 'Supplementation guide', '48-72 Hour whatsapp reply guarantee'], 60),
  ('training-only', 'One-Off', 'T', 'Training Plan Only', '6 Weeks', 22500, null, false, 'No Coaching', false, 'One-time plans that include a customized training plan only.', '6 week training plan', ARRAY['Built to your fitness levels', 'Customised to your gym or home training environment', 'Customised to your physique goals', 'Not online coaching'], 70),
  ('meal-only', 'One-Off', 'M', 'Meal Plan Only', 'One Time', 22500, null, false, 'No Coaching', false, 'One-time plans that include a customized meal plan only.', 'One time meal plan', ARRAY['Meal plan personalized to your goals', 'Meal options customised to your like and dislikes', 'Supplementation guide', 'Not online coaching'], 80),
  ('consult-inperson', 'One-Off', 'IC', 'In-Person Consultation', 'Face-To-Face Fitness Guidance', 15000, null, false, 'Personalised Guidance', false, 'A personalised consultation for clients who prefer direct interaction and coaching.', 'Ideal for goals, nutrition, training challenges and plateaus', ARRAY['One-on-one consultation', 'Personalised recommendations', 'Training and nutrition guidance', 'Clear next steps based on your goals'], 90),
  ('consult-online', 'One-Off', 'OC', 'Online Consultation', 'Expert Guidance From Anywhere', 10500, null, false, 'Personalised Guidance', false, 'A convenient option for personalised advice through an online consultation.', 'Ideal for training, nutrition, goal setting and progress reviews', ARRAY['One-on-one online consultation', 'Personalised recommendations', 'Training and nutrition guidance', 'Actionable steps to move forward'], 100),
  ('programme-review', 'One-Off', 'PR', 'Training Programme Review', 'Programme Assessment', 5500, null, false, 'Professional Assessment', false, 'Get expert feedback on your current workout programme without needing a completely new programme.', 'Find out whether your programme is structured correctly', ARRAY['Exercise selection review', 'Training volume assessment', 'Training frequency review', 'Programme structure analysis', 'Progression recommendations', 'Areas for improvement'], 110),
  ('technique-single', 'One-Off', 'SR', 'Single Exercise Review', 'Review One Exercise', 2500, null, false, 'Video Technique Review', false, 'Perfect if you need professional feedback on one specific movement.', 'Focused technique feedback for one exercise', ARRAY['Video technique assessment', 'Feedback on execution', 'Key corrections and recommendations'], 120),
  ('technique-full', 'One-Off', 'FR', 'Full Technique Review', 'Review Up To 10 Exercises', 7500, null, false, 'Complete Technique Review', false, 'Ideal for a more complete assessment of your training technique.', 'Professional feedback for up to 10 exercises', ARRAY['Review of up to 10 exercises', 'Technique feedback for each movement', 'Corrections and coaching cues', 'Recommendations to improve performance and safety'], 130)
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

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'packages_touch_updated_at'
      AND tgrelid = 'public.packages'::regclass
  ) THEN
    CREATE TRIGGER packages_touch_updated_at
      BEFORE UPDATE ON public.packages
      FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'packages'
      AND policyname = 'Packages are publicly visible'
  ) THEN
    CREATE POLICY "Packages are publicly visible"
      ON public.packages FOR SELECT
      USING (is_active OR public.is_staff());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'packages'
      AND policyname = 'Staff can manage packages'
  ) THEN
    CREATE POLICY "Staff can manage packages"
      ON public.packages FOR ALL
      USING (public.is_staff())
      WITH CHECK (public.is_staff());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'package_selections_package_id_fkey'
      AND conrelid = 'public.package_selections'::regclass
  ) THEN
    ALTER TABLE public.package_selections
      ADD CONSTRAINT package_selections_package_id_fkey
      FOREIGN KEY (package_id)
      REFERENCES public.packages(id)
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS packages_category_idx ON public.packages(category);
