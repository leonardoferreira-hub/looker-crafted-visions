-- Tornar tabelas públicas temporariamente para integração externa

-- Drop existing RLS policies for profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can view their own profile" ON public.profiles;

-- Drop existing RLS policies for authorized_emails
DROP POLICY IF EXISTS "Admins can manage authorized emails" ON public.authorized_emails;

-- Create new public read policies
CREATE POLICY "Public can view all profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can view authorized emails"
ON public.authorized_emails
FOR SELECT
TO public
USING (true);

-- Keep admin policies for management
CREATE POLICY "Authenticated users can manage their own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage authorized emails"
ON public.authorized_emails
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());