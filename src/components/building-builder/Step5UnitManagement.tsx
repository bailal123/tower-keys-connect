import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import type { StepProps, BuildingData } from './types'

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

interface Step5Props extends StepProps {
  buildingData: BuildingData
  selectedUnits: string[]
  setSelectedUnits: (units: string[]) => void
  selectedBlocksForUnits: string[]
  setSelectedBlocksForUnits: (blocks: string[]) => void
  selectedFloorsForUnits: string[]
  setSelectedFloorsForUnits: (floors: string[]) => void
  initialUnitOptions: string[]
  visuallySelectedUnits: Set<string>
  clearVisualSelection: () => void
  onAddUnits: () => void
  onCompleteBuilding: () => void
}

const Step5UnitManagement: React.FC<Step5Props> = ({
  onPrevious,
  isSubmitting,
  buildingData,
  selectedUnits,
  setSelectedUnits,
  selectedBlocksForUnits,
  setSelectedBlocksForUnits,
  selectedFloorsForUnits,
  setSelectedFloorsForUnits,
  initialUnitOptions,
  visuallySelectedUnits,
  clearVisualSelection,
  onAddUnits,
  onCompleteBuilding
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        المرحلة الخامسة: الشقق
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
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            💾 <strong>ملاحظة:</strong> عند الضغط على "إنشاء الشقق"، سيتم إنشاؤها فعلياً في قاعدة البيانات باستخدام الـ API.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onPrevious} variant="outline" className="flex-1">
            السابق
          </Button>
          <Button
            onClick={onAddUnits}
            disabled={isSubmitting || selectedUnits.length === 0 || selectedFloorsForUnits.length === 0 || selectedBlocksForUnits.length === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                جاري إنشاء الشقق...
              </>
            ) : (
              '🏠 إنشاء الشقق '
            )}
          </Button>
        </div>
        
        {/* أزرار التحكم في الاختيار البصري */}
        {visuallySelectedUnits.size > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-blue-900 flex items-center gap-1">
                ✅ تم اختيار {visuallySelectedUnits.size} شقة من الرسم
              </span>
              <Button 
                onClick={clearVisualSelection} 
                variant="outline" 
                size="sm"
                className="text-xs bg-white hover:bg-red-50 border-red-200 text-red-700"
              >
                🗑️ مسح الكل
              </Button>
            </div>
            <div className="text-xs text-blue-700 bg-white bg-opacity-50 p-2 rounded">
              <strong>الشقق المختارة:</strong> {Array.from(visuallySelectedUnits).map(unitId => {
                // استخراج رقم الشقة من الID
                const parts = unitId.split('-')
                const blockName = parts[1] || 'غير معروف'
                const floorNumber = parts[2] || 'غير معروف'
                const unitNumber = parts[3] || parts.pop()
                return `${blockName}-${floorNumber}-${unitNumber}`
              }).join(' • ')}
            </div>
            <div className="text-xs text-green-700 mt-2 font-medium">
              💡 يمكنك لاحقاً تطبيق تصاميم على هذه الشقق المختارة
            </div>
          </div>
        )}
        
        {/* تعليمات إضافية للمستخدم */}
        {visuallySelectedUnits.size === 0 && buildingData.blocks.some(block => 
          block.floors.some(floor => floor.units.length > 0)
        ) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">
              <div className="font-bold mb-1">💡 نصيحة:</div>
              <div>انظر إلى الرسم على اليمين واضغط على أي شقة لاختيارها.</div>
              <div className="text-xs mt-1">كل مربع صغير في الرسم يمثل شقة قابلة للنقر.</div>
            </div>
          </div>
        )}
      </div>

      {/* Complete Building Button */}
      {buildingData.blocks.some(block => 
        block.floors.some(floor => floor.units.length > 0)
      ) && (
        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={onCompleteBuilding}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            🎉 إكمال إنشاء البرج
          </Button>
        </div>
      )}
    </Card>
  )
}

export default Step5UnitManagement