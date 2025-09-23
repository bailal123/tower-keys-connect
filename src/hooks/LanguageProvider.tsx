import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { LanguageContext, type Language, type LanguageContextType } from './languageContext';

// النصوص المترجمة
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // نصوص الصفحة الرئيسية
    'dashboard': 'لوحة التحكم',
    'welcome': 'أهلاً وسهلاً',
    'home': 'الرئيسية',
    
    // نصوص التنقل
    'countries': 'البلدان',
    'cities': 'المدن',
    'areas': 'المناطق',
    'features': 'الميزات',
    'designs': 'التصاميم',
    'logout': 'تسجيل الخروج',
    
    // نصوص تسجيل الدخول
    'login': 'تسجيل الدخول',
    'email': 'البريد الإلكتروني',
    'password': 'كلمة المرور',
    'login_button': 'دخول',
    'login_title': 'تسجيل الدخول',
    'login_subtitle': 'أدخل بياناتك للوصول إلى نظام إدارة العقارات',
    'email_placeholder': 'أدخل بريدك الإلكتروني',
    'password_placeholder': 'أدخل كلمة المرور',
    'remember_me': 'تذكرني',
    'forgot_password': 'نسيت كلمة المرور؟',
    'login_error': 'خطأ في البريد الإلكتروني أو كلمة المرور',
    'hide_password': 'إخفاء كلمة المرور',
    'show_password': 'إظهار كلمة المرور',
    'no_account': 'ليس لديك حساب؟',
    'sign_up': 'إنشاء حساب',
    
    // نصوص الإحصائيات
    'total_countries': 'إجمالي البلدان',
    'total_cities': 'إجمالي المدن',
    'total_areas': 'إجمالي المناطق',
    'total_towers': 'إجمالي الأبراج',
    
    // نصوص عامة
    'loading': 'جاري التحميل...',
    'error': 'حدث خطأ',
    'success': 'تم بنجاح',
    'cancel': 'إلغاء',
    'save': 'حفظ',
    'delete': 'حذف',
    'edit': 'تعديل',
    'add': 'إضافة',
    'search': 'بحث',
    'close': 'إغلاق',
    'confirm': 'تأكيد',
    'yes': 'نعم',
    'no': 'لا',
    
    // رسائل النظام
    'no_data': 'لا توجد بيانات',
    'network_error': 'خطأ في الشبكة',
    'server_error': 'خطأ في الخادم',
    'unauthorized': 'غير مصرح',
    'forbidden': 'ممنوع',
    'not_found': 'غير موجود',
  },
  en: {
    // Home page texts
    'dashboard': 'Dashboard',
    'welcome': 'Welcome',
    'home': 'Home',
    
    // Navigation texts
    'countries': 'Countries',
    'cities': 'Cities', 
    'areas': 'Areas',
    'features': 'Features',
    'designs': 'Designs',
    'logout': 'Logout',
    
    // Login texts
    'login': 'Login',
    'email': 'Email',
    'password': 'Password',
    'login_button': 'Login',
    'login_title': 'Sign In',
    'login_subtitle': 'Enter your credentials to access the Real Estate CRM',
    'email_placeholder': 'Enter your email',
    'password_placeholder': 'Enter your password',
    'remember_me': 'Remember me',
    'forgot_password': 'Forgot password?',
    'login_error': 'Invalid email or password',
    'hide_password': 'Hide password',
    'show_password': 'Show password',
    'no_account': "Don't have an account?",
    'sign_up': 'Sign up',
    
    // Statistics texts
    'total_countries': 'Total Countries',
    'total_cities': 'Total Cities',
    'total_areas': 'Total Areas',
    'total_towers': 'Total Towers',
    
    // General texts
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'search': 'Search',
    'close': 'Close',
    'confirm': 'Confirm',
    'yes': 'Yes',
    'no': 'No',
    
    // System messages
    'no_data': 'No data available',
    'network_error': 'Network error',
    'server_error': 'Server error',
    'unauthorized': 'Unauthorized',
    'forbidden': 'Forbidden',
    'not_found': 'Not found',
  }
};

// مزود سياق اللغة
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  // تحميل اللغة المحفوظة من localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ar', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // تحديث اتجاه النص عند تغيير اللغة
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // دالة تغيير اللغة
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // دالة تبديل اللغة
  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
  };

  // دالة الترجمة
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    isRTL: language === 'ar',
    toggleLanguage,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}