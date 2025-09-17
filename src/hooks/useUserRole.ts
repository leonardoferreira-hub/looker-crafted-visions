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

    // Verificar se é admin por email
    const adminEmails = ['leonardo.ferreira@grupotravessia.com'];
    const isAdmin = adminEmails.includes(user.email || '');

    setUserRole(isAdmin ? 'admin' : 'viewer');
    setIsLoading(false);
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