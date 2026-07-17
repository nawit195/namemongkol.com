-- ============================================================
-- Fix: Allow authenticated users to insert/update premium_names
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users"
ON premium_names FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update (required for ON CONFLICT upsert)
CREATE POLICY "Enable update for authenticated users"
ON premium_names FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
