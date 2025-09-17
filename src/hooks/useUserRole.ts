import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'viewer';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Monitor isDevelopmentMode changes
  useEffect(() => {
    console.log('🔧 isDevelopmentMode changed:', isDevelopmentMode);
  }, [isDevelopmentMode]);

  // Monitor userRole changes
  useEffect(() => {
    console.log('👤 userRole changed:', userRole);
  }, [userRole]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserRole('viewer');
      setIsLoading(false);
      return;
    }

    // Se estiver autenticado, busca o role do Supabase
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserRole('viewer');
        } else if (data) {
          const profileData: Profile = {
            id: data.id,
            user_id: data.user_id,
            display_name: data.display_name,
            role: data.role as UserRole,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          setProfile(profileData);
          setUserRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserRole('viewer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, isAuthenticated]);


  const hasPermission = useCallback((requiredRole: UserRole) => {
    const result = requiredRole === 'viewer' ? true : userRole === 'admin';
    console.log(`🔑 hasPermission("${requiredRole}") - userRole: ${userRole} - result: ${result}`);
    return result;
  }, [userRole]);

  // Função temporária para desenvolvimento - permite alternar entre roles
  const toggleDevelopmentRole = () => {
    console.log('🔄 toggleDevelopmentRole called', { isDevelopmentMode, currentRole: userRole });
    if (isDevelopmentMode) {
      const newRole: UserRole = userRole === 'admin' ? 'viewer' : 'admin';
      console.log('🔄 Alternando role:', { from: userRole, to: newRole });
      setUserRole(newRole);
    } else {
      console.log('❌ toggleDevelopmentRole: isDevelopmentMode is false');
    }
  };

  const enableDevelopmentMode = () => {
    console.log('🛠️ Ativando modo desenvolvimento');
    setIsDevelopmentMode(true);
  };

  const disableDevelopmentMode = () => {
    setIsDevelopmentMode(false);
    // Recarrega o role real do usuário
    if (isAuthenticated && user) {
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            setUserRole('viewer');
          } else if (data) {
            setUserRole(data.role as UserRole);
          }
        } catch (error) {
          setUserRole('viewer');
        }
      };
      fetchUserProfile();
    }
  };

  return {
    userRole,
    hasPermission,
    isLoading,
    isAdmin: userRole === 'admin',
    isViewer: userRole === 'viewer',
    profile,
    isAuthenticated,
    // Funções de desenvolvimento
    isDevelopmentMode,
    toggleDevelopmentRole,
    enableDevelopmentMode,
    disableDevelopmentMode
  };
};