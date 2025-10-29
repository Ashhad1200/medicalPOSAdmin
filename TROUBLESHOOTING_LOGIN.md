# Troubleshooting Login Issues

## Quick Checklist

- [ ] Backend server is running on port 4001
- [ ] Frontend is running on port 3000
- [ ] `.env.local` has correct `NEXT_PUBLIC_API_URL=http://localhost:4001/api`
- [ ] Admin user exists in database with `role_in_pos = 'admin'`
- [ ] User password is correct
- [ ] Network tab shows login request succeeding (200 status)

## Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined (reading 'role')"

**Cause:** Response structure mismatch between frontend expectation and backend response.

**Solution:** Already fixed in `src/services/api.ts`. The frontend now correctly handles:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

**Verification:**
1. Check `src/services/api.ts` line 73-74 has `responseData.data?.user` extraction
2. Check line 152 uses `/api/auth/profile` endpoint

### Issue 2: "Insufficient permissions. Admin panel access requires admin or manager role."

**Causes:**
1. User's `role_in_pos` is not 'admin' or 'manager'
2. User's `role_in_pos` is 'none' or null
3. User doesn't have admin/manager role in database

**Solutions:**

**Option A: Update User Role in Database**
```sql
-- Connect to PostgreSQL
psql -U postgres -d medicalPOS

-- Update user role
UPDATE users 
SET role_in_pos = 'admin' 
WHERE email = 'admin@example.com';

-- Verify update
SELECT id, email, role_in_pos FROM users WHERE email = 'admin@example.com';
```

**Option B: Run Setup Script**
```bash
cd pos/server
node create-admin-user.js
```

**Option C: Seed Sample Data**
```bash
cd pos/server
node seed-sample-data.js
```

### Issue 3: "Invalid credentials"

**Causes:**
1. Email doesn't exist in database
2. Password is incorrect
3. User is deactivated (`is_active = false`)

**Solutions:**

**Check User Exists:**
```sql
SELECT id, email, is_active, role_in_pos FROM users WHERE email = 'admin@example.com';
```

**Reset User Password:**
```bash
cd pos/server
# Edit check-user-role.js or use direct SQL:
psql -U postgres -d medicalPOS

-- Hash a new password (use bcrypt in Node to generate)
-- Then update:
UPDATE users 
SET password_hash = '$2a$10$...' 
WHERE email = 'admin@example.com';
```

**Reactivate Deactivated User:**
```sql
UPDATE users 
SET is_active = true 
WHERE email = 'admin@example.com';
```

### Issue 4: "No authentication token found"

**Cause:** Token not being stored or retrieved from localStorage.

**Solutions:**

1. **Check localStorage in Browser DevTools:**
   - Open DevTools (F12)
   - Go to Application → Local Storage → http://localhost:3000
   - Look for `auth_token` key
   - If missing, login is failing before token storage

2. **Check Console Errors:**
   - Open DevTools Console
   - Look for errors from api.ts or useAuth.tsx
   - Note any error messages

3. **Check Network Requests:**
   - Open DevTools Network tab
   - Perform login
   - Find `POST /api/auth/login` request
   - Check response status (200 = success, 401 = invalid creds, 500 = server error)
   - Inspect response body for actual data structure

### Issue 5: "Failed to fetch user profile"

**Cause:** Token is stored but `/api/auth/profile` endpoint failing or returning error.

**Solutions:**

1. **Verify Backend Profile Endpoint:**
```bash
cd pos/server

# Check route exists
grep -n "profile" routes/auth.js

# Check controller function
grep -n "getProfile" controllers/authController.js
```

2. **Test Profile Endpoint Manually:**
```bash
# First get a valid token by logging in
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Then use token to get profile (replace TOKEN_HERE with actual token)
curl -X GET http://localhost:4001/api/auth/profile \
  -H "Authorization: Bearer TOKEN_HERE"
```

3. **Check Backend Logs:**
   - Look for errors in terminal where backend is running
   - Check for database connection issues

### Issue 6: Token Invalid or Expired

