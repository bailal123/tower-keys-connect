import React from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useLanguage } from '../../hooks/useLanguage'
import { Building2, Building, ArrowRight } from 'lucide-react'
import type { StepProps } from './types'
// MultiSelect component not available, using basic UI

interface Step2Props extends StepProps {
  selectedBlocks: string[]
  setSelectedBlocks: (blocks: string[]) => void
  blockFloorsCount: Record<string, number>
  setBlockFloorsCount: (count: Record<string, number>) => void
  availableBlocks: Array<{ id: number; arabicName: string; englishName: string }>
  initialBlockOptions: string[]
  createdTowerId: number | null
  createdBlocks: { id: number; name: string; originalName: string }[]
  onCreateBlocks: () => void
}

const Step2BlocksCreation: React.FC<Step2Props> = ({
  isCompleted,
  onNext,
  onPrevious,
  isSubmitting,
  selectedBlocks,
  setSelectedBlocks,
  blockFloorsCount,
  setBlockFloorsCount,
  availableBlocks,
  initialBlockOptions,
  createdTowerId,
  createdBlocks,
  onCreateBlocks
}) => {
  const { language } = useLanguage()

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        المرحلة الثانية: البلوكات وعدد الطوابق
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر البلوكات من القائمة المتاحة <span className="text-red-500">*</span>
          </label>
          <div className="mb-2 p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              💡 يتم تحميل البلوكات من قاعدة البيانات. سيتم ربط البلوكات المختارة بهذا البرج فقط.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(availableBlocks?.map((block: { arabicName: string; englishName: string }) => 
              language === 'ar' ? block.arabicName : block.englishName
            ) || initialBlockOptions).map((blockName: string) => (
              <label key={blockName} className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBlocks.includes(blockName)}
                  onChange={(e) => {
                    const newBlocks = e.target.checked
                      ? [...selectedBlocks, blockName]
                      : selectedBlocks.filter(b => b !== blockName)
                    setSelectedBlocks(newBlocks)
                    // إعادة تعيين عدد الطوابق للبلوكات الجديدة
                    const newBlockFloorsCount = { ...blockFloorsCount }
                    newBlocks.forEach((name: string) => {
                      if (!newBlockFloorsCount[name]) {
                        newBlockFloorsCount[name] = 5 // قيمة افتراضية
                      }
                    })
                    // حذف البلوكات غير المختارة
                    Object.keys(newBlockFloorsCount).forEach(name => {
                      if (!newBlocks.includes(name)) {
                        delete newBlockFloorsCount[name]
                      }
                    })
                    setBlockFloorsCount(newBlockFloorsCount)
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">{blockName}</span>
              </label>
            ))}
          </div>
          {availableBlocks && availableBlocks.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {availableBlocks.length} بلوك متاح في النظام
            </p>
          )}
        </div>

        {/* إدخال عدد الطوابق لكل بلوك */}
        {selectedBlocks.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              تحديد عدد الطوابق لكل بلوك
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedBlocks.map((blockName, index) => (
                <div key={blockName} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      البلوك {String.fromCharCode(65 + index)} ({blockName})
                    </label>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-500">طوابق</span>
                    </div>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={blockFloorsCount[blockName] || 5}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 1
                      const newState = { ...blockFloorsCount, [blockName]: count }
                      setBlockFloorsCount(newState)
                    }}
                    placeholder="عدد الطوابق"
                    className="text-center font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    الطوابق: من الطابق الأول إلى الطابق {blockFloorsCount[blockName] || 5}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                💡 <strong>إجمالي الطوابق المختارة:</strong> {Object.values(blockFloorsCount).reduce((sum, count) => sum + count, 0)} طابق
              </p>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={onCreateBlocks}
            disabled={selectedBlocks.length === 0 || !createdTowerId || isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Building className="w-4 h-4" />
                {isCompleted ? 'إعادة إنشاء البلوكات' : 'حفظ  '}
              </>
            )}
          </Button>
        </div>
        
        <div className='flex gap-2 '>
          <Button onClick={onPrevious} variant="outline" className="flex-1">
            السابق
          </Button>
          {isCompleted && (
            <Button
              onClick={onNext}
              variant="outline"
              className="flex-1"
            >
              <>
                <ArrowRight className="w-4 h-4" />
                التالي
              </>
            </Button>
          )}
        </div>
        
        {/* معلومات إضافية */}
        {createdTowerId && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              ✅ تم إنشاء البرج بنجاح. قم باختيار البلوكات وإنشائها.
            </p>
          </div>
        )}
        
        {createdBlocks.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ تم إنشاء {createdBlocks.length} بلوك: {createdBlocks.map(b => b.name).join(', ')}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default Step2BlocksCreation