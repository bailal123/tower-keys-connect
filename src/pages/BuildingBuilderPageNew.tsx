import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../components/ui/Button'

// Import types
import type { 
  TowerFormData,
  BuildingData,
  FloorDefinition
} from '../components/building-builder/types'
// import {  UnitType, UnitStatus } from '../types/api'
// import type { UnitDto } from '../types/api'
import { Card } from '../components/ui/Card'
import { useLanguage } from '../hooks/useLanguage'
import { useNotifications } from '../hooks/useNotificationContext'
import { RealEstateAPI } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import RealisticBuildingVisualization from '../components/building/RealisticBuildingVisualization'
import ThreeDVisualization from '../components/building/ThreeDVisualization'

// Import step components
import Step1TowerCreation from '../components/building-builder/Step1TowerCreation'
import Step2BlocksCreation from '../components/building-builder/Step2BlocksCreation'
import Step3FloorDefinitions from '../components/building-builder/Step3FloorDefinitions'
import Step4FloorCreation from '../components/building-builder/Step4FloorCreation'
import Step5UnitsDefinition from '../components/building-builder/Step5UnitsDefinition'



const BuildingBuilderPage: React.FC = () => {
  const { language, t } = useLanguage()
  const { showSuccess, showError, showInfo } = useNotifications()

  // الحالات الأساسية
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view3D, setView3D] = useState(false)
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [showFullScreenVisualization, setShowFullScreenVisualization] = useState(false)

  // بيانات النموذج
  const [towerFormData, setTowerFormData] = useState<TowerFormData>({
    arabicName: '',
    englishName: '',
    arabicDescription: '',
    englishDescription: '',
    address: '',
    latitude: '24.7136', // الرياض كقيمة افتراضية
    longitude: '46.6753', // الرياض كقيمة افتراضية
    constructionYear: new Date().getFullYear().toString(),
    mainImageUrl: '',
    countryId: 0,
    cityId: 0,
    areaId: 0,
    isActive: true,
    developerName: '',
    managementCompany: '',
    definitionStage: 1
  })

  // بيانات البناء
  const [buildingData, setBuildingData] = useState<BuildingData>({
    name: '',
    blocks: []
  })

  // تخزين callback خاص باختيار الطوابق من الرسمة (يُسجل من المرحلة 3)
  const [visualizationSelectionHandler, setVisualizationSelectionHandler] = useState<((selectedFloors: number[], selectedBlock?: string) => void) | null>(null)
  // تخزين الطوابق المختارة (لكل بلوك) بشكل مؤقت قبل التعريف
  const [selectedVisualizationFloors, setSelectedVisualizationFloors] = useState<Record<string, Set<number>>>({})
  // Debug toggle: window.__BUILDER_LOGS__ = true في الكونسول لتفعيل السجلات
  const debug = import.meta.env.DEV && (typeof window !== 'undefined') && !!(window as unknown as { __BUILDER_LOGS__?: boolean }).__BUILDER_LOGS__
  if (debug) console.log('[Builder] selectedVisualizationFloors init:', selectedVisualizationFloors)
  // تسجيل تغيير buildingData للتتبع
  useEffect(() => {
    if (debug) console.log('📊 buildingData updated:', buildingData)
  }, [buildingData, debug])

  // المتغيرات المساعدة
  const [selectedCountry, setSelectedCountry] = useState<number>(0)
  const [selectedCity, setSelectedCity] = useState<number>(0)
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])
  const [blockFloorsCount, setBlockFloorsCount] = useState<Record<string, number>>({})
  const [floorDefinitions, setFloorDefinitions] = useState<Record<string, FloorDefinition>>({})
  
  // للمرحلة الخامسة

  const [visuallySelectedUnits, setVisuallySelectedUnits] = useState<Set<string>>(new Set())
  const [selectedFloor, setSelectedFloor] = useState<{ floorId: string; blockId: string } | null>(null)

  // بيانات إنشاء البرج
  const [createdTowerId, setCreatedTowerId] = useState<number | null>(null)
  const [createdBlocks, setCreatedBlocks] = useState<{ id: number; name: string; originalName: string }[]>([])
  const [createdBlockFloors, setCreatedBlockFloors] = useState<{ id: number; blockName: string; floorNumber: string; towerBlockId: number }[]>([])
  if (debug) console.log('[Builder] createdBlockFloors:', createdBlockFloors)
  // Ref to avoid unnecessary buildingData updates loop in step 3 sync
  const lastStep3BlocksSigRef = useRef<string>('')
  // متغيرات لتتبع إكمال كل خطوة
  const [step1Completed, setStep1Completed] = useState(false)
  const [step2Completed, setStep2Completed] = useState(false)
  const [step3Completed, setStep3Completed] = useState(false)
  const [step4Completed, setStep4Completed] = useState(false)
  const [step5Completed, setStep5Completed] = useState(false)

  // إدراج البلوكات في buildingData بمجرد إنشائها (حتى قبل الدخول للمرحلة 3)
  useEffect(() => {
    if (!createdBlocks.length) return
    setBuildingData(prev => {
      const existingNames = new Set(prev.blocks.map(b => b.name))
      let changed = false
      const newBlocks = [...prev.blocks]
      createdBlocks.forEach(b => {
        if (!existingNames.has(b.name)) {
          newBlocks.push({ id: `block-${b.name}`, name: b.name, floors: [] })
          changed = true
        }
      })
      if (changed) {
        if (debug) console.log('🧱 Added placeholder blocks to buildingData for visualization:', newBlocks.map(b => b.name))
        return { ...prev, blocks: newBlocks }
      }
      return prev
    })
  }, [createdBlocks, debug])

  // إنشاء طوابق مبدئية (stub) فور الدخول للمرحلة 3 اعتماداً على عدد الطوابق المحدد في المرحلة 2
  useEffect(() => {
    if (currentStep !== 3) return
    if (!createdBlocks.length) return
    setBuildingData(prev => {
      let changed = false
      const updated = prev.blocks.map(b => {
        const src = createdBlocks.find(cb => cb.name === b.name)
        if (!src) return b
        const desired = blockFloorsCount[src.originalName] || blockFloorsCount[src.name] || 0
        if (desired > 0 && (!b.floors || b.floors.length === 0)) {
          const floors = Array.from({ length: desired }, (_, i) => ({
            id: `floor-${b.name}-${i + 1}`,
            number: String(i + 1),
            units: [],
            isSelectable: true,
            isVisualizationMode: true
          }))
          changed = true
          if (debug) console.log('🏗️ Injecting stub floors for block', b.name, 'count=', desired)
          return { ...b, floors }
        }
        return b
      })
      return changed ? { ...prev, blocks: updated } : prev
    })
  }, [currentStep, createdBlocks, blockFloorsCount, debug])

  // نسبة الإنجاز (stage 1..5)
  useEffect(() => {
    const stage = towerFormData.definitionStage || 1
    const pct = Math.min(100, Math.max(0, ((stage - 1) / 4) * 100))
    setProgressPercent(pct)
  }, [towerFormData.definitionStage])

  // استئناف تلقائي للخطوة الحالية اعتماداً على definitionStage
  useEffect(() => {
    const st = towerFormData.definitionStage
    let target: 1|2|3|4|5 = 1
    if (st === 2) target = 2
    else if (st === 3) target = 3
    else if (st === 4) target = 4
    else if (st >= 5) target = 5
    if (currentStep !== target) setCurrentStep(target)
  }, [towerFormData.definitionStage, currentStep])

  const guardedGoToNextStep = () => {
    if (currentStep === 3 && !step3Completed) {
      showError('يجب إكمال تعريف جميع الطوابق قبل المتابعة', 'تعريف ناقص')
      return
    }
    if (currentStep === 5 && !step5Completed) {
      showError('يجب تعيين التصاميم لكل الوحدات قبل الإنهاء', 'تصاميم ناقصة')
      return
    }
    if (currentStep < 5) setCurrentStep(prev => (prev + 1) as 1|2|3|4|5)
  }

  // API Queries
  const { data: countries } = useQuery({
    queryKey: ['countries', language],
    queryFn: () => RealEstateAPI.country.getAll(true, language),
    select: (data) => data.data?.data || []
  })

  const { data: cities } = useQuery({
    queryKey: ['cities', selectedCountry, language],
    queryFn: () => RealEstateAPI.city.getAll(true, selectedCountry || null, language),
    enabled: !!selectedCountry,
    select: (data) => data.data?.data || []
  })

  const { data: areas } = useQuery({
    queryKey: ['areas', selectedCity, language],
    queryFn: () => RealEstateAPI.area.getAll(true, selectedCity || null, language),
    enabled: !!selectedCity,
    select: (data) => data.data?.data || []
  })



  // Effects
  useEffect(() => {
    if (selectedCountry !== towerFormData.countryId) {
      setSelectedCity(0)
      setTowerFormData(prev => ({ ...prev, cityId: 0, areaId: 0 }))
    }
  }, [selectedCountry, towerFormData.countryId])

  useEffect(() => {
    if (selectedCity !== towerFormData.cityId) {
      setTowerFormData(prev => ({ ...prev, areaId: 0 }))
    }
  }, [selectedCity, towerFormData.cityId])

  // معالجات الأحداث
  const handleFormChange = (field: keyof TowerFormData, value: string | number | boolean) => {
    setTowerFormData(prev => ({ ...prev, [field]: value }))
  }

  // =====================
  // تعريف مراحل التقدم definitionStage
  // المطلوب: بعد إكمال كل خطوة يتم رفع القيمة:
  // ١ (بداية) -> عند إنهاء الخطوة 1 تصبح 2
  // ٢ -> عند إنهاء الخطوة 2 تصبح 3
  // ٣ -> عند إنهاء الخطوة 3 تصبح 4
  // ٤ (خطوة لا تنشئ بيانات جديدة في الداتابيز) -> عند إنهائها تصبح 5 (مكتمل)
  // ملاحظة: في الصفحة يوجد 5 مكوّنات, سنربط الزيادات بأول 4 فقط (Step1..Step4)
  // ولن نزيد بعد Step5 (يمكن تعديل ذلك لاحقاً حسب احتياجك)

  const computeTotalsForUpdate = async () => {
    try {
      // إذا كان التاور محفوظاً، نجلب الأعداد الفعلية من الـ API
      if (createdTowerId) {
        // حساب عدد الطوابق من blockFloorsCount أو من API
        const totalFloors = Object.values(blockFloorsCount).reduce((sum, count) => sum + count, 0)
        
        // حساب عدد البلوكات من selectedBlocks أو createdBlocks
        const totalBlocks = createdBlocks.length || selectedBlocks.length
        
        // جلب عدد الشقق الفعلي من API
        try {
          const unitsResponse = await RealEstateAPI.unit.getAll(true, createdTowerId, null, null, null, language)
          const towerUnits = unitsResponse.data.data || []
          const totalUnits = Array.isArray(towerUnits) ? towerUnits.length : 0
          const unitsPerFloor = totalFloors > 0 && totalUnits > 0 ? Math.ceil(totalUnits / totalFloors) : 0
          
          console.log('📊 حساب الأعداد من API:', { totalFloors, totalBlocks, totalUnits, unitsPerFloor })
          return { totalFloors, totalBlocks, unitsPerFloor }
        } catch {
          console.warn('⚠️ فشل جلب الشقق من API، استخدام القيم من blockFloorsCount')
        }
        
        // إذا فشل جلب الشقق، نحسب من blockFloorsCount فقط
        return { totalFloors, totalBlocks, unitsPerFloor: 0 }
      }
      
      // إذا لم يكن التاور محفوظاً بعد، نرجع 0
      return { totalFloors: 0, totalBlocks: 0, unitsPerFloor: 0 }
    } catch (err) {
      console.error('خطأ في حساب الأعداد:', err)
      return { totalFloors: 0, totalBlocks: 0, unitsPerFloor: 0 }
    }
  }

  const updateTowerDefinitionStage = async (targetStage: number, towerIdOverride?: number) => {
    try {
      const effectiveTowerId = towerIdOverride ?? createdTowerId
      if (!effectiveTowerId) {
        console.warn('⚠️ تعذر تحديث المرحلة: لا يوجد TowerId بعد. سيتم تجاهل الطلب.')
        return
      }
      console.log('🔄 بدء تحديث مرحلة التعريف', { targetStage, effectiveTowerId, currentStage: towerFormData.definitionStage })
      // لا نقوم بالتخفيض أو التكرار
      if (towerFormData.definitionStage >= targetStage) return

      const { totalFloors, totalBlocks, unitsPerFloor } = await computeTotalsForUpdate()

      // تحويل سنة البناء إلى DateTime (01 يناير) إن كانت سنة فقط
      let constructionYearDate: Date | null = null
      if (towerFormData.constructionYear && /^\d{4}$/.test(String(towerFormData.constructionYear))) {
        constructionYearDate = new Date(Number(towerFormData.constructionYear), 0, 1)
      }

      // إعداد البيانات بصيغة الباك إند (PascalCase) باستخدام UpdateTowerCommand
      const updatePayload: import('../types/api').UpdateTowerCommand = {
        Id: effectiveTowerId,
        ArabicName: towerFormData.arabicName || 'برج بدون اسم',
        EnglishName: towerFormData.englishName || 'Unnamed Tower',
        ArabicDescription: towerFormData.arabicDescription || null,
        EnglishDescription: towerFormData.englishDescription || null,
        Address: towerFormData.address || null,
        Latitude: towerFormData.latitude || null,
        Longitude: towerFormData.longitude || null,
        TotalFloors: totalFloors,
        TotalBlocks: totalBlocks,
        UnitsPerFloor: unitsPerFloor,
        ConstructionYear: constructionYearDate,
        MainImageUrl: towerFormData.mainImageUrl || null,
        IsActive: towerFormData.isActive,
        CountryId: towerFormData.countryId || null,
        CityId: towerFormData.cityId || null,
        AreaId: towerFormData.areaId || null,
        DeveloperName: towerFormData.developerName || null,
        ManagementCompany: towerFormData.managementCompany || null,
        DefinitionStage: targetStage,
        lang: language
      }

  if (debug) console.log('📤 إرسال تحديث المرحلة إلى الخادم:', updatePayload)
    await RealEstateAPI.tower.update(effectiveTowerId, updatePayload, language)
  if (debug) console.log('✅ تم تحديث المرحلة بنجاح على الخادم')
      setTowerFormData(prev => ({ ...prev, definitionStage: targetStage }))
      showSuccess(`تم تحديث مرحلة التعريف إلى ${targetStage}`, 'تحديث المرحلة')
    } catch (err) {
      console.error('خطأ في تحديث definitionStage:', err)
      showError('تعذر تحديث مرحلة التعريف', 'خطأ')
    }
  }

  // دوال خاصة بكل خطوة لرفع المرحلة
  const handleStep1Complete = async () => {
    setStep1Completed(true)
    // لم نرفع المرحلة هنا؛ سيتم رفعها فقط بعد نجاح API في Step1 (onStageAdvance)
  }

  const handleStep2Complete = async () => {
    setStep2Completed(true)
    // الترقية تتم بعد نجاح إنشاء البلوكات من خلال onStageAdvance
  }

  const handleStep3Complete = async () => {
    setStep3Completed(true)
    await updateTowerDefinitionStage(4)
  }

  const handleStep4Complete = async () => {
    setStep4Completed(true)
    // المرحلة الرابعة (لا عمليات DB جديدة) عند إكمالها تصبح 5
    await updateTowerDefinitionStage(5)
  }

  const handleLocationSelect = (lat: string, lng: string, address: string) => {
    setTowerFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address || prev.address
    }))
  }

  const handleUnitClick = (unitId: string) => {
    setVisuallySelectedUnits(prev => {
      const newSet = new Set(prev)
      if (newSet.has(unitId)) {
        newSet.delete(unitId)
      } else {
        newSet.add(unitId)
      }
      return newSet
    })
  }

