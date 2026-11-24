-- ==============================================================================
-- 001_schema.sql: Core Relational Schema & Integrity Constraints
-- Migration: Firebase Firestore -> Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TABLE: profile
-- Represents singleton developer profile, bio, links, and contact handles.
-- Single-row constraint enforced via fixed UUID primary key CHECK.
--
-- Field Mappings (Firestore -> Postgres):
--   id           -> id (fixed UUID '00000000-0000-0000-0000-000000000001')
--   name         -> name
--   title        -> title
--   headline     -> headline
--   tagline      -> tagline
--   bio          -> bio
--   about        -> about
--   avatarUrl    -> avatar_url
--   resumeUrl    -> resume_url
--   location     -> location
--   focusArea    -> focus_area
--   mindset      -> mindset
--   email        -> email
--   contactEmail -> contact_email
--   phone        -> phone
--   linkedinUrl  -> linkedin_url
--   githubUrl    -> github_url
--   leetcodeUrl  -> leetcode_url
--   codechefUrl  -> codechef_url
--   codeforcesUrl-> codeforces_url
--   twitterUrl   -> twitter_url
--   socials      -> socials (JSONB array of SocialLink objects)
--   createdAt    -> created_at
--   updatedAt    -> updated_at
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid 
        CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid),
    name TEXT NOT NULL DEFAULT '' CHECK (length(name) <= 100),
    title TEXT DEFAULT '' CHECK (length(title) <= 200),
    headline TEXT DEFAULT '' CHECK (length(headline) <= 200),
    tagline TEXT DEFAULT '' CHECK (length(tagline) <= 200),
    bio TEXT NOT NULL DEFAULT '' CHECK (length(bio) <= 5000),
    about TEXT DEFAULT '' CHECK (length(about) <= 10000),
    avatar_url TEXT DEFAULT '' CHECK (length(avatar_url) <= 1000),
    resume_url TEXT DEFAULT '' CHECK (length(resume_url) <= 1000),
    location TEXT DEFAULT '' CHECK (length(location) <= 100),
    focus_area TEXT DEFAULT '' CHECK (length(focus_area) <= 200),
    mindset TEXT DEFAULT '' CHECK (length(mindset) <= 200),
    email TEXT DEFAULT '' CHECK (length(email) <= 254),
    contact_email TEXT DEFAULT '' CHECK (length(contact_email) <= 254),
    phone TEXT DEFAULT '' CHECK (length(phone) <= 50),
    linkedin_url TEXT DEFAULT '' CHECK (length(linkedin_url) <= 500),
    github_url TEXT DEFAULT '' CHECK (length(github_url) <= 500),
    leetcode_url TEXT DEFAULT '' CHECK (length(leetcode_url) <= 500),
    codechef_url TEXT DEFAULT '' CHECK (length(codechef_url) <= 500),
    codeforces_url TEXT DEFAULT '' CHECK (length(codeforces_url) <= 500),
    twitter_url TEXT DEFAULT '' CHECK (length(twitter_url) <= 500),
    socials JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_profile_updated_at ON public.profile;
