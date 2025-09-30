import React, { useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Label } from '../ui/Label'
import { ArrowRight } from 'lucide-react'
import type { StepProps, FloorDefinition } from './types'
import { FloorType } from '../../types/api'
import { useNotifications } from '../../hooks/useNotificationContext'

interface Step3Props extends StepProps {
  createdBlocks: { id: number; name: string; originalName: string }[]
  blockFloorsCount: Record<string, number>
  floorDefinitions: Record<string, FloorDefinition>
  setFloorDefinitions: (definitions: Record<string, FloorDefinition>) => void
  onSaveDefinitions: () => void
}

const Step3FloorDefinitions: React.FC<Step3Props> = ({
  isCompleted,
  onNext,
  onPrevious,
  createdBlocks,
  blockFloorsCount,
  floorDefinitions,
  setFloorDefinitions,
  onSaveDefinitions
}) => {
  const { showWarning, showSuccess } = useNotifications()
  const prevFloorDefinitionsRef = useRef(floorDefinitions)

  // مراقبة التغييرات في floorDefinitions من الرسمة
  useEffect(() => {
    const prevDefinitions = prevFloorDefinitionsRef.current
    const currentDefinitions = floorDefinitions
    
    // التحقق من الطوابق الجديدة المضافة من الرسمة
    const newFloors = Object.keys(currentDefinitions).filter(
      key => !Object.keys(prevDefinitions).includes(key) && currentDefinitions[key]?.selectedFromVisualization
    )
    
    // التحقق من الطوابق المحذوفة من الرسمة
    const removedFloors = Object.keys(prevDefinitions).filter(
      key => !Object.keys(currentDefinitions).includes(key) && prevDefinitions[key]?.selectedFromVisualization
    )
    
    // إظهار إشعارات للطوابق المضافة من الرسمة
    newFloors.forEach(floorKey => {
      const [blockName, floorPart] = floorKey.split('-floor-')
      const floorNumber = floorPart
      if (currentDefinitions[floorKey]?.selectedFromVisualization) {
        showSuccess(`تم اختيار الطابق ${floorNumber} من البلوك ${blockName} من الرسمة`, 'تم الاختيار من الرسمة')
      }
    })
    
    // إظهار إشعارات للطوابق المحذوفة من الرسمة
    removedFloors.forEach(floorKey => {
      const [blockName, floorPart] = floorKey.split('-floor-')
      const floorNumber = floorPart
      showSuccess(`تم إلغاء اختيار الطابق ${floorNumber} من البلوك ${blockName} من الرسمة`, 'تم الإلغاء من الرسمة')
    })
    
    prevFloorDefinitionsRef.current = currentDefinitions
  }, [floorDefinitions, showSuccess])

  const handleSaveClick = () => {
    if (Object.keys(floorDefinitions).length > 0) {
      onSaveDefinitions()
      showSuccess(`تم تعريف ${Object.keys(floorDefinitions).length} طابق بنجاح!`, 'تم التعريف')
    } else {
      showWarning('يرجى تعريف طابق واحد على الأقل', 'لم يتم التعريف')
    }
  }

  return (
    <>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          المرحلة الثالثة: تعريف الطوابق
        </h3>
        
        {/* عرض البلوكات المنشأة وعدد طوابقها */}
        {createdBlocks.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-medium text-blue-900 mb-3">البلوكات المنشأة:</h4>
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
                      <div className="text-xs text-gray-500">طابق</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm font-medium text-green-700">
                إجمالي الطوابق المطلوب تعريفها: {Object.values(blockFloorsCount).reduce((sum, count) => sum + count, 0)} طابق
              </span>
            </div>
          </div>
        )}

        {/* الرسم التفاعلي للطوابق */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">الرسم التفاعلي للطوابق</h4>
          <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[300px]">
            <div className="space-y-4">
              {createdBlocks.map((block, blockIndex) => {
                const floorsCount = blockFloorsCount[block.originalName] || 0
                return (
                  <div key={block.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-lg font-semibold text-gray-900 mb-3 text-center">
                      البلوك {String.fromCharCode(65 + blockIndex)} ({block.originalName})
                    </div>
                    <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                      {Array.from({ length: floorsCount }, (_, floorIndex) => {
                        const floorNumber = floorIndex + 1
                        const floorKey = `${block.name}-floor-${floorNumber}`
                        const isSelected = floorDefinitions[floorKey]?.selectedFromVisualization || false
                        
                        return (
                          <button
                            key={floorKey}
                            type="button"
                            onClick={() => {
                              const newDefinitions = { ...floorDefinitions }
                              if (isSelected) {
                                delete newDefinitions[floorKey]
                                showSuccess(`تم إلغاء اختيار الطابق ${floorNumber} من البلوك ${String.fromCharCode(65 + blockIndex)}`, 'تم الإلغاء')
                              } else {
                                newDefinitions[floorKey] = {
                                  floorCode: `F${floorNumber}`,
                                  arabicName: `الطابق ${floorNumber}`,
                                  englishName: `Floor ${floorNumber}`,
                                  floorNumber: floorNumber,
                                  floorType: FloorType.Regular,
                                  selectedFromVisualization: true
                                }
                                showSuccess(`تم اختيار الطابق ${floorNumber} من البلوك ${String.fromCharCode(65 + blockIndex)}`, 'تم الاختيار')
                              }
                              setFloorDefinitions(newDefinitions)
                            }}
                            className={`
                              relative w-12 h-12 rounded-lg border-2 transition-all duration-200 
                              flex items-center justify-center text-xs font-semibold
                              ${isSelected 
                                ? 'bg-blue-600 text-white border-blue-700 shadow-lg transform scale-105' 
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100 hover:border-blue-400'
                              }
                            `}
                            title={`الطابق ${floorNumber} - البلوك ${String.fromCharCode(65 + blockIndex)}`}
                          >
                            {floorNumber}
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {Object.keys(floorDefinitions).length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    تم اختيار {Object.keys(floorDefinitions).length} طابق من الرسم
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFloorDefinitions({})}
                    className="text-xs"
                  >
                    مسح الكل
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(floorDefinitions).map(([floorKey]) => {
                    const [blockName, floorPart] = floorKey.split('-floor-')
                    const floorNumber = floorPart
                    return (
                      <div
                        key={floorKey}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1"
                      >
                        <span>الطابق {floorNumber} - {blockName}</span>
                        <button
                          onClick={() => {
                            const newDefinitions = { ...floorDefinitions }
                            delete newDefinitions[floorKey]
                            setFloorDefinitions(newDefinitions)
                            showSuccess(`تم إزالة الطابق ${floorNumber} من البلوك ${blockName}`, 'تم الحذف')
                          }}
                          className="hover:bg-blue-200 rounded-full p-0.5 ml-1"
                          title="إزالة هذا الطابق"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* النموذج التفصيلي لتعريف الطوابق - في كارد منفصل */}
      {Object.keys(floorDefinitions).length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-medium text-gray-900">تفاصيل الطوابق المختارة</h4>
          <div className="space-y-4">
            {Object.entries(floorDefinitions).map(([floorKey, definition]) => (
              <div key={floorKey} className="p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* كود الطابق */}
                  <div>
                    <Label htmlFor={`floorCode-${floorKey}`}>كود الطابق</Label>
                    <Input
                      id={`floorCode-${floorKey}`}
                      value={definition.floorCode}
                      onChange={(e) => {
                        const updatedDefinitions = { ...floorDefinitions }
                        updatedDefinitions[floorKey] = { ...updatedDefinitions[floorKey], floorCode: e.target.value }
                        setFloorDefinitions(updatedDefinitions)
                      }}
                      placeholder="F1, B1, G..."
                    />
                  </div>

                  {/* الاسم العربي */}
                  <div>
                    <Label htmlFor={`arabicName-${floorKey}`}>الاسم العربي</Label>
                    <Input
                      id={`arabicName-${floorKey}`}
                      value={definition.arabicName}
                      onChange={(e) => {
                        const updatedDefinitions = { ...floorDefinitions }
                        updatedDefinitions[floorKey] = { ...updatedDefinitions[floorKey], arabicName: e.target.value }
                        setFloorDefinitions(updatedDefinitions)
                      }}
                      placeholder="الطابق الأول"
                    />
                  </div>

                  {/* الاسم الإنجليزي */}
                  <div>
                    <Label htmlFor={`englishName-${floorKey}`}>الاسم الإنجليزي</Label>
                    <Input
                      id={`englishName-${floorKey}`}
                      value={definition.englishName}
                      onChange={(e) => {
                        const updatedDefinitions = { ...floorDefinitions }
                        updatedDefinitions[floorKey] = { ...updatedDefinitions[floorKey], englishName: e.target.value }
                        setFloorDefinitions(updatedDefinitions)
                      }}
                      placeholder="First Floor"
                    />
                  </div>

                  {/* نوع الطابق */}
                  <div>
                    <Label htmlFor={`floorType-${floorKey}`}>نوع الطابق</Label>
                    <select
                      id={`floorType-${floorKey}`}
                      value={definition.floorType}
                      onChange={(e) => {
                        const updatedDefinitions = { ...floorDefinitions }
                        updatedDefinitions[floorKey] = { ...updatedDefinitions[floorKey], floorType: parseInt(e.target.value) as FloorType }
                        setFloorDefinitions(updatedDefinitions)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={FloorType.Regular}>طابق عادي</option>
                      <option value={FloorType.Ground}>طابق أرضي</option>
                      <option value={FloorType.Basement}>قبو/بدروم</option>
                      <option value={FloorType.Parking}>موقف سيارات</option>
                      <option value={FloorType.Commercial}>تجاري</option>
                      <option value={FloorType.Office}>مكاتب</option>
                      <option value={FloorType.Rooftop}>سطح</option>
                      <option value={FloorType.Amenities}>مرافق</option>
                    </select>
                  </div>



                  {/* رقم الطابق */}
                  <div>
                    <Label htmlFor={`floorNumber-${floorKey}`}>رقم الطابق</Label>
                    <Input
                      id={`floorNumber-${floorKey}`}
                      type="number"
                      value={definition.floorNumber}
                      onChange={(e) => {
                        const updatedDefinitions = { ...floorDefinitions }
                        updatedDefinitions[floorKey] = { ...updatedDefinitions[floorKey], floorNumber: parseInt(e.target.value) || 1 }
                        setFloorDefinitions(updatedDefinitions)
                      }}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* أزرار التحكم */}
      <Card className="p-6">
        <div className="flex gap-2 mt-6">
          <Button onClick={onPrevious} variant="outline" className="flex-1">
            السابق
          </Button>
          <Button
            onClick={handleSaveClick}
            disabled={Object.keys(floorDefinitions).length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            حفظ تعريف الطوابق
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
                التالي - إنشاء الطوابق
              </>
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}

export default Step3FloorDefinitions