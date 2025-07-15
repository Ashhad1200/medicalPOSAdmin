# 🚀 Admin User Setup Instructions

Follow these steps to create your first admin user for the Medical POS Admin Panel.

## 📋 Prerequisites

- Access to your Supabase Dashboard
- Admin panel environment variables configured

## 🔑 Login Credentials (After Setup)

```
🌐 Admin Panel URL: http://localhost:3000
📧 Email: admin@medicalpos.com
🔑 Password: AdminPos2024!
👤 Username: admin
🏢 Organization: Medical POS System
```

## 📝 Setup Steps

### Step 1: Create Auth User in Supabase

1. **Go to your Supabase Dashboard**

   - Navigate to: https://supabase.com/dashboard/projects
   - Select your project: `kswqioakysmvofjngnxq`

2. **Go to Authentication → Users**

   - Click on "Add user" button
   - Fill in the details:
     - **Email**: `admin@medicalpos.com`
     - **Password**: `AdminPos2024!`
     - **Email Confirm**: ✅ Checked
   - Click "Create user"

3. **Copy the User ID**
   - After creating the user, click on the user in the list
   - Copy the **User UID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Run SQL Setup Script

1. **Go to SQL Editor**

   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New query"

2. **Run the Setup Script**

   ```sql
   -- =====================================================
   -- Medical POS Admin Panel - Initial Admin User Setup
   -- =====================================================

   -- Step 1: Create default organization
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
     "currentUsers",
     "createdAt",
     "updatedAt"
   ) VALUES (
     gen_random_uuid(),
     'Medical POS System',
     'MPS-001',
     'Default organization for Medical POS System',
     'System Default',
     '+1234567890',
     'admin@medicalpos.com',
     true,
     'enterprise',
     100,
     1,
     now(),
     now()
   )
   ON CONFLICT (code) DO NOTHING;

   -- Step 2: Create admin user record
   -- IMPORTANT: Replace 'YOUR_SUPABASE_AUTH_USER_ID' with the actual ID from Step 1
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
     "isEmailVerified",
     theme,
     language,
     timezone,
     "notificationSettings",
     preferences,
     "createdAt",
     "updatedAt"
   ) VALUES (
     gen_random_uuid(),
     'YOUR_SUPABASE_AUTH_USER_ID', -- 🚨 REPLACE THIS WITH ACTUAL AUTH USER ID
     'admin',
     'admin@medicalpos.com',
     'System Administrator',
     'admin',
     '["all"]'::jsonb,
     (SELECT id FROM organizations WHERE code = 'MPS-001' LIMIT 1),
     'active',
     '2025-12-31T23:59:59Z',
     false,
     true,
     true,
     'light',
     'en',
     'UTC',
     '{}'::jsonb,
     '{}'::jsonb,
     now(),
     now()
   )
   ON CONFLICT (email) DO NOTHING;

   -- Step 3: Create initial audit log
   INSERT INTO "auditLogs" (
     id,
     action,
     entity,
     "entityId",
     "userId",
     "organizationId",
     "newValues",
     metadata,
     timestamp
   ) VALUES (
     gen_random_uuid(),
     'CREATE',
     'User',
     (SELECT id FROM users WHERE email = 'admin@medicalpos.com' LIMIT 1),
     (SELECT id FROM users WHERE email = 'admin@medicalpos.com' LIMIT 1),
     (SELECT id FROM organizations WHERE code = 'MPS-001' LIMIT 1),
     '{"setup": true, "initial_admin": true}'::jsonb,
     '{"setup": true, "initial_admin": true}'::jsonb,
     now()
   );
   ```

3. **Before running**, replace `YOUR_SUPABASE_AUTH_USER_ID` with the User UID you copied in Step 1

4. **Click "Run"**

### Step 3: Verify Setup

Run this verification query in SQL Editor:

```sql
-- Verify the setup
SELECT
  'Organization Created' as step,
  name,
  code,
  "subscriptionTier",
  "maxUsers",
  "isActive"
FROM organizations
WHERE code = 'MPS-001';

SELECT
  'User Created' as step,
  username,
  email,
  "fullName",
  role,
  "subscriptionStatus",
  "isActive"
FROM users
WHERE email = 'admin@medicalpos.com';
```

You should see both the organization and user records returned.

### Step 4: Test Login

1. **Start the admin panel** (if not already running):

   ```bash
   cd pos-admin-panel
   npm run dev
   ```

2. **Open your browser** to: http://localhost:3000

3. **Login with credentials**:
   - **Email**: `admin@medicalpos.com`
   - **Password**: `AdminPos2024!`

## 🎉 Success!

If everything worked correctly, you should:

- ✅ See the admin dashboard
- ✅ Have access to user management
- ✅ Be able to create organizations and users

## ⚠️ Important Security Notes

1. **Change the password** immediately after first login
2. **Update the email** to your actual admin email
3. **Save these credentials** securely
4. **Delete the setup files** after successful setup:
   ```bash
   rm setup-admin-user.js setup-admin-user.sql
   ```

## 🆘 Troubleshooting

### If login fails:

1. Check that the auth user was created in Supabase
2. Verify the database record was created with correct `supabaseUid`
3. Ensure the user is active (`isActive = true`)
4. Check browser console for errors

### If dashboard doesn't load:

1. Verify environment variables are correct
2. Check that the admin panel server is running
3. Ensure the user has `role = 'admin'`

## 📧 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Verify the SQL queries ran successfully
3. Ensure the Supabase Auth user and database user are properly linked

---

**Once setup is complete, you'll have full access to manage your Medical POS system!** 🚀
