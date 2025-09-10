import { useState, useEffect } from 'react';

export type UserRole = 'admin' | 'viewer';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carrega o role salvo no localStorage
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole && (savedRole === 'admin' || savedRole === 'viewer')) {
      setUserRole(savedRole);
    }
    setIsLoading(false);
  }, []);

  const changeRole = (newRole: UserRole) => {
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
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
    isViewer: userRole === 'viewer'
  };
};