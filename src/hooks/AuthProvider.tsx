import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextType, type User } from './authContext';

// مزود سياق المصادقة
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل بيانات المصادقة من localStorage عند بدء التطبيق
  // useEffect(() => {
  //   const savedToken = localStorage.getItem('token');
  //   const savedUser = localStorage.getItem('user');

  //   if (savedToken && savedUser) {
  //     try {
  //       const parsedUser = JSON.parse(savedUser);
  //       setToken(savedToken);
  //       setUser(parsedUser);
  //     } catch (error) {
  //       console.error('Error parsing saved user data:', error);
  //       localStorage.removeItem('token');
  //       localStorage.removeItem('user');
  //     }
  //   }
    
  //   setIsLoading(false);
  // }, []);
  useEffect(() => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (token && savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      // setAuthState({ token, user: parsedUser });
      setToken(token);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing saved user data:', error);
      // تنظيف التخزين في حال وجود بيانات تالفة
      localStorage.removeItem('user');
    }
  }
  setIsLoading(false);
}, []);

  // دالة تسجيل الدخول
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // دالة تسجيل الخروج
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}