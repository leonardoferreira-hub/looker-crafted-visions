-- Add leonardo.ferreira@grupotravessia.com as admin
INSERT INTO public.authorized_emails (email, role) 
VALUES ('leonardo.ferreira@grupotravessia.com', 'admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'admin';