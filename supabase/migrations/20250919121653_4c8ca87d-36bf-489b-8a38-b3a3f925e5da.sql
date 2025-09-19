-- Sync profile roles to match authorized emails
SELECT sync_profile_roles();

-- Verify the update
UPDATE public.profiles p
SET role = ae.role
FROM auth.users u
JOIN public.authorized_emails ae ON ae.email = u.email
WHERE p.user_id = u.id
  AND ae.email = 'leonardo.ferreira@grupotravessia.com';