-- ============================================================
-- SUIS – Career v2: source, university resources, teacher visibility
-- Run after supabase_migration_career_tracking.sql
-- ============================================================

-- 1) Add source to career_progress_items: who added this (student = private from teacher)
ALTER TABLE public.career_progress_items
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'student'
  CHECK (source IN ('student', 'teacher', 'admin', 'system'));

-- Backfill: existing rows without source = 'system' (were added from our suggestions)
UPDATE public.career_progress_items SET source = 'system' WHERE source IS NULL;

-- 2) Allow more types: video, link, document (for student-added and admin-added)
ALTER TABLE public.career_progress_items DROP CONSTRAINT IF EXISTS career_progress_items_type_check;
ALTER TABLE public.career_progress_items
  ADD CONSTRAINT career_progress_items_type_check
  CHECK (type IN ('youtube', 'video', 'course', 'action', 'notes', 'link', 'document'));

-- 3) University resources catalog (admin adds; students see as "Suggested by University")
CREATE TABLE IF NOT EXISTS public.university_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path TEXT,
  type TEXT NOT NULL CHECK (type IN ('youtube', 'video', 'link', 'document', 'notes')),
  title TEXT NOT NULL,
  url TEXT,
  video_embed_url TEXT,
  video_duration_sec INT,
  notes_content TEXT,
  total_pages INT,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.university_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read university resources"
  ON public.university_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert university resources"
  ON public.university_resources FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Only admins can update university resources"
  ON public.university_resources FOR UPDATE
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Only admins can delete university resources"
  ON public.university_resources FOR DELETE
  USING (public.current_user_role() = 'admin');

-- 4) Teacher sees only progress for non-student items (not student's own resources)
DROP POLICY IF EXISTS "Teachers and admins read all progress" ON public.career_progress_items;

CREATE POLICY "Teachers read progress except student-owned"
  ON public.career_progress_items FOR SELECT
  USING (
    public.current_user_role() = 'teacher' AND (source IS NULL OR source != 'student')
  );

CREATE POLICY "Admins read all progress"
  ON public.career_progress_items FOR SELECT
  USING (public.current_user_role() = 'admin');
