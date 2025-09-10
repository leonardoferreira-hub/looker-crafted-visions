import { useState, useEffect } from 'react';
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
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Se não estiver autenticado, usa localStorage como fallback
      const savedRole = localStorage.getItem('userRole') as UserRole;
      if (savedRole && (savedRole === 'admin' || savedRole === 'viewer')) {
        setUserRole(savedRole);
      }
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
          // Fallback para localStorage em caso de erro
          const savedRole = localStorage.getItem('userRole') as UserRole;
          if (savedRole && (savedRole === 'admin' || savedRole === 'viewer')) {
            setUserRole(savedRole);
          }
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
          // Sincroniza com localStorage
          localStorage.setItem('userRole', data.role);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback para localStorage
        const savedRole = localStorage.getItem('userRole') as UserRole;
        if (savedRole && (savedRole === 'admin' || savedRole === 'viewer')) {
          setUserRole(savedRole);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, isAuthenticated]);

  const changeRole = async (newRole: UserRole) => {
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);

    // Se estiver autenticado, atualiza no Supabase também
    if (isAuthenticated && user && profile) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating user role:', error);
        } else {
          setProfile({ ...profile, role: newRole });
        }
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    }
  };

  const hasPermission = (requiredRole: UserRole) => {
    if (requiredRole === 'viewer') return true;
    return userRole === 'admin';
  };

  return {
    userRole,
    changeRole,
    hasPermission,
    isLoading,
    isAdmin: userRole === 'admin',
    isViewer: userRole === 'viewer',
    profile,
    isAuthenticated
  };
};