-- Tornar tabelas públicas temporariamente para integração externa

-- Drop ALL existing RLS policies for profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Drop ALL existing RLS policies for authorized_emails
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'authorized_emails' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.authorized_emails';
    END LOOP;
END $$;

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