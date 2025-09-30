import React, { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'

// مكون الخريطة لتحديد الموقع
interface MapComponentProps {
  latitude: string
  longitude: string
  onLocationSelect: (lat: string, lng: string, address: string) => void
}

const MapComponent: React.FC<MapComponentProps> = ({ latitude, longitude, onLocationSelect }) => {
  const [mapError, setMapError] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [mapMode, setMapMode] = useState<'interactive' | 'osm' | 'bing'>('interactive')
  const [selectedMarker, setSelectedMarker] = useState<{lat: number, lng: number} | null>(null)
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: 24.7136, lng: 46.6753 }) // الرياض كافتراضي

  // تحديد الموقع عند تحميل المكون
  useEffect(() => {
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      setMapCenter({ lat, lng })
      setSelectedMarker({ lat, lng })
    } else {
      // تأكد من وجود موقع افتراضي
      setMapCenter({ lat: 24.7136, lng: 46.6753 })
      if (!selectedMarker) {
        setSelectedMarker({ lat: 24.7136, lng: 46.6753 })
      }
    }
  }, [latitude, longitude, selectedMarker])

  // الحصول على موقع المستخدم
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          const newCenter = { lat, lng }
          setMapCenter(newCenter)
          setSelectedMarker(newCenter)
          onLocationSelect(lat.toString(), lng.toString(), `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          setIsLoadingLocation(false)
          setMapError(false)
        },
        (error) => {
          console.error('خطأ في الحصول على الموقع:', error)
          setMapError(true)
          setIsLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setMapError(true)
    }
  }

  // معالجة النقر على الخريطة التفاعلية
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // حساب الإحداثيات بناءً على موقع النقر
    const mapWidth = rect.width
    const mapHeight = rect.height
    
    // نطاق الخريطة (حوالي 0.02 درجة في كل اتجاه)
    const latRange = 0.02
    const lngRange = 0.02
    
    const clickedLat = mapCenter.lat + (latRange / 2) - (y / mapHeight) * latRange
    const clickedLng = mapCenter.lng - (lngRange / 2) + (x / mapWidth) * lngRange
    
    const newMarker = { lat: clickedLat, lng: clickedLng }
    setSelectedMarker(newMarker)
    onLocationSelect(clickedLat.toString(), clickedLng.toString(), `${clickedLat.toFixed(6)}, ${clickedLng.toFixed(6)}`)
  }

  // إنشاء رابط OpenStreetMap
  const getOSMUrl = () => {
    const lat = mapCenter.lat
    const lng = mapCenter.lng
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik${selectedMarker ? `&marker=${selectedMarker.lat},${selectedMarker.lng}` : ''}`
  }

  // إنشاء رابط Bing Maps
  const getBingMapsUrl = () => {
    const lat = mapCenter.lat
    const lng = mapCenter.lng
    return `https://www.bing.com/maps/embed?h=300&w=500&cp=${lat}~${lng}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`
  }

  // فتح الخريطة في نافذة جديدة
  const openInMaps = () => {
    const lat = selectedMarker?.lat || mapCenter.lat
    const lng = selectedMarker?.lng || mapCenter.lng
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15#map=15/${lat}/${lng}`
    window.open(url, '_blank')
  }

  // إعادة تعيين مركز الخريطة
  const resetMapCenter = () => {
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      setMapCenter({ lat, lng })
      setSelectedMarker({ lat, lng })
    } else {
      // الرياض كموقع افتراضي
      setMapCenter({ lat: 24.7136, lng: 46.6753 })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">تحديد موقع البرج</Label>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={getUserLocation}
            disabled={isLoadingLocation}
            className="flex items-center gap-2"
          >
            {isLoadingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            موقعي الحالي
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={resetMapCenter}
            className="flex items-center gap-2"
            title="إعادة تعيين الخريطة"
          >
            إعادة تعيين
          </Button>
          
          {/* زر تبديل نوع الخريطة */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMapMode('interactive')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                mapMode === 'interactive' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="خريطة تفاعلية للنقر"
            >
              تفاعلية
            </button>
            <button
              type="button"
              onClick={() => setMapMode('osm')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                mapMode === 'osm' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="خريطة مفتوحة المصدر"
            >
              OSM
            </button>
            <button
              type="button"
              onClick={() => setMapMode('bing')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                mapMode === 'bing' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="خرائط بينغ"
            >
              Bing
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">خط العرض</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onLocationSelect(e.target.value, longitude, '')}
            placeholder="24.7136"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="longitude">خط الطول</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onLocationSelect(latitude, e.target.value, '')}
            placeholder="46.6753"
            className="mt-1"
          />
        </div>
      </div>
      
      {/* عرض الخريطة التفاعلية - تظهر دائماً */}
      <div className="mt-4">
        <div className="relative">
          {mapMode === 'interactive' ? (
            /* خريطة تفاعلية مخصصة */
            <div 
              className="w-full h-64 border-2 border-blue-300 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 cursor-crosshair relative"
              onClick={handleMapClick}
              title="انقر لاختيار الموقع"
            >
              {/* شبكة الخريطة */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`h-${i}`} className="absolute h-px bg-gray-400" style={{ top: `${i * 5}%`, left: 0, right: 0 }} />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`v-${i}`} className="absolute w-px bg-gray-400" style={{ left: `${i * 5}%`, top: 0, bottom: 0 }} />
                ))}
              </div>
              
              {/* علامة الموقع المختار */}
              {selectedMarker && (
                <div 
                  className="absolute w-6 h-6 -ml-3 -mt-6 pointer-events-none z-10"
                  style={{
                    left: `${((selectedMarker.lng - mapCenter.lng + 0.01) / 0.02) * 100}%`,
                    top: `${(1 - (selectedMarker.lat - mapCenter.lat + 0.01) / 0.02) * 100}%`
                  }}
                >
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
              
              {/* محور الإحداثيات */}
              <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
                شمال: {(mapCenter.lat + 0.01).toFixed(4)}
              </div>
              <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
                جنوب: {(mapCenter.lat - 0.01).toFixed(4)}
              </div>
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
                شرق: {(mapCenter.lng + 0.01).toFixed(4)}
              </div>
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
                غرب: {(mapCenter.lng - 0.01).toFixed(4)}
              </div>
              
              {/* إرشادات الاستخدام */}
              {!selectedMarker && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="bg-blue-600 bg-opacity-80 text-white text-sm px-3 py-2 rounded-lg text-center">
                    <MapPin className="w-5 h-5 mx-auto mb-1" />
                    <div>انقر لاختيار الموقع</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* خرائط iframe العادية */
            <div className="w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={mapMode === 'osm' ? getOSMUrl() : getBingMapsUrl()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`خريطة ${mapMode === 'osm' ? 'مفتوحة المصدر' : 'بينغ'}`}
                onError={() => {
                  console.error('خطأ في تحميل الخريطة:', mapMode)
                  setMapError(true)
                }}
                onLoad={() => setMapError(false)}
              />
            </div>
          )}
            
            {/* زر فتح في نافذة جديدة */}
            <button
              type="button"
              onClick={openInMaps}
              className="absolute top-2 right-2 bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors border"
              title="فتح في OpenStreetMap"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            
          {/* معلومات الإحداثيات */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {selectedMarker ? 
              `${selectedMarker.lat.toFixed(6)}, ${selectedMarker.lng.toFixed(6)}` : 
              `${mapCenter.lat.toFixed(6)}, ${mapCenter.lng.toFixed(6)}`
            }
          </div>
          </div>
          
        {/* إرشادات */}
        <div className="mt-2 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
          {mapMode === 'interactive' ? (
            <div>
              <p className="flex items-center gap-1 mb-1 text-blue-700 font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                خريطة تفاعلية: انقر في أي مكان لاختيار الموقع
              </p>
              <p className="text-green-600">
                ✓ يمكنك النقر في أي مكان على الخريطة لتحديد الموقع بدقة
              </p>
            </div>
          ) : (
            <p className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              يمكنك فتح الخريطة في تطبيق منفصل أو استخدام الخريطة التفاعلية
            </p>
          )}
          <p className="text-green-600 font-medium mt-1">
            🆓 جميع الخرائط مجانية بالكامل!
          </p>
        </div>
      </div>
      
      {/* رسائل الخطأ */}
      {mapError && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">تعذر تحميل الخريطة</p>
              <p className="text-xs mt-1">يمكنك إدخال الإحداثيات يدوياً أو تجربة الحصول على موقعك الحالي</p>
            </div>
          </div>
        </div>
      )}
      
      {/* معلومات مفيدة - تظهر دائماً */}
      <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">طرق تحديد الموقع:</p>
            <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
              <li>استخدم الخريطة التفاعلية وانقر على الموقع المطلوب</li>
              <li>أو استخدم زر "موقعي الحالي" للحصول على إحداثيات GPS</li>
              <li>أو أدخل الإحداثيات يدوياً (مثال: الرياض 24.7136, 46.6753)</li>
              <li>جرب أنواع الخرائط المختلفة - كلها مجانية!</li>
            </ul>
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <p className="font-medium text-xs">ملاحظة:</p>
              <p className="text-xs">الخريطة تبدأ بموقع افتراضي (الرياض). استخدم أي طريقة من الطرق المذكورة أعلاه لتحديد الموقع الصحيح.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapComponent