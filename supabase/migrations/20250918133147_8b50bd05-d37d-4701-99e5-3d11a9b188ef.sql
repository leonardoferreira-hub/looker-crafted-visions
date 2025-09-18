-- Change leonardo.ferreira@grupotravessia.com role to viewer
UPDATE public.authorized_emails 
SET role = 'viewer' 
WHERE email = 'leonardo.ferreira@grupotravessia.com';