-- ==============================================================================
-- 004_storage.sql: Storage Buckets & Storage Security Policies
-- Migration: Firebase Storage -> Supabase Storage
-- ==============================================================================

-- 1. Create public storage buckets
-- Projects, certifications, resumes, institutions, avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
    ('projects', 'projects', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
    ('certifications', 'certifications', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
    ('institutions', 'institutions', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']),
    ('resumes', 'resumes', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- 2. Storage Policies on storage.objects
-- ==============================================================================

-- 2.1 Public Read Policy: anyone can view files from the 5 public portfolio buckets
DROP POLICY IF EXISTS "Public read portfolio assets" ON storage.objects;
CREATE POLICY "Public read portfolio assets"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id IN ('avatars', 'projects', 'certifications', 'institutions', 'resumes'));

-- 2.2 Admin Upload Policy (INSERT):
-- Mirrors Firebase storage.rules:
-- - avatars, projects, certifications: max 5MB, png/jpeg/webp/gif (SVG explicitly blocked)
-- - institutions: max 2MB, png/jpeg/webp (SVG blocked)
-- - resumes: max 10MB, application/pdf
DROP POLICY IF EXISTS "Admin upload portfolio assets" ON storage.objects;
CREATE POLICY "Admin upload portfolio assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        AND (
            -- Avatars, Projects, Certifications (Max 5MB = 5,242,880 bytes)
            (
                bucket_id IN ('avatars', 'projects', 'certifications')
                AND (COALESCE((metadata->>'size')::bigint, 0) <= 5242880)
                AND (
                    (metadata->>'mimetype' IN ('image/png', 'image/jpeg', 'image/webp', 'image/gif'))
                    OR (lower(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp', 'gif'))
                )
                AND lower(storage.extension(name)) != 'svg'
            )
            OR
            -- Institutions (Max 2MB = 2,097,152 bytes)
            (
                bucket_id = 'institutions'
                AND (COALESCE((metadata->>'size')::bigint, 0) <= 2097152)
                AND (
                    (metadata->>'mimetype' IN ('image/png', 'image/jpeg', 'image/webp'))
                    OR (lower(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp'))
                )
                AND lower(storage.extension(name)) != 'svg'
            )
            OR
            -- Resumes (Max 10MB = 10,485,760 bytes, PDF only)
            (
                bucket_id = 'resumes'
                AND (COALESCE((metadata->>'size')::bigint, 0) <= 10485760)
                AND (
                    (metadata->>'mimetype' = 'application/pdf')
                    OR (lower(storage.extension(name)) = 'pdf')
                )
            )
        )
    );

-- 2.3 Admin Update Policy (UPDATE):
DROP POLICY IF EXISTS "Admin update portfolio assets" ON storage.objects;
CREATE POLICY "Admin update portfolio assets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        AND bucket_id IN ('avatars', 'projects', 'certifications', 'institutions', 'resumes')
    )
    WITH CHECK (
        public.is_admin()
        AND bucket_id IN ('avatars', 'projects', 'certifications', 'institutions', 'resumes')
    );

-- 2.4 Admin Delete Policy (DELETE):
DROP POLICY IF EXISTS "Admin delete portfolio assets" ON storage.objects;
CREATE POLICY "Admin delete portfolio assets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
        AND bucket_id IN ('avatars', 'projects', 'certifications', 'institutions', 'resumes')
    );
