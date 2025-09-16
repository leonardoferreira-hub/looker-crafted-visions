-- Update lucas.bublitz@grupotravessia.com to admin role for full access
UPDATE public.authorized_emails 
SET role = 'admin' 
WHERE email = 'lucas.bublitz@grupotravessia.com';