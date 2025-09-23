import { useState } from 'react';
// import {  useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Building2, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
// import { useLogin } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { cn } from '../lib/utils';
// import type {  LoginResponse } from '../types/api';
import {  useLogin } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import type { LoginResponse } from '../types/api';
// import { useMutation } from '@tanstack/react-query';
// import type { LoginResponse } from '../types/api';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  // const navigate = useNavigate();
  // const {  login } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLogin();
 
// const isAuthenticated = Boolean(localStorage.getItem('token'));
  // إذا كان المستخدم مسجل دخول بالفعل، انتقل للصفحة الرئيسية
  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
   const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.email || !formData.password) return;

 loginMutation.mutate(
  { credentials: formData, lang: language },
  {
    onSuccess: (data: unknown) => {
      console.log('Login successful:', data);
      // طباعة التوكن والكي بشكل منفصل
      const loginData = data as LoginResponse;
      console.log('Token:', loginData.token);
      console.log('Key:', loginData.key);

      const token = loginData.key ?? loginData.token ?? '';
      const userData = loginData.data ?? {} as LoginResponse['data'];
      const permissions = loginData.permissions ?? [];

      if (token && userData) {
        // إنشاء كائن المستخدم
        const user = {
          id: String(userData.id ?? ''),
          email: userData.email ?? '',
          firstName: userData.englishName ?? '',
          lastName: userData.arabicName ?? '',
          role: Array.isArray(userData.roles) ? userData.roles[0] : '',
          permissions
        };

        // استدعاء دالة login من AuthContext
        login(token, user);

        // إعادة التوجيه
        navigate('/dashboard', { replace: true });
      }
    },
    onError: (err) => console.error('Login failed', err)
  }
);
   }

//  const handleSubmit = (e: React.FormEvent) => {
//   e.preventDefault();
//   if (!formData.email || !formData.password) return;

//   loginMutation.mutate(
//     {
//       credentials: formData,
//       lang: language
//     },
//     {
//       onSuccess: (data: LoginResponse) => {
//         const token = data.token ||  '';
//         const userData = data.user ||  {};
//         if (token && userData) {
//           const user = {
//             id: String(userData.id ?? ''),
//             email: userData.email ?? '',
//             firstName: userData.englishName ?? '',
//             role: Array.isArray(userData.roles) ? userData.roles[0] ?? '' : '',
//             permissions: data.permissions ?? []
//           };
//           login(token, user);
//           // التحويل بعد تحديث الحالة
//           navigate('/dashboard', { replace: true });
//         }
//       },
//       onError: (err) => console.error('Login failed:', err)
//     }
//   );
// };


  const isLoading = loginMutation.isPending;
  const error = loginMutation.error as Error | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='7' r='1'/%3E%3Ccircle cx='7' cy='37' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 justify-center text-2xl font-bold text-blue-700">
              <Building2 className="h-7 w-7 text-indigo-500" />
              {t('login_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4" />
                <span>{t('login_error')}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('email_placeholder')}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200",
                      "placeholder-gray-400 text-gray-900",
                      language === 'ar' && "text-right pr-10 pl-4"
                    )}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('password_placeholder')}
                    className={cn(
                      "w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200",
                      "placeholder-gray-400 text-gray-900",
                      language === 'ar' && "text-right pr-12 pl-10"
                    )}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    title={showPassword ? t('hide_password') : t('show_password')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {t('forgot_password')}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('login_button')}...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>{t('login_button')}</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {t('no_account')}{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {t('sign_up')}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Real Estate CRM. All rights reserved.</p>
        </div>
      </div>
      {/* زر تغيير اللغة في الأسفل */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-md"
        >
          {language === 'ar' ? 'English' : 'العربية'}
        </Button>
      </div>
    </div>
  );
}
