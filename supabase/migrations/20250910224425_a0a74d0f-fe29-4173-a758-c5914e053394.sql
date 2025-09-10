-- Ensure handle_new_user runs when a user is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created'
      AND c.relname = 'users'
      AND n.nspname = 'auth'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Make sure Leonardo's email is authorized as admin
UPDATE public.authorized_emails
SET role = 'admin'
WHERE email = 'leonardo.ferreira@grupotravessia.com';

-- Insert if not exists
INSERT INTO public.authorized_emails (email, role)
SELECT 'leonardo.ferreira@grupotravessia.com', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.authorized_emails WHERE email = 'leonardo.ferreira@grupotravessia.com'
);

-- Backfill profiles for existing authorized users without a profile
INSERT INTO public.profiles (user_id, display_name, role)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name,
  ae.role
FROM auth.users u
JOIN public.authorized_emails ae ON ae.email = u.email
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;