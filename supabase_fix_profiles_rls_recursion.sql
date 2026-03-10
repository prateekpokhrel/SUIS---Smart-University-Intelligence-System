-- ============================================================
-- FIX: "infinite recursion detected in policy for relation profiles"
-- Run this in Supabase SQL Editor. It fixes RLS so profiles and
-- teacher_tasks (and career_progress_items) work without recursion.
-- ============================================================

-- 1) Helper: get current user's role without triggering RLS (SECURITY DEFINER = runs as owner, bypasses RLS)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 2) Drop the policy that causes recursion (it queried profiles inside a policy on profiles)
DROP POLICY IF EXISTS "Teachers and admins read all profiles" ON public.profiles;

-- 3) Recreate it using the function instead of querying profiles directly
CREATE POLICY "Teachers and admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.current_user_role() IN ('teacher', 'admin'));

-- 4) Fix career_progress_items policies that also query profiles (same recursion risk when evaluated)
DROP POLICY IF EXISTS "Teachers and admins read all progress" ON public.career_progress_items;
CREATE POLICY "Teachers and admins read all progress"
  ON public.career_progress_items FOR SELECT
  USING (public.current_user_role() IN ('teacher', 'admin'));

DROP POLICY IF EXISTS "Teachers can add progress items for students" ON public.career_progress_items;
CREATE POLICY "Teachers can add progress items for students"
  ON public.career_progress_items FOR INSERT
  WITH CHECK (public.current_user_role() = 'teacher');

-- 5) Fix teacher_tasks "Admins read all tasks" (it queried profiles)
DROP POLICY IF EXISTS "Admins read all tasks" ON public.teacher_tasks;
CREATE POLICY "Admins read all tasks"
  ON public.teacher_tasks FOR SELECT
  USING (public.current_user_role() = 'admin');
