-- Clean up conflicting RLS policies on profiles table
-- Remove the less secure policies that don't require authorization

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Keep only the secure policies that require is_authorized_user()
-- The following policies will remain:
-- - "Admins can view all profiles" 
-- - "Authorized users can insert their own profile"
-- - "Authorized users can update their own profile" 
-- - "Authorized users can view their own profile"

-- Enable leaked password protection (this requires manual configuration in Supabase dashboard)
-- Note: This must be enabled in Authentication > Settings in the Supabase dashboard