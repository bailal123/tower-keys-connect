import React from 'react'
import { Input } from '../Input'
import { useLanguage } from '../../../hooks/useLanguage'
import type { DesignFormData } from '../../../types/api'

interface RoomsStepProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
}

const RoomsStep: React.FC<RoomsStepProps> = ({ formData, setFormData }) => {
  const { t } = useLanguage()

  const roomTypes = [
    {
      key: 'bedroomsCount',
      label: 'غرف النوم',
      icon: '🛏️',
      color: 'bg-blue-50 border-blue-200',
      value: formData.bedroomsCount,
    },
    {
      key: 'bathroomsCount', 
      label: 'الحمامات',
      icon: '🚿',
      color: 'bg-cyan-50 border-cyan-200',
      value: formData.bathroomsCount,
    },
    {
      key: 'livingRoomsCount',
      label: 'غرف المعيشة', 
      icon: '🛋️',
      color: 'bg-green-50 border-green-200',
      value: formData.livingRoomsCount,
    },
    {
      key: 'kitchensCount',
      label: 'المطابخ',
      icon: '🍳',
      color: 'bg-orange-50 border-orange-200', 
      value: formData.kitchensCount,
    },
    {
      key: 'balconiesCount',
      label: 'الشرفات',
      icon: '🏡',
      color: 'bg-purple-50 border-purple-200',
      value: formData.balconiesCount,
    },
  ]

  const updateRoomCount = (roomType: string, value: number) => {
    setFormData(prev => ({ ...prev, [roomType]: Math.max(0, value) }))
  }

  const getTotalRooms = () => {
    return formData.bedroomsCount + formData.bathroomsCount + formData.livingRoomsCount + 
           formData.kitchensCount + formData.balconiesCount
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('areaAndRooms') || 'المساحة وتفاصيل الغرف'}
        </h3>
        <p className="text-gray-600">
          {t('specifyAreaAndRoomDetails') || 'حدد مساحة التصميم وعدد الغرف المختلفة'}
        </p>
      </div>

      {/* Area */}
      <div className="max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-2xl">
            📐
          </div>
          
          <div>
            <label className="block text-base font-medium text-gray-900 mb-3">
              المساحة الإجمالية <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
              <Input
                type="number"
                value={formData.areaSquareMeters}
                onChange={(e) => setFormData(prev => ({ ...prev, areaSquareMeters: Number(e.target.value) }))}
                min="0"
                required
                className="text-center text-xl font-semibold pr-16"
                placeholder="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 font-medium">متر²</span>
              </div>
            </div>
            
            {formData.areaSquareMeters > 0 && (
              <p className="text-sm text-green-600 mt-2">
                ✅ تم تحديد المساحة: {formData.areaSquareMeters} متر مربع
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="space-y-6">
        <h4 className="text-base font-medium text-gray-900 text-center">
          تفاصيل الغرف
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {roomTypes.map((room) => (
            <div key={room.key} className={`p-6 rounded-xl border-2 ${room.color} transition-all duration-200 hover:shadow-lg`}>
              <div className="text-center space-y-4">
                <div className="text-4xl mb-3">{room.icon}</div>
                
                <h5 className="font-semibold text-gray-900 text-lg">{room.label}</h5>
                
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.key, room.value - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={room.value === 0}
                  >
                    <span className="text-lg font-bold">−</span>
                  </button>
                  
                  <div className="w-16 h-12 flex items-center justify-center bg-white border border-gray-300 rounded-lg">
                    <span className="text-xl font-bold text-gray-900">{room.value}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.key, room.value + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            📊 ملخص التصميم
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{formData.areaSquareMeters}</div>
              <div className="text-sm text-gray-600">متر مربع</div>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{getTotalRooms()}</div>
              <div className="text-sm text-gray-600">إجمالي الغرف</div>
            </div>
          </div>
          
          {getTotalRooms() > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-700">
                {formData.bedroomsCount > 0 && `${formData.bedroomsCount} غرفة نوم`}
                {formData.bedroomsCount > 0 && formData.bathroomsCount > 0 && ' • '}
                {formData.bathroomsCount > 0 && `${formData.bathroomsCount} حمام`}
                {(formData.bedroomsCount > 0 || formData.bathroomsCount > 0) && formData.livingRoomsCount > 0 && ' • '}
                {formData.livingRoomsCount > 0 && `${formData.livingRoomsCount} غرفة معيشة`}
                {getTotalRooms() > formData.bedroomsCount + formData.bathroomsCount + formData.livingRoomsCount && formData.kitchensCount > 0 && ' • '}
                {formData.kitchensCount > 0 && `${formData.kitchensCount} مطبخ`}
                {getTotalRooms() > formData.bedroomsCount + formData.bathroomsCount + formData.livingRoomsCount + formData.kitchensCount && formData.balconiesCount > 0 && ' • '}
                {formData.balconiesCount > 0 && `${formData.balconiesCount} شرفة`}
              </p>
            </div>
          )}
        </div>

        {formData.areaSquareMeters === 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  يرجى إدخال المساحة الإجمالية للتصميم للمتابعة
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomsStep