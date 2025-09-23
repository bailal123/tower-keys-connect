// Mock data for the Real Estate CRM

export interface Country {
  id: number
  nameAr: string
  nameEn: string
  code: string
  isDeleted: boolean
}

export interface City {
  id: number
  nameAr: string
  nameEn: string
  countryId: number
  isDeleted: boolean
}

export interface Area {
  id: number
  nameAr: string
  nameEn: string
  cityId: number
  isDeleted: boolean
}

export interface Feature {
  id: number
  nameAr: string
  nameEn: string
  icon: string
  isDeleted: boolean
}

export interface Block {
  id: number
  name: string
  towerId: number
  isDeleted: boolean
}

export interface Appliance {
  id: number
  nameAr: string
  nameEn: string
  icon: string
  isDeleted: boolean
}

export interface Design {
  id: number
  name: string
  coverImage: string
  additionalImages: string[]
  video?: string
  area: number
  features: number[]
  notes: string
  originalRentPrice: number
  discount: number
  finalPrice: number
  annualRent: number
  paymentOptions: PaymentOption[]
  freeDays: number
  officeCommission: number
  municipalityFees: number
  electricityFees: number
  proFees: number
  insurance: number
  maintenance: MaintenanceType
  gasType: 'central' | 'cylinder'
  additionalFees: number
  isDeleted: boolean
}

export interface PaymentOption {
  id: number
  name: string
  discount: number
  price: number
  finalPrice: number
}

export type MaintenanceType = 'annual' | 'not_included' | 'optional' | 'free'

export interface Tower {
  id: number
  name: string
  areaId: number
  blocks: Block[]
  isDeleted: boolean
}

export interface Apartment {
  id: number
  number: string
  towerId: number
  blockId: number
  designId: number
  isDeleted: boolean
}

export interface DashboardStats {
  totalTowers: number
  totalApartments: number
  occupiedApartments: number
  availableApartments: number
  totalRevenue: number
  monthlyRevenue: number
  totalOwners: number
  totalTenants: number
}

