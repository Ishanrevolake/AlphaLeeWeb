-- Run once in the Supabase SQL editor.
-- Makes selected consultation/review services available through Q&A accounts.

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
    'consult-inperson',
    'In-Person Consultation',
    'Face-To-Face Fitness Guidance',
    'A personalised consultation for direct fitness guidance and recommendations.',
    15000,
    1,
    72,
    false,
    ARRAY['One-on-one consultation', 'Personalised recommendations', 'Training and nutrition guidance']::text[],
    30
  ),
  (
    'consult-online',
    'Online Consultation',
    'Expert Guidance From Anywhere',
    'A convenient online consultation for personalised fitness guidance.',
    10500,
    1,
    72,
    false,
    ARRAY['One-on-one online consultation', 'Personalised recommendations', 'Actionable next steps']::text[],
    40
  ),
  (
    'programme-review',
    'Training Programme Review',
    'Programme Assessment',
    'Expert feedback and recommendations for your current workout programme.',
    5500,
    1,
    72,
    false,
    ARRAY['Programme structure analysis', 'Training volume assessment', 'Progression recommendations']::text[],
    50
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
