-- Adicionar emails específicos como admins
INSERT INTO public.authorized_emails (email, role) VALUES
  ('camila.oliveira@grupotravessia.com', 'admin'),
  ('thais.monteiro@grupotravessia.com', 'admin'),
  ('lucas.bublitz@grupotravessia.com', 'admin'),
  ('vinicius.stopa@grupotravessia.com', 'admin'),
  ('francielle.ruppelt@grupotravessia.com', 'admin'),
  ('rafael.barichello@grupotravessia.com', 'admin'),
  ('diego.bomfim@grupotravessia.com', 'admin'),
  ('ioanni.apostolou@grupotravessia.com', 'admin'),
  ('aline.santos@grupotravessia.com', 'admin'),
  ('beatriz.demarchi@grupotravessia.com', 'admin'),
  ('eduarda.rezende@grupotravessia.com', 'admin'),
  ('ronaldo.souza@grupotravessia.com', 'admin'),
  ('jessica.rodrigues@grupotravessia.com', 'admin'),
  ('leonardo.ferreira@grupotravessia.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Sincronizar perfis existentes para refletir as novas roles
SELECT sync_profile_roles();