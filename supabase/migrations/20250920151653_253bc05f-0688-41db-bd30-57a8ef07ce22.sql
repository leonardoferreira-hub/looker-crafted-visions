-- Atualizar função is_authorized_user para aceitar emails @grupotravessia.com
CREATE OR REPLACE FUNCTION public.is_authorized_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verifica se o usuário está na lista de emails autorizados OU
  -- se o email termina com @grupotravessia.com
  RETURN EXISTS (
    SELECT 1 FROM public.authorized_emails ae
    JOIN auth.users u ON u.email = ae.email
    WHERE u.id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.email LIKE '%@grupotravessia.com'
  );
END;
$function$;

-- Atualizar função handle_new_user para criar perfis automáticos para @grupotravessia.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role text := 'viewer'; -- Default role
BEGIN
  -- Se o email está na lista de autorizados, usar a role específica
  IF EXISTS (SELECT 1 FROM public.authorized_emails WHERE email = NEW.email) THEN
    SELECT ae.role INTO user_role
    FROM public.authorized_emails ae
    WHERE ae.email = NEW.email;
  -- Se o email termina com @grupotravessia.com, usar role 'viewer'
  ELSIF NEW.email LIKE '%@grupotravessia.com' THEN
    user_role := 'viewer';
  -- Caso contrário, bloquear acesso
  ELSE
    RAISE EXCEPTION 'Email % is not authorized to access this application', NEW.email;
  END IF;

  -- Criar perfil do usuário
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    user_role
  );
  
  RETURN NEW;
END;
$function$;