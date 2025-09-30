import React, { useState } from 'react'
import { Building2, Home, Eye, EyeOff } from 'lucide-react'
import type { BuildingData } from '../building-builder/types'

interface BuildingVisualizationProps {
  buildingData: BuildingData
  currentStep: number
  onUnitClick?: (unitId: string) => void
  selectedUnits?: Set<string>
  onBlockUpdate?: (blockId: string, updates: Record<string, unknown>) => void
}

const BuildingVisualization: React.FC<BuildingVisualizationProps> = ({
  buildingData,
  currentStep,
  onUnitClick,
  selectedUnits = new Set()
}) => {
  const [view3D, setView3D] = useState(false)

  // إذا لم تكن هناك بيانات، اعرض رسالة
  if (!buildingData.name && buildingData.blocks.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
        <Building2 className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد بيانات لعرضها</h3>
        <p className="text-gray-500 text-center max-w-md">
          قم بإنشاء البرج أولاً، ثم أضف البلوكات والطوابق لرؤية التصور التفاعلي
        </p>
      </div>
    )
  }

  const handleUnitClick = (unitId: string) => {
    if (onUnitClick) {
      onUnitClick(unitId)
    }
  }

  return (
    <div className="w-full bg-white rounded-lg border shadow-sm">
      {/* شريط التحكم */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              {buildingData.name || 'البرج الجديد'}
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {buildingData.blocks.length} بلوك
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView3D(!view3D)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                view3D 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {view3D ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {view3D ? 'عرض 2D' : 'عرض 3D'}
            </button>
          </div>
        </div>
      </div>

      {/* منطقة العرض */}
      <div className="p-6 min-h-96">
        {buildingData.blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Building2 className="w-12 h-12 mb-3 opacity-50" />
            <p>لا توجد بلوكات لعرضها</p>
            <p className="text-sm">أضف بلوكات في الخطوة الثانية</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${buildingData.blocks.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {buildingData.blocks.map((block) => (
              <div key={block.id} className="space-y-4">
                {/* رأس البلوك */}
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                    {block.name}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">البلوك {block.name}</h4>
                    <p className="text-sm text-gray-500">{block.floors.length} طوابق</p>
                  </div>
                </div>

                {/* الطوابق */}
                {block.floors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <Home className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد طوابق</p>
                    <p className="text-xs">أضف طوابق في الخطوة الثالثة</p>
                  </div>
                ) : (
                  <div className={`grid gap-3 ${view3D ? 'perspective-1000' : ''}`}>
                    {block.floors.slice().reverse().map((floor, floorIndex) => (
                      <div 
                        key={floor.id} 
                        className={`border-2 border-gray-300 rounded-lg p-3 bg-gradient-to-r from-blue-50 to-gray-50 ${
                          view3D ? 'transform-gpu hover:scale-105 transition-transform' : ''
                        }`}
                        style={view3D ? {
                          transform: `translateY(${floorIndex * -2}px) translateZ(${floorIndex * 10}px)`,
                          boxShadow: `0 ${floorIndex * 2 + 4}px ${floorIndex * 4 + 8}px rgba(0,0,0,0.1)`
                        } : undefined}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">الطابق {floor.number}</span>
                          <span className="text-xs text-gray-500">{floor.units.length} وحدة</span>
                        </div>
                        
                        {/* الوحدات */}
                        {floor.units.length === 0 ? (
                          <div className="text-center py-4 text-gray-400 text-sm">
                            لا توجد وحدات
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            {floor.units.map((unit) => {
                              const unitId = `${block.id}-${floor.id}-${unit.id}`
                              const isSelected = selectedUnits.has(unitId)
                              
                              return (
                                <button
                                  key={unit.id}
                                  onClick={() => handleUnitClick(unitId)}
                                  className={`
                                    w-8 h-8 rounded border-2 text-xs font-medium transition-all duration-200
                                    ${isSelected 
                                      ? 'bg-green-500 border-green-600 text-white shadow-lg scale-110' 
                                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                    }
                                  `}
                                  title={`الوحدة ${unit.number} - اضغط للاختيار`}
                                >
                                  {unit.number}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* شريط المعلومات السفلي */}
      <div className="px-6 py-3 bg-gray-50 border-t rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>الخطوة الحالية: {currentStep}</span>
            {selectedUnits.size > 0 && (
              <span className="text-green-600 font-medium">
                تم اختيار {selectedUnits.size} وحدة
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span>إجمالي البلوكات: {buildingData.blocks.length}</span>
            <span>إجمالي الطوابق: {buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)}</span>
            <span>إجمالي الوحدات: {buildingData.blocks.reduce((total, block) => 
              total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
            )}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildingVisualization