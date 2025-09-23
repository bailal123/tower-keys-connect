import { createContext } from 'react';

// نوع اللغات المدعومة
export type Language = 'ar' | 'en';

// نوع سياق اللغة
export interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// إنشاء سياق اللغة
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);