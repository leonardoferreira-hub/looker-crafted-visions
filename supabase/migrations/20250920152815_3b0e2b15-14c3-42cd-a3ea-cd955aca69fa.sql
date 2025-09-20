-- Melhorar a função sync_profile_roles para lidar com usuários removidos da lista
CREATE OR REPLACE FUNCTION public.sync_profile_roles()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualizar perfis para a role correta baseada em authorized_emails
  UPDATE public.profiles p
  SET role = ae.role
  FROM auth.users u
  JOIN public.authorized_emails ae ON ae.email = u.email
  WHERE p.user_id = u.id
    AND p.role != ae.role;
    
  -- Atualizar usuários @grupotravessia.com que não estão na lista authorized_emails para 'viewer'
  UPDATE public.profiles p
  SET role = 'viewer'
  FROM auth.users u
  WHERE p.user_id = u.id
    AND u.email LIKE '%@grupotravessia.com'
    AND NOT EXISTS (
      SELECT 1 FROM public.authorized_emails ae 
      WHERE ae.email = u.email
    )
    AND p.role != 'viewer';
END;
$function$;

-- Executar a função atualizada para corrigir o perfil do leonardo.ferreira
SELECT sync_profile_roles();