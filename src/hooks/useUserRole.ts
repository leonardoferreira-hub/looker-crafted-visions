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
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserRole('viewer');
      setIsLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error);
          setUserRole('viewer');
          setIsLoading(false);
          return;
        }

        if (profile) {
          setProfile(profile as Profile);
          setUserRole(profile.role as UserRole);
        } else {
          setUserRole('viewer');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserRole('viewer');
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, isAuthenticated]);

  const hasPermission = useCallback((requiredRole: UserRole) => {
    return requiredRole === 'viewer' ? true : userRole === 'admin';
  }, [userRole]);

  return {
    userRole,
    hasPermission,
    isLoading,
    isAdmin: userRole === 'admin',
    isViewer: userRole === 'viewer',
    profile,
    isAuthenticated
  };
};