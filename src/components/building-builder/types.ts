import { FloorType } from '../../types/api'

// Types for building data (needed by visualization components)
export interface Block {
  id: string
  name: string
  floors: Floor[]
}

export interface Floor {
  id: string
  number: string
  units: Unit[]
}

export interface Unit {
  id: string
  number: string
  type?: string
  code?: string
}

export interface BuildingData {
  name: string
  blocks: Block[]
}

// نوع بيانات نموذج إنشاء البرج
export interface TowerFormData {
  arabicName: string
  englishName: string
  arabicDescription: string
  englishDescription: string
  address: string
  latitude: string
  longitude: string
  constructionYear: string
  mainImageUrl: string
  countryId: number
  cityId: number
  areaId: number
  isActive: boolean
  developerName: string
  managementCompany: string
  definitionStage: number
}

// تعريف الشقق/الوحدات الجديد
export interface UnitDefinition {
  type: string
  count: number
  startNumber: number
  codePrefix: string
  includeTowerName: boolean
  includeFloorCode: boolean
  includeUnitNumber: boolean
}

// تعريف الطابق المحدث ليتضمن الشقق
export interface FloorDefinition {
  floorCode: string
  arabicName: string
  englishName: string
  floorNumber: number
  floorType: FloorType
  unitsDefinition?: UnitDefinition
  selectedFromVisualization?: boolean
  serviceFloorDetails?: {
    [key: string]: string | number | boolean // تفاصيل إضافية للطوابق الخدمية
  }
}

// نموذج تعريف الطوابق الجديد
export interface FloorRangeDefinition {
  fromFloor: number
  toFloor: number
  selectedBlocks: string[]
  floorType: FloorType
  floorCodePrefix: string
  unitsDefinition: UnitDefinition
}

// خصائص مشتركة للمراحل
export interface StepProps {
  isCompleted: boolean
  onComplete: () => void
  onNext: () => void
  onPrevious: () => void
  isSubmitting: boolean
}