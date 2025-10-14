-- Adicionar leonardo.ferreira@grupotravessia.com como admin
INSERT INTO public.authorized_emails (email, role)
VALUES ('leonardo.ferreira@grupotravessia.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Sincronizar as roles dos perfis
SELECT sync_profile_roles();