# Supabase Database & Storage Setup Guide

Follow these steps in the **Supabase Dashboard** for project `sfttdefeuzstwvdszhql` (`https://sfttdefeuzstwvdszhql.supabase.co`).

---

## Step 1: Open the SQL Editor

1. Navigate to your Supabase Project: [https://supabase.com/dashboard/project/sfttdefeuzstwvdszhql](https://supabase.com/dashboard/project/sfttdefeuzstwvdszhql).
2. Click on the **SQL Editor** tab in the left sidebar (icon with `>_`).

---

## Step 2: Run Migrations in Order

Run the following SQL files one by one. In the SQL Editor, paste the contents of each file and click **Run** (or `Cmd + Enter` / `Ctrl + Enter`):

### 1. `001_schema.sql`
- **Path**: `supabase/migrations/001_schema.sql`
- **Purpose**: Creates the base tables (`profile`, `projects`, `skills`, `education`, `certifications`, `contact_messages`), indexes, `updated_at` trigger, and check constraints matching Firestore validation rules.

### 2. `002_admin.sql`
- **Path**: `supabase/migrations/002_admin.sql`
- **Purpose**: Creates the `public.admins` table and the `is_admin()` security-definer helper function.

### 3. Register Your Admin User
After running `002_admin.sql`, run this query to grant your authenticated user admin privileges:

```sql
INSERT INTO public.admins (user_id)
VALUES ('394bffe4-6f36-4421-85e2-fc677f511127')
ON CONFLICT (user_id) DO NOTHING;
```

*(UID `394bffe4-6f36-4421-85e2-fc677f511127` corresponds to `sinhakiran872@gmail.com`).*

### 4. `003_rls.sql`
- **Path**: `supabase/migrations/003_rls.sql`
- **Purpose**: Enables Row Level Security on all tables. Grants public read access to portfolio items, allows public submissions to `contact_messages` (with `read = false` constraint), and restricts all writes, updates, and deletes to `is_admin()`.

### 5. `004_storage.sql`
- **Path**: `supabase/migrations/004_storage.sql`
- **Purpose**: Provisions public storage buckets (`avatars`, `projects`, `certifications`, `institutions`, `resumes`) and sets RLS storage policies enforcing size limits, MIME type filtering, SVG blocking, and admin-only upload/delete.

---

## Step 3: Verify Setup

Run the verification queries in `supabase/tests/rls_check.sql` inside the SQL Editor to verify that:
1. Public / anonymous users can read portfolio items.
2. Anonymous users are blocked from inserting/modifying portfolio items.
3. Anonymous users can submit contact messages, but cannot read them.
4. Your admin user has full management access.
