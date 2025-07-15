# Admin Panel Setup Guide

## Step 1: Environment Configuration

Create `.env.local` file in the root directory:

```bash
# Copy from your Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional configurations
NEXT_PUBLIC_APP_NAME="Medical POS Admin Panel"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_ENVIRONMENT=development
```

## Step 2: Create First Admin User

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add user" (or "Invite user")
3. Fill in:
   - Email: `admin@yourcompany.com`
   - Password: Choose a strong password
   - Confirm password
   - ✅ Auto Confirm User

### Option B: Using SQL

```sql
-- 1. First, create the organization (if not exists)
INSERT INTO organizations (id, name, code, description, subscription_tier, max_users)
VALUES (
  gen_random_uuid(),
  'Your Company Name',
  'MAIN',
  'Main organization for POS system',
  'enterprise',
  100
);

-- 2. Get the organization ID
SELECT id, name FROM organizations WHERE code = 'MAIN';

-- 3. Create admin user record (after creating auth user via dashboard)
INSERT INTO users (
  id,
  supabase_uid,
  username,
  email,
  full_name,
  role,
  organization_id,
  is_active,
  subscription_status,
  access_valid_till,
  permissions,
  created_by
) VALUES (
  gen_random_uuid(),
  'YOUR_SUPABASE_AUTH_UID_HERE',  -- Get this from auth.users table
  'admin',
  'admin@yourcompany.com',
  'System Administrator',
  'admin',
  'YOUR_ORGANIZATION_ID_HERE',   -- Use ID from step 2
  true,
  'active',
  (NOW() + INTERVAL '1 year'),
  '["super_admin", "user_management", "organization_management", "audit_access"]',
  null
);
```

## Step 3: Verify Database Schema

Ensure these tables exist in your Supabase database:

```sql
-- Check if all required tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'organizations',
  'users',
  'audit_logs',
  'user_inventory',
  'user_preferences',
  'user_reminders',
  'user_notes',
  'user_ledger'
);
```

## Step 4: Test the Setup

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Try logging in with your admin credentials

4. You should see the admin dashboard

## Step 5: Configure Row Level Security (RLS)

Apply these RLS policies to secure your data:

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations: Only admins can see all organizations
CREATE POLICY "Admin can view all organizations" ON organizations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.supabase_uid = auth.uid()
    AND users.role IN ('admin')
    AND users.is_active = true
  )
);

-- Users: Admins can see all users, managers can see their org users
CREATE POLICY "Admin and managers can view users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.supabase_uid = auth.uid()
    AND u.is_active = true
    AND (
      u.role = 'admin' OR
      (u.role = 'manager' AND u.organization_id = users.organization_id)
    )
  )
);

-- Audit logs: Admin can see all, managers can see their org
CREATE POLICY "Admin and managers can view audit logs" ON audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.supabase_uid = auth.uid()
    AND u.is_active = true
    AND (
      u.role = 'admin' OR
      (u.role = 'manager' AND u.organization_id = audit_logs.organization_id)
    )
  )
);
```

## Step 6: Production Deployment

### Vercel Deployment:

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
NEXT_PUBLIC_APP_NAME="Medical POS Admin Panel"
NEXT_PUBLIC_ENVIRONMENT=production
```

## Troubleshooting

### Common Issues:

1. **Can't login**: Check if user exists in both `auth.users` and `public.users` tables
2. **Access denied**: Verify user role is 'admin' or 'manager' and is_active is true
3. **Data not loading**: Check RLS policies and Supabase connection
4. **Environment errors**: Ensure all required env vars are set

### Useful SQL Queries:

```sql
-- Check auth users
SELECT id, email, created_at FROM auth.users;

-- Check app users
SELECT id, supabase_uid, email, role, is_active, organization_id FROM users;

-- Check user with organization
SELECT
  u.id, u.username, u.email, u.role, u.is_active,
  o.name as org_name, o.subscription_tier
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id;
```

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Service role key kept secure
- ✅ Admin user has strong password
- ✅ Environment variables secured
- ✅ Production deployment uses HTTPS
- ✅ Regular backup of Supabase data

## Next Steps

1. **Customize branding** in components and Tailwind config
2. **Add more admin users** through the admin panel
3. **Configure organization settings** for your clients
4. **Set up monitoring** and alerts for the admin panel
5. **Regular security audits** of user access and permissions

Your POS Admin Panel is now ready for managing your medical POS system! 🎉
