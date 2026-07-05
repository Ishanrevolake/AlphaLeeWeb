-- Alpha Lee Fitness web analytics schema
-- Run this in the Supabase SQL Editor for the project.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL DEFAULT 'page_view',
  visitor_id TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pathname TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  language TEXT,
  timezone TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read analytics events" ON public.analytics_events;
CREATE POLICY "Staff can read analytics events"
  ON public.analytics_events FOR SELECT
  USING (public.is_staff());

CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
  ON public.analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_pathname_idx
  ON public.analytics_events(pathname);

CREATE INDEX IF NOT EXISTS analytics_events_visitor_id_idx
  ON public.analytics_events(visitor_id);

CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx
  ON public.analytics_events(event_type);

CREATE OR REPLACE VIEW public.analytics_daily_views AS
SELECT
  date_trunc('day', created_at)::date AS day,
  count(*)::integer AS page_views,
  count(DISTINCT visitor_id)::integer AS unique_visitors
FROM public.analytics_events
WHERE event_type = 'page_view'
GROUP BY 1
ORDER BY 1 DESC;

CREATE OR REPLACE VIEW public.analytics_top_pages AS
SELECT
  pathname,
  count(*)::integer AS page_views,
  count(DISTINCT visitor_id)::integer AS unique_visitors,
  max(created_at) AS last_viewed_at
FROM public.analytics_events
WHERE event_type = 'page_view'
GROUP BY pathname
ORDER BY page_views DESC;

CREATE OR REPLACE VIEW public.analytics_top_referrers AS
SELECT
  COALESCE(NULLIF(referrer, ''), 'Direct') AS referrer,
  count(*)::integer AS page_views,
  count(DISTINCT visitor_id)::integer AS unique_visitors
FROM public.analytics_events
WHERE event_type = 'page_view'
GROUP BY 1
ORDER BY page_views DESC;

CREATE OR REPLACE FUNCTION public.analytics_summary(
  start_at TIMESTAMPTZ DEFAULT now() - interval '30 days',
  end_at TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  page_views BIGINT,
  unique_visitors BIGINT,
  sessions BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*) AS page_views,
    count(DISTINCT visitor_id) AS unique_visitors,
    count(DISTINCT session_id) AS sessions
  FROM public.analytics_events
  WHERE event_type = 'page_view'
    AND created_at >= start_at
    AND created_at <= end_at;
$$;

