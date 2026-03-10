-- ============================================================
-- SUIS – Career recommendations: video embed, notes, tracking
-- Run in Supabase SQL Editor (after supabase_migration_onboarding_progress.sql)
-- ============================================================

-- 1) Allow 'notes' type and add tracking columns to career_progress_items
ALTER TABLE public.career_progress_items
  DROP CONSTRAINT IF EXISTS career_progress_items_type_check;

ALTER TABLE public.career_progress_items
  ADD CONSTRAINT career_progress_items_type_check
  CHECK (type IN ('youtube', 'course', 'action', 'notes'));

ALTER TABLE public.career_progress_items
  ADD COLUMN IF NOT EXISTS video_embed_url TEXT,
  ADD COLUMN IF NOT EXISTS video_duration_sec INT,
  ADD COLUMN IF NOT EXISTS seconds_watched INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_pages INT,
  ADD COLUMN IF NOT EXISTS pages_read INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes_content TEXT,
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- 2) Optional: seed template resources (no user_id – we copy these when user adds; or use as templates)
-- Skipping seed table; frontend will insert with user_id when adding suggested items.
