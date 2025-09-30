// ==============================================================================
// REAL ESTATE SYSTEM CONSTANTS & HELPERS
// ==============================================================================

import type { 
  UnitStatus, 
  UnitType, 
  FloorType, 
  MaintenanceType, 
  GasType,
  DesignCategory,
  TargetMarket,
  BlockType,
  TowerType
} from './api'

// ==============================================================================
// STATUS & TYPE LABELS (Arabic/English)
// ==============================================================================

export const UnitStatusLabels: Record<UnitStatus, { ar: string; en: string }> = {
  1: { ar: 'متاحة', en: 'Available' },
  2: { ar: 'محجوزة', en: 'Reserved' },
  3: { ar: 'مؤجرة', en: 'Rented' },
  4: { ar: 'صيانة', en: 'Maintenance' },
  5: { ar: 'غير متاحة', en: 'Unavailable' }
} as const

export const UnitTypeLabels: Record<UnitType, { ar: string; en: string }> = {
  1: { ar: 'سكنية', en: 'Residential' },
  2: { ar: 'تجارية', en: 'Commercial' },
  3: { ar: 'مكتبية', en: 'Office' },
  4: { ar: 'مخزن', en: 'Storage' },
  5: { ar: 'موقف سيارات', en: 'Parking' }
} as const

export const FloorTypeLabels: Record<string, { ar: string; en: string }> = {
  'Parking': { ar: 'مواقف سيارات', en: 'Parking' },
  'Residential': { ar: 'سكني', en: 'Residential' },
  'Commercial': { ar: 'تجاري', en: 'Commercial' },
  'Facilities': { ar: 'مرافق', en: 'Facilities' }
} as const

export const MaintenanceTypeLabels: Record<MaintenanceType, { ar: string; en: string }> = {
  1: { ar: 'سنوي', en: 'Annual' },
  2: { ar: 'غير مشمول', en: 'Not Included' },
  3: { ar: 'اختياري', en: 'Optional' },
  4: { ar: 'مجاني', en: 'Free' }
} as const

export const GasTypeLabels: Record<GasType, { ar: string; en: string }> = {
  1: { ar: 'مركزي', en: 'Central' },
  2: { ar: 'أسطوانات', en: 'Cylinder' }
} as const

export const DesignCategoryLabels: Record<DesignCategory, { ar: string; en: string }> = {
  1: { ar: 'عادي', en: 'Standard' },
  2: { ar: 'فاخر', en: 'Luxury' },
  3: { ar: 'ممتاز', en: 'Premium' },
  4: { ar: 'اقتصادي', en: 'Economic' },
  5: { ar: 'عائلي', en: 'Family' },
  6: { ar: 'تنفيذي', en: 'Executive' }
} as const

export const TargetMarketLabels: Record<TargetMarket, { ar: string; en: string }> = {
  1: { ar: 'عام', en: 'General' },
  2: { ar: 'عزاب', en: 'Singles' },
  3: { ar: 'عائلات', en: 'Families' },
  4: { ar: 'تنفيذيين', en: 'Executives' },
  5: { ar: 'طلاب', en: 'Students' },
  6: { ar: 'كبار السن', en: 'Seniors' }
} as const

export const BlockTypeLabels: Record<BlockType, { ar: string; en: string }> = {
  1: { ar: 'سكني', en: 'Residential' },
  2: { ar: 'تجاري', en: 'Commercial' },
  3: { ar: 'مختلط', en: 'Mixed' },
  4: { ar: 'مكاتب', en: 'Office' },
  5: { ar: 'مواقف', en: 'Parking' }
} as const

export const TowerTypeLabels: Record<TowerType, { ar: string; en: string }> = {
  1: { ar: 'برج واحد', en: 'Single Block' },
  2: { ar: 'متعدد البلوكات', en: 'Multi Block' }
} as const

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Get label for any enum value in specified language
 */
export const getLabel = (
  value: number | string, 
  labelMap: Record<string | number, { ar: string; en: string }>, 
  lang: 'ar' | 'en' = 'ar'
): string => {
  return labelMap[value]?.[lang] || String(value)
}

/**
 * Get all options for a specific enum as array
 */
export const getEnumOptions = (
  labelMap: Record<string | number, { ar: string; en: string }>, 
  lang: 'ar' | 'en' = 'ar'
) => {
  return Object.entries(labelMap).map(([key, value]) => ({
    value: parseInt(key) || key,
    label: value[lang]
  }))
}

/**
 * Format currency value
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'SAR', 
  lang: 'ar' | 'en' = 'ar'
): string => {
  const formatter = new Intl.NumberFormat(
    lang === 'ar' ? 'ar-SA' : 'en-US', 
    {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }
  )
  return formatter.format(amount)
}

/**
 * Format area value
 */
export const formatArea = (
  area: number, 
  unit: string = 'م²', 
  lang: 'ar' | 'en' = 'ar'
): string => {
  const formatter = new Intl.NumberFormat(
    lang === 'ar' ? 'ar-SA' : 'en-US',
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }
  )
  return `${formatter.format(area)} ${unit}`
}

