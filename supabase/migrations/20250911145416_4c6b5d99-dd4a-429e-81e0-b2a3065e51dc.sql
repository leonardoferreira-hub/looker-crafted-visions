-- Adicionar acesso de viewer para leonardoff108@gmail.com
INSERT INTO public.authorized_emails (email, role, created_at)
VALUES ('leonardoff108@gmail.com', 'viewer', now())
ON CONFLICT (email) DO UPDATE SET 
  role = 'viewer',
  created_at = now();