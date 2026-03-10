-- ============================================================
-- SUIS – Mentor–Mentee: admin assigns students to teachers
-- Teachers only see their assigned mentees (profiles, progress, tasks).
-- Run after supabase_fix_profiles_rls_recursion.sql and supabase_migration_career_v2.sql
-- ============================================================

-- 1) Mentor–mentee assignment (admin-only write; teachers read own rows)
CREATE TABLE IF NOT EXISTS public.mentor_mentee (
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (teacher_id, student_id),
  CONSTRAINT no_self_assign CHECK (teacher_id != student_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_mentee_teacher ON public.mentor_mentee(teacher_id);
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_student ON public.mentor_mentee(student_id);

ALTER TABLE public.mentor_mentee ENABLE ROW LEVEL SECURITY;

-- Teachers can read their own assignments (to know who their mentees are)
CREATE POLICY "Teachers read own mentor_mentee"
  ON public.mentor_mentee FOR SELECT
  USING (auth.uid() = teacher_id);

-- Admins can read all and manage (insert/update/delete)
CREATE POLICY "Admins read all mentor_mentee"
  ON public.mentor_mentee FOR SELECT
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Admins insert mentor_mentee"
  ON public.mentor_mentee FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Admins delete mentor_mentee"
  ON public.mentor_mentee FOR DELETE
  USING (public.current_user_role() = 'admin');

-- 2) Profiles: teachers see only their mentees (not all students)
DROP POLICY IF EXISTS "Teachers and admins read all profiles" ON public.profiles;

CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Teachers read mentee profiles only"
  ON public.profiles FOR SELECT
  USING (
    public.current_user_role() = 'teacher'
    AND role = 'student'
    AND id IN (SELECT student_id FROM public.mentor_mentee WHERE teacher_id = auth.uid())
  );

-- 3) career_progress_items: teachers see only progress of their mentees (non-student source)
DROP POLICY IF EXISTS "Teachers read progress except student-owned" ON public.career_progress_items;

CREATE POLICY "Teachers read progress except student-owned"
  ON public.career_progress_items FOR SELECT
  USING (
    public.current_user_role() = 'teacher'
    AND (source IS NULL OR source != 'student')
    AND user_id IN (SELECT student_id FROM public.mentor_mentee WHERE teacher_id = auth.uid())
  );

-- 4) teacher_tasks: teacher can only create tasks for their mentees (separate INSERT policy)
DROP POLICY IF EXISTS "Teachers can manage their tasks" ON public.teacher_tasks;

CREATE POLICY "Teachers select their tasks"
  ON public.teacher_tasks FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers update their tasks"
  ON public.teacher_tasks FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers delete their tasks"
  ON public.teacher_tasks FOR DELETE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers insert tasks only for mentees"
  ON public.teacher_tasks FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id
    AND student_id IN (SELECT student_id FROM public.mentor_mentee WHERE teacher_id = auth.uid())
  );
