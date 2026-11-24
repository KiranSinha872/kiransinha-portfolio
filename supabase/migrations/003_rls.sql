-- ==============================================================================
-- 003_rls.sql: Row Level Security Policies
-- Migration: Firebase Firestore -> Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable Row Level Security across all application tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. Public Read / Admin Write Tables:
-- (profile, projects, skills, education, certifications)
-- ==============================================================================

-- 2.1 Table: profile
DROP POLICY IF EXISTS "Public can view profile" ON public.profile;
CREATE POLICY "Public can view profile"
    ON public.profile FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert profile" ON public.profile;
CREATE POLICY "Admin can insert profile"
    ON public.profile FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update profile" ON public.profile;
CREATE POLICY "Admin can update profile"
    ON public.profile FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete profile" ON public.profile;
CREATE POLICY "Admin can delete profile"
    ON public.profile FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 2.2 Table: projects
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects"
    ON public.projects FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert projects" ON public.projects;
CREATE POLICY "Admin can insert projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update projects" ON public.projects;
CREATE POLICY "Admin can update projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete projects" ON public.projects;
CREATE POLICY "Admin can delete projects"
    ON public.projects FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 2.3 Table: skills
DROP POLICY IF EXISTS "Public can view skills" ON public.skills;
CREATE POLICY "Public can view skills"
    ON public.skills FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert skills" ON public.skills;
CREATE POLICY "Admin can insert skills"
    ON public.skills FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update skills" ON public.skills;
CREATE POLICY "Admin can update skills"
    ON public.skills FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete skills" ON public.skills;
CREATE POLICY "Admin can delete skills"
    ON public.skills FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 2.4 Table: education
DROP POLICY IF EXISTS "Public can view education" ON public.education;
CREATE POLICY "Public can view education"
    ON public.education FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert education" ON public.education;
CREATE POLICY "Admin can insert education"
    ON public.education FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update education" ON public.education;
CREATE POLICY "Admin can update education"
    ON public.education FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete education" ON public.education;
CREATE POLICY "Admin can delete education"
    ON public.education FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 2.5 Table: certifications
DROP POLICY IF EXISTS "Public can view certifications" ON public.certifications;
CREATE POLICY "Public can view certifications"
    ON public.certifications FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert certifications" ON public.certifications;
CREATE POLICY "Admin can insert certifications"
    ON public.certifications FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update certifications" ON public.certifications;
CREATE POLICY "Admin can update certifications"
    ON public.certifications FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete certifications" ON public.certifications;
CREATE POLICY "Admin can delete certifications"
    ON public.certifications FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 3. Inbound Contact Table: contact_messages
-- Public can INSERT only (forced read = false). Nobody can SELECT publicly.
-- Only is_admin() can SELECT, UPDATE, or DELETE messages.
-- ==============================================================================
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages"
    ON public.contact_messages FOR INSERT
    TO anon, authenticated
    WITH CHECK (read = false);

DROP POLICY IF EXISTS "Admin can view contact messages" ON public.contact_messages;
CREATE POLICY "Admin can view contact messages"
    ON public.contact_messages FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update contact messages" ON public.contact_messages;
CREATE POLICY "Admin can update contact messages"
    ON public.contact_messages FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admin can delete contact messages"
    ON public.contact_messages FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 4. Table: admins
-- Strictly private. Only verified admins can view who is in the admins table.
-- Public/anon has ZERO access.
-- ==============================================================================
DROP POLICY IF EXISTS "Admin can view admins list" ON public.admins;
CREATE POLICY "Admin can view admins list"
    ON public.admins FOR SELECT
    TO authenticated
    USING (public.is_admin());
