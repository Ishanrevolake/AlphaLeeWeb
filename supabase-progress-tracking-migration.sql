-- Run once in the Supabase SQL editor.
-- Enables daily weight/waist updates and private client progress photos.

BEGIN;

DROP POLICY IF EXISTS "Clients can update own measurements"
  ON public.progress_measurements;
CREATE POLICY "Clients can update own measurements"
  ON public.progress_measurements FOR UPDATE
  USING (public.is_record_owner(client_id))
  WITH CHECK (public.is_record_owner(client_id));

CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  captured_on DATE NOT NULL DEFAULT current_date,
  view_type TEXT NOT NULL CHECK (view_type IN ('front', 'side', 'back')),
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS progress_photos_client_date_idx
  ON public.progress_photos(client_id, captured_on DESC);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can create own progress photos" ON public.progress_photos;
CREATE POLICY "Clients can create own progress photos"
  ON public.progress_photos FOR INSERT
  WITH CHECK (public.is_record_owner(client_id));

DROP POLICY IF EXISTS "Progress photos visible to owner and staff" ON public.progress_photos;
CREATE POLICY "Progress photos visible to owner and staff"
  ON public.progress_photos FOR SELECT
  USING (public.is_record_owner(client_id) OR public.is_staff());

DROP POLICY IF EXISTS "Staff can manage progress photos" ON public.progress_photos;
CREATE POLICY "Staff can manage progress photos"
  ON public.progress_photos FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'progress-photos',
  'progress-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Clients can upload own progress photos" ON storage.objects;
CREATE POLICY "Clients can upload own progress photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Progress photo files visible to owner and staff" ON storage.objects;
CREATE POLICY "Progress photo files visible to owner and staff"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'progress-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_staff()
    )
  );

DROP POLICY IF EXISTS "Clients can remove own progress photos" ON storage.objects;
CREATE POLICY "Clients can remove own progress photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

COMMIT;
