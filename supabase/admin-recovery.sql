-- ═══════════════════════════════════════════════════════════════
-- Suttro Admin Panel Recovery
-- ═══════════════════════════════════════════════════════════════
-- Use this when you've forgotten your admin login credentials.
--
-- How to run:
--   1. Open Supabase Studio (self-hosted on your Coolify VPS)
--   2. Go to SQL Editor
--   3. Copy-paste ONE section at a time, don't run the whole file
--   4. Read comments carefully — some sections are destructive
--
-- Admin access requires TWO things:
--   (a) A user in auth.users with email + password
--   (b) A matching row in admin_users table
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────
-- STEP 1 — List existing admins (READ-ONLY, safe to run)
-- ─────────────────────────────────────────────────────────
-- This shows you which emails currently have admin access.
-- If you see your email here, go to STEP 2.
-- If the list is EMPTY, go to STEP 3.

SELECT
  a.email             AS admin_email,
  a.role              AS admin_role,
  a.name              AS admin_name,
  u.email_confirmed_at,
  u.last_sign_in_at,
  a.created_at
FROM admin_users a
JOIN auth.users u ON u.id = a.id
ORDER BY a.created_at ASC;


-- ─────────────────────────────────────────────────────────
-- STEP 2 — Reset password for an EXISTING admin
-- ─────────────────────────────────────────────────────────
-- Replace the email and new password, then run.
-- Password must be at least 8 chars.
--
-- NOTE: This directly updates the encrypted password. Supabase uses
-- bcrypt via the pgcrypto extension. The `crypt()` call handles it.

UPDATE auth.users
SET encrypted_password = crypt('PUT_NEW_PASSWORD_HERE', gen_salt('bf')),
    updated_at          = now()
WHERE email = 'PUT_YOUR_ADMIN_EMAIL_HERE';

-- Verify it worked (should return 1 row):
SELECT email, updated_at FROM auth.users WHERE email = 'PUT_YOUR_ADMIN_EMAIL_HERE';


-- ─────────────────────────────────────────────────────────
-- STEP 3 — Create a brand-new super_admin (if none exist)
-- ─────────────────────────────────────────────────────────
-- Use this when STEP 1 returned zero rows, OR when you want to
-- add a fresh admin account you fully control.
--
-- Replace the email, password, and name below, then run the whole
-- block as ONE statement.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  admin_email TEXT := 'PUT_NEW_ADMIN_EMAIL_HERE';      -- e.g. 'shaon@suttro.app'
  admin_pass  TEXT := 'PUT_NEW_ADMIN_PASSWORD_HERE';   -- min 8 chars
  admin_name  TEXT := 'PUT_YOUR_NAME_HERE';
BEGIN
  -- 1. Insert into auth.users (Supabase auth table)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_pass, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', admin_name),
    false,
    '',
    '',
    '',
    ''
  );

  -- 2. Insert matching identity row (required for email/password login on newer Supabase)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    jsonb_build_object('sub', new_user_id::text, 'email', admin_email),
    'email',
    now(),
    now(),
    now()
  );

  -- 3. Insert into admin_users with super_admin role
  INSERT INTO admin_users (id, email, role, name)
  VALUES (new_user_id, admin_email, 'super_admin', admin_name);

  RAISE NOTICE 'Created super_admin: % (id: %)', admin_email, new_user_id;
END $$;


-- ─────────────────────────────────────────────────────────
-- STEP 4 — Promote an existing regular user to admin
-- ─────────────────────────────────────────────────────────
-- If you already have a normal Suttro account (from the app) and
-- want to give it admin access without creating a new user.

INSERT INTO admin_users (id, email, role, name)
SELECT
  u.id,
  u.email,
  'super_admin',                      -- or 'admin' or 'editor'
  COALESCE((u.raw_user_meta_data->>'name'), split_part(u.email, '@', 1))
FROM auth.users u
WHERE u.email = 'PUT_EXISTING_USER_EMAIL_HERE'
ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role;


-- ─────────────────────────────────────────────────────────
-- STEP 5 — Remove admin access (DESTRUCTIVE — use with care)
-- ─────────────────────────────────────────────────────────
-- Only removes the admin role, keeps the auth user intact so they
-- can still use the regular Suttro app.

-- DELETE FROM admin_users WHERE email = 'REVOKE_THIS_EMAIL';


-- ═══════════════════════════════════════════════════════════════
-- Done. Go to https://admin.suttro.app/login and sign in with the
-- email + password you set above.
-- ═══════════════════════════════════════════════════════════════
