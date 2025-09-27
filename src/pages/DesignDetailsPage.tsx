import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2, 
  Bed, 
  Bath, 
  Square, 
  Settings,
  Star,
  Home,
  ChevronLeft,
  ChevronRight,
  Play,
  Calendar,
  Clock,
  Eye
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useLanguage } from '../hooks/useLanguage'
import { RealEstateAPI } from '../services/api'
import type { UnitDesignDetailDto } from '../types/api'

const DesignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  
  const [design, setDesign] = useState<UnitDesignDetailDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const loadDesignDetails = useCallback(async () => {
    if (!id) {
      console.log('No design ID provided')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log('Loading design details for ID:', id)
      
      const response = await RealEstateAPI.unitDesign.getById(Number(id))
      console.log('Design details response:', response)
      
      if (response.data && response.data.success && response.data.data) {
        setDesign(response.data.data)
        console.log('Design loaded successfully:', response.data.data)
      } else {
        console.error('No data in response:', response)
        setError('فشل في تحميل بيانات التصميم')
      }
    } catch (err) {
      console.error('Error loading design details:', err)
      setError('حدث خطأ أثناء تحميل بيانات التصميم')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      loadDesignDetails()
    }
  }, [id, loadDesignDetails])

  // تسجيل حالة البيانات
  console.log('DesignDetailsPage render - isLoading:', isLoading, 'error:', error, 'design:', design)

  const handleBack = () => {
    navigate('/designs')
  }

  const handleEdit = () => {
    navigate(`/designs/edit/${id}`)
  }

  const handleCopy = () => {
    navigate(`/designs/copy/${id}`)
  }

  const handleDelete = async () => {
    if (!design || !confirm(t('deleteDesignConfirm') || 'Are you sure?')) return
    
    try {
      await RealEstateAPI.unitDesign.delete(design.id)
      navigate('/designs')
    } catch (error) {
      console.error('Error deleting design:', error)
    }
  }

  const getCategoryColor = (category: number) => {
    switch (category) {
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-purple-100 text-purple-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-green-100 text-green-800'
      case 5: return 'bg-orange-100 text-orange-800'
      case 6: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMaintenanceTypeLabel = (maintenanceTypeName: string | null) => {
    return maintenanceTypeName || (t('maintenance_not_specified') || 'غير محدد')
  }

  const getGasTypeLabel = (gasTypeName: string | null) => {
    return gasTypeName || (t('gas_not_specified') || 'غير محدد')
  }

  const nextImage = () => {
    if (design?.images && design.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % design.images!.length)
    }
  }

  const prevImage = () => {
    if (design?.images && design.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + design.images!.length) % design.images!.length)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('error') || 'خطأ'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBack}>
            {t('back') || 'العودة'}
          </Button>
        </div>
      </div>
    )
  }

  if (!design) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('back') || 'العودة'}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'ar' ? (design.arabicName || design.englishName) : (design.englishName || design.arabicName)}
                </h1>
                <p className="text-gray-600">
                  {t('designDetails') || 'تفاصيل التصميم'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                {t('edit') || 'تعديل'}
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                {t('copy') || 'نسخ'}
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete') || 'حذف'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* معرض الصور والفيديوهات */}
          <div className="lg:col-span-2 space-y-6">
            {/* معرض الصور */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {t('imageGallery') || 'معرض الصور'}
                </h3>
              </div>
              
              {/* الصورة الرئيسية */}
              <div className="relative h-96">
                {design.images && design.images.length > 0 ? (
                  <img
                    src={design.images[currentImageIndex].imageUrl}
                    alt={language === 'ar' 
                      ? design.images[currentImageIndex].arabicTitle || design.arabicName 
                      : design.images[currentImageIndex].englishTitle || design.englishName
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                    <Square className="w-24 h-24" />
                  </div>
                )}
                
                {/* أزرار التنقل */}
                {design.images && design.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* مؤشر الصور */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {design.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {/* عداد الصور */}
                {design.images && design.images.length > 0 && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {design.images.length}
                  </div>
                )}
              </div>
              
              {/* عنوان ووصف الصورة الحالية */}
              {design.images && design.images.length > 0 && design.images[currentImageIndex] && 
               (design.images[currentImageIndex].arabicTitle || design.images[currentImageIndex].englishTitle || 
                design.images[currentImageIndex].arabicDescription || design.images[currentImageIndex].englishDescription) && (
                <div className="p-4 bg-gray-50">
                  {(design.images[currentImageIndex].arabicTitle || design.images[currentImageIndex].englishTitle) && (
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {language === 'ar' 
                        ? design.images[currentImageIndex].arabicTitle 
                        : design.images[currentImageIndex].englishTitle
                      }
                    </h4>
                  )}
                  {(design.images[currentImageIndex].arabicDescription || design.images[currentImageIndex].englishDescription) && (
                    <p className="text-gray-600 text-sm">
                      {language === 'ar' 
                        ? design.images[currentImageIndex].arabicDescription 
                        : design.images[currentImageIndex].englishDescription
                      }
                    </p>
                  )}
                </div>
              )}
              
              {/* صور مصغرة */}
              {design.images && design.images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {design.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.imageUrl}
                          alt={language === 'ar' ? image.arabicTitle || `صورة ${index + 1}` : image.englishTitle || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* معرض الفيديوهات */}
            {design.videos && design.videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    {t('videoGallery') || 'معرض الفيديو'}
                  </h3>
                </div>
                
                <div className="p-4 space-y-4">
                  {design.videos.map((video) => (
                    <div key={video.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-black">
                        <video
                          src={video.videoUrl}
                          controls
                          className="w-full h-full"
                          title={language === 'ar' ? video.arabicTitle : video.englishTitle}
                          preload="metadata"
                        >
                          متصفحك لا يدعم عرض الفيديو
                        </video>
                      </div>
                      {(video.arabicTitle || video.englishTitle || video.arabicDescription || video.englishDescription) && (
                        <div className="p-3 bg-gray-50">
                          {(video.arabicTitle || video.englishTitle) && (
                            <h4 className="font-medium text-gray-900 mb-1">
                              {language === 'ar' ? video.arabicTitle : video.englishTitle}
                            </h4>
                          )}
                          {(video.arabicDescription || video.englishDescription) && (
                            <p className="text-gray-600 text-sm">
                              {language === 'ar' ? video.arabicDescription : video.englishDescription}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {video.durationSeconds && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.floor(video.durationSeconds / 60)}:{(video.durationSeconds % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                            {video.fileSizeFormatted && (
                              <span className="flex items-center gap-1">
                                📁 {video.fileSizeFormatted}
                              </span>
                            )}
                            {video.videoTypeName && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {video.videoTypeName}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* وصف التصميم */}
            {(design.arabicDescription || design.englishDescription) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('description') || 'الوصف'}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {language === 'ar' 
                    ? (design.arabicDescription || design.englishDescription || t('noDescriptionAvailable') || 'لا يوجد وصف متاح')
                    : (design.englishDescription || design.arabicDescription || t('noDescriptionAvailable') || 'No description available')
                  }
                </p>
              </div>
            )}
          </div>

          {/* معلومات التصميم */}
          <div className="space-y-6">
            {/* معلومات أساسية */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('basicInfo') || 'المعلومات الأساسية'}
                </h2>
                <Badge className={getCategoryColor(design.category)}>
                  {design.categoryName || t(`category_${design.category}`) || 'فئة التصميم'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Square className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">{t('area') || 'المساحة'}</div>
                    <div className="font-medium">{design.areaSquareMeters} {t('sqm') || 'م²'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Bed className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">{t('bedrooms') || 'غرف النوم'}</div>
                    <div className="font-medium">{design.bedroomsCount || 0}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Bath className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">{t('bathrooms') || 'دورات المياه'}</div>
                    <div className="font-medium">{design.bathroomsCount || 0}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">{t('livingRooms') || 'غرف المعيشة'}</div>
                    <div className="font-medium">{design.livingRoomsCount || 0}</div>
                  </div>
                </div>

                {design.kitchensCount > 0 && (
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">{t('kitchens') || 'المطابخ'}</div>
                      <div className="font-medium">{design.kitchensCount}</div>
                    </div>
                  </div>
                )}

                {design.balconiesCount > 0 && (
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">{t('balconies') || 'الشرفات'}</div>
                      <div className="font-medium">{design.balconiesCount}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* معلومات السعر */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('priceInfo') || 'معلومات السعر'}
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('originalPrice') || 'السعر الأصلي'}</span>
                  <span className="font-medium">{design.originalRentPrice?.toLocaleString()} {t('currency') || 'درهم'}</span>
                </div>
                
                {design.discountPercentage && design.discountPercentage > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('discount') || 'الخصم'}</span>
                    <span className="text-red-600 font-medium">{design.discountPercentage}%</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-lg font-semibold text-gray-900">{t('finalPrice') || 'السعر النهائي'}</span>
                  <span className="text-2xl font-bold text-green-600">
                    {design.finalRentPrice?.toLocaleString() || design.originalRentPrice?.toLocaleString()} {t('currency') || 'درهم'}
                  </span>
                </div>

                {design.freePeriodDays > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('freePeriod') || 'الفترة المجانية'}</span>
                    <span className="font-medium text-green-600">{design.freePeriodDays} {t('days') || 'أيام'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* معلومات المصاريف الإضافية */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('additionalExpenses') || 'المصاريف الإضافية'}
              </h2>
              
              <div className="space-y-3 text-sm">
                {design.officeCommission > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('officeCommission') || 'عمولة المكتب'}</span>
                    <span className="font-medium">{design.officeCommission.toLocaleString()} {t('currency') || 'درهم'}</span>
                  </div>
                )}
                
                {design.municipalityFees > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('municipalityFees') || 'رسوم البلدية'}</span>
                    <span className="font-medium">{design.municipalityFees.toLocaleString()} {t('currency') || 'درهم'}</span>
                  </div>
                )}
                
                {design.electricityFees > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('electricityFees') || 'رسوم الكهرباء'}</span>
                    <span className="font-medium">{design.electricityFees.toLocaleString()} {t('currency') || 'درهم'}</span>
                  </div>
                )}
                
                {design.proFees > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('proFees') || 'الرسوم الاحترافية'}</span>
                    <span className="font-medium">{design.proFees.toLocaleString()} {t('currency') || 'درهم'}</span>
                  </div>
                )}
                
                {design.insuranceAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('insuranceAmount') || 'قيمة التأمين'}</span>
                    <span className="font-medium">{design.insuranceAmount.toLocaleString()} {t('currency') || 'درهم'}</span>
                  </div>
                )}

                {design.maintenanceAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('maintenanceAmount') || 'مبلغ الصيانة'}</span>
                    <span className="font-medium">{design.maintenanceAmount.toLocaleString()} {t('currency') || 'درهم'}</span>
                  </div>
                )}

                {design.additionalExpensesAmount > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">{t('additionalExpenses') || 'مصاريف إضافية'}</span>
                      <span className="font-medium">{design.additionalExpensesAmount.toLocaleString()} {t('currency') || 'درهم'}</span>
                    </div>
                    {design.additionalExpensesDescription && (
                      <p className="text-xs text-gray-500">{design.additionalExpensesDescription}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* معلومات الصيانة والغاز */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('maintenanceInfo') || 'معلومات الصيانة والغاز'}
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('maintenanceType') || 'نوع الصيانة'}</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {getMaintenanceTypeLabel(design.maintenanceTypeName || null)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('gasType') || 'نوع الغاز'}</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {getGasTypeLabel(design.gasTypeName || null)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* خطط الدفع */}
            {design.paymentPlans && design.paymentPlans.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('paymentPlans') || 'خطط الدفع'}
                </h2>
                
                <div className="space-y-3">
                  {design.paymentPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-2">
                        {language === 'ar' ? plan.arabicName : plan.englishName}
                      </div>
                      {(plan.arabicDescription || plan.englishDescription) && (
                        <p className="text-sm text-gray-600 mb-2">
                          {language === 'ar' ? plan.arabicDescription : plan.englishDescription}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>{t('numberOfPayments') || 'عدد الدفعات'}: {plan.numberOfPayments}</div>
                        <div>{t('discount') || 'الخصم'}: {plan.discountPercentage}%</div>
                        <div className="col-span-2 font-medium text-green-600">
                          {t('finalPrice') || 'السعر النهائي'}: {plan.finalPrice.toLocaleString()} {t('currency') || 'درهم'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الميزات */}
            {design.features && design.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('features') || 'الميزات'}
                </h2>
                
                <div className="space-y-3">
                  {design.features.map((feature, index) => (
                    <div key={feature.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {(() => {
                            const f = feature as unknown as Record<string, unknown>
                            return language === 'ar' ? (f.arabicName as string || `ميزة ${f.towerFeatureId}`) : (f.englishName as string || `Feature ${f.towerFeatureId}`)
                          })()}
                        </div>
                        {(() => {
                          const f = feature as unknown as Record<string, unknown>
                          return (f.arabicDescription || f.englishDescription) ? (
                            <div className="text-sm text-gray-600 mt-1">
                              {language === 'ar' ? (f.arabicDescription as string) : (f.englishDescription as string)}
                            </div>
                          ) : null
                        })()}
                        <div className="text-xs text-gray-500 mt-1">
                          {t('featureId') || 'معرف الميزة'}: {String((feature as unknown as Record<string, unknown>).towerFeatureId)}
                        </div>
                      </div>
                      {(feature as unknown as Record<string, unknown>).iconUrl ? (
                        <img src={String((feature as unknown as Record<string, unknown>).iconUrl)} alt="Feature icon" className="w-8 h-8 rounded" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الأجهزة */}
            {design.appliances && design.appliances.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('appliances') || 'الأجهزة'}
                </h2>
                
                <div className="space-y-3">
                  {design.appliances.map((appliance, index) => (
                    <div key={appliance.id || index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Settings className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {(() => {
                                const a = appliance as unknown as Record<string, unknown>
                                return language === 'ar' ? (a.arabicName as string || `جهاز ${a.applianceId}`) : (a.englishName as string || `Appliance ${a.applianceId}`)
                              })()}
                            </div>
                            {(() => {
                              const a = appliance as unknown as Record<string, unknown>
                              return (a.arabicDescription || a.englishDescription) ? (
                                <div className="text-sm text-gray-600 mt-1">
                                  {language === 'ar' ? (a.arabicDescription as string) : (a.englishDescription as string)}
                                </div>
                              ) : null
                            })()}
                          </div>
                          {(appliance as unknown as Record<string, unknown>).iconUrl ? (
                            <img src={String((appliance as unknown as Record<string, unknown>).iconUrl)} alt="Appliance icon" className="w-8 h-8 rounded" />
                          ) : null}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-blue-600">×{appliance.quantity}</span>
                            {appliance.isOptional && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {t('optional') || 'اختياري'}
                              </span>
                            )}
                          </div>
                          {appliance.additionalCost && appliance.additionalCost > 0 && (
                            <div className="text-sm text-green-600 font-medium mt-1">
                              +{appliance.additionalCost.toLocaleString()} {t('currency') || 'درهم'}
                            </div>
                          )}
                        </div>
                      </div>
                      {appliance.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{t('notes') || 'ملاحظات'}: </span>
                            {appliance.notes}
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {t('applianceId') || 'معرف الجهاز'}: {String((appliance as unknown as Record<string, unknown>).applianceId)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* حالة النشاط */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('status') || 'الحالة'}</span>
                <Badge className={design.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {design.isActive ? (t('active') || 'نشط') : (t('inactive') || 'غير نشط')}
                </Badge>
              </div>

              {/* إحصائيات سريعة */}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{t('images') || 'الصور'}</span>
                    <span className="font-medium">{design.images?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{t('videos') || 'الفيديوهات'}</span>
                    <span className="font-medium">{design.videos?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{t('features') || 'الميزات'}</span>
                    <span className="font-medium">{design.features?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{t('appliances') || 'الأجهزة والأدوات'}</span>
                    <span className="font-medium">{design.appliances?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* تاريخ الإنشاء والتحديث */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>تم الإنشاء: {new Date(design.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
                {design.lastModifiedAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>آخر تحديث: {new Date(design.lastModifiedAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignDetailsPage