import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import RealisticBuildingVisualization from '../components/building/RealisticBuildingVisualization'
import ThreeDVisualization from '../components/building/ThreeDVisualization'

// Types for building data
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

// Simple multi-select component
interface MultiSelectProps {
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder: string
  allowCustom?: boolean
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selectedValues, 
  onChange, 
  placeholder,
  allowCustom = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [newValue, setNewValue] = useState('')

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const addCustomValue = () => {
    if (newValue.trim() && !selectedValues.includes(newValue.trim()) && !options.includes(newValue.trim())) {
      onChange([...selectedValues, newValue.trim()])
      setNewValue('')
    }
  }

  return (
    <div className="relative">
      <div
        className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex flex-wrap items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.map((value) => (
          <span
            key={value}
            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            {value}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange(selectedValues.filter(v => v !== value))
              }}
              className="mr-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
        {selectedValues.length === 0 && (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {allowCustom && (
            <div className="p-2 border-b">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="إضافة قيمة جديدة..."
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={addCustomValue}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  إضافة
                </button>
              </div>
            </div>
          )}
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                selectedValues.includes(option) ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {selectedValues.includes(option) && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Initial options
const initialFloorOptions = ['B2', 'B1', 'G', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
const initialUnitOptions = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'))
const initialBlockOptions = ['A', 'B', 'C']

const BuildingBuilderPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showFullScreenVisualization, setShowFullScreenVisualization] = useState(false)
  const [view3D, setView3D] = useState(false)
  const [buildingData, setBuildingData] = useState<BuildingData>({
    name: '',
    blocks: []
  })

  // Step 1: Building Name
  const [buildingName, setBuildingName] = useState('')

  // Step 2: Blocks
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])

  // Step 3: Floors
  const [selectedFloors, setSelectedFloors] = useState<string[]>([])
  const [selectedBlocksForFloors, setSelectedBlocksForFloors] = useState<string[]>([])

  // Step 4: Units
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [selectedFloorsForUnits, setSelectedFloorsForUnits] = useState<string[]>([])
  const [selectedBlocksForUnits, setSelectedBlocksForUnits] = useState<string[]>([])

  // Handle Step 1: Save building name
  const handleSaveBuildingName = () => {
    if (buildingName.trim()) {
      setBuildingData(prev => ({ ...prev, name: buildingName.trim() }))
      setCurrentStep(2)
    }
  }

  // Handle Step 2: Save blocks
  const handleSaveBlocks = () => {
    if (selectedBlocks.length > 0) {
      const newBlocks: Block[] = selectedBlocks.map(blockName => ({
        id: `block-${blockName}`,
        name: blockName,
        floors: []
      }))
      setBuildingData(prev => ({ ...prev, blocks: newBlocks }))
      setCurrentStep(3)
    }
  }

  // Handle Step 3: Add floors to blocks
  const handleAddFloors = () => {
    if (selectedFloors.length > 0 && selectedBlocksForFloors.length > 0) {
      setBuildingData(prev => ({
        ...prev,
        blocks: prev.blocks.map(block => {
          if (selectedBlocksForFloors.includes(block.name)) {
            const newFloors: Floor[] = selectedFloors.map(floorNum => ({
              id: `floor-${block.name}-${floorNum}`,
              number: floorNum,
              units: []
            }))
            // Merge with existing floors, avoiding duplicates
            const existingFloorNumbers = block.floors.map(f => f.number)
            const uniqueNewFloors = newFloors.filter(f => !existingFloorNumbers.includes(f.number))
            return { ...block, floors: [...block.floors, ...uniqueNewFloors] }
          }
          return block
        })
      }))
      setSelectedFloors([])
      setSelectedBlocksForFloors([])
    }
  }

  // Handle Step 4: Add units to floors
  const handleAddUnits = () => {
    if (selectedUnits.length > 0 && selectedFloorsForUnits.length > 0 && selectedBlocksForUnits.length > 0) {
      setBuildingData(prev => ({
        ...prev,
        blocks: prev.blocks.map(block => {
          if (selectedBlocksForUnits.includes(block.name)) {
            return {
              ...block,
              floors: block.floors.map(floor => {
                if (selectedFloorsForUnits.includes(floor.number)) {
                  const newUnits: Unit[] = selectedUnits.map(unitNum => ({
                    id: `unit-${block.name}-${floor.number}-${unitNum}`,
                    number: unitNum
                  }))
                  // Merge with existing units, avoiding duplicates
                  const existingUnitNumbers = floor.units.map(u => u.number)
                  const uniqueNewUnits = newUnits.filter(u => !existingUnitNumbers.includes(u.number))
                  return { ...floor, units: [...floor.units, ...uniqueNewUnits] }
                }
                return floor
              })
            }
          }
          return block
        })
      }))
      setSelectedUnits([])
      setSelectedFloorsForUnits([])
      setSelectedBlocksForUnits([])
    }
  }

  // Advanced Building Visualization Component
  const SimpleBuildingVisualization = () => {
    if (view3D) {
      return <ThreeDVisualization buildingData={buildingData} currentStep={currentStep} />;
    }
    
    return <RealisticBuildingVisualization buildingData={buildingData} currentStep={currentStep} />;
  };



  // Step navigation
  const goToNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // Complete building creation
  const handleCompleteBuilding = () => {
    console.log('Building data ready for API:', buildingData)
    // Here you would send the data to your API
    alert('تم إنشاء البرج بنجاح!')
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
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
          {/* Left Panel: Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Step 1: Building Name */}
            {currentStep === 1 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  المرحلة الأولى: اسم البرج
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      أدخل اسم البرج <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      placeholder="مثال: برج المدينة الأول"
                      dir="rtl"
                    />
                  </div>
                  <Button
                    onClick={handleSaveBuildingName}
                    disabled={!buildingName.trim()}
                    className="w-full"
                  >
                    حفظ والانتقال للمرحلة التالية
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Blocks */}
            {currentStep === 2 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  المرحلة الثانية: البلوكات
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر عدد أو أسماء البلوكات <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={initialBlockOptions}
                      selectedValues={selectedBlocks}
                      onChange={setSelectedBlocks}
                      placeholder="اختر أو أضف بلوكات..."
                      allowCustom={true}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      السابق
                    </Button>
                    <Button
                      onClick={handleSaveBlocks}
                      disabled={selectedBlocks.length === 0}
                      className="flex-1"
                    >
                      حفظ والانتقال للمرحلة التالية
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Floors */}
            {currentStep === 3 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  المرحلة الثالثة: الطوابق
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر أرقام الطوابق <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={initialFloorOptions}
                      selectedValues={selectedFloors}
                      onChange={setSelectedFloors}
                      placeholder="اختر أو أضف طوابق..."
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر البلوكات لتطبيق الطوابق عليها <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={buildingData.blocks.map(block => block.name)}
                      selectedValues={selectedBlocksForFloors}
                      onChange={setSelectedBlocksForFloors}
                      placeholder="اختر البلوكات..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      السابق
                    </Button>
                    <Button
                      onClick={handleAddFloors}
                      disabled={selectedFloors.length === 0 || selectedBlocksForFloors.length === 0}
                      className="flex-1"
                    >
                      إضافة الطوابق
                    </Button>
                    <Button onClick={goToNextStep} variant="outline" className="flex-1">
                      التالي
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 4: Units */}
            {currentStep === 4 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  المرحلة الرابعة: الشقق
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر أرقام الشقق <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={initialUnitOptions}
                      selectedValues={selectedUnits}
                      onChange={setSelectedUnits}
                      placeholder="اختر أو أضف شقق..."
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر البلوكات <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={buildingData.blocks.map(block => block.name)}
                      selectedValues={selectedBlocksForUnits}
                      onChange={(values) => {
                        setSelectedBlocksForUnits(values)
                        setSelectedFloorsForUnits([]) // Reset floors when blocks change
                      }}
                      placeholder="اختر البلوكات..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر الطوابق <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={(() => {
                        const floors = new Set<string>()
                        buildingData.blocks.forEach(block => {
                          if (selectedBlocksForUnits.includes(block.name)) {
                            block.floors.forEach(floor => floors.add(floor.number))
                          }
                        })
                        return Array.from(floors)
                      })()}
                      selectedValues={selectedFloorsForUnits}
                      onChange={setSelectedFloorsForUnits}
                      placeholder="اختر الطوابق..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      السابق
                    </Button>
                    <Button
                      onClick={handleAddUnits}
                      disabled={selectedUnits.length === 0 || selectedFloorsForUnits.length === 0 || selectedBlocksForUnits.length === 0}
                      className="flex-1"
                    >
                      إضافة الشقق
                    </Button>
                  </div>
                </div>

                {/* Complete Building Button */}
                {buildingData.blocks.some(block => 
                  block.floors.some(floor => floor.units.length > 0)
                ) && (
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      onClick={handleCompleteBuilding}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      🎉 إكمال إنشاء البرج
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Building Summary */}
            {currentStep > 1 && (
              <Card className="p-6 bg-blue-50">
                <h4 className="text-lg font-semibold mb-3 text-blue-900">ملخص البرج</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>اسم البرج:</strong> {buildingData.name || 'غير محدد'}</p>
                  <p><strong>عدد البلوكات:</strong> {buildingData.blocks.length}</p>
                  <p><strong>إجمالي الطوابق:</strong> {buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)}</p>
                  <p><strong>إجمالي الشقق:</strong> {buildingData.blocks.reduce((total, block) => 
                    total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
                  )}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel: Visualization */}
          <div className="xl:col-span-5 xl:sticky xl:top-4">
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
                {/* Scroll indicator */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  اسحب للتنقل
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Screen Visualization Modal */}
      {showFullScreenVisualization && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col">
            {/* Modal Header */}
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

            {/* Modal Content */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="w-full h-full min-h-[600px]">
                <SimpleBuildingVisualization />
              </div>
            </div>

            {/* Modal Footer */}
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
  )
}

export default BuildingBuilderPage