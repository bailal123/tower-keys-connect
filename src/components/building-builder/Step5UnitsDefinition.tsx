import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import type { StepProps, FloorDefinition, BuildingData } from './types'
import { useNotifications } from '../../hooks/useNotificationContext'

// MultiSelect component interface
interface MultiSelectProps {
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder: string
  allowCustom?: boolean
}

// MultiSelect component implementation
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
                  <span className="text-blue-600">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


interface Step5Props extends StepProps {
  floorDefinitions: Record<string, FloorDefinition>
  createdBlocks: { id: number; name: string; originalName: string }[]
  onAddUnits: (units: string[], blocks: string[], floors: string[]) => void
  setBuildingData: React.Dispatch<React.SetStateAction<BuildingData>>
}

const Step5UnitsDefinition: React.FC<Step5Props> = ({
  onPrevious,
  isSubmitting,
  floorDefinitions,
  createdBlocks,
  onAddUnits,
  setBuildingData
}) => {
  const { showWarning } = useNotifications()
  
  // Form state with MultiSelect format
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [selectedBlocksForUnits, setSelectedBlocksForUnits] = useState<string[]>([])
  const [selectedFloorsForUnits, setSelectedFloorsForUnits] = useState<string[]>([])
  useEffect(() => {
    console.log('created floors:', floorDefinitions)
  }, [floorDefinitions])
  // Initial unit options (01-25)
  const initialUnitOptions = Array.from({ length: 25 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  )

  // Get available floors from floor definitions
  const getAvailableFloors = () => {
    const floors = new Set<string>()
    Object.keys(floorDefinitions).forEach(floorKey => {
      const [, floorPart] = floorKey.split('-floor-')
      const floorNumber = parseInt(floorPart)
      floors.add(floorNumber.toString().padStart(2, '0'))
    })
    return Array.from(floors).sort()
  }

  const availableFloors = getAvailableFloors()

  // تحديث buildingData فورياً عند تغيير الاختيارات
  useEffect(() => {
    if (selectedUnits.length > 0 && selectedBlocksForUnits.length > 0 && selectedFloorsForUnits.length > 0) {
      setBuildingData(prev => {
        const updatedBlocks = prev.blocks.map(block => {
          // التحقق إذا كان هذا البلوك مختار
          if (selectedBlocksForUnits.includes(block.name)) {
            const updatedFloors = block.floors.map(floor => {
              // التحقق إذا كان هذا الطابق مختار
              if (selectedFloorsForUnits.includes(floor.number)) {
                // إضافة الوحدات المختارة لهذا الطابق
                const floorUnits = selectedUnits.map(unitNumber => ({
                  id: `unit-${block.name}-${floor.number}-${unitNumber}`,
                  number: unitNumber
                }))
                
                return {
                  ...floor,
                  units: floorUnits
                }
              }
              return floor
            })
            
            return {
              ...block,
              floors: updatedFloors
            }
          }
          return block
        })
        
        return {
          ...prev,
          blocks: updatedBlocks
        }
      })
    }
  }, [selectedUnits, selectedBlocksForUnits, selectedFloorsForUnits, setBuildingData])







  // Handle proceed to create units
  const handleProceed = () => {
    if (selectedUnits.length === 0) {
      showWarning('يرجى اختيار أرقام الشقق أولاً', 'تنبيه')
      return
    }

    if (selectedBlocksForUnits.length === 0) {
      showWarning('يرجى اختيار بلوك واحد على الأقل', 'تنبيه')
      return
    }

    if (selectedFloorsForUnits.length === 0) {
      showWarning('يرجى اختيار طابق واحد على الأقل', 'تنبيه')
      return
    }

    // تحديث buildingData بالوحدات المختارة قبل الإرسال
    setBuildingData(prev => {
      console.log('📊 تحديث buildingData قبل إنشاء الوحدات:', {
        selectedUnits,
        selectedBlocks: selectedBlocksForUnits,
        selectedFloors: selectedFloorsForUnits,
        totalUnits: totalUnitsToCreate
      })
      
      // تحديث blocks بالوحدات المختارة
      const updatedBlocks = prev.blocks.map(block => {
        // التحقق إذا كان هذا البلوك مختار
        if (selectedBlocksForUnits.includes(block.name)) {
          const updatedFloors = block.floors.map(floor => {
            // التحقق إذا كان هذا الطابق مختار
            if (selectedFloorsForUnits.includes(floor.number)) {
              // إضافة الوحدات المختارة لهذا الطابق
              const floorUnits = selectedUnits.map(unitNumber => ({
                id: `unit-${block.name}-${floor.number}-${unitNumber}`,
                number: unitNumber
              }))
              
              return {
                ...floor,
                units: floorUnits
              }
            }
            return floor
          })
          
          return {
            ...block,
            floors: updatedFloors
          }
        }
        return block
      })
      
      return {
        ...prev,
        blocks: updatedBlocks,
        metadata: {
          selectedUnitsCount: selectedUnits.length,
          selectedBlocksCount: selectedBlocksForUnits.length,
          selectedFloorsCount: selectedFloorsForUnits.length,
          totalUnitsToCreate,
          lastStep: 'units-creation'
        }
      }
    })

    // استدعاء دالة إنشاء الوحدات مع البيانات المختارة
    onAddUnits(selectedUnits, selectedBlocksForUnits, selectedFloorsForUnits)
  }

  // Calculate summary based on selections
  const totalUnitsToCreate = selectedUnits.length * selectedFloorsForUnits.length * selectedBlocksForUnits.length

  const canProceed = selectedUnits.length > 0 && selectedBlocksForUnits.length > 0 && selectedFloorsForUnits.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
          🏠 تحديد الوحدات للطوابق
        </div>
        <p className="text-gray-600">
          اختر أرقام الشقق والبلوكات والطوابق المطلوب إضافة الوحدات إليها، ثم اضغط زر الحفظ.
        </p>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>تنبيه:</strong> بعد اختيار جميع الخيارات المطلوبة، اضغط على زر "إنشاء الوحدات" لحفظ البيانات في قاعدة البيانات وإكمال تعريف البرج.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Units Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              1️⃣ اختر أرقام الشقق <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={initialUnitOptions}
              selectedValues={selectedUnits}
              onChange={setSelectedUnits}
              placeholder="اختر أو أضف شقق..."
              allowCustom={true}
            />
            {selectedUnits.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                تم اختيار {selectedUnits.length} شقة: {selectedUnits.join(', ')}
              </p>
            )}
          </div>

          {/* Blocks Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              2️⃣ اختر البلوكات <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={createdBlocks.map(block => block.name)}
              selectedValues={selectedBlocksForUnits}
              onChange={(values) => {
                setSelectedBlocksForUnits(values)
                setSelectedFloorsForUnits([]) // Reset floors when blocks change
              }}
              placeholder="اختر البلوكات..."
            />
            {selectedBlocksForUnits.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                تم اختيار {selectedBlocksForUnits.length} بلوك: {selectedBlocksForUnits.join(', ')}
              </p>
            )}
          </div>

          {/* Floors Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              3️⃣ اختر الطوابق <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={availableFloors}
              selectedValues={selectedFloorsForUnits}
              onChange={setSelectedFloorsForUnits}
              placeholder="اختر الطوابق..."
            />
            {selectedFloorsForUnits.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                تم اختيار {selectedFloorsForUnits.length} طابق: {selectedFloorsForUnits.join(', ')}
              </p>
            )}
          </div>

          {/* معاينة التطبيق التلقائي */}
          {selectedUnits.length > 0 && selectedBlocksForUnits.length > 0 && selectedFloorsForUnits.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <span className="text-lg">✅</span>
                <div>
                  <p className="font-semibold">سيتم إنشاء التكوين التالي عند الضغط على زر الحفظ:</p>
                  <p className="text-sm">
                    {selectedUnits.length} وحدة سكنية لكل طابق × {selectedFloorsForUnits.length} طابق × {selectedBlocksForUnits.length} بلوك
                  </p>
                  <p className="text-sm font-medium">
                    = إجمالي {selectedUnits.length * selectedFloorsForUnits.length * selectedBlocksForUnits.length} وحدة سكنية
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">ملخص الطوابق والوحدات</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{selectedUnits.length}</div>
            <div className="text-sm text-gray-600">أرقام الشقق المختارة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{selectedFloorsForUnits.length}</div>
            <div className="text-sm text-gray-600">الطوابق المختارة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{totalUnitsToCreate}</div>
            <div className="text-sm text-gray-600">إجمالي الوحدات المطلوبة</div>
          </div>
        </div>

        {!canProceed && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm text-center">
            يرجى اختيار أرقام الشقق والبلوكات والطوابق أولاً
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          السابق
        </Button>

        <Button
          onClick={handleProceed}
          disabled={!canProceed || isSubmitting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              جاري إنشاء الوحدات في قاعدة البيانات...
            </>
          ) : (
            <>
              🏠 إنشاء الوحدات السكنية وإكمال تعريف البرج
              <ArrowLeft className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default Step5UnitsDefinition