-- Update leonardo.ferreira profile role to match authorized_emails
UPDATE public.profiles p
SET role = ae.role
FROM auth.users u
JOIN public.authorized_emails ae ON ae.email = u.email
WHERE p.user_id = u.id 
  AND u.email = 'leonardo.ferreira@grupotravessia.com';