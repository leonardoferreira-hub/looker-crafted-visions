-- Remover leonardo.ferreira@grupotravessia.com da tabela de emails autorizados
DELETE FROM public.authorized_emails 
WHERE email = 'leonardo.ferreira@grupotravessia.com';

-- Sincronizar perfis para atualizar a role (se o usuário já existir, será atualizado automaticamente no próximo login)
SELECT sync_profile_roles();