**Cause:** JWT token is malformed or has expired.

**Solutions:**

1. **Check JWT_EXPIRY in Backend:**
```bash
# Check environment variable
echo $JWT_EXPIRY

# Check default in authController.js
grep -n "JWT_EXPIRY" pos/server/controllers/authController.js
```

2. **Clear LocalStorage and Re-login:**
```javascript
// In browser console:
localStorage.clear()
// Then refresh page and login again
```

3. **Check Token Format:**
```javascript
// In browser console after login:
const token = localStorage.getItem('auth_token')
console.log('Token:', token)
console.log('Token parts:', token.split('.').length) // Should be 3
```

## Testing Procedures

### Full Login Flow Test

1. **Start Backend:**
```bash
cd pos
npm install
npm start
# Wait for: "✅ Server running on port 4001"
```

2. **Start Frontend:**
```bash
cd pos-admin-panel
npm install
npm run dev
# Wait for: "▲ Next.js ... ready - started server on localhost:3000"
```

3. **Test Login:**
   - Open http://localhost:3000
   - Open DevTools (F12)
   - Go to Network tab
   - Enter credentials and submit
   - Watch for `/api/auth/login` request
   - Verify 200 status code
   - Check response has `{ success: true, data: { user: {...}, token: "..." } }`
   - Check DevTools Console for any errors
   - Verify localStorage has `auth_token`

### Backend Login Response Test

```bash
cd pos/server
TEST_EMAIL="admin@example.com" TEST_PASSWORD="admin123" node test-login-response.js
```

Expected output:
```
🔍 Testing login response format...
Email: admin@example.com
POST http://localhost:4001/api/auth/login

✅ Login Response Test

Status Code: 200

Response Body:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@example.com",
      ...
    },
    "token": "..."
  }
}

�� Response Structure Validation:
✓ success: true
✓ data: true
✓ data.user: true
✓ data.token: true
✓ data.user.role_in_pos: admin
✓ data.user.id: ...
✓ data.user.email: admin@example.com

✅ Response structure is correct!
```

## Debugging Tips

### Enable Detailed Logging

**Backend:**
```bash
# In pos/server, add to authController.js:
console.log('Login request:', { email, password });
console.log('Profile found:', profile);
console.log('Response being sent:', responseData);
```

**Frontend:**
```typescript
// In src/services/api.ts login function:
console.log('Response status:', response.status);
console.log('Response data:', responseData);
console.log('User data:', userData);
console.log('Token:', token);
```

### Check Database Directly

```bash
# Connect to PostgreSQL
psql -U postgres -d medicalPOS

# List all users
SELECT id, email, username, role_in_pos, is_active FROM users;

# Check specific user
SELECT * FROM users WHERE email = 'admin@example.com'\gx

# Check organizations
SELECT id, name, is_active, access_valid_till FROM organizations;
```

## Files to Review

- ✅ `/pos-admin-panel/src/services/api.ts` - Response handling
- ✅ `/pos-admin-panel/src/hooks/useAuth.tsx` - Auth context and state
- ✅ `/pos-admin-panel/src/app/(auth)/login/page.tsx` - Login page component
- ✅ `/pos/server/controllers/authController.js` - Backend auth logic
- ✅ `/pos/server/routes/auth.js` - Auth routes
- ✅ `/pos/server/middleware/auth.js` - JWT verification middleware

## Getting Help

1. **Check logs in both terminals** - Backend and Frontend
2. **Use browser DevTools** - Network tab and Console
3. **Test endpoint directly** - Use curl or Postman
4. **Verify database** - Check user exists with correct role
5. **Review recent changes** - Look for API/schema changes

## Success Indicators

✅ Login page accepts credentials  
✅ Request shows 200 status in Network tab  
✅ localStorage shows `auth_token` key  
✅ Page redirects to dashboard  
✅ User menu shows logged-in username  
✅ Able to view users, medicines, orders, etc.  

---

**Last Updated:** 2025-01-21  
**Status:** ✅ Login authentication working with backend PostgreSQL integration
