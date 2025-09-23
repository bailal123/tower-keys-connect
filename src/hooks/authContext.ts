import { createContext } from 'react';
import type { UserPermission } from '../types/api';

// نوع بيانات المستخدم
export interface User {
  id: string;
  email: string;
  firstName: string;
   lastName?: string;
  role: string;
  permissions: UserPermission[];
  // id?: number;
  // arabicName?: string;
  // englishName?: string;
  // email?: string;
  // phoneNumber?: string;
  // isActive?: boolean;
  // roles?: string[];
}

// نوع سياق المصادقة
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// إنشاء سياق المصادقة
export const AuthContext = createContext<AuthContextType | undefined>(undefined);