-- ==============================================================================
-- 002_admin.sql: Admin Authorization Model & is_admin() Helper
-- Migration: Firebase Firestore -> Supabase PostgreSQL
-- ==============================================================================

-- 1. Table: admins
-- Tracks which auth.users are designated site administrators.
-- Does NOT hardcode any UID; users insert their own UID securely.
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admins table immediately
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. Security Definer Function: is_admin()
-- Returns true if the currently authenticated user exists in public.admins.
-- Runs with owner privileges (SECURITY DEFINER) and fixed search_path to prevent spoofing.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admins
        WHERE user_id = auth.uid()
    );
$$;

-- Grant execution to anon, authenticated, and service_role
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
