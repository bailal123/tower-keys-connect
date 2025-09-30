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

// نوع تعريف الطابق المفصل
export interface FloorDefinition {
  floorCode: string
  arabicName: string
  englishName: string
  floorNumber: number
  floorType: FloorType
  unitsCount?: number // اختياري الآن - سيتم تعريفه في المرحلة 5
  selectedFromVisualization?: boolean
}

// خصائص مشتركة للمراحل
export interface StepProps {
  isCompleted: boolean
  onComplete: () => void
  onNext: () => void
  onPrevious: () => void
  isSubmitting: boolean
}