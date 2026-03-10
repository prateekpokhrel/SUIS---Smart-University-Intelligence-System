-- ============================================================
-- SUIS – Allow admin to suggest resources for individual students
-- Run after supabase_migration_career_v2.sql
-- ============================================================

-- Admins can insert career_progress_items for any student (suggestions show as "Suggested by University")
CREATE POLICY "Admins can add progress items for students"
  ON public.career_progress_items FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');
