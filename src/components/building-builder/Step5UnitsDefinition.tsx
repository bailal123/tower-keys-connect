import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import type { StepProps, FloorDefinition } from './types'
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
  setFloorDefinitions: (definitions: Record<string, FloorDefinition>) => void
  createdBlocks: { id: number; name: string; originalName: string }[]
  onAddUnits: () => void
}

const Step5UnitsDefinition: React.FC<Step5Props> = ({
  onPrevious,
  isSubmitting,
  floorDefinitions,
  setFloorDefinitions,
  createdBlocks,
  onAddUnits
}) => {
  const { showWarning, showSuccess } = useNotifications()
  
  // Form state with MultiSelect format
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [selectedBlocksForUnits, setSelectedBlocksForUnits] = useState<string[]>([])
  const [selectedFloorsForUnits, setSelectedFloorsForUnits] = useState<string[]>([])

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





  // Apply units to selected blocks and floors
  const handleApplyUnits = () => {
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

    // Update floor definitions with selected units count
    const updatedDefinitions = { ...floorDefinitions }
    let updatedCount = 0

    selectedBlocksForUnits.forEach(blockName => {
      selectedFloorsForUnits.forEach(floorNumber => {
        const floorKey = `${blockName}-floor-${parseInt(floorNumber)}`
        if (updatedDefinitions[floorKey]) {
          updatedDefinitions[floorKey] = {
            ...updatedDefinitions[floorKey],
            unitsCount: selectedUnits.length
          }
          updatedCount++
        }
      })
    })

    setFloorDefinitions(updatedDefinitions)

    if (updatedCount > 0) {
      showSuccess(
        `تم تطبيق ${selectedUnits.length} وحدة على ${updatedCount} طابق في ${selectedBlocksForUnits.length} بلوك`, 
        'تم التطبيق'
      )
    } else {
      showWarning('لم يتم العثور على طوابق مطابقة للاختيار', 'تنبيه')
    }
  }

  // Handle proceed to create units
  const handleProceed = () => {
    const floorsWithoutUnits = Object.entries(floorDefinitions).filter(
      ([, def]) => !def.unitsCount || def.unitsCount <= 0
    )

    if (floorsWithoutUnits.length > 0) {
      showWarning('يرجى تحديد عدد الوحدات لجميع الطوابق أولاً', 'تنبيه')
      return
    }

    onAddUnits()
  }

  // Calculate summary
  const totalFloors = Object.keys(floorDefinitions).length
  const floorsWithUnits = Object.values(floorDefinitions).filter(
    def => def.unitsCount && def.unitsCount > 0
  ).length
  const totalUnits = Object.values(floorDefinitions).reduce(
    (sum, def) => sum + (def.unitsCount || 0), 
    0
  )

  const canProceed = floorsWithUnits === totalFloors && totalUnits > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
          🏠 تحديد الوحدات للطوابق
        </div>
        <p className="text-gray-600">
          اختر أرقام الشقق والبلوكات والطوابق المطلوب إضافة الوحدات إليها
        </p>
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

          {/* Apply Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleApplyUnits}
              disabled={selectedUnits.length === 0 || selectedBlocksForUnits.length === 0 || selectedFloorsForUnits.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              تطبيق {selectedUnits.length} وحدة على {selectedBlocksForUnits.length} بلوك و {selectedFloorsForUnits.length} طابق
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">ملخص الطوابق والوحدات</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{totalFloors}</div>
            <div className="text-sm text-gray-600">إجمالي الطوابق</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{floorsWithUnits}</div>
            <div className="text-sm text-gray-600">طوابق محددة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{totalUnits}</div>
            <div className="text-sm text-gray-600">إجمالي الوحدات</div>
          </div>
        </div>

        {floorsWithUnits < totalFloors && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm text-center">
            يرجى تحديد عدد الوحدات لجميع الطوابق ({totalFloors - floorsWithUnits} طوابق متبقية)
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
              جاري الإنشاء...
            </>
          ) : (
            <>
              إنشاء الوحدات
              <ArrowLeft className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default Step5UnitsDefinition