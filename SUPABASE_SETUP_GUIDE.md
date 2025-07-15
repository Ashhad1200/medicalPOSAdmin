# Supabase Manual Setup Guide

Follow these steps to set up your Supabase database for the POS Admin Panel.

## 1. Access SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `kswqioakysmvofjngnxq`
3. Navigate to the SQL Editor in the left sidebar
4. Click "New Query"

## 2. Create Tables

Copy and paste the following SQL code into the editor and run it:

```sql
-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "subscriptionTier" TEXT NOT NULL DEFAULT 'basic',
  "maxUsers" INTEGER NOT NULL DEFAULT 5,
  "currentUsers" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "supabaseUid" TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "fullName" TEXT,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  permissions JSONB NOT NULL DEFAULT '[]'::JSONB,
  "organizationId" TEXT NOT NULL,
  "subscriptionStatus" TEXT NOT NULL DEFAULT 'pending',
  "accessValidTill" TIMESTAMP WITHOUT TIME ZONE,
  "isTrialUser" BOOLEAN NOT NULL DEFAULT TRUE,
  "isActive" BOOLEAN NOT NULL DEFAULT FALSE,
  "isEmailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "lastLogin" TIMESTAMP WITHOUT TIME ZONE,
  "loginAttempts" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP WITHOUT TIME ZONE,
  "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "twoFactorSecret" TEXT,
  preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("organizationId") REFERENCES organizations(id)
);
```

## 3. Disable Row Level Security (RLS)

Run the following SQL to disable RLS for development:

```sql
-- Disable RLS for development
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL PRIVILEGES ON organizations TO authenticated;
GRANT ALL PRIVILEGES ON organizations TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON users TO anon;
```

## 4. Create Default Organization

Run the following SQL to create a default organization:

```sql
-- Create default organization
INSERT INTO organizations (
  id,
  name,
  code,
  description,
  address,
  phone,
  email,
  "isActive",
  "subscriptionTier",
  "maxUsers",
  "currentUsers"
)
VALUES (
  'default-org-id',
  'Medical POS System',
  'MPS-001',
  'Default organization for Medical POS System',
  'System Default',
  '+1234567890',
  'admin@medicalpos.com',
  true,
  'enterprise',
  100,
  1
)
ON CONFLICT (code) DO NOTHING;
```

## 5. Create Helper Function

Run the following SQL to create a helper function:

```sql
-- Drop the existing function first if it exists
DROP FUNCTION IF EXISTS get_user_by_supabase_uid(text);

-- Create RPC function to get user by supabase_uid
CREATE OR REPLACE FUNCTION get_user_by_supabase_uid(p_supabase_uid TEXT)
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE "supabaseUid" = p_supabase_uid;
END;
$$;
```

## 6. Create Admin User in Auth

1. Go to Authentication → Users
2. Click "Add User"
3. Fill in the details:
   - Email: `admin@medicalpos.com`
   - Password: `AdminPos2024!`
   - Check "Auto-confirm user"
4. Click "Create User"
5. Copy the User ID (UUID)

## 7. Create Admin User in Database

Run the following SQL to create the admin user, replacing `YOUR_SUPABASE_AUTH_USER_ID` with the ID you copied:

```sql
-- Create admin user with explicit ID
INSERT INTO users (
  id,
  "supabaseUid",
  username,
  email,
  "fullName",
  role,
  permissions,
  "organizationId",
  "subscriptionStatus",
  "accessValidTill",
  "isTrialUser",
  "isActive",
  "isEmailVerified"
)
VALUES (
  gen_random_uuid(), -- Generate a UUID for the ID column
  'YOUR_SUPABASE_AUTH_USER_ID',
  'admin',
  'admin@medicalpos.com',
  'System Administrator',
  'admin',
  '["all"]'::JSONB,
  'default-org-id',
  'active',
  '2025-12-31T23:59:59Z',
  false,
  true,
  true
)
ON CONFLICT (email) DO NOTHING;
```

## 8. Verify Setup

Run the following SQL to verify your setup:

```sql
-- Verify organization
SELECT * FROM organizations WHERE code = 'MPS-001';

-- Verify user
SELECT * FROM users WHERE email = 'admin@medicalpos.com';
```

## 9. Test Login

1. Start the admin panel: `npm run dev`
2. Open your browser to: http://localhost:3000
3. Login with:
   - Email: `admin@medicalpos.com`
   - Password: `AdminPos2024!`
