-- ============================================================================
-- TranslateMe Supabase Cloud Database Schema
-- Run this script in the Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. Novels Table
CREATE TABLE IF NOT EXISTS public.novels (
  id TEXT PRIMARY KEY,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  author TEXT DEFAULT '',
  genre TEXT DEFAULT 'xianxia',
  tags JSONB DEFAULT '[]'::jsonb,
  cover_gradient TEXT,
  description TEXT DEFAULT '',
  chapters_count INT DEFAULT 0,
  translated_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL,
  chapter_number INT NOT NULL,
  title_zh TEXT DEFAULT '',
  title_en TEXT DEFAULT '',
  content_zh TEXT DEFAULT '',
  content_en TEXT DEFAULT '',
  status TEXT DEFAULT 'raw',
  summary TEXT DEFAULT '',
  extracted_terms_count INT DEFAULT 0,
  self_healed_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Glossary Table
CREATE TABLE IF NOT EXISTS public.glossary (
  id TEXT PRIMARY KEY,
  original_zh TEXT NOT NULL,
  translated_en TEXT NOT NULL,
  category TEXT DEFAULT 'character',
  scope TEXT DEFAULT 'local',
  gender TEXT,
  notes TEXT,
  occurrences INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reader Suggestions Table
CREATE TABLE IF NOT EXISTS public.reader_suggestions (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL,
  chapter_number INT,
  original_zh TEXT,
  current_en TEXT,
  suggested_en TEXT,
  reason TEXT,
  submitted_by TEXT DEFAULT 'Reader',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Token Usage Table
CREATE TABLE IF NOT EXISTS public.token_usage (
  id TEXT PRIMARY KEY,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  total_cost_usd NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reader_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all novels" ON public.novels;
CREATE POLICY "Allow public all novels" ON public.novels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all chapters" ON public.chapters;
CREATE POLICY "Allow public all chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all glossary" ON public.glossary;
CREATE POLICY "Allow public all glossary" ON public.glossary FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all suggestions" ON public.reader_suggestions;
CREATE POLICY "Allow public all suggestions" ON public.reader_suggestions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all token_usage" ON public.token_usage;
CREATE POLICY "Allow public all token_usage" ON public.token_usage FOR ALL USING (true) WITH CHECK (true);

-- 7. Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.novels, public.chapters;