CREATE TRIGGER trg_profile_updated_at
    BEFORE UPDATE ON public.profile
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- TABLE: projects
-- Portfolio projects with metadata, array tags, and gallery images.
--
-- Field Mappings (Firestore -> Postgres):
--   id              -> id (UUID)
--   title           -> title
--   slug            -> slug
--   tagline         -> tagline
--   description     -> description
--   longDescription -> long_description
--   thumbnailUrl    -> thumbnail_url
--   images          -> images (TEXT[])
--   tags            -> tags (TEXT[])
--   liveUrl         -> live_url
--   repoUrl         -> repo_url
--   featured        -> featured
--   order           -> sort_order
--   publishedAt     -> published_at
--   createdAt       -> created_at
--   updatedAt       -> updated_at
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
    slug TEXT NOT NULL UNIQUE CHECK (length(slug) >= 1 AND length(slug) <= 200),
    tagline TEXT DEFAULT '' CHECK (length(tagline) <= 300),
    description TEXT NOT NULL CHECK (length(description) >= 1 AND length(description) <= 5000),
    long_description TEXT DEFAULT '' CHECK (length(long_description) <= 10000),
    thumbnail_url TEXT DEFAULT '' CHECK (length(thumbnail_url) <= 1000),
    images TEXT[] NOT NULL DEFAULT '{}'::text[],
    tags TEXT[] NOT NULL DEFAULT '{}'::text[],
    live_url TEXT DEFAULT '' CHECK (length(live_url) <= 1000),
    repo_url TEXT DEFAULT '' CHECK (length(repo_url) <= 1000),
    featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 1,
    published_at TEXT DEFAULT '' CHECK (length(published_at) <= 50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON public.projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- TABLE: skills
-- Technical skills grouped by category with proficiency 0-100.
--
-- Field Mappings (Firestore -> Postgres):
--   id          -> id (UUID)
--   name        -> name
--   category    -> category
--   proficiency -> proficiency (0-100)
--   iconUrl     -> icon_url
--   featured    -> featured
--   order       -> sort_order
--   createdAt   -> created_at
--   updatedAt   -> updated_at
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
    category TEXT NOT NULL CHECK (length(category) >= 1 AND length(category) <= 100),
    proficiency INTEGER NOT NULL DEFAULT 80 CHECK (proficiency >= 0 AND proficiency <= 100),
    icon_url TEXT DEFAULT '' CHECK (length(icon_url) <= 1000),
    featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_sort_order ON public.skills(sort_order);

DROP TRIGGER IF EXISTS trg_skills_updated_at ON public.skills;
CREATE TRIGGER trg_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- TABLE: education
-- Academic history with institution branding and timeline fields.
--
-- Field Mappings (Firestore -> Postgres):
--   id           -> id (UUID)
--   institution  -> institution
--   degree       -> degree
--   fieldOfStudy -> field_of_study
--   startDate    -> start_date
--   endDate      -> end_date
--   isCurrent    -> is_current
--   grade        -> grade
--   description  -> description
--   location     -> location
--   logoUrl      -> logo_url
--   logoPath     -> logo_path
--   order        -> sort_order
--   createdAt    -> created_at
--   updatedAt    -> updated_at
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution TEXT NOT NULL CHECK (length(institution) >= 1 AND length(institution) <= 200),
    degree TEXT NOT NULL CHECK (length(degree) >= 1 AND length(degree) <= 200),
    field_of_study TEXT DEFAULT '' CHECK (length(field_of_study) <= 200),
    start_date TEXT NOT NULL DEFAULT '' CHECK (length(start_date) <= 50),
    end_date TEXT DEFAULT '' CHECK (length(end_date) <= 50),
    is_current BOOLEAN NOT NULL DEFAULT false,
    grade TEXT DEFAULT '' CHECK (length(grade) <= 100),
    location TEXT DEFAULT '' CHECK (length(location) <= 100),
    description TEXT DEFAULT '' CHECK (length(description) <= 5000),
    logo_url TEXT DEFAULT '' CHECK (length(logo_url) <= 1000),
    logo_path TEXT DEFAULT '' CHECK (length(logo_path) <= 500),
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_sort_order ON public.education(sort_order);

DROP TRIGGER IF EXISTS trg_education_updated_at ON public.education;
CREATE TRIGGER trg_education_updated_at
    BEFORE UPDATE ON public.education
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- TABLE: certifications
-- Accreditations, licenses, credential URLs, and badge images.
--
-- Field Mappings (Firestore -> Postgres):
--   id            -> id (UUID)
--   title         -> title
--   issuer        -> issuer
--   issueDate     -> issue_date
--   expiryDate    -> expiry_date
--   credentialId  -> credential_id
--   credentialUrl -> credential_url
--   badgeUrl      -> badge_url
--   order         -> sort_order
--   createdAt     -> created_at
--   updatedAt     -> updated_at
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
    issuer TEXT NOT NULL CHECK (length(issuer) >= 1 AND length(issuer) <= 200),
    issue_date TEXT NOT NULL DEFAULT '' CHECK (length(issue_date) <= 50),
    expiry_date TEXT DEFAULT '' CHECK (length(expiry_date) <= 50),
    credential_id TEXT DEFAULT '' CHECK (length(credential_id) <= 200),
    credential_url TEXT DEFAULT '' CHECK (length(credential_url) <= 1000),
    badge_url TEXT DEFAULT '' CHECK (length(badge_url) <= 1000),
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certifications_sort_order ON public.certifications(sort_order);

DROP TRIGGER IF EXISTS trg_certifications_updated_at ON public.certifications;
CREATE TRIGGER trg_certifications_updated_at
    BEFORE UPDATE ON public.certifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- TABLE: contact_messages
-- Inbound visitor messages submitted via contact form.
--
-- Field Mappings (Firestore -> Postgres):
--   id        -> id (UUID)
--   name      -> name
--   email     -> email
--   message   -> message
--   read      -> read
--   createdAt -> created_at
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
    email TEXT NOT NULL CHECK (
        length(email) >= 3 AND 
        length(email) <= 254 AND 
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    message TEXT NOT NULL CHECK (length(message) >= 1 AND length(message) <= 5000),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages(read);
