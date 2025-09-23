import { useContext } from 'react';
import { AuthContext, type AuthContextType, type User } from './authContext';
import type { UserPermission } from '../types/api';

// خطاف استخدام المصادقة
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// خطاف للتحقق من الصلاحيات
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: UserPermission): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(user?.role || '');
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    permissions: user?.permissions || [],
    role: user?.role || '',
  };
};

// تصدير نوع User للاستخدام في أماكن أخرى
export type { User };