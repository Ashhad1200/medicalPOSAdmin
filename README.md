# POS Admin Panel

## Authentication System

### Database Column Names

Ensure your `users` table has the following column names:

- `supabaseuid`: Unique identifier from Supabase Auth
- `email`: User's email address
- `role`: User's role (restricted, user, manager, admin)
- `organizationid`: ID of the organization the user belongs to
- `isactive`: Boolean indicating if the user account is active

### Role Hierarchy

The system implements a role-based access control with the following hierarchy:

- `restricted` (lowest access)
- `user`
- `manager`
- `admin` (highest access)

### Authentication Flow

1. User logs in via Supabase authentication
2. Supabase Auth provides a session
3. The system fetches the user's profile from the `users` table
4. User's role and permissions are determined based on their profile

### Environment Configuration

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Troubleshooting Common Issues

- **Column Name Mismatch**: Ensure database column names exactly match the code
  - Use `supabaseuid` for the Supabase Auth user ID column
- **Permission Denied**: Check RLS policies and service role permissions
- **Authentication Failures**:
  1. Verify Supabase configuration
  2. Check environment variables
  3. Ensure user profile exists in the `users` table

### Development Notes

- Always use the service role key for admin-level operations
- Implement proper error handling in authentication flows
- Use Row Level Security (RLS) to secure database access

## Running the Project

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run the development server: `npm run dev`

## Testing

- Run authentication tests: `npm run test:auth`
- Verify RLS policies manually in Supabase dashboard

## Deployment Considerations

- Never expose service role key in client-side code
- Use environment-specific configurations
- Implement proper logging and monitoring for authentication events
