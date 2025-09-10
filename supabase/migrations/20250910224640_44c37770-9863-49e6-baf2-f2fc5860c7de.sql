-- Update Leonardo's profile to admin role
UPDATE public.profiles 
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'leonardo.ferreira@grupotravessia.com'
);

-- Create a function to sync profile roles with authorized emails
CREATE OR REPLACE FUNCTION public.sync_profile_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update existing profiles to match their authorized email role
  UPDATE public.profiles p
  SET role = ae.role
  FROM auth.users u
  JOIN public.authorized_emails ae ON ae.email = u.email
  WHERE p.user_id = u.id
    AND p.role != ae.role;
END;
$$;

-- Run the sync function
SELECT public.sync_profile_roles();