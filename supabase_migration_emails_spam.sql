-- ============================================================
-- SUIS – Emails table for Spam Detection (stored & visible on website)
-- Spam (and other categories) moved to Gmail bin are stored here
-- so they appear in the Mailbox → Spam tab on the website.
-- Run in Supabase SQL Editor. Ensure backend has SUPABASE_URL and
-- SUPABASE_KEY (anon key) so it can store and retrieve emails.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.emails (
  id BIGSERIAL PRIMARY KEY,
  from_email TEXT,
  from_name TEXT,
  subject TEXT,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'regular'
    CHECK (category IN ('important', 'faculty', 'events', 'spam', 'regular')),
  received_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emails_category ON public.emails(category);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON public.emails(received_at DESC);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Backend (anon key) and authenticated users can read/insert so spam is stored and visible
CREATE POLICY "Allow read emails"
  ON public.emails FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert emails"
  ON public.emails FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