/**
 * Generate unit number pattern
 */
export const generateUnitNumber = (
  pattern: string,
  blockIndex: number,
  floorNumber: number,
  unitIndex: number
): string => {
  return pattern
    .replace(/B/g, String.fromCharCode(65 + blockIndex)) // Block letter (A, B, C...)
    .replace(/F/g, String(floorNumber).padStart(2, '0')) // Floor number (01, 02, 03...)
    .replace(/U/g, String(unitIndex + 1).padStart(2, '0')) // Unit number (01, 02, 03...)
    .replace(/#/g, String(unitIndex + 1).padStart(2, '0')) // Alternative unit pattern
}

/**
 * Validate coordinates
 */
export const isValidCoordinate = (lat: string, lng: string): boolean => {
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  
  return !isNaN(latitude) && 
         !isNaN(longitude) && 
         latitude >= -90 && 
         latitude <= 90 && 
         longitude >= -180 && 
         longitude <= 180
}

/**
 * Generate color for status
 */
export const getStatusColor = (status: UnitStatus): string => {
  const colors: Record<UnitStatus, string> = {
    1: '#10B981', // Available - Green
    2: '#F59E0B', // Reserved - Yellow
    3: '#EF4444', // Rented - Red
    4: '#6B7280', // Maintenance - Gray
    5: '#374151'  // Unavailable - Dark Gray
  }
  return colors[status] || '#6B7280'
}

/**
 * Calculate final rent price after discount
 */
export const calculateFinalPrice = (
  originalPrice: number,
  discountPercentage: number = 0
): number => {
  return originalPrice * (1 - discountPercentage / 100)
}

/**
 * Format floor display name
 */
export const formatFloorDisplay = (
  floorNumber: number,
  arabicName?: string,
  englishName?: string,
  lang: 'ar' | 'en' = 'ar'
): string => {
  const name = lang === 'ar' ? arabicName : englishName
  if (name) {
    return `${name} (${floorNumber})`
  }
  
  // Default floor names
  if (floorNumber === 0) {
    return lang === 'ar' ? 'الطابق الأرضي' : 'Ground Floor'
  } else if (floorNumber < 0) {
    return lang === 'ar' ? `القبو ${Math.abs(floorNumber)}` : `Basement ${Math.abs(floorNumber)}`
  } else {
    return lang === 'ar' ? `الطابق ${floorNumber}` : `Floor ${floorNumber}`
  }
}

// ==============================================================================
// VALIDATION HELPERS
// ==============================================================================

export const ValidationRules = {
  required: (value: unknown): boolean => {
    if (typeof value === 'string') return value.trim().length > 0
    if (typeof value === 'number') return !isNaN(value) && value > 0
    return value !== null && value !== undefined
  },
  
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^[+]?[0-9\s\-()]{8,15}$/
    return phoneRegex.test(phone.trim())
  },
  
  arabicText: (text: string): boolean => {
    const arabicRegex = /[\u0600-\u06FF]/
    return arabicRegex.test(text)
  },
  
  englishText: (text: string): boolean => {
    const englishRegex = /[a-zA-Z]/
    return englishRegex.test(text)
  },
  
  positiveNumber: (num: number): boolean => {
    return !isNaN(num) && num > 0
  },
  
  percentage: (num: number): boolean => {
    return !isNaN(num) && num >= 0 && num <= 100
  }
}

// ==============================================================================
// DEFAULT VALUES
// ==============================================================================

export const DefaultValues = {
  tower: {
    isActive: true,
    definitionStage: 1,
    constructionYear: new Date().getFullYear()
  },
  
  unit: {
    status: 1 as UnitStatus, // Available
    type: 1 as UnitType, // Residential
    isActive: true
  },
  
  design: {
    category: 1 as DesignCategory, // Standard
    targetMarket: 1 as TargetMarket, // General
    maintenanceType: 1 as MaintenanceType, // Annual
    gasType: 1 as GasType, // Central
    isActive: true,
    discountPercentage: 0,
    freePeriodDays: 0
  },
  
  block: {
    type: 1 as BlockType, // Residential
    isActive: true,
    displayOrder: 1
  },
  
  floor: {
    type: 4 as FloorType,
    hasSharedFacilities: true,
    isActive: true,
    displayOrder: 1
  }
}

export default {
  UnitStatusLabels,
  UnitTypeLabels,
  FloorTypeLabels,
  MaintenanceTypeLabels,
  GasTypeLabels,
  DesignCategoryLabels,
  TargetMarketLabels,
  BlockTypeLabels,
  TowerTypeLabels,
  getLabel,
  getEnumOptions,
  formatCurrency,
  formatArea,
  generateUnitNumber,
  isValidCoordinate,
  getStatusColor,
  calculateFinalPrice,
  formatFloorDisplay,
  ValidationRules,
  DefaultValues
}