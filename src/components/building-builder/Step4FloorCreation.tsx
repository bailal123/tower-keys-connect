import React from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Building2, ArrowRight } from 'lucide-react'
import type { StepProps, FloorDefinition, BuildingData } from './types'
import { FloorType } from '../../types/api'
import { useNotifications } from '../../hooks/useNotificationContext'

interface Step4Props extends StepProps {
  floorDefinitions: Record<string, FloorDefinition>
  onCreateFloors: () => void
  setBuildingData: React.Dispatch<React.SetStateAction<BuildingData>>
}

const Step4FloorCreation: React.FC<Step4Props> = ({
  isCompleted,
  onNext,
  onPrevious,
  isSubmitting,
  floorDefinitions,
  onCreateFloors,
  setBuildingData
}) => {
  const { showSuccess } = useNotifications()

  const handleCreateClick = () => {
    // تحديث buildingData بحالة إنشاء الطوابق
    setBuildingData(prev => {
      const updatedBlocks = prev.blocks.map(block => ({
        ...block,
        floors: block.floors.map(floor => ({
          ...floor,
          created: true // إضافة علامة أن الطابق تم إنشاؤه
        }))
      }))
      
      return {
        ...prev,
        blocks: updatedBlocks
      }
    })
    
    onCreateFloors()
    showSuccess('تم تحضير البيانات للمرحلة التالية!', 'جاهز للمتابعة')
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        المرحلة الرابعة: إنشاء الطوابق في قاعدة البيانات
      </h3>
      
      {/* ملخص تعريفات الطوابق */}
      {Object.keys(floorDefinitions).length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h4 className="text-lg font-medium text-green-900 mb-3">ملخص الطوابق المعرفة:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(floorDefinitions).map(([floorKey, floorDef]) => {
              const blockName = floorKey.split('-')[0]
              return (
                <div key={floorKey} className="bg-white p-3 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {floorDef.arabicName}
                      </div>
                      <div className="text-sm text-gray-600">
                        البلوك {blockName} - {floorDef.floorCode}
                      </div>
                      <div className="text-xs text-blue-600">
                        {floorDef.floorType === FloorType.Regular ? 'طابق عادي' :
                         floorDef.floorType === FloorType.Ground ? 'طابق أرضي' :
                         floorDef.floorType === FloorType.Commercial ? 'تجاري' :
                         floorDef.floorType === FloorType.Parking ? 'موقف سيارات' :
                         'نوع آخر'}
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 text-center">
            <span className="text-sm font-medium text-green-700">
              إجمالي: {Object.keys(floorDefinitions).length} طابق
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            🚀 <strong>جاهز للإنشاء!</strong> سيتم إنشاء الطوابق والوحدات في قاعدة البيانات باستخدام التعريفات المفصلة من الخطوة السابقة.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onPrevious} variant="outline" className="flex-1">
            السابق
          </Button>
          <Button
            onClick={handleCreateClick}
            disabled={Object.keys(floorDefinitions).length === 0 || isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                {isCompleted ? 'إعادة إنشاء الطوابق' : 'إنشاء الطوابق والوحدات'}
              </>
            )}
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
                التالي - إدارة الشقق
              </>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default Step4FloorCreation