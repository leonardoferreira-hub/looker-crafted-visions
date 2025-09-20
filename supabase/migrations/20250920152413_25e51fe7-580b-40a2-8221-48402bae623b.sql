-- Adicionar emails adicionais como admins
INSERT INTO public.authorized_emails (email, role) VALUES
  ('mario.cazzulo@grupotravessia.com', 'admin'),
  ('victor.ireno@grupotravessia.com', 'admin'),
  ('ramon.barros@grupotravessia.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Sincronizar perfis existentes para refletir as novas roles
SELECT sync_profile_roles();