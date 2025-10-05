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
  floorCode?: string
  floorType?: number
  isDefined?: boolean
  isNew?: boolean
  isSelectable?: boolean
  isVisualizationMode?: boolean
}

export interface Unit {
  id: string
  number: string
  type?: string
  code?: string
  color?: string
  status?: string
  fullCode?: string
  unitTypeLabel?: string
  floorCode?: string
  isDefined?: boolean
  isNew?: boolean
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
  // تعريف خاص في حالة الطابق المختلط: كل وحدة لها نوع ورمز مستقل
  mixedUnits?: {
    type: number // UnitType numeric value
    code: string
  }[]
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