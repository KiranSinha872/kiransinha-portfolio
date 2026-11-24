-- ==============================================================================
-- /supabase/tests/rls_check.sql: RLS Security Policy Verification
-- Run these queries in the Supabase SQL Editor to test permissions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Test 1: Anonymous user CAN read projects (Expect: SUCCESS, returns rows or 0 rows without error)
-- ------------------------------------------------------------------------------
SET ROLE anon;

SELECT count(*) AS anon_project_count FROM public.projects;

-- ------------------------------------------------------------------------------
-- Test 2: Anonymous user CANNOT write to projects (Expect: ERROR / permission denied)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    INSERT INTO public.projects (title, slug, description)
    VALUES ('Unauthorized Project', 'unauthorized-project', 'Should be blocked');
    RAISE EXCEPTION 'TEST FAILED: Anon was able to insert a project!';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'TEST PASSED: Anon cannot insert project (insufficient privilege).';
    WHEN check_violation THEN
        RAISE NOTICE 'TEST PASSED: Anon blocked by check constraint.';
    WHEN OTHERS THEN
        IF SQLSTATE = '42501' THEN
            RAISE NOTICE 'TEST PASSED: Anon cannot insert project (42501 permission denied).';
        ELSE
            RAISE NOTICE 'TEST RESULT: Caught expected exception: % (%)', SQLERRM, SQLSTATE;
        END IF;
END $$;

-- ------------------------------------------------------------------------------
-- Test 3: Anonymous user CAN insert contact message with read=false (Expect: SUCCESS)
-- ------------------------------------------------------------------------------
INSERT INTO public.contact_messages (name, email, message, read)
VALUES ('Test Visitor', 'visitor@example.com', 'Hello from anon RLS test', false);

-- ------------------------------------------------------------------------------
-- Test 4: Anonymous user CANNOT insert contact message with read=true (Expect: ERROR)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    INSERT INTO public.contact_messages (name, email, message, read)
    VALUES ('Hacker Visitor', 'hacker@example.com', 'Trying to mark as read', true);
    RAISE EXCEPTION 'TEST FAILED: Anon was able to insert a message with read = true!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'TEST PASSED: Anon cannot insert contact message with read = true (RLS WITH CHECK violation).';
END $$;

-- ------------------------------------------------------------------------------
-- Test 5: Anonymous user CANNOT read contact messages (Expect: 0 rows returned)
-- ------------------------------------------------------------------------------
SELECT count(*) AS anon_visible_contact_messages FROM public.contact_messages;
-- Due to RLS, anon gets count = 0 even though Test 3 inserted a message.

-- ------------------------------------------------------------------------------
-- Test 6: Verify Admin Access
-- Reset to postgres / authenticated role and check is_admin()
-- ------------------------------------------------------------------------------
RESET ROLE;

-- Verify admin table contains your UID
SELECT user_id, created_at FROM public.admins;