//   const clearVisualSelection = () => {
//     setVisuallySelectedUnits(new Set())
//   }

  const handleFloorClick = (floorId: string, blockId: string) => {
    setSelectedFloor(prev => (prev && prev.floorId === floorId && prev.blockId === blockId ? prev : { floorId, blockId }))
    if (currentStep === 3) {
      const blk = createdBlocks.find(b => `block-${b.name}` === blockId)
      if (!blk) return
      const floorNumber = parseInt(floorId.split('-').pop() || '0', 10)
      if (!floorNumber) return
      // Throttle بسيط لمنع تجمد عند نقر متتابع سريع
  interface FloorClickWindow extends Window { __FLOOR_CLICK_BUSY__?: boolean }
  const w = window as FloorClickWindow
  if (w.__FLOOR_CLICK_BUSY__) return
  w.__FLOOR_CLICK_BUSY__ = true
  setTimeout(() => { w.__FLOOR_CLICK_BUSY__ = false }, 40)
      setSelectedVisualizationFloors(prev => {
        const next = { ...prev }
        const setForBlock = new Set(next[blk.name] || [])
        if (setForBlock.has(floorNumber)) setForBlock.delete(floorNumber); else setForBlock.add(floorNumber)
        next[blk.name] = setForBlock
        queueMicrotask(() => {
          const sortedFloors = Array.from(setForBlock).sort((a, b) => a - b)
          visualizationSelectionHandler?.(sortedFloors, blk.name)
        })
        return next
      })
    }
    
    // في المرحلة 4 - إضافة الطابق لقائمة الطوابق المختارة
    if (currentStep === 4) {
      const block = createdBlocks.find(b => `block-${b.name}` === blockId)
      if (block) {
        // استخراج رقم الطابق من floorId مثل "floor-A-1"
        const floorIdParts = floorId.split('-')
        const floorNumber = parseInt(floorIdParts[floorIdParts.length - 1])
        // يمكن إضافة منطق إضافي للمرحلة 4 هنا إذا لزم الأمر
        showInfo(`تم النقر على الطابق ${floorNumber} من البلوك ${block.name}`, 'معلومات الطابق')
      }
    }
  }

  // Load persisted floors + units into buildingData for visualization when entering step 5
  useEffect(() => {
    const loadUnitsForVisualization = async () => {
      if (!createdTowerId) return
      if (!createdBlocks.length) return
      // If we already have units present, skip
      const hasAnyUnits = buildingData.blocks.some(b => b.floors.some(f => f.units && f.units.length > 0))
      if (hasAnyUnits) return
      try {
        const blockIdMap = new Map<string, number>()
        createdBlocks.forEach(b => blockIdMap.set(b.name, b.id))
        const newBlocks = [...buildingData.blocks]
        // Ensure blocks exist in buildingData
        createdBlocks.forEach(b => {
          if (!newBlocks.find(nb => nb.name === b.name)) {
            newBlocks.push({ id: `block-${b.name}`, name: b.name, floors: [] })
          }
        })
        interface FloorApi { id:number; floorNumber?:number; FloorNumber?:number; number?:number; floorCode?:string; floorType?:number }
        interface UnitApi { id:number; unitNumber?:string; unitCode?:string; type?:number; status?:number }
        for (const apiBlock of createdBlocks) {
          try {
            // get all floors for this towerBlock
            const floorsResp = await RealEstateAPI.blockFloor.getAll({ towerBlockId: apiBlock.id })
            let floorsData: FloorApi[] = []
            if (floorsResp?.data) {
              floorsData = Array.isArray(floorsResp.data) ? floorsResp.data as FloorApi[] : Array.isArray(floorsResp.data.data) ? floorsResp.data.data as FloorApi[] : []
            }
            for (const floor of floorsData) {
              const floorNumber = floor.floorNumber || floor.FloorNumber || floor.number || 0
              const floorId = `floor-${apiBlock.name}-${floorNumber}`
              // fetch units for this floor
              try {
                const unitsResp = await RealEstateAPI.unit.getAllAdvanced({ blockFloorId: floor.id })
                let unitsData: UnitApi[] = []
                if (unitsResp?.data) {
                  unitsData = Array.isArray(unitsResp.data) ? unitsResp.data as UnitApi[] : Array.isArray(unitsResp.data.data) ? unitsResp.data.data as UnitApi[] : []
                }
                console.log(`🔍 Floor ${floor.id} (${floor.floorCode || 'N/A'}) - Type: ${floor.floorType} - Units loaded:`, unitsData.length, unitsData.map(u => ({ id: u.id, unitNumber: u.unitNumber, unitCode: u.unitCode })))
                const visualUnits = unitsData.map(u => ({
                  id: `unit-${apiBlock.name}-${floorNumber}-${u.unitNumber || u.unitCode || u.id}`,
                  number: String(u.unitNumber || u.unitCode || u.id),
                  code: u.unitCode || u.unitNumber,
                  fullCode: u.unitCode || u.unitNumber,
                  //  code: 'code',
                  // fullCode: 'fullCode',
                  type: String(u.type || ''),
                  status: String(u.status || ''),
                  isDefined: true
                }))
                console.log(`✅ Visual units created for floor ${floor.floorCode}:`, visualUnits)
                const blockRef = newBlocks.find(b => b.name === apiBlock.name)!
                const existingFloor = blockRef.floors.find(f => f.id === floorId)
                if (existingFloor) {
                  existingFloor.units = visualUnits
                  existingFloor.floorCode = floor.floorCode
                  existingFloor.floorType = floor.floorType
                  console.log(`🔄 Updated existing floor ${floorId} with ${visualUnits.length} units`)
                } else {
                  blockRef.floors.push({
                    id: floorId,
                    number: String(floorNumber),
                    units: visualUnits,
                    floorCode: floor.floorCode,
                    floorType: floor.floorType,
                    isDefined: true
                  })
                  console.log(`➕ Added new floor ${floorId} with ${visualUnits.length} units`)
                }
              } catch (e) {
                console.error('Error loading units for visualization floor', floor.id, e)
              }
            }
          } catch (e) {
            console.error('Error loading floors for block visualization', apiBlock.id, e)
          }
        }
        // sort floors numerically
        newBlocks.forEach(b => b.floors.sort((a, b2) => parseInt(a.number) - parseInt(b2.number)))
        console.log('🎨 Final buildingData blocks before setBuildingData:', newBlocks.map(b => ({
          name: b.name,
          floors: b.floors.map(f => ({
            number: f.number,
            floorCode: f.floorCode,
            floorType: f.floorType,
            unitsCount: f.units?.length || 0,
            units: f.units?.map(u => u.number)
          }))
        })))
        setBuildingData(prev => ({ ...prev, blocks: newBlocks }))
      } catch (err) {
        console.error('Failed to load visualization units for step 5', err)
      }
    }
    if (currentStep === 5) {
      loadUnitsForVisualization()
    }
  }, [currentStep, createdTowerId, createdBlocks, buildingData.blocks])

  // دوال المراحل

  const handleSaveFloorDefinitions = () => {
  if (debug) console.log('💾 Saving floor definitions (merge mode). Current buildingData:', buildingData)
    // دمج الطوابق الجديدة مع الموجودة بدلاً من الاستبدال الكامل
    setBuildingData(prev => {
      const existingBlocks = prev.blocks || []
      const updatedBlocks = [...existingBlocks]

      createdBlocks.forEach(block => {
        const blockId = `block-${block.name}`
        const existingBlockIndex = updatedBlocks.findIndex(b => b.id === blockId || b.name === block.name)

        // الطوابق الجديدة لهذا البلوك من floorDefinitions
        const newFloorsForBlock = Object.keys(floorDefinitions)
          .filter(key => key.startsWith(`${block.name}-floor-`))
          .map(key => {
            const floorNumber = key.split('-floor-')[1]
            return {
              id: `floor-${block.name}-${floorNumber}`,
              number: floorNumber,
              units: [],
              isSelectable: true,
              isDefined: true,
              isVisualizationMode: true
            }
          })

        if (existingBlockIndex >= 0) {
          const existingBlock = updatedBlocks[existingBlockIndex]
            const mergedFloors = [...(existingBlock.floors || [])]
            newFloorsForBlock.forEach(newFloor => {
              if (!mergedFloors.some(f => f.id === newFloor.id)) {
                mergedFloors.push(newFloor)
              }
            })
            updatedBlocks[existingBlockIndex] = {
              ...existingBlock,
              floors: mergedFloors.sort((a, b) => parseInt(a.number) - parseInt(b.number))
            }
        } else {
          updatedBlocks.push({
            id: blockId,
            name: block.name,
            floors: newFloorsForBlock.sort((a, b) => parseInt(a.number) - parseInt(b.number))
          })
        }
      })

  if (debug) console.log('✅ Updated buildingData after merge floors:', updatedBlocks)
      return { ...prev, blocks: updatedBlocks }
    })
    
    setStep3Completed(true)
    setCurrentStep(4)
  }

  // مزامنة فورية للرسمة في المرحلة 3 مع الحفاظ على كل الطوابق (لا نخفي غير المختارة)
  useEffect(() => {
    if (currentStep !== 3) return
    if (!createdBlocks.length) return

    setBuildingData(prev => {
      const updatedBlocks = createdBlocks.map(block => {
        const blockId = `block-${block.name}`
        const existingBlock = prev.blocks.find(b => b.id === blockId || b.name === block.name)
        const existingFloors = existingBlock?.floors || []
        // جمع العدد من عدة مصادر
        let maxFloors = blockFloorsCount[block.originalName] || existingFloors.length || 0
        if (!maxFloors) {
          // استخرج أرقام الطوابق من مفاتيح floorDefinitions
            const defNumbers = Object.keys(floorDefinitions)
              .filter(k => k.startsWith(block.name + '-floor-'))
              .map(k => parseInt(k.split('-floor-')[1] || '0', 10))
              .filter(n => !isNaN(n))
          if (defNumbers.length) {
            maxFloors = Math.max(...defNumbers)
          }
        }
        if (!maxFloors) {
          // لا تُنشئ بلوك خالي (لتفادي توقيع ثابت يمنع تحديث لاحق)
          return {
            id: blockId,
            name: block.name,
            floors: existingFloors
          }
        }
        const fullFloors = Array.from({ length: maxFloors }, (_, i) => {
          const floorNumber = (i + 1).toString()
          const floorId = `floor-${block.name}-${floorNumber}`
          const existing = existingFloors.find(f => f.id === floorId) || { id: floorId, number: floorNumber, units: [] }
          // لا نحقن حالة التعريف داخل buildingData لتقليل إعادة البناء، سنستخدم floorDefinitions مباشرة في الرسم
          return {
            ...existing,
            id: floorId,
            number: floorNumber,
            units: existing.units || [],
            isSelectable: true,
            isVisualizationMode: true
          }
        })
        return {
          id: blockId,
          name: block.name,
          floors: fullFloors.sort((a, b) => parseInt(a.number) - parseInt(b.number))
        }
      })

      // توقيع مبني فقط على عدد الطوابق وترتيب المعرفات (بدون حالة التعريف) لتجنب تحديثات لا لزوم لها عند اختيار/إزالة تعريف طابق
      const sig = updatedBlocks
        .map(b => `${b.name}:${b.floors.map(f => f.id).join(',')}`)
        .sort()
        .join('|')

      const allFloorsCount = updatedBlocks.reduce((s,b)=>s+(b.floors?.length||0),0)
      if (lastStep3BlocksSigRef.current === sig && allFloorsCount > 0) {
        return prev
      }
      lastStep3BlocksSigRef.current = sig
      const result = { ...prev, blocks: updatedBlocks }
      if (debug) {
        ;(window as unknown as { __LAST_BUILDING_DATA__?: BuildingData }).__LAST_BUILDING_DATA__ = result
        console.log('🛠️ Sync floors (step 3) updated (floors total='+allFloorsCount+')')
      }
      return result
    })
  }, [floorDefinitions, currentStep, createdBlocks, blockFloorsCount, debug])
  
  // تقليل تحذيرات التجمّد: منع تحديث buildingData أثناء سحب المسرح
  useEffect(() => {
    const globalWin = window as unknown as { __KONVA_STAGE__?: { on:(e:string,cb:()=>void)=>void; off:(e:string)=>void } }
    const st = globalWin.__KONVA_STAGE__
    if (st) {
      st.on('dragstart', () => {/* reserved hook */})
      st.on('dragend', () => {/* reserved hook */})
    }
    return () => { if (st) { st.off('dragstart'); st.off('dragend') } }
  }, [])

  const handleCreateFloors = () => {
    console.log('✅ تم إنشاء الطوابق - تحديث ملخص البرج')
    // لا حاجة لتحديث buildingData هنا لأنه تم تحديثه في Step3
    setStep4Completed(true)
  }

  // const handleAddUnits = async (selectedUnits: string[], selectedBlocks: string[], selectedFloors: string[]) => {
  //   if (!createdTowerId) {
  //     showError('لم يتم العثور على ID البرج', 'خطأ')
  //     return
  //   }

  //   setIsSubmitting(true)
  //   try {
  //     // 1) تحقق من المدخلات الأساسية
  //     if (!selectedUnits?.length) { showError('يرجى اختيار أرقام الوحدات أولاً', 'تنبيه'); return }
  //     if (!selectedBlocks?.length) { showError('يرجى اختيار بلوك واحد على الأقل', 'تنبيه'); return }
  //     if (!selectedFloors?.length) { showError('يرجى اختيار طابق واحد على الأقل', 'تنبيه'); return }
  //     if (!createdBlocks?.length) { showError('لا توجد بلوكات منشأة (الخطوة 2)', 'خطأ'); return }
  //     if (!createdBlockFloors?.length) { showError('لا توجد طوابق منشأة (الخطوة 3)', 'خطأ'); return }

  //     // 2) تجهيز خرائط سريعة للوصول
  //     const blocksByName = new Map<string, { id: number; name: string; originalName: string }>()
  //     createdBlocks.forEach(b => {
  //       blocksByName.set(b.name, b)
  //       if (b.originalName) blocksByName.set(b.originalName, b)
  //     })

  //     // مفتاح الدمج: blockName|floorNumber (مقارن بالأرقام لتفادي مشكلة الصفر في اليسار)
  //     const normalizeFloor = (f: string) => parseInt(f, 10)
  //     const floorMap = new Map<string, { id: number; blockName: string; floorNumber: string; towerBlockId: number }>()
  //     createdBlockFloors.forEach(f => {
  //       const key = `${f.blockName}|${normalizeFloor(f.floorNumber)}`
  //       floorMap.set(key, f)
  //     })

  //     // 3) بناء قائمة الوحدات (التجميع المباشر دون سجلات مطولة)
  // const unitsToCreate: UnitDto[] = []
  //     const missingCombos: string[] = []

  //     for (const blockName of selectedBlocks) {
  //       const block = blocksByName.get(blockName)
  //       if (!block) { missingCombos.push(`بلوك غير معروف: ${blockName}`); continue }

  //       for (const floor of selectedFloors) {
  //         const floorEntry = floorMap.get(`${block.name}|${normalizeFloor(floor)}`) ||
  //                            floorMap.get(`${block.originalName}|${normalizeFloor(floor)}`)
  //         if (!floorEntry) { missingCombos.push(`(${block.name}) الطابق ${floor}`); continue }

  //           for (const unitNumber of selectedUnits) {
  //             unitsToCreate.push({
  //               unitNumber: unitNumber,
  //               floorNumber: normalizeFloor(floorEntry.floorNumber) || 1,
  //               TowerId: createdTowerId,
  //               BlockId: block.id,            // استخدام معرف البلوك مباشرة
  //               blockFloorId: floorEntry.id,   // معرف الطابق الحقيقي
  //               type: UnitType.Residential,
  //               status: UnitStatus.Available,
  //               isActive: true
  //             })
  //           }
  //       }
  //     }

  //     if (!unitsToCreate.length) {
  //       showError('لم يتم توليد أي وحدات (تحقق من توافق البلوك والطابق)', 'لا توجد بيانات')
  //       return
  //     }

  //     if (missingCombos.length) {
  //       // تحذير فقط - سنواصل إنشاء ما أمكن
  //       showWarning(`تعذر إيجاد بعض التركيبات: ${missingCombos.slice(0,5).join(' | ')}`, 'تحذير')
  //     }

  //     // 4) استدعاء API مباشرة
  //     const requestPayload = { units: unitsToCreate, lang: 'ar' }
  // await RealEstateAPI.unit.createMultiple(requestPayload, 'ar')

  //     // 5) تحديث العرض المحلي (buildingData)
  //     setBuildingData(prev => {
  //       const blockGroups: Record<string, { floors: Record<number, { units: { id: string; number: string }[] }> }> = {}
  //       unitsToCreate.forEach(u => {
  //         const b = createdBlocks.find(cb => cb.id === u.BlockId)
  //         const blockLabel = b?.name || 'Block'
  //         if (!blockGroups[blockLabel]) blockGroups[blockLabel] = { floors: {} }
  //         if (!blockGroups[blockLabel].floors[u.floorNumber]) blockGroups[blockLabel].floors[u.floorNumber] = { units: [] }
  //         blockGroups[blockLabel].floors[u.floorNumber].units.push({ id: `unit-${blockLabel}-${u.floorNumber}-${u.unitNumber}` , number: u.unitNumber })
  //       })

  //       const updatedBlocks = Object.entries(blockGroups).map(([blockLabel, data]) => ({
  //         id: `block-${blockLabel}`,
  //         name: blockLabel,
  //         floors: Object.entries(data.floors).map(([fn, fData]) => ({
  //           id: `floor-${blockLabel}-${fn}`,
  //           number: fn,
  //           units: fData.units
  //         }))
  //       }))

  //       return {
  //         ...prev,
  //           name: prev.name || towerFormData.arabicName || 'البرج الجديد',
  //           blocks: updatedBlocks
  //       }
  //     })

  //     setStep5Completed(true)
  //     showSuccess(`تم إنشاء ${unitsToCreate.length} وحدة بنجاح`, 'نجاح')
      
  //   } catch (error) {
  //     console.error('❌ خطأ في إنشاء الوحدات:', error)
  //     let errorMessage = 'فشل في إنشاء الوحدات السكنية'
      
  //     if (error instanceof Error) {
  //       errorMessage = `خطأ: ${error.message}`
  //     } else if (typeof error === 'object' && error && 'response' in error) {
  //       const axiosError = error as { response?: { data?: { message?: string } } }
  //       if (axiosError.response?.data?.message) {
  //         errorMessage = axiosError.response.data.message
  //       }
  //     }
      
  //     showError(errorMessage, 'خطأ في إنشاء الوحدات')
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  // Handle assign design to units
  const handleAssignDesign = async (assignmentData: { unitIds: number[]; unitDesignId: number }) => {
    try {
      setIsSubmitting(true)
      await RealEstateAPI.unit.assignDesign(assignmentData)
      showSuccess('تم تعيين التصميم بنجاح', 'نجاح العملية')
      // لا تغلق الخطوة تلقائياً - دع المستخدم يكمل تعيين باقي الشقق
      // setStep5Completed(true)
    } catch (error) {
      console.error('Error assigning design:', error)
      showError('حدث خطأ في تعيين التصميم', 'خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

//   const handleCompleteBuilding = () => {
//     showSuccess('تم إنشاء البرج بنجاح!', 'مبروك!')
//   }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5)
    }
  }

  // Building Visualization Component
  const SimpleBuildingVisualization = () => {
    if (view3D) {
      return (
        <ThreeDVisualization 
          buildingData={buildingData} 
          currentStep={currentStep} 
          onUnitClick={handleUnitClick}
          selectedUnits={visuallySelectedUnits}
        />
      )
    }
    
    return (
      <RealisticBuildingVisualization 
        buildingData={buildingData} 
        currentStep={currentStep}
        onUnitClick={handleUnitClick}
        onFloorClick={handleFloorClick}
        selectedUnits={visuallySelectedUnits}
        selectedFloor={selectedFloor}
        floorDefinitions={floorDefinitions}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            {t('builder_title')}
          </h1>
          <p className="text-gray-600 text-center">
            {t('builder_subtitle')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {[1, 2, 3, 5].map((step, index) => {
              const isCompleted = 
                (step === 1 && step1Completed) ||
                (step === 2 && step2Completed) ||
                (step === 3 && step3Completed) ||
                (step === 4 && step4Completed) ||
                (step === 5 && step5Completed)
              
              const isCurrent = step === currentStep
              const isAccessible = step <= currentStep || isCompleted
              
              // Display step 5 as step 4
              const displayStep = step === 5 ? 4 : step
              
              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer relative ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : isAccessible
                        ? 'bg-blue-400 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                    onClick={() => {
                      if (isAccessible && (step <= currentStep || isCompleted)) {
                        setCurrentStep(step as 1 | 2 | 3 | 4 | 5)
                      }
                    }}
                  >
                    {isCompleted ? '✓' : displayStep}
                    {isCurrent && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all ${
                        isCompleted || (step < currentStep && (
                          (step === 1 && step1Completed) ||
                          (step === 2 && step2Completed) ||
                          (step === 3 && step3Completed) ||
                          (step === 4 && step4Completed)
                        ))
                          ? 'bg-green-500'
                          : step < currentStep
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Status Legend */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-6 rtl:space-x-reverse text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
              <span className="text-gray-600">{t('builder_step_completed')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-gray-600">{t('builder_step_current')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
              <span className="text-gray-600">{t('builder_step_upcoming')}</span>
            </div>
          </div>
        </div>

        {/* Status Information and Reset Button */}
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {step1Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">{t('builder_tower_created')}</span>
              </div>
            )}
            {step2Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">{t('builder_blocks_created')}</span>
              </div>
            )}
            {step3Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">{t('builder_floors_defined')}</span>
              </div>
            )}
            {step4Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">{t('builder_floors_created')}</span>
              </div>
            )}
            {step5Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">{t('builder_units_created')}</span>
              </div>
            )}
          </div>
          
          {/* Reset Button */}
          <Button 
            onClick={() => {
              setTowerFormData({
                arabicName: '',
                englishName: '',
                arabicDescription: '',
                englishDescription: '',
                address: '',
                latitude: '',
                longitude: '',
                constructionYear: '',
                mainImageUrl: '',
                countryId: 0,
                cityId: 0,
                areaId: 0,
                isActive: true,
                developerName: '',
                managementCompany: '',
                definitionStage: 1
              })
              setBuildingData({ name: '', blocks: [] })
              setSelectedBlocks([])
              setCreatedTowerId(null)
              setCreatedBlocks([])
              setCreatedBlockFloors([])
              setCurrentStep(1)
              setBlockFloorsCount({})
              setFloorDefinitions({})
              setStep1Completed(false)
              setStep2Completed(false)
              setStep3Completed(false)
              setStep4Completed(false)
              setStep5Completed(false)
              showInfo('تم إعادة تعيين النظام', 'إعادة تعيين')
            }}
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('builder_reset')}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
          {/* Left Panel: Form */}
          <div className={currentStep === 1 || currentStep===3 ? "xl:col-span-5 space-y-6" : "xl:col-span-2 space-y-6"}>
            {/* Step Components */}
            {/* شريط التقدم */}
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div className="h-2 bg-green-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="text-xs text-gray-600">{t('builder_progress_label')}: {Math.round(progressPercent)}% ({t('builder_current_stage')}: {towerFormData.definitionStage})</div>

            {currentStep === 1 && (
              <Step1TowerCreation
                isCompleted={step1Completed}
                onComplete={handleStep1Complete}
                onNext={guardedGoToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                formData={towerFormData}
                onFormChange={handleFormChange}
                onLocationSelect={handleLocationSelect}
                countries={countries || []}
                cities={cities || []}
                areas={areas || []}
                selectedCountry={selectedCountry}
                selectedCity={selectedCity}
                setSelectedCountry={setSelectedCountry}
                setSelectedCity={setSelectedCity}
                setCreatedTowerId={setCreatedTowerId}
                setBuildingData={setBuildingData}
                onStageAdvance={async (nextStage, newTowerId) => {
                  if (newTowerId) setCreatedTowerId(newTowerId)
                  // استخدم towerId مباشرة لتفادي مشكلة التزامن مع setState
                  await updateTowerDefinitionStage(nextStage, newTowerId)
                  setCurrentStep(2)
                }}
              />
            )}

            {currentStep === 2 && (
              <Step2BlocksCreation
                isCompleted={step2Completed}
                onComplete={handleStep2Complete}
                onNext={guardedGoToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                selectedBlocks={selectedBlocks}
                setSelectedBlocks={setSelectedBlocks}
                blockFloorsCount={blockFloorsCount}
                setBlockFloorsCount={setBlockFloorsCount}
                createdTowerId={createdTowerId}
                setCreatedBlocks={setCreatedBlocks}
                createdBlocks={createdBlocks}
                setBuildingData={setBuildingData}
                onStageAdvance={async (nextStage) => {
                  await updateTowerDefinitionStage(nextStage, createdTowerId || undefined)
                  setCurrentStep(3)
                }}
              />
            )}

            {currentStep === 3 && (
              <Step3FloorDefinitions
                isCompleted={step3Completed}
                onComplete={handleStep3Complete}
                onNext={guardedGoToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                createdBlocks={createdBlocks}
                blockFloorsCount={blockFloorsCount}
                floorDefinitions={floorDefinitions}
                setFloorDefinitions={setFloorDefinitions}
                onSaveDefinitions={handleSaveFloorDefinitions}
                createdTowerId={createdTowerId}
                setBuildingData={setBuildingData}
                setCreatedBlockFloors={setCreatedBlockFloors}
                // تسجيل callback اختيار الطوابق من الرسمة
                onVisualizationFloorSelection={(handler) => setVisualizationSelectionHandler(() => handler)}
                onAllFloorsPersisted={async () => {
                  // ضبط اكتمال المرحلة 3 ثم القفز مباشرة إلى 5 وتحديث stage إلى 5
                  setStep3Completed(true)
                  await updateTowerDefinitionStage(5, createdTowerId || undefined)
                  setCurrentStep(5)
                }}
              />
            )}

            {currentStep === 4 && (
              <Step4FloorCreation
                isCompleted={step4Completed}
                onComplete={handleStep4Complete}
                onNext={guardedGoToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                floorDefinitions={floorDefinitions}
                onCreateFloors={handleCreateFloors}
                setBuildingData={setBuildingData}
              />
            )}

            {currentStep === 5 && (
              <Step5UnitsDefinition
                isCompleted={step5Completed}
                onPrevious={goToPreviousStep}
                onComplete={() => setStep5Completed(true)}
                buildingData={buildingData}
                towerId={createdTowerId || 0}
                onAssignDesign={handleAssignDesign}
                visualSelection={visuallySelectedUnits}
                onClearVisualSelection={() => setVisuallySelectedUnits(new Set())}
              />
            )}

            {/* Building Summary */}
            {currentStep > 1 && (
              <Card className="p-6 bg-blue-50">
                <h4 className="text-lg font-semibold mb-3 text-blue-900">ملخص البرج</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>اسم البرج:</strong> {buildingData.name || towerFormData.arabicName || 'غير محدد'}</p>
                  {towerFormData.developerName && (
                    <p><strong>المطور:</strong> {towerFormData.developerName}</p>
                  )}
                  {towerFormData.managementCompany && (
                    <p><strong>شركة الإدارة:</strong> {towerFormData.managementCompany}</p>
                  )}
                  <p><strong>عدد البلوكات:</strong> {buildingData.blocks.length}</p>
                  <p><strong>إجمالي الطوابق:</strong> {buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)}</p>
                  <p><strong>إجمالي الشقق:</strong> {buildingData.blocks.reduce((total, block) => 
                    total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
                  )}</p>
                  {visuallySelectedUnits.size > 0 && (
                    <p><strong>الشقق المختارة بصرياً:</strong> {visuallySelectedUnits.size}</p>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel: Visualization */}
          <div className={currentStep === 1 || currentStep===3 ? "xl:col-span-2 xl:sticky xl:top-4" : "xl:col-span-5 xl:sticky xl:top-4"}>
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{t('builder_visual_preview')}</h4>
                <div className="flex gap-2">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setView3D(false)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        !view3D 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      2D
                    </button>
                    <button
                      onClick={() => setView3D(true)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        view3D 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      3D
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFullScreenVisualization(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                    title={t('builder_full_screen')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {t('builder_full_screen')}
                  </button>
                </div>
              </div>
              <div 
                style={{height: '650px', overflow: 'auto', direction: 'ltr'}} 
                className="rounded-lg border border-gray-200 relative group cursor-grab"
              >
                <SimpleBuildingVisualization />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('builder_drag_to_pan')}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Full Screen Visualization Modal */}
        {showFullScreenVisualization && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t('builder_full_visualization_title')} - {buildingData.name || t('builder_title')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('builder_full_visualization_desc')}
                  </p>
                </div>
                <button
                  onClick={() => setShowFullScreenVisualization(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title={t('close')}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 p-4 overflow-auto">
                <div className="w-full h-full min-h-[600px]">
                  <SimpleBuildingVisualization />
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    💡 {t('builder_zoom_hint')}
                  </div>
                  <button
                    onClick={() => setShowFullScreenVisualization(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('builder_close_full_button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuildingBuilderPage