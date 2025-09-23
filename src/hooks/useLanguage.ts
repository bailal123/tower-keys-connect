import { useContext } from 'react';
import { LanguageContext, type LanguageContextType } from './languageContext.ts';

// خطاف استخدام اللغة
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

// خطاف سريع للترجمة
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};