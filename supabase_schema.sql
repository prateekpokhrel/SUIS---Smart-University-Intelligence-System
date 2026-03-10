-- ============================================================
-- SUIS – Supabase schema: auth + profiles + career_predictions
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- 1) PROFILES (extends auth.users – one row per user)
-- id matches auth.users(id); role used for student/teacher/admin
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  department TEXT DEFAULT 'CSE',
  year TEXT DEFAULT '1st Year',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: set updated_at on change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) Auto-create profile on signup (Supabase Auth trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow insert from trigger (service role) and from authenticated user for upsert
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4) CAREER_PREDICTIONS (for Career API – optional, if you use this table)
CREATE TABLE IF NOT EXISTS public.career_predictions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  branch TEXT,
  current_year INT,
  programming_languages TEXT,
  technical_skills TEXT,
  tools_frameworks TEXT,
  skill_proficiency TEXT,
  career_preference TEXT,
  research_or_industry TEXT,
  aptitude_score INT,
  communication_skill INT,
  risk_tolerance INT,
  top_career TEXT,
  top_match_score NUMERIC,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.career_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own predictions"
  ON public.career_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON public.career_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5) USER_SETTINGS (optional – for Settings page: theme, notifications, etc.)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  compact_mode BOOLEAN DEFAULT false,
  font_size TEXT DEFAULT 'medium',
  email_noti BOOLEAN DEFAULT true,
  push_noti BOOLEAN DEFAULT false,
  spam_alerts BOOLEAN DEFAULT true,
  important_alerts BOOLEAN DEFAULT true,
  hide_email BOOLEAN DEFAULT false,
  auto_logout TEXT DEFAULT '30m',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Done. After running:
-- 1. In Supabase Dashboard → Authentication → Providers: enable Email and Google if needed.
-- 2. Add your frontend URL to Authentication → URL Configuration → Site URL / Redirect URLs.
