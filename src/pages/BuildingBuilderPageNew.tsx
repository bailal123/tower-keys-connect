import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'

// Import types
import type { 
  TowerFormData,
  BuildingData,
  FloorDefinition
} from '../components/building-builder/types'
import { FloorType } from '../types/api'
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
  const { language } = useLanguage()
  const { showSuccess, showError, showInfo } = useNotifications()

  // الحالات الأساسية
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view3D, setView3D] = useState(false)
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
  
  // متغيرات لتتبع إكمال كل خطوة
  const [step1Completed, setStep1Completed] = useState(false)
  const [step2Completed, setStep2Completed] = useState(false)
  const [step3Completed, setStep3Completed] = useState(false)
  const [step4Completed, setStep4Completed] = useState(false)
  const [step5Completed, setStep5Completed] = useState(false)

  // بيانات ثابتة
  const initialBlockOptions = ['البلوك A', 'البلوك B', 'البلوك C', 'البلوك D']


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

  const { data: availableBlocks } = useQuery({
    queryKey: ['blocks', language],
    queryFn: () => RealEstateAPI.block.getAll(true, language),
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
    // تحديد الطابق المختار
    setSelectedFloor({ floorId, blockId })
    
    // في المرحلة 3 - إضافة الطابق لتعريفات الطوابق
    if (currentStep === 3) {
      const block = createdBlocks.find(b => `block-${b.name}` === blockId)
      if (block) {
        // استخراج رقم الطابق من floorId مثل "floor-A-1"
        const floorIdParts = floorId.split('-')
        const floorNumber = parseInt(floorIdParts[floorIdParts.length - 1])
        const floorKey = `${block.name}-floor-${floorNumber}`
        
        const newDefinitions = { ...floorDefinitions }
        if (newDefinitions[floorKey]) {
          // إزالة الطابق إذا كان مختاراً مسبقاً
          delete newDefinitions[floorKey]
          showInfo(`تم إلغاء اختيار الطابق ${floorNumber} من البلوك ${block.name}`, 'تم الإلغاء')
        } else {
          // إضافة الطابق للتعريفات
          newDefinitions[floorKey] = {
            floorCode: `F${floorNumber}`,
            arabicName: `الطابق ${floorNumber}`,
            englishName: `Floor ${floorNumber}`,
            floorNumber: floorNumber,
            floorType: FloorType.Regular,
            selectedFromVisualization: true
          }
          showSuccess(`تم اختيار الطابق ${floorNumber} من البلوك ${block.name}`, 'تم الاختيار')
        }
        setFloorDefinitions(newDefinitions)
      }
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

  // دوال المراحل
  const handleSubmitTower = async () => {
    if (!towerFormData.arabicName.trim() || !towerFormData.englishName.trim()) {
      showError('يرجى إدخال اسم البرج بالعربية والإنجليزية', 'بيانات ناقصة')
      return
    }

    setIsSubmitting(true)
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockTowerId = Math.floor(Math.random() * 1000) + 1
      setCreatedTowerId(mockTowerId)
      setBuildingData(prev => ({ ...prev, name: towerFormData.arabicName }))
      setStep1Completed(true)
      showSuccess('تم إنشاء البرج بنجاح!', 'نجح الإنشاء')
    } catch (error) {
      console.error('Error creating tower:', error)
      showError('فشل في إنشاء البرج', 'خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateBlocks = async () => {
    if (selectedBlocks.length === 0) {
      showError('يرجى اختيار بلوك واحد على الأقل', 'لا توجد بلوكات')
      return
    }

    setIsSubmitting(true)
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockBlocks = selectedBlocks.map((blockName, index) => ({
        id: index + 1,
        name: String.fromCharCode(65 + index), // A, B, C, etc.
        originalName: blockName
      }))
      setCreatedBlocks(mockBlocks)
      
      // إضافة البلوكات إلى buildingData مع طوابق بدون وحدات (سيتم إضافة الوحدات في المرحلة 5)
      const newBlocks = mockBlocks.map(block => ({
        id: `block-${block.name}`,
        name: block.name,
        floors: Array.from({ length: blockFloorsCount[block.originalName] || 3 }, (_, floorIndex) => ({
          id: `floor-${block.name}-${floorIndex + 1}`,
          number: (floorIndex + 1).toString(),
          units: [] // لا وحدات في البداية
        }))
      }))
      
      setBuildingData(prev => ({ ...prev, blocks: newBlocks }))
      setStep2Completed(true)
      showSuccess(`تم إنشاء ${mockBlocks.length} بلوك بنجاح!`, 'نجح الإنشاء')
    } catch (error) {
      console.error('Error creating blocks:', error)
      showError('فشل في إنشاء البلوكات', 'خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveFloorDefinitions = () => {
    setStep3Completed(true)
    setCurrentStep(4)
  }

  const handleCreateFloors = () => {
    setStep4Completed(true)
  }

  const handleAddUnits = async () => {
    setIsSubmitting(true)
    try {
      // إضافة الوحدات للطوابق بناءً على floorDefinitions
      setBuildingData(prev => ({
        ...prev,
        blocks: prev.blocks.map(block => ({
          ...block,
          floors: block.floors.map(floor => {
            // البحث عن تعريف هذا الطابق في floorDefinitions
            const floorNumber = parseInt(floor.number)
            const floorKey = `${block.name}-floor-${floorNumber}`
            const floorDefinition = floorDefinitions[floorKey]
            
            if (floorDefinition) {
              // إضافة الوحدات بناءً على العدد المحدد في التعريف
              const unitsCount = floorDefinition.unitsCount || 0
              return {
                ...floor,
                units: Array.from({ length: unitsCount }, (_, unitIndex) => ({
                  id: `unit-${block.name}-${floorNumber}-${unitIndex + 1}`,
                  number: (unitIndex + 1).toString().padStart(2, '0')
                }))
              }
            }
            
            // إذا لم يكن الطابق معرفاً، لا تضيف وحدات
            return floor
          })
        }))
      }))
      
      // حساب إجمالي الوحدات المضافة
      const totalUnits = Object.values(floorDefinitions).reduce((total, def) => total + (def.unitsCount || 0), 0)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStep5Completed(true)
      showSuccess(`تم إضافة ${totalUnits} وحدة بنجاح!`, 'نجح الإنشاء')
    } catch (error) {
      console.error('Error creating units:', error)
      showError('فشل في إنشاء الشقق', 'خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }

//   const handleCompleteBuilding = () => {
//     showSuccess('تم إنشاء البرج بنجاح!', 'مبروك!')
//   }

  // Navigation functions
  const canGoToNextStep = () => {
    switch (currentStep) {
      case 1: return step1Completed
      case 2: return step2Completed
      case 3: return step3Completed
      case 4: return step4Completed
      case 5: return false
      default: return false
    }
  }

  const goToNextStep = () => {
    if (currentStep < 5 && canGoToNextStep()) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4 | 5)
    }
  }

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
            منشئ الأبراج التفاعلي
          </h1>
          <p className="text-gray-600 text-center">
            اتبع الخطوات لإنشاء برج جديد مع البلوكات والطوابق والشقق
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {[1, 2, 3, 4, 5].map((step) => {
              const isCompleted = 
                (step === 1 && step1Completed) ||
                (step === 2 && step2Completed) ||
                (step === 3 && step3Completed) ||
                (step === 4 && step4Completed) ||
                (step === 5 && step5Completed)
              
              const isCurrent = step === currentStep
              const isAccessible = step <= currentStep || isCompleted
              
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
                    {isCompleted ? '✓' : step}
                    {isCurrent && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {step < 5 && (
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
              <span className="text-gray-600">خطوة مكتملة</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-gray-600">خطوة حالية</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
              <span className="text-gray-600">خطوة قادمة</span>
            </div>
          </div>
        </div>

        {/* Status Information and Reset Button */}
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {step1Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">✓ البرج منشأ</span>
              </div>
            )}
            {step2Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">✓ البلوكات منشأة</span>
              </div>
            )}
            {step3Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">✓ تعريف الطوابق</span>
              </div>
            )}
            {step4Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">✓ الطوابق منشأة</span>
              </div>
            )}
            {step5Completed && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">✓ الشقق منشأة</span>
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
            إعادة تعيين
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
          {/* Left Panel: Form */}
          <div className={currentStep === 1 ? "xl:col-span-5 space-y-6" : "xl:col-span-2 space-y-6"}>
            {/* Step Components */}
            {currentStep === 1 && (
              <Step1TowerCreation
                isCompleted={step1Completed}
                onComplete={() => setStep1Completed(true)}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                formData={towerFormData}
                onFormChange={handleFormChange}
                onLocationSelect={handleLocationSelect}
                onSubmit={handleSubmitTower}
                countries={countries || []}
                cities={cities || []}
                areas={areas || []}
                selectedCountry={selectedCountry}
                selectedCity={selectedCity}
                setSelectedCountry={setSelectedCountry}
                setSelectedCity={setSelectedCity}
              />
            )}

            {currentStep === 2 && (
              <Step2BlocksCreation
                isCompleted={step2Completed}
                onComplete={() => setStep2Completed(true)}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                selectedBlocks={selectedBlocks}
                setSelectedBlocks={setSelectedBlocks}
                blockFloorsCount={blockFloorsCount}
                setBlockFloorsCount={setBlockFloorsCount}
                availableBlocks={availableBlocks || []}
                initialBlockOptions={initialBlockOptions}
                createdTowerId={createdTowerId}
                createdBlocks={createdBlocks}
                onCreateBlocks={handleCreateBlocks}
              />
            )}

            {currentStep === 3 && (
              <Step3FloorDefinitions
                isCompleted={step3Completed}
                onComplete={() => setStep3Completed(true)}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                createdBlocks={createdBlocks}
                blockFloorsCount={blockFloorsCount}
                floorDefinitions={floorDefinitions}
                setFloorDefinitions={setFloorDefinitions}
                onSaveDefinitions={handleSaveFloorDefinitions}
              />
            )}

            {currentStep === 4 && (
              <Step4FloorCreation
                isCompleted={step4Completed}
                onComplete={() => setStep4Completed(true)}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                floorDefinitions={floorDefinitions}
                onCreateFloors={handleCreateFloors}
              />
            )}

            {currentStep === 5 && (
              <Step5UnitsDefinition
                isCompleted={step5Completed}
                onComplete={() => setStep5Completed(true)}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                isSubmitting={isSubmitting}
                floorDefinitions={floorDefinitions}
                setFloorDefinitions={setFloorDefinitions}
                createdBlocks={createdBlocks}
                onAddUnits={handleAddUnits}
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
          <div className={currentStep === 1 ? "xl:col-span-2 xl:sticky xl:top-4" : "xl:col-span-5 xl:sticky xl:top-4"}>
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">المعاينة المرئية</h4>
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
                    title="عرض بحجم كامل"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    عرض كامل
                  </button>
                </div>
              </div>
              <div 
                style={{height: '600px', overflow: 'hidden'}} 
                className="rounded-lg border border-gray-200 relative group"
              >
                <SimpleBuildingVisualization />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  اسحب للتنقل
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
                    المعاينة الكاملة - {buildingData.name || 'البرج'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    عرض تفصيلي بحجم كامل للمبنى
                  </p>
                </div>
                <button
                  onClick={() => setShowFullScreenVisualization(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="إغلاق"
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
                    💡 يمكنك التكبير والتصغير باستخدام عجلة الماوس أو إيماءات اللمس
                  </div>
                  <button
                    onClick={() => setShowFullScreenVisualization(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إغلاق العرض الكامل
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