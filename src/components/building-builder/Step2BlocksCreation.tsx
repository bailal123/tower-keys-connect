import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'

import { useNotifications } from '../../hooks/useNotificationContext'
import { useLanguage } from '../../hooks/useLanguage'
import { Building2, Building, ArrowRight } from 'lucide-react'
import { RealEstateAPI } from '../../services/api'
import type { StepProps, BuildingData } from './types'
import type { CreateTowerBlockRequest } from '../../types/api'

// MultiSelect component
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
                  placeholder="إضافة بلوك جديد..."
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

interface Step2Props extends StepProps {
  selectedBlocks: string[]
  setSelectedBlocks: (blocks: string[]) => void
  blockFloorsCount: Record<string, number>
  setBlockFloorsCount: (count: Record<string, number>) => void
  createdTowerId: number | null
  createdBlocks: { id: number; name: string; originalName: string }[]
  setCreatedBlocks: (blocks: { id: number; name: string; originalName: string }[]) => void
  setBuildingData: (data: BuildingData | ((prev: BuildingData) => BuildingData)) => void
  onStageAdvance?: (nextStage: number) => void
}

const Step2BlocksCreation: React.FC<Step2Props> = ({
  isCompleted,
  onNext,
  onPrevious,
  onComplete,
  isSubmitting,
  selectedBlocks,
  setSelectedBlocks,
  blockFloorsCount,
  setBlockFloorsCount,
  createdTowerId,
  createdBlocks,
  setCreatedBlocks,
  setBuildingData,
  onStageAdvance
}) => {
  const { showSuccess, showError } = useNotifications()
  const { t } = useLanguage()
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // تتبع تغيير createdTowerId
  useEffect(() => {
    console.log('Step2: createdTowerId changed to:', createdTowerId)
  }, [createdTowerId])

  // تحميل البلوكات المتاحة من قاعدة البيانات
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setIsLoading(true)
        
        // جلب البلوكات العامة المتاحة للاختيار منها باستخدام blockAPI.getAll
        const response = await RealEstateAPI.block.getAll(true, 'ar')
        console.log('Blocks API Response:', response.data) // للتتبع
        
        // البيانات موجودة في response.data.data وليس response.data مباشرة
        const blocksData = response.data.data || []
        const blockNames = blocksData.map((block: { arabicName?: string; englishName?: string; code?: string }) => 
          block.arabicName || block.englishName || block.code || t('blocks')
        )
        setAvailableBlocks(blockNames)
        
        // إذا كان لدينا بلوكات مُنشأة مسبقاً، نضعها كمختارة
        if (createdBlocks.length > 0) {
          const existingBlockNames = createdBlocks.map(block => block.name)
          setSelectedBlocks(existingBlockNames)
        }
      } catch (error) {
  console.error('load blocks error:', error)
  showError(t('error'), t('error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlocks()
  }, [showError, createdBlocks, setSelectedBlocks, t])

  // حفظ البلوكات في قاعدة البيانات
  const handleCreateBlocks = useCallback(async () => {
    console.log('handleCreateBlocks called, createdTowerId:', createdTowerId) // للتتبع
    
    if (isSubmitting) {
  console.log('submit in progress, ignored')
      return
    }
    
    if (!createdTowerId) {
      console.error('createdTowerId is null or undefined:', createdTowerId)
  showError(t('builder_tower_created'), t('error'))
      return
    }

    if (selectedBlocks.length === 0) {
  showError(t('builder_select_blocks_label'), t('warning') || t('alert'))
      return
    }

    try {
      // جلب البلوكات العامة للحصول على الـ IDs
      const blocksResponse = await RealEstateAPI.block.getAll(true, 'ar')
      const allBlocks = blocksResponse.data.data || [] // البيانات في data.data
      
      const createdBlocksList = []
      
      for (let i = 0; i < selectedBlocks.length; i++) {
        const blockName = selectedBlocks[i]
        
        // البحث عن البلوك في البيانات
        let foundBlock = allBlocks.find((block: { id: number; arabicName?: string; englishName?: string; code?: string }) => 
          (block.arabicName === blockName || block.englishName === blockName || block.code === blockName)
        )
        
        // إذا لم يتم العثور على البلوك، قم بإنشائه أولاً
        if (!foundBlock) {
          console.log(`Block "${blockName}" not found. Creating new block...`)
          try {
            const newBlockData = {
              code: blockName,
              arabicName: blockName,
              englishName: blockName,
              blockType: 1, // نوع افتراضي
              isActive: true,
              displayOrder: i + 1
            }
            const createBlockResponse = await RealEstateAPI.block.create(newBlockData)
            foundBlock = createBlockResponse.data.data || createBlockResponse.data
            console.log('New block created:', foundBlock)
          } catch (createError) {
            console.error('Error creating new block:', createError)
            showError(`فشل في إنشاء البلوك "${blockName}"`, t('error'))
            continue // تجاوز هذا البلوك والانتقال للتالي
          }
        }
        
        if (foundBlock) {
          const towerBlockData: CreateTowerBlockRequest = {
            towerId: createdTowerId,
            blockId: foundBlock.id,
            blockNumber: blockName,
            floorsInBlock: blockFloorsCount[blockName] || 5,
            unitsPerFloorInBlock: 4, // قيمة افتراضية، يمكن تخصيصها
            isActive: true,
            displayOrder: i + 1
          }
          
          console.log('Creating TowerBlock with data:', towerBlockData)
          const response = await RealEstateAPI.towerBlock.create(towerBlockData)
          console.log('TowerBlock creation response:', response.data) // للتتبع
          console.log('Full response object:', response) // للتتبع الكامل
          
          // استخراج towerBlockId من الاستجابة الصحيحة
          const blockId = response.data.data?.towerBlockId || response.data.data?.id || response.data.id
          console.log('Extracted blockId:', blockId, 'type:', typeof blockId)
          console.log('Available IDs in response:', {
            towerBlockId: response.data.data?.towerBlockId,
            dataId: response.data.data?.id,
            directId: response.data.id,
            blockId: response.data.data?.blockId
          })
          
          if (!blockId || blockId === 0) {
            console.error('خطأ: لم يتم الحصول على blockId صحيح من الاستجابة')
            console.error('response.data:', response.data)
            console.error('response.data.data:', response.data.data)
            throw new Error('فشل في الحصول على ID البلوك من الخادم')
          }
          
          createdBlocksList.push({
            id: blockId,
            name: blockName,
            originalName: blockName
          })
        }
      }

      setCreatedBlocks(createdBlocksList)
      
      // تحديث buildingData مع البلوكات الجديدة
      const blocksData = createdBlocksList.map(block => ({
        id: `block-${block.name}`,
        name: block.name,
        floors: [] // سيتم ملؤها في الخطوات التالية
      }))
      
      setBuildingData(prev => ({
        ...prev,
        blocks: blocksData
      }))
      
      // حساب إجمالي عدد الطوابق في جميع البلوكات
      const totalFloorsCount = Object.values(blockFloorsCount).reduce((sum, count) => sum + count, 0)
      
      console.log('✅ تم إنشاء البلوكات - إجمالي الطوابق:', totalFloorsCount)
      
  console.log('Blocks created:', createdBlocksList)
  console.log('Updated buildingData blocks:', blocksData)
  showSuccess(`${createdBlocksList.length} ${t('blocks')} ${t('success')}`, t('success'))
      
      // الانتقال للخطوة التالية
      console.log('الانتقال للخطوة التالية...')
      onComplete()
      onNext()
    onStageAdvance?.(3)
    } catch (error: unknown) {
      console.error('خطأ في إنشاء البلوكات:', error)
      console.error('Error details:', {
        error,
        type: typeof error,
        hasResponse: error && typeof error === 'object' && 'response' in error
      })
      
  let errorMessage = t('error')
      
      if (error instanceof Error) {
        if ('response' in error && error.response && typeof error.response === 'object') {
          console.error('Response error details:', error.response)
          if ('data' in error.response && error.response.data && 
              typeof error.response.data === 'object' && 'message' in error.response.data) {
            errorMessage = String(error.response.data.message)
          } else if ('status' in error.response) {
            errorMessage = `Server error (${error.response.status}): ${error.message}`
          }
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
  showError(errorMessage, t('error'))
    }
  }, [createdTowerId, selectedBlocks, blockFloorsCount, setCreatedBlocks, setBuildingData, onComplete, onNext, onStageAdvance, showError, showSuccess, isSubmitting, t])

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3">{t('loading')}</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        {t('builder_step2_heading')}
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            🏢 {t('builder_select_blocks_label')} <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            options={availableBlocks}
            selectedValues={selectedBlocks}
            onChange={(newBlocks) => {
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
            placeholder={t('builder_select_blocks_label')}
            allowCustom={true}
          />
          {/* <div className="mt-2 p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              💡 يتم تحميل البلوكات من قاعدة البيانات. سيتم ربط البلوكات المختارة بهذا البرج فقط.
            </p>
          </div>
          {availableBlocks && availableBlocks.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {availableBlocks.length} بلوك متاح في النظام
            </p>
          )} */}
        </div>

        {/* إدخال عدد الطوابق لكل بلوك */}
        {selectedBlocks.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              {t('builder_blocks_floorcount_heading')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedBlocks.map((blockName, index) => (
                <div key={blockName} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('blocks')} {String.fromCharCode(65 + index)} ({blockName})
                    </label>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-500">{t('total_floors') || t('floors') || 'Floors'}</span>
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
                    placeholder={t('builder_blocks_floors_placeholder')}
                    className="text-center font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {t('floors') || 'Floors'}: 1 - {blockFloorsCount[blockName] || 5}
                  </p>
                </div>
              ))}
            </div>
            {/* <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                💡 <strong>إجمالي الطوابق المختارة:</strong> {Object.values(blockFloorsCount).reduce((sum, count) => sum + count, 0)} طابق
              </p>
            </div>
            <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700">
                ⚠️ <strong>تنبيه:</strong> اضغط على زر "حفظ البلوكات" أسفل لحفظ البلوكات في قاعدة البيانات والانتقال للخطوة التالية.
              </p>
            </div> */}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleCreateBlocks}
            disabled={selectedBlocks.length === 0 || !createdTowerId || isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('builder_saving')}
              </>
            ) : (
              <>
                <Building className="w-4 h-4" />
                {t('builder_save_blocks_and_next')}
              </>
            )}
          </Button>
        </div>
        
        <div className='flex gap-2 '>
          <Button onClick={onPrevious} variant="outline" className="flex-1">
            {t('wizard_previous')}
          </Button>
          {isCompleted && (
            <Button
              onClick={onNext}
              variant="outline"
              className="flex-1"
            >
              <>
                <ArrowRight className="w-4 h-4" />
                {t('wizard_next')}
              </>
            </Button>
          )}
        </div>
        
        {/* معلومات إضافية */}
        {createdTowerId && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              ✅ {t('builder_tower_created')} (ID: {createdTowerId})
            </p>
          </div>
        )}
        
        {!createdTowerId && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠️ {t('error')}
            </p>
          </div>
        )}
        
        {createdBlocks.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ {createdBlocks.length} {t('blocks')}: {createdBlocks.map(b => b.name).join(', ')}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default Step2BlocksCreation