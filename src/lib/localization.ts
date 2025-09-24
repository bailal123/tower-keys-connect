import type { Language } from '../hooks/languageContext'

// دالة مساعدة لعرض النص الصحيح حسب اللغة
export const getLocalizedText = (
  arabicText: string, 
  englishText: string, 
  language: Language
): string => {
  return language === 'ar' ? arabicText : englishText
}

// دالة مساعدة لعرض الأسماء من API
export const getLocalizedName = (
  item: { arabicName?: string; englishName?: string } | null | undefined,
  language: Language
): string => {
  if (!item) {
    return ''
  }
  
  if (language === 'ar') {
    return item.arabicName || item.englishName || ''
  }
  return item.englishName || item.arabicName || ''
}

// دالة مساعدة لعرض الوصف من API
export const getLocalizedDescription = (
  item: { arabicDescription?: string; englishDescription?: string } | null | undefined,
  language: Language
): string => {
  if (!item) {
    return ''
  }
  
  if (language === 'ar') {
    return item.arabicDescription || item.englishDescription || ''
  }
  return item.englishDescription || item.arabicDescription || ''
}

export default {
  getLocalizedText,
  getLocalizedName,
  getLocalizedDescription
}