import React, { useState, useEffect } from 'react'
import { MapPin, Target, Navigation } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Label } from './Label'

interface SimpleMapComponentProps {
  latitude: string
  longitude: string
  onLocationSelect: (lat: string, lng: string, address: string) => void
}

const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({ 
  latitude, 
  longitude, 
  onLocationSelect 
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null)

  // تحديث الإحداثيات عند التغيير
  useEffect(() => {
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      setSelectedCoords({ lat: parseFloat(latitude), lng: parseFloat(longitude) })
    }
  }, [latitude, longitude])

  // الحصول على موقع المستخدم
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          onLocationSelect(lat.toString(), lng.toString(), `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          setSelectedCoords({ lat, lng })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error('خطأ في الحصول على الموقع:', error)
          setIsLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }
  }

  // استخدام القيم الافتراضية (الرياض)
  const useDefaultLocation = () => {
    const defaultLat = '24.7136'
    const defaultLng = '46.6753'
    onLocationSelect(defaultLat, defaultLng, 'دبي،  الامارات العربية المتحدة ')
    setSelectedCoords({ lat: 24.7136, lng: 46.6753 })
  }

  // معالجة النقر على الخريطة التفاعلية
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // حساب الإحداثيات النسبية (محاكاة بسيطة)
    const baseLatitude = selectedCoords?.lat || 24.7136
    const baseLongitude = selectedCoords?.lng || 46.6753
    
    const mapWidth = rect.width
    const mapHeight = rect.height
    
    // نطاق الخريطة (±0.01 درجة)
    const latRange = 0.02
    const lngRange = 0.02
    
    const clickedLat = baseLatitude + (latRange / 2) - (y / mapHeight) * latRange
    const clickedLng = baseLongitude - (lngRange / 2) + (x / mapWidth) * lngRange
    
    onLocationSelect(clickedLat.toString(), clickedLng.toString(), `${clickedLat.toFixed(6)}, ${clickedLng.toFixed(6)}`)
    setSelectedCoords({ lat: clickedLat, lng: clickedLng })
  }

  // فتح الخريطة في Google Maps
  const openInGoogleMaps = () => {
    const lat = selectedCoords?.lat || parseFloat(latitude) || 24.7136
    const lng = selectedCoords?.lng || parseFloat(longitude) || 46.6753
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, '_blank')
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
              <Navigation className="w-4 h-4" />
            )}
            موقعي الحالي
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={useDefaultLocation}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            الرياض
          </Button>
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
      
      {/* خريطة تفاعلية بسيطة */}
      <div className="mt-4">
        <div className="relative">
          <div 
            className="w-full h-64 border-2 border-blue-300 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 cursor-crosshair relative"
            onClick={handleMapClick}
            title="انقر لاختيار الموقع"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            {/* شبكة الخريطة */}
            <div className="absolute inset-0">
              {/* خطوط الطول */}
              {Array.from({ length: 11 }).map((_, i) => (
                <div 
                  key={`lng-${i}`} 
                  className="absolute h-full w-px bg-blue-300 opacity-30" 
                  style={{ left: `${i * 10}%` }} 
                />
              ))}
              {/* خطوط العرض */}
              {Array.from({ length: 11 }).map((_, i) => (
                <div 
                  key={`lat-${i}`} 
                  className="absolute w-full h-px bg-blue-300 opacity-30" 
                  style={{ top: `${i * 10}%` }} 
                />
              ))}
            </div>
            
            {/* علامة الموقع المختار */}
            {selectedCoords && (
              <div 
                className="absolute w-8 h-8 -ml-4 -mt-8 pointer-events-none z-20 animate-bounce"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                {/* ظل الموقع */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
              </div>
            )}
            
            {/* معلومات الإحداثيات في الزوايا */}
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 shadow">
              {selectedCoords ? `${(selectedCoords.lat + 0.01).toFixed(4)}° ش` : '---° ش'}
            </div>
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 shadow">
              {selectedCoords ? `${(selectedCoords.lat - 0.01).toFixed(4)}° ش` : '---° ش'}
            </div>
            <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 shadow">
              {selectedCoords ? `${(selectedCoords.lng + 0.01).toFixed(4)}° ق` : '---° ق'}
            </div>
            <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 shadow">
              {selectedCoords ? `${(selectedCoords.lng - 0.01).toFixed(4)}° ق` : '---° ق'}
            </div>
            
            {/* إرشادات الاستخدام */}
            {!selectedCoords && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="bg-blue-600 bg-opacity-90 text-white text-sm px-4 py-3 rounded-lg text-center shadow-lg">
                  <MapPin className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">انقر لاختيار الموقع</div>
                  <div className="text-xs mt-1 opacity-90">أو استخدم الأزرار أعلاه</div>
                </div>
              </div>
            )}
            
            {/* زر فتح في خرائط جوجل */}
            <button
              type="button"
              onClick={openInGoogleMaps}
              className="absolute top-3 right-3 bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors border z-10"
              title="فتح في خرائط جوجل"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
          
          {/* معلومات الإحداثيات الحالية */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-3 py-1 rounded-full">
            {selectedCoords ? 
              `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}` : 
              'لم يتم تحديد موقع'
            }
          </div>
        </div>
        
        {/* إرشادات وملاحظات */}
        <div className="mt-3 space-y-2">
          {/* حالة الموقع */}
          <div className={`text-sm p-3 rounded-lg border ${
            selectedCoords 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              {selectedCoords ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">تم تحديد الموقع بنجاح</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">يرجى تحديد موقع البرج</span>
                </>
              )}
            </div>
            {selectedCoords && (
              <div className="mt-2 text-xs">
                <p>الإحداثيات: {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}</p>
                <p className="text-green-600 mt-1">✓ يمكنك المتابعة للخطوة التالية</p>
              </div>
            )}
          </div>

          {/* طرق التحديد */}
          <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="font-medium mb-2 text-gray-800">طرق تحديد الموقع:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>🖱️ انقر في أي مكان على الخريطة</li>
              <li>📍 استخدم زر "موقعي الحالي" للحصول على GPS</li>
              <li>🏢 استخدم زر "الرياض" للموقع الافتراضي</li>
              <li>✏️ أدخل الإحداثيات يدوياً في الحقول</li>
              <li>🗺️ افتح في خرائط جوجل للتفاصيل</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleMapComponent