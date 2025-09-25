import React, { useState } from 'react'
import { Button } from '../Button'
import { useLanguage } from '../../../hooks/useLanguage'
import type { DesignFormData, TowerFeatureListDto, ApplianceListDto } from '../../../types/api'

interface ReviewStepProps {
  formData: DesignFormData
  features: TowerFeatureListDto[]
  appliances: ApplianceListDto[]
  onSubmit: (data: DesignFormData) => Promise<void>
  isSubmitting: boolean
}

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  formData, 
  features, 
  appliances, 
  onSubmit,
  isSubmitting 
}) => {
  const { language } = useLanguage()
  const [showAllImages, setShowAllImages] = useState(false)

  // Helper functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatArea = (area: number) => {
    return `${area} متر مربع`
  }

  const getCategoryName = (category: string | number) => {
    const categories = {
      VILLA: 'فيلا',
      APARTMENT: 'شقة', 
      TOWNHOUSE: 'تاون هاوس',
      DUPLEX: 'دوبلكس',
      PENTHOUSE: 'بنت هاوس',
      STUDIO: 'استوديو',
      0: 'فيلا',
      1: 'شقة',
      2: 'تاون هاوس',
      3: 'دوبلكس',
      4: 'بنت هاوس',
      5: 'استوديو'
    }
    return categories[category as keyof typeof categories] || category
  }

  const getTargetMarketName = (targetMarket: string | number) => {
    const markets = {
      FAMILIES: 'العائلات',
      BACHELORS: 'العزاب',
      EXECUTIVES: 'التنفيذيين',
      STUDENTS: 'الطلاب',
      SENIORS: 'كبار السن',
      MIXED: 'مختلط',
      0: 'العائلات',
      1: 'العزاب',
      2: 'التنفيذيين',
      3: 'الطلاب',
      4: 'كبار السن',
      5: 'مختلط'
    }
    return markets[targetMarket as keyof typeof markets] || targetMarket
  }

  const getMaintenanceTypeName = (type: string | number) => {
    const types = {
      INCLUDED: 'مشمولة',
      SEPARATE: 'منفصلة',
      SHARED: 'مشتركة',
      0: 'مشمولة',
      1: 'منفصلة',
      2: 'مشتركة'
    }
    return types[type as keyof typeof types] || type
  }

  const getGasTypeName = (type: string | number) => {
    const types = {
      CENTRAL: 'مركزي',
      INDIVIDUAL: 'فردي',
      NONE: 'لا يوجد',
      0: 'مركزي',
      1: 'فردي',
      2: 'لا يوجد'
    }
    return types[type as keyof typeof types] || type
  }

  // Calculate totals
  const calculateFinalPrice = () => {
    const discountAmount = (formData.originalRentPrice * formData.discountPercentage) / 100
    return formData.originalRentPrice - discountAmount
  }

  const calculateTotalExpenses = () => {
    return formData.municipalityFees + 
           formData.electricityFees + 
           formData.proFees + 
           formData.insuranceAmount + 
           formData.maintenanceAmount + 
           formData.additionalExpensesAmount
  }

  const getSelectedFeaturesInfo = () => {
    return formData.selectedFeatures.map(featureId => {
      const feature = features.find(f => f.id === featureId)
      return feature ? {
        id: featureId,
        name: language === 'ar' ? feature.arabicName : feature.englishName
      } : null
    }).filter(Boolean)
  }

  const getSelectedAppliancesInfo = () => {
    return formData.selectedAppliances.map(selected => {
      const appliance = appliances.find(a => a.id === selected.id)
      return appliance ? {
        ...selected,
        name: language === 'ar' ? appliance.arabicName : appliance.englishName
      } : null
    }).filter(Boolean)
  }

  const getTotalAppliances = () => {
    return formData.selectedAppliances.reduce((sum, a) => sum + a.quantity, 0)
  }

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          مراجعة التصميم قبل الحفظ
        </h3>
        <p className="text-gray-600">
          راجع جميع البيانات المدخلة وتأكد من صحتها قبل إنشاء التصميم
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            المعلومات الأساسية
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية</label>
              <div className="text-gray-900 font-medium">{formData.arabicName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
              <div className="text-gray-900 font-medium">{formData.englishName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف بالعربية</label>
              <div className="text-gray-900">{formData.arabicDescription}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف بالإنجليزية</label>
              <div className="text-gray-900">{formData.englishDescription}</div>
            </div>
          </div>
        </div>

        {/* Category & Target Market */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            التصنيف والسوق المستهدف
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع التصميم</label>
              <div className="text-gray-900 font-medium">{getCategoryName(formData.category)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السوق المستهدف</label>
              <div className="text-gray-900 font-medium">{getTargetMarketName(formData.targetMarket)}</div>
            </div>
          </div>
        </div>

        {/* Area & Rooms */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📏</span>
            المساحة والغرف
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{formData.areaSquareMeters}</div>
              <div className="text-sm text-gray-600">متر مربع</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{formData.bedroomsCount}</div>
              <div className="text-sm text-gray-600">غرف نوم</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{formData.bathroomsCount}</div>
              <div className="text-sm text-gray-600">دورات مياه</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{formData.livingRoomsCount}</div>
              <div className="text-sm text-gray-600">غرف معيشة</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">{formData.kitchensCount}</div>
              <div className="text-sm text-gray-600">مطابخ</div>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded-lg">
              <div className="text-lg font-bold text-teal-600">{formData.balconiesCount}</div>
              <div className="text-sm text-gray-600">شرفات</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            معلومات التسعير
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأصلي</label>
              <div className="text-gray-900 font-bold text-lg">{formatPrice(formData.originalRentPrice)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الخصم</label>
              <div className="text-green-600 font-bold text-lg">{formData.discountPercentage}%</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفترة المجانية</label>
              <div className="text-blue-600 font-bold text-lg">{formData.freePeriodDays} يوم</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عمولة المكتب</label>
              <div className="text-purple-600 font-bold text-lg">{formatPrice(formData.officeCommission)}</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">السعر النهائي بعد الخصم</div>
              <div className="text-2xl font-bold text-green-600">{formatPrice(calculateFinalPrice())}</div>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            المصاريف والتكاليف
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{formatPrice(formData.municipalityFees)}</div>
              <div className="text-sm text-gray-600">رسوم البلدية</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">{formatPrice(formData.electricityFees)}</div>
              <div className="text-sm text-gray-600">رسوم الكهرباء</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{formatPrice(formData.proFees)}</div>
              <div className="text-sm text-gray-600">الرسوم المهنية</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{formatPrice(formData.insuranceAmount)}</div>
              <div className="text-sm text-gray-600">مبلغ التأمين</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">{formatPrice(formData.maintenanceAmount)}</div>
              <div className="text-sm text-gray-600">مبلغ الصيانة</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الصيانة</label>
              <div className="text-gray-900 font-medium">{getMaintenanceTypeName(formData.maintenanceType)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الغاز</label>
              <div className="text-gray-900 font-medium">{getGasTypeName(formData.gasType)}</div>
            </div>
          </div>

          {formData.additionalExpensesAmount > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">مصاريف إضافية</label>
              <div className="text-gray-900 font-medium">{formatPrice(formData.additionalExpensesAmount)}</div>
              {formData.additionalExpensesDescription && (
                <div className="text-sm text-gray-600 mt-1">{formData.additionalExpensesDescription}</div>
              )}
            </div>
          )}

          <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">إجمالي المصاريف</div>
              <div className="text-2xl font-bold text-orange-600">{formatPrice(calculateTotalExpenses())}</div>
            </div>
          </div>
        </div>

        {/* Features */}
        {formData.selectedFeatures.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              الميزات المختارة ({formData.selectedFeatures.length})
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {getSelectedFeaturesInfo().map((feature) => feature && (
                <div key={feature.id} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appliances */}
        {formData.selectedAppliances.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              الأدوات والأجهزة ({formData.selectedAppliances.length} نوع • {getTotalAppliances()} قطعة)
            </h4>
            
            <div className="space-y-3">
              {getSelectedAppliancesInfo().map((appliance) => appliance && (
                <div key={appliance.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-500">🔧</span>
                    <div>
                      <div className="font-medium text-gray-900">{appliance.name}</div>
                      {appliance.notes && (
                        <div className="text-sm text-gray-600">{appliance.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {appliance.quantity} قطعة
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Files */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📁</span>
            الملفات الإعلامية
          </h4>
          
          <div className="space-y-6">
            {/* Cover Image */}
            {formData.coverImage && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">صورة الغلاف الرئيسية</h5>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={formData.coverImage instanceof File ? URL.createObjectURL(formData.coverImage) : formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formData.coverImage instanceof File ? formData.coverImage.name : 'صورة موجودة'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.coverImage instanceof File ? getFileSize(formData.coverImage.size) : 'صورة محفوظة'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Images */}
            {formData.images && formData.images.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">الصور الإضافية ({formData.images.length})</h5>
                <div className={`grid gap-3 ${showAllImages ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-4 md:grid-cols-6'}`}>
                  {(showAllImages ? formData.images : formData.images.slice(0, 6)).map((image: File | string, index: number) => (
                    <div key={index} className="relative">
                      <div className="w-full h-20 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image instanceof File ? URL.createObjectURL(image) : image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {showAllImages && (
                        <div className="mt-1 text-xs text-gray-600 truncate">
                          {image instanceof File ? image.name : 'صورة موجودة'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {formData.images.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllImages(!showAllImages)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showAllImages ? 'إخفاء التفاصيل' : `عرض جميع الصور (${formData.images.length})`}
                  </button>
                )}
              </div>
            )}

            {/* Video */}
            {formData.video && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">الفيديو</h5>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formData.video instanceof File ? formData.video.name : 'فيديو موجود'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.video instanceof File ? getFileSize(formData.video.size) : 'فيديو محفوظ'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            📊 ملخص التصميم
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{formatPrice(calculateFinalPrice())}</div>
              <div className="text-sm text-gray-600">السعر النهائي</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{formatArea(formData.areaSquareMeters)}</div>
              <div className="text-sm text-gray-600">المساحة</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{formData.selectedFeatures.length}</div>
              <div className="text-sm text-gray-600">الميزات</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{getTotalAppliances()}</div>
              <div className="text-sm text-gray-600">الأدوات</div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="text-center space-y-6">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                🎉 التصميم جاهز للحفظ!
              </h4>
              <p className="text-gray-600">
                تمت مراجعة جميع البيانات. انقر على "إنشاء التصميم" لحفظ التصميم في النظام.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    إنشاء التصميم
                  </>
                )}
              </Button>
            </div>

            {isSubmitting && (
              <div className="text-sm text-gray-600">
                يرجى الانتظار، جاري حفظ التصميم في النظام...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewStep