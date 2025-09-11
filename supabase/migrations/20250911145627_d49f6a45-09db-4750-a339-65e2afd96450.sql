-- Adicionar acesso de viewer para lucas.bublitz@grupotravessia.com
INSERT INTO public.authorized_emails (email, role, created_at)
VALUES ('lucas.bublitz@grupotravessia.com', 'viewer', now())
ON CONFLICT (email) DO UPDATE SET 
  role = 'viewer',
  created_at = now();