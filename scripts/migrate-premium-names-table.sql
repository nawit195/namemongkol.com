-- ============================================================
-- Migration: Create premium_names table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS premium_names (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups and sorting
CREATE INDEX IF NOT EXISTS idx_premium_names_name ON premium_names (name);

-- Enable Row Level Security
ALTER TABLE premium_names ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed by /premium-search page)
CREATE POLICY "Public read premium_names"
  ON premium_names FOR SELECT
  USING (true);

-- Only service_role (server-side API) can insert/update/delete
-- (No INSERT/UPDATE/DELETE policy = only service_role key can write)
