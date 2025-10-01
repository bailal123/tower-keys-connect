import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Label } from '../ui/Label'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import type { StepProps, FloorDefinition, BuildingData, UnitDefinition } from './types'
import { FloorType, UnitType, UnitStatus } from '../../types/api'
import { useNotifications } from '../../hooks/useNotificationContext'
import { RealEstateAPI } from '../../services/api'
import type { CreateMultipleBlockFloorsRequest, BlockFloorDto, UnitDto, CreateMultipleUnitsRequest } from '../../types/api'

// تعريف جميع أنواع الوحدات مع أسمائها العربية
const UNIT_TYPES = {
  apartment: { label: 'سكني', apiValue: UnitType.Residential },
  commercial: { label: 'تجاري', apiValue: UnitType.Commercial },
  office: { label: 'مكتب', apiValue: UnitType.Office },
  shop: { label: 'محل تجاري', apiValue: UnitType.Shop },
  storage: { label: 'مخزن', apiValue: UnitType.Storage },
  warehouse: { label: 'مستودع', apiValue: UnitType.Warehouse },
  restaurant: { label: 'مطعم', apiValue: UnitType.Restaurant },
  cafe: { label: 'مقهى', apiValue: UnitType.Cafe },
  clinic: { label: 'عيادة', apiValue: UnitType.Clinic },
  pharmacy: { label: 'صيدلية', apiValue: UnitType.Pharmacy },
  salon: { label: 'صالون', apiValue: UnitType.Salon },
  gym: { label: 'صالة رياضة', apiValue: UnitType.Gym },
  studio: { label: 'استوديو', apiValue: UnitType.Studio },
  showroom: { label: 'صالة عرض', apiValue: UnitType.Showroom },
  bank: { label: 'بنك', apiValue: UnitType.Bank },
  atm: { label: 'صراف آلي', apiValue: UnitType.ATM },
  garage: { label: 'جراج', apiValue: UnitType.Garage },
  laundry: { label: 'مغسلة', apiValue: UnitType.Laundry },
  bakery: { label: 'مخبز', apiValue: UnitType.Bakery },
  supermarket: { label: 'سوبر ماركت', apiValue: UnitType.Supermarket },
  hotel: { label: 'فندق', apiValue: UnitType.Hotel },
  hostel: { label: 'نزل', apiValue: UnitType.Hostel },
  serviced_apartment: { label: 'شقة مفروشة', apiValue: UnitType.Serviced_Apartment },
  penthouse: { label: 'بنت هاوس', apiValue: UnitType.Penthouse },
  duplex: { label: 'دوبلكس', apiValue: UnitType.Duplex },
  loft: { label: 'لوفت', apiValue: UnitType.Loft },
  villa: { label: 'فيلا', apiValue: UnitType.Villa },
  townhouse: { label: 'تاون هاوس', apiValue: UnitType.Townhouse },
  pool_area: { label: 'منطقة المسبح', apiValue: UnitType.Pool_Area },
  garden: { label: 'حديقة', apiValue: UnitType.Garden },
  playground: { label: 'ملعب', apiValue: UnitType.Playground },
  reception: { label: 'استقبال', apiValue: UnitType.Reception },
  lobby: { label: 'لوبي', apiValue: UnitType.Lobby },
  security: { label: 'أمن', apiValue: UnitType.Security },
  maintenance: { label: 'صيانة', apiValue: UnitType.Maintenance },
  generator_room: { label: 'غرفة المولد', apiValue: UnitType.Generator_Room },
  electrical_room: { label: 'غرفة الكهرباء', apiValue: UnitType.Electrical_Room },
  water_tank_room: { label: 'غرفة خزان المياه', apiValue: UnitType.Water_Tank_Room },
  hvac_room: { label: 'غرفة التكييف', apiValue: UnitType.HVAC_Room },
  mixed_use: { label: 'استخدام مختلط', apiValue: UnitType.Mixed_Use },
  flexible_space: { label: 'مساحة مرنة', apiValue: UnitType.Flexible_Space },
  multi_purpose: { label: 'متعدد الأغراض', apiValue: UnitType.Multi_Purpose },
  under_construction: { label: 'تحت الإنشاء', apiValue: UnitType.Under_Construction },
  reserved_space: { label: 'مساحة محجوزة', apiValue: UnitType.Reserved_Space },
  common_area: { label: 'منطقة مشتركة', apiValue: UnitType.Common_Area },
  service_area: { label: 'منطقة خدمية', apiValue: UnitType.Service_Area },
  emergency_exit: { label: 'مخرج طوارئ', apiValue: UnitType.Emergency_Exit },
  staircase: { label: 'درج', apiValue: UnitType.Staircase },
  elevator: { label: 'مصعد', apiValue: UnitType.Elevator },
  parking: { label: 'باركنج', apiValue: UnitType.Parking }
} as const

interface Step3Props extends StepProps {
  createdBlocks: { id: number; name: string; originalName: string }[]
  blockFloorsCount: Record<string, number>
  floorDefinitions: Record<string, FloorDefinition>
  setFloorDefinitions: (definitions: Record<string, FloorDefinition>) => void
  onSaveDefinitions: () => void
  createdTowerId: number | null
  setBuildingData: React.Dispatch<React.SetStateAction<BuildingData>>
  setCreatedBlockFloors: React.Dispatch<React.SetStateAction<{ id: number; blockName: string; floorNumber: string; towerBlockId: number }[]>>
  towerName?: string
  onVisualizationFloorSelection?: (handler: (selectedFloors: number[], selectedBlock?: string) => void) => void
}