// Mock Countries Data
export const mockCountries: Country[] = [
  { id: 1, nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', code: 'AE', isDeleted: false },
  { id: 2, nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', code: 'SA', isDeleted: false },
  { id: 3, nameAr: 'قطر', nameEn: 'Qatar', code: 'QA', isDeleted: false },
]

export const countries = [
  {
    id: '1',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    code: 'AE',
    flag: '🇦🇪',
    isActive: true
  },
  {
    id: '2',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    code: 'SA',
    flag: '🇸🇦',
    isActive: true
  },
  {
    id: '3',
    name: 'Qatar',
    nameAr: 'قطر',
    code: 'QA',
    flag: '🇶🇦',
    isActive: true
  }
]

// Mock Cities Data
export const cities = [
  // UAE Cities
  {
    id: '1',
    name: 'Dubai',
    nameAr: 'دبي',
    countryId: '1',
    isActive: true
  },
  {
    id: '2',
    name: 'Abu Dhabi',
    nameAr: 'أبوظبي',
    countryId: '1',
    isActive: true
  },
  {
    id: '3',
    name: 'Sharjah',
    nameAr: 'الشارقة',
    countryId: '1',
    isActive: true
  },
  {
    id: '4',
    name: 'Ajman',
    nameAr: 'عجمان',
    countryId: '1',
    isActive: true
  },
  {
    id: '5',
    name: 'Ras Al Khaimah',
    nameAr: 'رأس الخيمة',
    countryId: '1',
    isActive: true
  },
  {
    id: '6',
    name: 'Fujairah',
    nameAr: 'الفجيرة',
    countryId: '1',
    isActive: true
  },
  {
    id: '7',
    name: 'Umm Al Quwain',
    nameAr: 'أم القيوين',
    countryId: '1',
    isActive: true
  },
  // Saudi Arabia Cities
  {
    id: '8',
    name: 'Riyadh',
    nameAr: 'الرياض',
    countryId: '2',
    isActive: true
  },
  {
    id: '9',
    name: 'Jeddah',
    nameAr: 'جدة',
    countryId: '2',
    isActive: true
  },
  {
    id: '10',
    name: 'Mecca',
    nameAr: 'مكة المكرمة',
    countryId: '2',
    isActive: true
  },
  // Qatar Cities
  {
    id: '11',
    name: 'Doha',
    nameAr: 'الدوحة',
    countryId: '3',
    isActive: true
  },
  {
    id: '12',
    name: 'Al Rayyan',
    nameAr: 'الريان',
    countryId: '3',
    isActive: true
  }
]

export const mockCities = cities

// Mock Areas Data
export const areas = [
  // Dubai Areas
  {
    id: '1',
    name: 'Marina',
    nameAr: 'مارينا',
    cityId: '1',
    isActive: true
  },
  {
    id: '2',
    name: 'Downtown',
    nameAr: 'وسط المدينة',
    cityId: '1',
    isActive: true
  },
  {
    id: '3',
    name: 'Jumeirah',
    nameAr: 'جميرا',
    cityId: '1',
    isActive: true
  },
  {
    id: '4',
    name: 'Business Bay',
    nameAr: 'الخليج التجاري',
    cityId: '1',
    isActive: true
  },
  {
    id: '5',
    name: 'Palm Jumeirah',
    nameAr: 'جزيرة النخلة',
    cityId: '1',
    isActive: true
  },
  {
    id: '6',
    name: 'JBR',
    nameAr: 'شاطئ الجميرا',
    cityId: '1',
    isActive: true
  },
  {
    id: '7',
    name: 'DIFC',
    nameAr: 'مركز دبي المالي العالمي',
    cityId: '1',
    isActive: true
  },
  {
    id: '8',
    name: 'Dubai Hills',
    nameAr: 'دبي هيلز',
    cityId: '1',
    isActive: true
  },
  // Abu Dhabi Areas
  {
    id: '9',
    name: 'Corniche',
    nameAr: 'الكورنيش',
    cityId: '2',
    isActive: true
  },
  {
    id: '10',
    name: 'Yas Island',
    nameAr: 'جزيرة ياس',
    cityId: '2',
    isActive: true
  },
  {
    id: '11',
    name: 'Al Reem Island',
    nameAr: 'جزيرة الريم',
    cityId: '2',
    isActive: true
  },
  {
    id: '12',
    name: 'Saadiyat Island',
    nameAr: 'جزيرة السعديات',
    cityId: '2',
    isActive: true
  },
  // Sharjah Areas
  {
    id: '13',
    name: 'Al Majaz',
    nameAr: 'المجاز',
    cityId: '3',
    isActive: true
  },
  {
    id: '14',
    name: 'Al Khan',
    nameAr: 'الخان',
    cityId: '3',
    isActive: true
  },
  {
    id: '15',
    name: 'Al Qasba',
    nameAr: 'القصباء',
    cityId: '3',
    isActive: true
  },
  // Ajman Areas
  {
    id: '16',
    name: 'Al Nuaimiya',
    nameAr: 'النعيمية',
    cityId: '4',
    isActive: true
  },
  {
    id: '17',
    name: 'Al Rashidiya',
    nameAr: 'الراشدية',
    cityId: '4',
    isActive: true
  }
]

export const mockAreas = areas

// Mock Features Data
export const mockFeatures: Feature[] = [
  { id: 1, nameAr: 'بلكونة', nameEn: 'Balcony', icon: 'home', isDeleted: false },
  { id: 2, nameAr: 'بلكونتان', nameEn: 'Two Balconies', icon: 'home', isDeleted: false },
  { id: 3, nameAr: 'إطلالة بحرية', nameEn: 'Sea View', icon: 'waves', isDeleted: false },
  { id: 4, nameAr: 'إطلالة مفتوحة', nameEn: 'Open View', icon: 'eye', isDeleted: false },
  { id: 5, nameAr: 'حمام واحد', nameEn: 'One Bathroom', icon: 'bath', isDeleted: false },
  { id: 6, nameAr: 'حمامان', nameEn: 'Two Bathrooms', icon: 'bath', isDeleted: false },
  { id: 7, nameAr: 'غرفة ماستر', nameEn: 'Master Room', icon: 'bed', isDeleted: false },
  { id: 8, nameAr: 'مسبح', nameEn: 'Swimming Pool', icon: 'waves', isDeleted: false },
  { id: 9, nameAr: 'جيم', nameEn: 'Gym', icon: 'dumbbell', isDeleted: false },
  { id: 10, nameAr: 'موقف سيارة', nameEn: 'Parking', icon: 'car', isDeleted: false },
]

// Mock Appliances Data
export const mockAppliances: Appliance[] = [
  { id: 1, nameAr: 'غاز', nameEn: 'Gas', icon: 'flame', isDeleted: false },
  { id: 2, nameAr: 'غسالة', nameEn: 'Washing Machine', icon: 'washing-machine', isDeleted: false },
  { id: 3, nameAr: 'ثلاجة', nameEn: 'Refrigerator', icon: 'refrigerator', isDeleted: false },
  { id: 4, nameAr: 'مكيف', nameEn: 'Air Conditioner', icon: 'air-vent', isDeleted: false },
  { id: 5, nameAr: 'فرن', nameEn: 'Oven', icon: 'chef-hat', isDeleted: false },
  { id: 6, nameAr: 'ميكروويف', nameEn: 'Microwave', icon: 'microwave', isDeleted: false },
]

export const features = [
  {
    id: '1',
    name: 'Swimming Pool',
    nameAr: 'مسبح',
    category: 'tower',
    isActive: true
  },
  {
    id: '2',
    name: 'Gym',
    nameAr: 'صالة رياضية',
    category: 'tower',
    isActive: true
  },
  {
    id: '3',
    name: 'Parking',
    nameAr: 'موقف سيارات',
    category: 'tower',
    isActive: true
  },
  {
    id: '4',
    name: 'Garden',
    nameAr: 'حديقة',
    category: 'apartment',
    isActive: true
  },
  {
    id: '5',
    name: 'Balcony',
    nameAr: 'شرفة',
    category: 'apartment',
    isActive: true
  },
  {
    id: '6',
    name: 'Sea View',
    nameAr: 'إطلالة بحرية',
    category: 'apartment',
    isActive: true
  },
  {
    id: '7',
    name: 'City View',
    nameAr: 'إطلالة على المدينة',
    category: 'apartment',
    isActive: true
  },
  {
    id: '8',
    name: 'Furnished',
    nameAr: 'مفروشة',
    category: 'appliance',
    isActive: true
  },
  {
    id: '9',
    name: 'Unfurnished',
    nameAr: 'غير مفروشة',
    category: 'furniture',
    isActive: true
  },
  {
    id: '10',
    name: 'Central AC',
    nameAr: 'تكييف مركزي',
    category: 'facilities',
    isActive: true
  }
]

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalTowers: 25,
  totalApartments: 1250,
  occupiedApartments: 980,
  availableApartments: 270,
  totalRevenue: 15750000,
  monthlyRevenue: 1312500,
  totalOwners: 156,
  totalTenants: 980,
}

// Mock Payment Options
export const mockPaymentOptions: PaymentOption[] = [
  { id: 1, name: 'شيك واحد', discount: 5, price: 50000, finalPrice: 47500 },
  { id: 2, name: 'أربعة شيكات', discount: 2, price: 50000, finalPrice: 49000 },
  { id: 3, name: 'اثنا عشر شيكاً', discount: 0, price: 50000, finalPrice: 50000 },
]

// Mock Designs Data
export const mockDesigns: Design[] = [
  {
    id: 1,
    name: 'تصميم A - استوديو',
    coverImage: '/images/design-a-cover.jpg',
    additionalImages: ['/images/design-a-1.jpg', '/images/design-a-2.jpg'],
    video: '/videos/design-a-tour.mp4',
    area: 450,
    features: [1, 3, 5, 8, 10],
    notes: 'استوديو عصري مع إطلالة بحرية رائعة',
    originalRentPrice: 45000,
    discount: 2000,
    finalPrice: 43000,
    annualRent: 43000,
    paymentOptions: mockPaymentOptions,
    freeDays: 15,
    officeCommission: 2150,
    municipalityFees: 500,
    electricityFees: 200,
    proFees: 300,
    insurance: 1000,
    maintenance: 'annual',
    gasType: 'central',
    additionalFees: 0,
    isDeleted: false,
  },
  {
    id: 2,
    name: 'تصميم B - غرفة نوم واحدة',
    coverImage: '/images/design-b-cover.jpg',
    additionalImages: ['/images/design-b-1.jpg', '/images/design-b-2.jpg', '/images/design-b-3.jpg'],
    area: 650,
    features: [1, 4, 6, 7, 9, 10],
    notes: 'شقة بغرفة نوم واحدة مع غرفة ماستر',
    originalRentPrice: 65000,
    discount: 3000,
    finalPrice: 62000,
    annualRent: 62000,
    paymentOptions: mockPaymentOptions,
    freeDays: 30,
    officeCommission: 3100,
    municipalityFees: 650,
    electricityFees: 250,
    proFees: 400,
    insurance: 1500,
    maintenance: 'free',
    gasType: 'cylinder',
    additionalFees: 500,
    isDeleted: false,
  },
]

export const designs = [
  {
    id: '1',
    name: 'Modern Living Room',
    nameAr: 'غرفة معيشة عصرية',
    description: 'Contemporary living room design with minimalist furniture and neutral colors',
    descriptionAr: 'تصميم غرفة معيشة عصرية بأثاث بسيط وألوان محايدة',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    videoUrl: '',
    category: 'interior' as const,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Luxury Kitchen',
    nameAr: 'مطبخ فاخر',
    description: 'High-end kitchen design with marble countertops and premium appliances',
    descriptionAr: 'تصميم مطبخ راقي بأسطح رخامية وأجهزة متميزة',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    videoUrl: '',
    category: 'interior' as const,
    isActive: true,
    createdAt: '2024-01-16T11:30:00Z'
  },
  {
    id: '3',
    name: 'Modern Villa Exterior',
    nameAr: 'واجهة فيلا عصرية',
    description: 'Contemporary villa exterior with clean lines and glass facades',
    descriptionAr: 'واجهة فيلا عصرية بخطوط نظيفة وواجهات زجاجية',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    videoUrl: '',
    category: 'exterior' as const,
    isActive: true,
    createdAt: '2024-01-17T14:15:00Z'
  },
  {
    id: '4',
    name: 'Garden Landscape',
    nameAr: 'تنسيق حديقة',
    description: 'Beautiful garden landscape with water features and tropical plants',
    descriptionAr: 'تنسيق حديقة جميلة مع نوافير مائية ونباتات استوائية',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    videoUrl: '',
    category: 'landscape' as const,
    isActive: true,
    createdAt: '2024-01-18T09:45:00Z'
  },
  {
    id: '5',
    name: 'Master Bedroom',
    nameAr: 'غرفة نوم رئيسية',
    description: 'Elegant master bedroom with walk-in closet and en-suite bathroom',
    descriptionAr: 'غرفة نوم رئيسية أنيقة مع خزانة ملابس وحمام خاص',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    videoUrl: '',
    category: 'interior' as const,
    isActive: true,
    createdAt: '2024-01-19T16:20:00Z'
  }
]