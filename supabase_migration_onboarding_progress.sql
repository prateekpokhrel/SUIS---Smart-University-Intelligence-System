-- ============================================================
-- SUIS – Onboarding, CGPA, interests, career progress, teacher tasks
-- Run in Supabase SQL Editor after supabase_schema.sql
-- ============================================================

-- 1) Add columns to profiles (student CGPA, interests, onboarding done)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cgpa NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS interests TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 2) Career progress items: YouTube, courses, action items (student checks off; teachers/admin can view)
CREATE TABLE IF NOT EXISTS public.career_progress_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('youtube', 'course', 'action')),
  title TEXT NOT NULL,
  url TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  added_by_teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_career_progress_user ON public.career_progress_items(user_id);

ALTER TABLE public.career_progress_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own progress"
  ON public.career_progress_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own progress"
  ON public.career_progress_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own progress"
  ON public.career_progress_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Teachers can read all progress (to view students); service role / backend can insert for "suggested" items
CREATE POLICY "Teachers and admins read all progress"
  ON public.career_progress_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin'))
  );

-- Teachers can insert items for students (suggestions)
CREATE POLICY "Teachers can add progress items for students"
  ON public.career_progress_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
  );

-- 3) Teacher tasks for students (assignments / todos)
CREATE TABLE IF NOT EXISTS public.teacher_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_tasks_student ON public.teacher_tasks(student_id);

ALTER TABLE public.teacher_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own tasks"
  ON public.teacher_tasks FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own tasks (mark complete)"
  ON public.teacher_tasks FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can manage their tasks"
  ON public.teacher_tasks FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Admins can read all tasks
CREATE POLICY "Admins read all tasks"
  ON public.teacher_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 4) Teachers/admins need to read student profiles (for CGPA, interests, onboarding)
-- Already have: users read own profile. Add: teachers and admins can read all profiles (for student list)
CREATE POLICY "Teachers and admins read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin'))
  );