const Step3FloorDefinitions: React.FC<Step3Props> = ({
  isCompleted,
  onNext,
  onPrevious,
  createdBlocks,
  blockFloorsCount,
  floorDefinitions,
  setFloorDefinitions,
  onSaveDefinitions,
  createdTowerId,
  setBuildingData,
  setCreatedBlockFloors,
  towerName,
  onVisualizationFloorSelection
}) => {
  const { showWarning, showSuccess, showError } = useNotifications()

  // حالة النموذج الجديد
  const [showDefinitionForm, setShowDefinitionForm] = useState(false)
  const [floorRangeForm, setFloorRangeForm] = useState({
    fromFloor: 1,
    toFloor: 1,
    selectedBlocks: [] as string[],
    floorType: FloorType.Regular as FloorType,
    floorCodePrefix: 'F',
    unitType: 'apartment' as string,
    unitsCount: 1,
    startUnitNumber: 1,
    includeTowerName: false,
    includeFloorCode: true,
    includeUnitNumber: true
  })

  // دالة لمعالجة اختيار الطوابق من الرسمة
  const handleVisualizationFloorSelection = React.useCallback((selectedFloors: number[], selectedBlock?: string) => {
    console.log('🎨 تم اختيار طوابق من الرسمة:', { selectedFloors, selectedBlock })
    console.log('📊 Current buildingData before selection:', { 
      blocksCount: createdBlocks.length,
      blockNames: createdBlocks.map(b => b.name)
    })
    
    if (selectedFloors.length > 0) {
      const minFloor = Math.min(...selectedFloors)
      const maxFloor = Math.max(...selectedFloors)
      
      setFloorRangeForm(prev => {
        const updates: Partial<typeof prev> = {
          fromFloor: minFloor,
          toFloor: maxFloor
        }
        
        // إذا تم تحديد بلوك معين، نضيفه للاختيار (بدلاً من استبدال كامل)
        if (selectedBlock) {
          const blockExists = createdBlocks.find(b => b.name === selectedBlock || b.originalName === selectedBlock)
          if (blockExists) {
            // إضافة البلوك المحدد إلى القائمة الموجودة إذا لم يكن موجوداً
            const currentBlocks = prev.selectedBlocks
            if (!currentBlocks.includes(blockExists.name)) {
              updates.selectedBlocks = [...currentBlocks, blockExists.name]
            } else {
              updates.selectedBlocks = currentBlocks // الحفاظ على الاختيارات الموجودة
            }
          }
        }
        
        console.log('🔄 تحديث نموذج الطوابق:', { 
          from: prev.fromFloor, 
          to: prev.toFloor, 
          newFrom: minFloor, 
          newTo: maxFloor,
          selectedBlocksBefore: prev.selectedBlocks,
          selectedBlocksAfter: updates.selectedBlocks || prev.selectedBlocks
        })
        
        return { ...prev, ...updates }
      })
      
      // إظهار رسالة توضيحية
      const floorsText = selectedFloors.length === 1 
        ? `الطابق ${minFloor}` 
        : selectedFloors.length === 2 && minFloor === maxFloor - 1
        ? `الطابقين ${minFloor} و ${maxFloor}`
        : `الطوابق من ${minFloor} إلى ${maxFloor} (مجموع ${selectedFloors.length} طابق)`
      
      const blockText = selectedBlock ? ` في البلوك ${selectedBlock}` : ''
      
      showSuccess(
        `تم تحديد ${floorsText}${blockText} من الرسمة. اضغط "تعريف الطوابق المختارة" لوضع تفاصيل التعريف الموحد لكل الطوابق.`, 
        'اختيار من الرسمة'
      )

      // فتح نموذج التعريف تلقائياً عند أول اختيار مرئي إذا لم يكن مفتوحاً
      setShowDefinitionForm(true)
      
      // عدم فتح نموذج التعريف تلقائياً للسماح بالاختيار المتعدد
      // يمكن للمستخدم فتحه يدوياً عندما ينتهي من الاختيار
    } else {
      console.log('⚠️ لم يتم اختيار أي طوابق')
    }
  }, [showSuccess, createdBlocks])

  // إعداد callback للمكون الأب فقط (منع إعادة بناء مستمر للبيانات لتفادي حلقة لا نهائية)
  const visualizationInitRef = React.useRef(false)
  React.useEffect(() => {
    if (onVisualizationFloorSelection && !visualizationInitRef.current) {
      onVisualizationFloorSelection(handleVisualizationFloorSelection)
      visualizationInitRef.current = true
      console.log('✅ Visualization floor selection callback registered (once)')
    }
  }, [onVisualizationFloorSelection, handleVisualizationFloorSelection])

  // دالة لمعالجة النموذج الجديد
  const handleDefineFloors = () => {
    if (floorRangeForm.selectedBlocks.length === 0) {
      showWarning('يرجى اختيار بلوك واحد على الأقل', 'لم يتم الاختيار')
      return
    }

    if (floorRangeForm.fromFloor > floorRangeForm.toFloor) {
      showWarning('رقم الطابق الأول يجب أن يكون أقل من أو يساوي رقم الطابق الأخير', 'خطأ في النطاق')
      return
    }

    const newDefinitions: Record<string, FloorDefinition> = { ...floorDefinitions }
    
  // إنشاء تعريفات الطوابق للنطاق المحدد (لا نضيف تلقائياً من اختيار الرسمة بدون موافقة المستخدم)
    for (let floorNum = floorRangeForm.fromFloor; floorNum <= floorRangeForm.toFloor; floorNum++) {
      floorRangeForm.selectedBlocks.forEach(blockName => {
        const floorKey = `${blockName}-floor-${floorNum}`
        
        // توليد رمز الطابق - إذا كان البادئة رقم، نستخدم رقم الطابق مباشرة
        const floorCode = isNaN(parseInt(floorRangeForm.floorCodePrefix)) 
          ? `${floorRangeForm.floorCodePrefix}${floorNum}` // إذا كان البادئة حرف مثل "F" -> "F1", "F2"
          : `${floorNum}` // إذا كان البادئة رقم مثل "1" -> "1", "2", "3"
        
        newDefinitions[floorKey] = {
          floorCode,
          arabicName: `الطابق ${floorNum}`,
          englishName: `Floor ${floorNum}`,
          floorNumber: floorNum,
          floorType: floorRangeForm.floorType,
          unitsDefinition: {
            type: floorRangeForm.unitType,
            count: floorRangeForm.unitType === 'parking' ? 0 : floorRangeForm.unitsCount,
            startNumber: floorRangeForm.startUnitNumber,
            codePrefix: floorRangeForm.floorCodePrefix,
            includeTowerName: floorRangeForm.includeTowerName,
            includeFloorCode: floorRangeForm.includeFloorCode,
            includeUnitNumber: floorRangeForm.includeUnitNumber
          },
          selectedFromVisualization: false
        }
      })
    }

    setFloorDefinitions(newDefinitions)
    setShowDefinitionForm(false)
    
    const totalFloors = (floorRangeForm.toFloor - floorRangeForm.fromFloor + 1) * floorRangeForm.selectedBlocks.length
    showSuccess(`تم تعريف ${totalFloors} طابق بنجاح`, 'تم التعريف')
    
    // تحديث الرسمة فوراً بالطوابق والوحدات المُعرَّفة (معاينة قبل الحفظ)
    setBuildingData(prev => {
      // الحفاظ على جميع البلوكات الموجودة
      const existingBlocks = prev.blocks || []
      
      const updatedBlocks = existingBlocks.map(block => {
        const existingFloors = block.floors || []
        
        // البحث عن الطوابق المُعرَّفة لهذا البلوك فقط
        const newBlockFloors = Object.keys(newDefinitions)
          .filter(key => key.startsWith(`${block.name}-floor-`))
          .map(key => {
            const floorNumber = key.split('-floor-')[1]
            const definition = newDefinitions[key]
            
            // إنشاء الوحدات للمعاينة
            const units = []
            if (definition.unitsDefinition && definition.unitsDefinition.type !== 'parking') {
              for (let i = 0; i < definition.unitsDefinition.count; i++) {
                const unitNumber = definition.unitsDefinition.startNumber + i
                const unitCode = generateUnitCode(definition.floorCode, unitNumber, definition.unitsDefinition)
                
                const displayNumber = definition.unitsDefinition.type === 'apartment' 
                  ? String(unitNumber).padStart(2, '0')
                  : unitCode
                
                const unitColor = definition.unitsDefinition.type === 'apartment' ? '#10B981' :
                                definition.unitsDefinition.type === 'office' ? '#3B82F6' :
                                definition.unitsDefinition.type === 'commercial' ? '#F59E0B' :
                                definition.unitsDefinition.type === 'storage' ? '#6B7280' :
                                definition.unitsDefinition.type === 'shop' ? '#EF4444' :
                                '#8B5CF6'
                
                units.push({
                  id: `unit-${block.name}-${floorNumber}-${unitNumber}`,
                  number: displayNumber,
                  type: definition.unitsDefinition.type,
                  code: unitCode,
                  color: unitColor,
                  status: 'defined', // حالة "مُعرَّف" قبل الحفظ
                  fullCode: unitCode,
                  unitTypeLabel: UNIT_TYPES[definition.unitsDefinition.type as keyof typeof UNIT_TYPES]?.label,
                  floorCode: definition.floorCode,
                  isDefined: true // علامة للوحدات المُعرَّفة
                })
              }
            }
            
            return {
              id: `floor-${block.name}-${floorNumber}`,
              number: floorNumber,
              units,
              floorCode: definition.floorCode,
              floorType: definition.floorType,
              isDefined: true // علامة للطوابق المُعرَّفة
            }
          })
        
        // دمج الطوابق الموجودة (القابلة للاختيار) مع الجديدة (المُعرَّفة)
        const allFloors = [...existingFloors]
        newBlockFloors.forEach(newFloor => {
          const existingIndex = allFloors.findIndex(f => f.number === newFloor.number)
          if (existingIndex >= 0) {
            // تحديث الطابق الموجود بالوحدات الجديدة مع الحفاظ على قابلية الاختيار
            allFloors[existingIndex] = {
              ...newFloor,
              isSelectable: true, // الحفاظ على قابلية الاختيار
              isVisualizationMode: true // الحفاظ على وضع الاختيار
            }
          } else {
            // إضافة طابق جديد مع المحافظة على خصائص الاختيار
            allFloors.push({
              ...newFloor,
              isSelectable: true,
              isVisualizationMode: true
            })
          }
        })
        
        return {
          ...block,
          floors: allFloors.sort((a, b) => parseInt(a.number) - parseInt(b.number))
        }
      })
      
      console.log('📐 تحديث معاينة الرسمة بالطوابق المُعرَّفة (مع الحفاظ على جميع البلوكات):', {
        totalBlocks: updatedBlocks.length,
        blocksWithFloors: updatedBlocks.map(b => ({ name: b.name, floorsCount: b.floors?.length || 0 }))
      })
      
      return {
        ...prev,
        blocks: updatedBlocks
      }
    })
  }

  // دالة لتوليد رمز الوحدة
  const generateUnitCode = (floorCode: string, unitNumber: number, definition: UnitDefinition) => {
    const parts: string[] = []
    
    if (definition.includeTowerName && towerName) {
      parts.push(towerName)
    }
    
    if (definition.includeFloorCode) {
      parts.push(floorCode)
    }
    
    if (definition.includeUnitNumber) {
      const paddedUnitNumber = String(unitNumber).padStart(2, '0')
      parts.push(paddedUnitNumber)
    }
    
    return parts.join('-')
  }

  const handleSaveClick = async () => {
    if (Object.keys(floorDefinitions).length === 0) {
      showWarning('يرجى تعريف طابق واحد على الأقل', 'لم يتم التعريف')
      return
    }

    try {
      // تحويل floorDefinitions إلى BlockFloorDto array مع إنشاء الوحدات
      const blockFloors: BlockFloorDto[] = []
      const unitsToCreate: UnitDto[] = []
      
      Object.entries(floorDefinitions).forEach(([floorKey, definition]) => {
        const [blockName, floorPart] = floorKey.split('-floor-')
        const floorNumber = parseInt(floorPart)
        
        const block = createdBlocks.find(b => b.name === blockName)
        if (!block) {
          throw new Error(`لم يتم العثور على البلوك: ${blockName}`)
        }

        if (!block.id || block.id === 0 || typeof block.id !== 'number') {
          throw new Error(`BlockId غير صحيح للبلوك ${block.name}: ${block.id}`)
        }

        // إنشاء الطوابق مع الوحدات
        const floorData = {
          BlockId: block.id,
          TowerId: createdTowerId ?? undefined,
          FloorCode: definition.floorCode,
          FloorArabicName: definition.arabicName,
          FloorEnglishName: definition.englishName,
          FloorNumber: definition.floorNumber,
          SortOrder: floorNumber,
          FloorType: definition.floorType,
          UnitsCount: definition.unitsDefinition?.count || 0,
          UnitNumberPattern: "A##01",
          HasSharedFacilities: false,
          ElevatorsCount: 0,
          StaircasesCount: 1,
          HasEmergencyExit: false,
          IsActive: true,
          DisplayOrder: floorNumber
        }

        blockFloors.push(floorData)
        
        // إنشاء الوحدات إذا لم تكن باركنج
        if (definition.unitsDefinition &&  definition.unitsDefinition.count > 0) {
          for (let unitIndex = 0; unitIndex < definition.unitsDefinition.count; unitIndex++) {
            const unitNumber = definition.unitsDefinition.startNumber + unitIndex
            const unitCode = generateUnitCode(definition.floorCode, unitNumber, definition.unitsDefinition)
            
            // للشقق السكنية، نخزن رقم الوحدة بدون رمز "-"
            const finalUnitNumber = definition.unitsDefinition.type === 'apartment' 
              ? String(unitNumber).padStart(2, '0') // رقم فقط للشقق السكنية
              : unitCode // الترميز الكامل للأنواع الأخرى
            
            // تحديد نوع الوحدة بناءً على الاختيار
            const unitTypeKey = definition.unitsDefinition.type as keyof typeof UNIT_TYPES
            const unitTypeValue = UNIT_TYPES[unitTypeKey]?.apiValue || UnitType.Residential
            
            unitsToCreate.push({
              unitNumber: finalUnitNumber,
              floorNumber: definition.floorNumber,
              TowerId: createdTowerId!,
              BlockId: block.id,
              blockFloorId: 0, // سيتم تحديثه بعد إنشاء الطابق
              type: unitTypeValue as UnitType,
              status: UnitStatus.Available,
              isActive: true
            })
          }
        }
      })

      const request: CreateMultipleBlockFloorsRequest = {
        blockFloors: blockFloors
      }

      console.log('إرسال طلب إنشاء الطوابق:', request)
      const response = await RealEstateAPI.blockFloor.createMultiple(request, "ar")
      console.log('استجابة إنشاء الطوابق:', response)

      if (response.data) {
        const apiBlockFloors = response.data?.data?.blockFloors || response.data?.data || []
        const createdFloorsData: { id: number; blockName: string; floorNumber: string; towerBlockId: number }[] = []

        const blockIdToName = new Map<number, string>()
        createdBlocks.forEach(b => { blockIdToName.set(b.id, b.name) })

        // تحديث blockFloorId في الوحدات
        apiBlockFloors.forEach((createdFloor: {
          id?: number;
          blockFloorId?: number;
          towerBlockId?: number;
          blockId?: number;
          floorNumber?: number;
        }, index: number) => {
          const requestedFloor = blockFloors[index]
          const towerBlockId = (createdFloor.towerBlockId ?? requestedFloor?.BlockId ?? createdFloor.blockId ?? 0)
          const blockName = blockIdToName.get(towerBlockId) || 'Unknown'
          const rawFloorNumber = createdFloor.floorNumber ?? requestedFloor?.FloorNumber ?? (index + 1)
          const paddedFloorNumber = String(rawFloorNumber).padStart(2, '0')
          const floorId = createdFloor.id || createdFloor.blockFloorId || 0
          
          createdFloorsData.push({
            id: floorId,
            blockName,
            floorNumber: paddedFloorNumber,
            towerBlockId: towerBlockId
          })

          // تحديث blockFloorId في الوحدات المرتبطة بهذا الطابق
          unitsToCreate.forEach(unit => {
            if (unit.BlockId === towerBlockId && unit.floorNumber === rawFloorNumber) {
              unit.blockFloorId = floorId
            }
          })
        })

        console.log('✅ تم استخراج الطوابق المنشأة (مع IDs حقيقية):', createdFloorsData)
        setCreatedBlockFloors(createdFloorsData)

        // إنشاء الوحدات إذا كان هناك وحدات للإنشاء
        if (unitsToCreate.length > 0) {
          console.log('🏠 إنشاء الوحدات:', unitsToCreate)
          const unitRequestPayload: CreateMultipleUnitsRequest = { units: unitsToCreate }
          await RealEstateAPI.unit.createMultiple(unitRequestPayload, 'ar')
          showSuccess(`تم إنشاء ${blockFloors.length} طابق و ${unitsToCreate.length} وحدة بنجاح!`, 'تم الحفظ')
        } else {
          showSuccess(`تم إنشاء ${blockFloors.length} طابق بنجاح!`, 'تم الحفظ')
        }

        // تحديث buildingData
        setBuildingData(prev => {
          // الحفاظ على جميع البلوكات الموجودة
          const existingBlocks = prev.blocks || []
          
          const updatedBlocks = existingBlocks.map(block => {
            // البحث عن الطوابق المُعرَّفة لهذا البلوك
            const blockDefinitions = Object.keys(floorDefinitions)
              .filter(key => key.startsWith(`${block.name}-floor-`))
            
            if (blockDefinitions.length === 0) {
              // إذا لم يكن هناك تعريفات جديدة لهذا البلوك، أعد الطوابق الموجودة
              return block
            }
            
            // إنشاء الطوابق الجديدة المُعرَّفة
            const newFloors = blockDefinitions.map(key => {
              const floorNumber = key.split('-floor-')[1]
              const definition = floorDefinitions[key]
              
              // إنشاء الوحدات حسب التعريف
              const units = []
              if (definition.unitsDefinition && definition.unitsDefinition.type !== 'parking') {
                for (let i = 0; i < definition.unitsDefinition.count; i++) {
                  const unitNumber = definition.unitsDefinition.startNumber + i
                  const unitCode = generateUnitCode(definition.floorCode, unitNumber, definition.unitsDefinition)
                  
                  // تحديد رقم العرض (للشقق السكنية: رقم بسيط، للأخرى: الترميز الكامل)
                  const displayNumber = definition.unitsDefinition.type === 'apartment' 
                    ? String(unitNumber).padStart(2, '0')
                    : unitCode
                  
                  // تحديد لون الوحدة حسب النوع
                  const unitColor = definition.unitsDefinition.type === 'apartment' ? '#10B981' : // أخضر للسكني
                                  definition.unitsDefinition.type === 'office' ? '#3B82F6' : // أزرق للمكاتب
                                  definition.unitsDefinition.type === 'commercial' ? '#F59E0B' : // برتقالي للتجاري
                                  definition.unitsDefinition.type === 'storage' ? '#6B7280' : // رمادي للمخازن
                                  definition.unitsDefinition.type === 'shop' ? '#EF4444' : // أحمر للمحلات
                                  definition.unitsDefinition.type === 'clinic' ? '#06B6D4' : // سماوي للعيادات
                                  definition.unitsDefinition.type === 'restaurant' ? '#F97316' : // برتقالي محمر للمطاعم
                                  '#8B5CF6' // بنفسجي للأنواع الأخرى
                  
                  units.push({
                    id: `unit-${block.name}-${floorNumber}-${unitNumber}`,
                    number: displayNumber,
                    type: definition.unitsDefinition.type,
                    code: unitCode,
                    color: unitColor,
                    status: 'available',
                    // إضافة معلومات إضافية للرسمة
                    fullCode: unitCode, // الترميز الكامل
                    unitTypeLabel: UNIT_TYPES[definition.unitsDefinition.type as keyof typeof UNIT_TYPES]?.label || definition.unitsDefinition.type,
                    floorCode: definition.floorCode,
                    isNew: true // علامة للوحدات الجديدة
                  })
                }
              }
              
              return {
                id: `floor-${block.name}-${floorNumber}`,
                number: floorNumber,
                units,
                floorCode: definition.floorCode,
                floorType: definition.floorType,
                isNew: true, // علامة للطوابق الجديدة
                isDefined: true,
                isSelectable: true, // الحفاظ على قابلية الاختيار
                isVisualizationMode: true // الحفاظ على وضع الاختيار
              }
            })
            
            // دمج الطوابق الموجودة مع الجديدة
            const existingFloors = block.floors || []
            const mergedFloors = [...existingFloors]
            
            newFloors.forEach(newFloor => {
              const existingIndex = mergedFloors.findIndex(f => f.number === newFloor.number)
              if (existingIndex >= 0) {
                // تحديث الطابق الموجود مع الحفاظ على خصائص الاختيار
                mergedFloors[existingIndex] = {
                  ...newFloor,
                  isSelectable: true,
                  isVisualizationMode: true
                }
              } else {
                // إضافة طابق جديد
                mergedFloors.push({
                  ...newFloor,
                  isSelectable: true,
                  isVisualizationMode: true
                })
              }
            })
            
            return {
              ...block,
              floors: mergedFloors.sort((a, b) => parseInt(a.number) - parseInt(b.number))
            }
          })
          
          const newBuildingData = {
            ...prev,
            blocks: updatedBlocks
          }
          
          // إضافة console.log لمراقبة التحديث
          console.log('🏗️ تحديث بيانات البناء للرسمة:', {
            totalBlocks: updatedBlocks.length,
            totalFloors: updatedBlocks.reduce((sum, block) => sum + block.floors.length, 0),
            totalUnits: updatedBlocks.reduce((sum, block) => 
              sum + block.floors.reduce((floorSum, floor) => floorSum + floor.units.length, 0), 0
            ),
            newData: newBuildingData
          })
          
          return newBuildingData
        })
        
        showSuccess(`تم إنشاء ${blockFloors.length} طابق مع الوحدات بنجاح!`, 'تم الحفظ')
        setTimeout(() => {
          showSuccess(`تم تحديث الرسمة بـ ${unitsToCreate.length} وحدة جديدة!`, 'تحديث الرسمة')
        }, 1000)
        onSaveDefinitions()
        
        setTimeout(() => {
          onNext()
        }, 1500)
      } else {
        throw new Error('فشل في حفظ الطوابق')
      }
    } catch (error) {
      console.error('خطأ في حفظ الطوابق:', error)
      showError(
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء حفظ الطوابق',
        'خطأ في الحفظ'
      )
    }
  }

  return (
    <>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          المرحلة الثالثة: تعريف الطوابق والوحدات
        </h3>
        
        {/* عرض البلوكات المنشأة */}
        {createdBlocks.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-medium text-blue-900 mb-3">البلوكات المتاحة:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {createdBlocks.map((block, index) => (
                <div key={block.id} className="bg-white p-3 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        البلوك {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-sm text-gray-600">{block.originalName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {blockFloorsCount[block.originalName] || 0}
                      </div>
                      <div className="text-xs text-gray-500">طابق أقصى</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نموذج تعريف الطوابق الجديد */}
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
          <h4 className="text-lg font-medium text-gray-900 mb-4">تعريف نطاق الطوابق</h4>
          
          {/* إرشادات للمستخدم */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <div className="text-blue-500 mt-1">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-semibold text-blue-900 mb-2">🎯 طرق تحديد الطوابق:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <h6 className="font-semibold text-blue-800 mb-2">📱 من الرسمة التفاعلية:</h6>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• انقر على الطوابق في رسمة البناء لتحديدها</li>
                      <li>• يمكن اختيار عدة طوابق معاً (اختيار متعدد)</li>
                      <li>• <strong>ستبقى جميع الطوابق قابلة للاختيار حتى بعد التعريف</strong></li>
                      <li>• يمكن إضافة المزيد من الطوابق في أي وقت</li>
                      <li>• تظهر أرقام الطوابق بوضوح على الرسمة</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <h6 className="font-semibold text-green-800 mb-2">⌨️ من القوائم المنسدلة:</h6>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• اختر نطاق الطوابق يدوياً من القوائم أدناه</li>
                      <li>• حدد البلوكات المراد تعريف طوابقها</li>
                      <li>• مفيد للنطاقات الكبيرة</li>
                      <li>• يمكن دمج الطريقتين معاً</li>
                    </ul>
                  </div>
                </div>
                {createdBlocks.length > 0 && (
                  <div className="mt-3 p-2 bg-green-100 rounded-md border border-green-200">
                    <p className="text-sm text-green-800">
                      ✅ <strong>جاهز للاختيار:</strong> تم تحضير {createdBlocks.length} بلوك مع إجمالي {Object.values(blockFloorsCount).reduce((sum, count) => sum + count, 0)} طابق للتعريف
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* من الطابق */}
            <div className="relative">
              <Label htmlFor="fromFloor">من الطابق</Label>
              <select
                id="fromFloor"
                value={floorRangeForm.fromFloor}
                onChange={(e) => setFloorRangeForm(prev => ({ ...prev, fromFloor: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: Math.max(...Object.values(blockFloorsCount), 1) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              {floorRangeForm.fromFloor && (
                <div className="text-xs text-green-600 mt-1">✓ الطابق {floorRangeForm.fromFloor} محدد</div>
              )}
            </div>

            {/* إلى الطابق */}
            <div className="relative">
              <Label htmlFor="toFloor">إلى الطابق</Label>
              <select
                id="toFloor"
                value={floorRangeForm.toFloor}
                onChange={(e) => setFloorRangeForm(prev => ({ ...prev, toFloor: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: Math.max(...Object.values(blockFloorsCount), 1) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              {floorRangeForm.toFloor && (
                <div className="text-xs text-green-600 mt-1">✓ الطابق {floorRangeForm.toFloor} محدد</div>
              )}
            </div>

            {/* معاينة النطاق */}
            <div className="md:col-span-2">
              <Label>معاينة النطاق المحدد</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                {floorRangeForm.fromFloor === floorRangeForm.toFloor ? (
                  <div className="text-sm text-gray-700">
                    📌 <strong>طابق واحد:</strong> الطابق {floorRangeForm.fromFloor}
                  </div>
                ) : (
                  <div className="text-sm text-gray-700">
                    📊 <strong>نطاق طوابق:</strong> من الطابق {floorRangeForm.fromFloor} إلى الطابق {floorRangeForm.toFloor}
                    <span className="text-blue-600 font-medium">
                      {' '}(إجمالي {floorRangeForm.toFloor - floorRangeForm.fromFloor + 1} طوابق)
                    </span>
                  </div>
                )}
                {floorRangeForm.selectedBlocks.length > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ سيتم تطبيقه على {floorRangeForm.selectedBlocks.length} بلوك مختار
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* اختيار البلوكات المحسن */}
          <div className="mb-4">
            <Label className="text-lg font-medium text-gray-900 mb-3 block">اختيار البلوكات المراد تعريف طوابقها</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {createdBlocks.map((block, index) => {
                const isSelected = floorRangeForm.selectedBlocks.includes(block.name)
                const blockLetter = String.fromCharCode(65 + index)
                const maxFloors = blockFloorsCount[block.originalName] || 0
                
                return (
                  <label 
                    key={block.id} 
                    className={`
                      flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFloorRangeForm(prev => ({
                              ...prev,
                              selectedBlocks: [...prev.selectedBlocks, block.name]
                            }))
                          } else {
                            setFloorRangeForm(prev => ({
                              ...prev,
                              selectedBlocks: prev.selectedBlocks.filter(b => b !== block.name)
                            }))
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          البلوك {blockLetter}
                        </div>
                        <div className="text-sm text-gray-600">{block.originalName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{maxFloors}</div>
                      <div className="text-xs text-gray-500">طابق</div>
                    </div>
                  </label>
                )
              })}
            </div>
            {floorRangeForm.selectedBlocks.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                <p className="text-sm text-green-700">
                  ✅ تم اختيار {floorRangeForm.selectedBlocks.length} بلوك. 
                  إجمالي الطوابق التي سيتم تعريفها: <strong>
                    {floorRangeForm.selectedBlocks.length * (floorRangeForm.toFloor - floorRangeForm.fromFloor + 1)}
                  </strong> طابق
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={() => setShowDefinitionForm(true)}
            disabled={floorRangeForm.selectedBlocks.length === 0}
            className="w-full mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            تعريف الطوابق المختارة
          </Button>
        </div>

        {/* نموذج تفاصيل التعريف */}
        {showDefinitionForm && (
          <Card className="p-6 mt-4 bg-blue-50 border-blue-200">
            <h4 className="text-lg font-medium text-blue-900 mb-4">تفاصيل تعريف الطوابق</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* نوع الطابق */}
              <div>
                <Label htmlFor="floorType">نوع الطابق</Label>
                <select
                  id="floorType"
                  value={floorRangeForm.floorType}
                  onChange={(e) => setFloorRangeForm(prev => ({ ...prev, floorType: parseInt(e.target.value) as FloorType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={FloorType.Regular}>سكني</option>
                  <option value={FloorType.Office}>مكاتب</option>
                  <option value={FloorType.Parking}>باركنج</option>
                  <option value={FloorType.Commercial}>تجاري</option>
                  <option value={FloorType.Amenities}>مرافق</option>
                  <option value={FloorType.Service}>خدمي</option>
                  <option value={FloorType.Technical}>تقني</option>
                  <option value={FloorType.Storage}>تخزين</option>
                </select>
              </div>

              {/* ترميز الطوابق */}
              <div>
                <Label htmlFor="floorCodePrefix">ترميز الطوابق</Label>
                <Input
                  id="floorCodePrefix"
                  value={floorRangeForm.floorCodePrefix}
                  onChange={(e) => setFloorRangeForm(prev => ({ ...prev, floorCodePrefix: e.target.value }))}
                  placeholder="F, M, B, etc."
                />
              </div>

              {/* نوع الوحدة */}
              {floorRangeForm.floorType !== FloorType.Parking && (
                <div>
                  <Label htmlFor="unitType">نوع الوحدة</Label>
                  <select
                    id="unitType"
                    value={floorRangeForm.unitType}
                    onChange={(e) => setFloorRangeForm(prev => ({ ...prev, unitType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(UNIT_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* عدد الوحدات */}
              {floorRangeForm.floorType !== FloorType.Parking && (
                <div>
                  <Label htmlFor="unitsCount">عدد {floorRangeForm.unitType === 'apartment' ? 'الشقق' : 'المكاتب'}</Label>
                  <Input
                    id="unitsCount"
                    type="number"
                    min="1"
                    value={floorRangeForm.unitsCount}
                    onChange={(e) => setFloorRangeForm(prev => ({ ...prev, unitsCount: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              )}

              {/* بداية ترقيم الوحدات */}
              {floorRangeForm.floorType !== FloorType.Parking && (
                <div>
                  <Label htmlFor="startUnitNumber">بداية ترقيم {floorRangeForm.unitType === 'apartment' ? 'الشقق' : 'المكاتب'}</Label>
                  <Input
                    id="startUnitNumber"
                    type="number"
                    min="1"
                    value={floorRangeForm.startUnitNumber}
                    onChange={(e) => setFloorRangeForm(prev => ({ ...prev, startUnitNumber: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              )}

              {/* عدد الباركنات */}
              {floorRangeForm.floorType === FloorType.Parking && (
                <div>
                  <Label htmlFor="parkingCount">عدد الباركنات</Label>
                  <Input
                    id="parkingCount"
                    type="number"
                    min="0"
                    value={floorRangeForm.unitsCount}
                    onChange={(e) => setFloorRangeForm(prev => ({ ...prev, unitsCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              )}
            </div>

            {/* شكل الترميز */}
            {floorRangeForm.floorType !== FloorType.Parking && (
              <div className="mt-4">
                <Label>شكل ترميز {floorRangeForm.unitType === 'apartment' ? 'الشقة' : 'المكتب'}</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      checked={floorRangeForm.includeTowerName}
                      onChange={(e) => setFloorRangeForm(prev => ({ ...prev, includeTowerName: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">اسم البرج</span>
                  </label>
                  <label className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      checked={floorRangeForm.includeFloorCode}
                      onChange={(e) => setFloorRangeForm(prev => ({ ...prev, includeFloorCode: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">رمز الطابق</span>
                  </label>
                  <label className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      checked={floorRangeForm.includeUnitNumber}
                      onChange={(e) => setFloorRangeForm(prev => ({ ...prev, includeUnitNumber: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">رقم {floorRangeForm.unitType === 'apartment' ? 'الشقة' : 'المكتب'}</span>
                  </label>
                </div>
              </div>
            )}

            {/* معاينة الترميز */}
            {floorRangeForm.floorType !== FloorType.Parking && (
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <Label>معاينة الترميز:</Label>
                <div className="mt-2 text-sm text-gray-600">
                  مثال: {(() => {
                    const exampleDefinition = {
                      type: floorRangeForm.unitType,
                      count: floorRangeForm.unitsCount,
                      startNumber: floorRangeForm.startUnitNumber,
                      codePrefix: floorRangeForm.floorCodePrefix,
                      includeTowerName: floorRangeForm.includeTowerName,
                      includeFloorCode: floorRangeForm.includeFloorCode,
                      includeUnitNumber: floorRangeForm.includeUnitNumber
                    }
                    
                    // توليد رمز الطابق بنفس منطق التعريف
                    const exampleFloorCode = isNaN(parseInt(floorRangeForm.floorCodePrefix)) 
                      ? `${floorRangeForm.floorCodePrefix}1` // حرف + رقم
                      : `1` // رقم فقط
                    
                    const exampleCode = generateUnitCode(exampleFloorCode, floorRangeForm.startUnitNumber, exampleDefinition)
                    
                    // للشقق السكنية: إذا كان اسم البرج مُفعل، نعرض الترميز الكامل، وإلا نعرض الرقم فقط
                    if (floorRangeForm.unitType === 'apartment') {
                      return floorRangeForm.includeTowerName || floorRangeForm.includeFloorCode 
                        ? exampleCode 
                        : String(floorRangeForm.startUnitNumber).padStart(2, '0')
                    }
                    
                    return exampleCode
                  })()}
                </div>
                {floorRangeForm.includeTowerName && towerName && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ سيتم تضمين اسم البرج: {towerName}
                  </div>
                )}
                {!floorRangeForm.includeTowerName && (
                  <div className="mt-1 text-xs text-amber-600">
                    ⚠ اسم البرج غير مُفعل
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  <strong>ملاحظة:</strong> للشقق السكنية، يتم حفظ الرقم فقط في قاعدة البيانات، بينما الترميز الكامل يُستخدم للعرض والتتبع.
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowDefinitionForm(false)}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleDefineFloors}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                تطبيق التعريف
              </Button>
            </div>
          </Card>
        )}
      </Card>

      {/* عرض الطوابق المُعرَّفة */}
      {Object.keys(floorDefinitions).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">الطوابق المُعرَّفة</h4>
            <Button
              onClick={() => setFloorDefinitions({})}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              مسح الكل
            </Button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(floorDefinitions).map(([floorKey, definition]) => {
              const [blockName, floorPart] = floorKey.split('-floor-')
              const floorNumber = floorPart
              
              return (
                <div key={floorKey} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      الطابق {floorNumber} - {blockName}
                    </div>
                    <Button
                      onClick={() => {
                        const newDefinitions = { ...floorDefinitions }
                        delete newDefinitions[floorKey]
                        setFloorDefinitions(newDefinitions)
                        showSuccess(`تم حذف تعريف الطابق ${floorNumber}`, 'تم الحذف')
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div><strong>الكود:</strong> {definition.floorCode}</div>
                    <div><strong>النوع:</strong> {
                      definition.floorType === FloorType.Regular ? 'سكني' :
                      definition.floorType === FloorType.Office ? 'مكاتب' :
                      definition.floorType === FloorType.Parking ? 'باركنج' :
                      definition.floorType === FloorType.Commercial ? 'تجاري' : 'أخرى'
                    }</div>
                    {definition.unitsDefinition && definition.unitsDefinition.type !== 'parking' && (
                      <>
                        <div><strong>الوحدات:</strong> {definition.unitsDefinition.count}</div>
                        <div><strong>من رقم:</strong> {definition.unitsDefinition.startNumber}</div>
                        <div className="md:col-span-2"><strong>نوع الوحدة:</strong> {UNIT_TYPES[definition.unitsDefinition.type as keyof typeof UNIT_TYPES]?.label || definition.unitsDefinition.type}</div>
                        <div className="md:col-span-2"><strong>مثال ترميز:</strong> {
                          generateUnitCode(definition.floorCode, definition.unitsDefinition.startNumber, definition.unitsDefinition)
                        }</div>
                      </>
                    )}
                    {definition.floorType === FloorType.Parking && (
                      <div><strong>الباركنات:</strong> {definition.unitsDefinition?.count || 0}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* أزرار التحكم */}
      <Card className="p-6">
        <div className="flex gap-2">
          <Button onClick={onPrevious} variant="outline" className="flex-1">
            السابق
          </Button>
          <Button
            onClick={handleSaveClick}
            disabled={Object.keys(floorDefinitions).length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            حفظ الطوابق والوحدات
          </Button>
        </div>

        {isCompleted && (
          <div className="mt-4">
            <Button
              onClick={onNext}
              variant="outline"
              className="w-full"
            >
              <>
                <ArrowRight className="w-4 h-4" />
                التالي - المرحلة التالية
              </>
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}

export default Step3FloorDefinitions