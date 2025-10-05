// Centralized bilingual labels for FloorType and UnitType enums
// Source-of-truth numeric values remain in api.ts (backend contracts)
// This file only maps enum keys (names) or numeric values to { ar, en }

import { FloorType, UnitType } from './api'

// Build reverse lookup: numeric value -> key string for each enum
const buildEnumValueToKey = (enumObj: Record<string, number>) => {
  const map: Record<number, string> = {}
  Object.entries(enumObj).forEach(([k, v]) => { map[v] = k })
  return map
}

export const FloorTypeValueToKey = buildEnumValueToKey(FloorType)
export const UnitTypeValueToKey = buildEnumValueToKey(UnitType)

export type BilingualLabel = { ar: string; en: string }

// Full labels for FloorType (keyed by enum numeric value)
export const FloorTypeLabels: Record<FloorType, BilingualLabel> = {
  [FloorType.Basement]: { ar: 'قبو', en: 'Basement' },
  [FloorType.Parking]: { ar: 'مواقف', en: 'Parking' },
  [FloorType.Ground]: { ar: 'أرضي', en: 'Ground' },
  [FloorType.Regular]: { ar: 'عادي', en: 'Regular' },
  [FloorType.Mezzanine]: { ar: 'ميزانين', en: 'Mezzanine' },
  [FloorType.Hall]: { ar: 'قاعة', en: 'Hall' },
  [FloorType.Rooftop]: { ar: 'سطح', en: 'Rooftop' },
  [FloorType.Amenities]: { ar: 'مرافق', en: 'Amenities' },
  [FloorType.Commercial]: { ar: 'تجاري', en: 'Commercial' },
  [FloorType.Office]: { ar: 'مكاتب', en: 'Office' },
  [FloorType.Technical]: { ar: 'تقني', en: 'Technical' },
  [FloorType.Storage]: { ar: 'تخزين', en: 'Storage' },
  [FloorType.Service]: { ar: 'خدمي', en: 'Service' },
  [FloorType.Emergency]: { ar: 'طوارئ', en: 'Emergency' },
  [FloorType.Mixed]: { ar: 'مختلط', en: 'Mixed' }
} as const

// Full labels for UnitType (keyed by enum numeric value)
export const UnitTypeLabels: Record<UnitType, BilingualLabel> = {
  [UnitType.Residential]: { ar: 'سكني', en: 'Residential' },
  [UnitType.Commercial]: { ar: 'تجاري', en: 'Commercial' },
  [UnitType.Office]: { ar: 'مكتب', en: 'Office' },
  [UnitType.Shop]: { ar: 'محل', en: 'Shop' },
  [UnitType.Storage]: { ar: 'مخزن', en: 'Storage' },
  [UnitType.Warehouse]: { ar: 'مستودع', en: 'Warehouse' },
  [UnitType.Restaurant]: { ar: 'مطعم', en: 'Restaurant' },
  [UnitType.Cafe]: { ar: 'مقهى', en: 'Cafe' },
  [UnitType.Clinic]: { ar: 'عيادة', en: 'Clinic' },
  [UnitType.Pharmacy]: { ar: 'صيدلية', en: 'Pharmacy' },
  [UnitType.Salon]: { ar: 'صالون', en: 'Salon' },
  [UnitType.Gym]: { ar: 'نادي رياضي', en: 'Gym' },
  [UnitType.Studio]: { ar: 'استوديو', en: 'Studio' },
  [UnitType.Showroom]: { ar: 'صالة عرض', en: 'Showroom' },
  [UnitType.Bank]: { ar: 'بنك', en: 'Bank' },
  [UnitType.ATM]: { ar: 'صراف آلي', en: 'ATM' },
  [UnitType.Parking]: { ar: 'موقف سيارات', en: 'Parking' },
  [UnitType.Garage]: { ar: 'جراج', en: 'Garage' },
  [UnitType.Laundry]: { ar: 'مغسلة', en: 'Laundry' },
  [UnitType.Bakery]: { ar: 'مخبز', en: 'Bakery' },
  [UnitType.Supermarket]: { ar: 'سوبر ماركت', en: 'Supermarket' },
  [UnitType.Hotel]: { ar: 'فندق', en: 'Hotel' },
  [UnitType.Hostel]: { ar: 'نزل', en: 'Hostel' },
  [UnitType.Serviced_Apartment]: { ar: 'شقة مفروشة', en: 'Serviced Apt' },
  [UnitType.Penthouse]: { ar: 'بنت هاوس', en: 'Penthouse' },
  [UnitType.Duplex]: { ar: 'دوبلكس', en: 'Duplex' },
  [UnitType.Loft]: { ar: 'لوفت', en: 'Loft' },
  [UnitType.Villa]: { ar: 'فيلا', en: 'Villa' },
  [UnitType.Townhouse]: { ar: 'تاون هاوس', en: 'Townhouse' },
  [UnitType.Pool_Area]: { ar: 'منطقة مسبح', en: 'Pool Area' },
  [UnitType.Garden]: { ar: 'حديقة', en: 'Garden' },
  [UnitType.Playground]: { ar: 'ملعب', en: 'Playground' },
  [UnitType.Reception]: { ar: 'استقبال', en: 'Reception' },
  [UnitType.Lobby]: { ar: 'لوبي', en: 'Lobby' },
  [UnitType.Security]: { ar: 'أمن', en: 'Security' },
  [UnitType.Maintenance]: { ar: 'صيانة', en: 'Maintenance' },
  [UnitType.Generator_Room]: { ar: 'غرفة مولد', en: 'Generator Room' },
  [UnitType.Electrical_Room]: { ar: 'غرفة كهرباء', en: 'Electrical Room' },
  [UnitType.Water_Tank_Room]: { ar: 'خزان مياه', en: 'Water Tank Room' },
  [UnitType.HVAC_Room]: { ar: 'غرفة تكييف', en: 'HVAC Room' },
  [UnitType.Mixed_Use]: { ar: 'استخدام مختلط', en: 'Mixed Use' },
  [UnitType.Flexible_Space]: { ar: 'مساحة مرنة', en: 'Flexible Space' },
  [UnitType.Multi_Purpose]: { ar: 'متعدد الأغراض', en: 'Multi Purpose' },
  [UnitType.Under_Construction]: { ar: 'تحت الإنشاء', en: 'Under Construction' },
  [UnitType.Reserved_Space]: { ar: 'مساحة محجوزة', en: 'Reserved Space' },
  [UnitType.Common_Area]: { ar: 'منطقة مشتركة', en: 'Common Area' },
  [UnitType.Service_Area]: { ar: 'منطقة خدمية', en: 'Service Area' },
  [UnitType.Emergency_Exit]: { ar: 'مخرج طوارئ', en: 'Emergency Exit' },
  [UnitType.Staircase]: { ar: 'درج', en: 'Staircase' },
  [UnitType.Elevator]: { ar: 'مصعد', en: 'Elevator' }
} as const

export const getBilingualLabel = <T extends number>(value: T, map: Record<T, BilingualLabel>, lang: 'ar' | 'en' = 'ar') => {
  return map[value]?.[lang] || String(value)
}

export const enumToOptions = <T extends number>(map: Record<T, BilingualLabel>, lang: 'ar' | 'en' = 'ar') => {
  return (Object.entries(map) as [string, BilingualLabel][]).map(([num, lb]) => ({ value: Number(num), label: lb[lang] }))
}
