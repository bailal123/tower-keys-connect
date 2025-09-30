// import React, { useState, useEffect } from 'react'
// import { Button } from '../components/ui/Button'
// import { Input } from '../components/ui/Input'
// import { Card } from '../components/ui/Card'
// import { Label } from '../components/ui/Label'
// import { useLanguage } from '../hooks/useLanguage'
// import { useNotifications } from '../hooks/useNotificationContext'
// import { RealEstateAPI } from '../services/api'
// import { useQuery } from '@tanstack/react-query'
// import { MapPin, Building2, Calendar, Image, Save, ArrowRight, User, Building, Settings } from 'lucide-react'
// import RealisticBuildingVisualization from '../components/building/RealisticBuildingVisualization'
// import ThreeDVisualization from '../components/building/ThreeDVisualization'
// import type { 
//   CreateTowerWithFloorsRequest,
//   CreateMultipleTowerBlocksRequest,
//   CreateMultipleUnitsRequest,
//   TowerBlockDto,
//   UnitDto,
//   UnitType,
//   UnitStatus
// } from '../types/api'
// import { FloorType } from '../types/api'

// // Types for building data
// export interface Block {
//   id: string
//   name: string
//   floors: Floor[]
// }

// export interface Floor {
//   id: string
//   number: string
//   units: Unit[]
// }

// export interface Unit {
//   id: string
//   number: string
// }

// export interface BuildingData {
//   name: string
//   blocks: Block[]
// }

// // نوع بيانات نموذج إنشاء البرج
// export interface TowerFormData {
//   arabicName: string
//   englishName: string
//   arabicDescription: string
//   englishDescription: string
//   address: string
//   latitude: string
//   longitude: string
//   constructionYear: string
//   mainImageUrl: string
//   countryId: number
//   cityId: number
//   areaId: number
//   isActive: boolean
  
//   // الحقول الجديدة
//   developerName: string
//   managementCompany: string
//   definitionStage: number
// }

// // مكون الخريطة لتحديد الموقع
// interface MapComponentProps {
//   latitude: string
//   longitude: string
//   onLocationSelect: (lat: string, lng: string, address: string) => void
// }

// const MapComponent: React.FC<MapComponentProps> = ({ latitude, longitude, onLocationSelect }) => {
//   const [mapError, setMapError] = useState(false)
//   const [isLoadingLocation, setIsLoadingLocation] = useState(false)
//   const [mapMode, setMapMode] = useState<'interactive' | 'osm' | 'bing'>('interactive')
//   const [selectedMarker, setSelectedMarker] = useState<{lat: number, lng: number} | null>(null)
//   const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: 24.7136, lng: 46.6753 }) // الرياض كافتراضي

//   // تحديد الموقع عند تحميل المكون
//   useEffect(() => {
//     if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
//       const lat = parseFloat(latitude)
//       const lng = parseFloat(longitude)
//       setMapCenter({ lat, lng })
//       setSelectedMarker({ lat, lng })
//     }
//   }, [latitude, longitude])

//   // الحصول على موقع المستخدم
//   const getUserLocation = () => {
//     if (navigator.geolocation) {
//       setIsLoadingLocation(true)
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude: lat, longitude: lng } = position.coords
//           const newCenter = { lat, lng }
//           setMapCenter(newCenter)
//           setSelectedMarker(newCenter)
//           onLocationSelect(lat.toString(), lng.toString(), `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
//           setIsLoadingLocation(false)
//           setMapError(false)
//         },
//         (error) => {
//           console.error('خطأ في الحصول على الموقع:', error)
//           setMapError(true)
//           setIsLoadingLocation(false)
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 60000
//         }
//       )
//     } else {
//       setMapError(true)
//     }
//   }

//   // معالجة النقر على الخريطة التفاعلية
//   const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
//     const rect = event.currentTarget.getBoundingClientRect()
//     const x = event.clientX - rect.left
//     const y = event.clientY - rect.top
    
//     // حساب الإحداثيات بناءً على موقع النقر
//     const mapWidth = rect.width
//     const mapHeight = rect.height
    
//     // نطاق الخريطة (حوالي 0.02 درجة في كل اتجاه)
//     const latRange = 0.02
//     const lngRange = 0.02
    
//     const clickedLat = mapCenter.lat + (latRange / 2) - (y / mapHeight) * latRange
//     const clickedLng = mapCenter.lng - (lngRange / 2) + (x / mapWidth) * lngRange
    
//     const newMarker = { lat: clickedLat, lng: clickedLng }
//     setSelectedMarker(newMarker)
//     onLocationSelect(clickedLat.toString(), clickedLng.toString(), `${clickedLat.toFixed(6)}, ${clickedLng.toFixed(6)}`)
//   }

//   // إنشاء رابط OpenStreetMap
//   const getOSMUrl = () => {
//     const lat = mapCenter.lat
//     const lng = mapCenter.lng
//     return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik${selectedMarker ? `&marker=${selectedMarker.lat},${selectedMarker.lng}` : ''}`
//   }

//   // إنشاء رابط Bing Maps
//   const getBingMapsUrl = () => {
//     const lat = mapCenter.lat
//     const lng = mapCenter.lng
//     return `https://www.bing.com/maps/embed?h=300&w=500&cp=${lat}~${lng}&lvl=15&typ=d&sty=r&src=SHELL&FORM=MBEDV8`
//   }

//   // فتح الخريطة في نافذة جديدة
//   const openInMaps = () => {
//     const lat = selectedMarker?.lat || mapCenter.lat
//     const lng = selectedMarker?.lng || mapCenter.lng
//     const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15#map=15/${lat}/${lng}`
//     window.open(url, '_blank')
//   }

//   // إعادة تعيين مركز الخريطع
//   const resetMapCenter = () => {
//     if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
//       const lat = parseFloat(latitude)
//       const lng = parseFloat(longitude)
//       setMapCenter({ lat, lng })
//       setSelectedMarker({ lat, lng })
//     } else {
//       // الرياض كموقع افتراضي
//       setMapCenter({ lat: 24.7136, lng: 46.6753 })
//     }
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <Label className="text-sm font-medium">تحديد موقع البرج</Label>
//         <div className="flex gap-2">
//           <Button 
//             type="button" 
//             variant="outline" 
//             size="sm" 
//             onClick={getUserLocation}
//             disabled={isLoadingLocation}
//             className="flex items-center gap-2"
//           >
//             {isLoadingLocation ? (
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//             ) : (
//               <MapPin className="w-4 h-4" />
//             )}
//             موقعي الحالي
//           </Button>
          
//           <Button 
//             type="button" 
//             variant="outline" 
//             size="sm" 
//             onClick={resetMapCenter}
//             className="flex items-center gap-2"
//             title="إعادة تعيين الخريطة"
//           >
//             إعادة تعيين
//           </Button>
          
//           {/* زر تبديل نوع الخريطة */}
//           <div className="flex bg-gray-100 rounded-lg p-1">
//             <button
//               type="button"
//               onClick={() => setMapMode('interactive')}
//               className={`px-2 py-1 rounded text-xs transition-colors ${
//                 mapMode === 'interactive' 
//                   ? 'bg-white text-blue-600 shadow-sm' 
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//               title="خريطة تفاعلية للنقر"
//             >
//               تفاعلية
//             </button>
//             <button
//               type="button"
//               onClick={() => setMapMode('osm')}
//               className={`px-2 py-1 rounded text-xs transition-colors ${
//                 mapMode === 'osm' 
//                   ? 'bg-white text-blue-600 shadow-sm' 
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//               title="خريطة مفتوحة المصدر"
//             >
//               OSM
//             </button>
//             <button
//               type="button"
//               onClick={() => setMapMode('bing')}
//               className={`px-2 py-1 rounded text-xs transition-colors ${
//                 mapMode === 'bing' 
//                   ? 'bg-white text-blue-600 shadow-sm' 
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//               title="خرائط بينغ"
//             >
//               Bing
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <Label htmlFor="latitude">خط العرض</Label>
//           <Input
//             id="latitude"
//             type="number"
//             step="any"
//             value={latitude}
//             onChange={(e) => onLocationSelect(e.target.value, longitude, '')}
//             placeholder="24.7136"
//             className="mt-1"
//           />
//         </div>
//         <div>
//           <Label htmlFor="longitude">خط الطول</Label>
//           <Input
//             id="longitude"
//             type="number"
//             step="any"
//             value={longitude}
//             onChange={(e) => onLocationSelect(latitude, e.target.value, '')}
//             placeholder="46.6753"
//             className="mt-1"
//           />
//         </div>
//       </div>
      
//       {/* عرض الخريطة التفاعلية - تظهر دائماً */}
//       <div className="mt-4">
//         <div className="relative">
//           {mapMode === 'interactive' ? (
//             /* خريطة تفاعلية مخصصة */
//             <div 
//               className="w-full h-64 border-2 border-blue-300 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 cursor-crosshair relative"
//               onClick={handleMapClick}
//               title="انقر لاختيار الموقع"
//             >
//               {/* شبكة الخريطة */}
//               <div className="absolute inset-0 opacity-20">
//                 {Array.from({ length: 20 }).map((_, i) => (
//                   <div key={`h-${i}`} className="absolute h-px bg-gray-400" style={{ top: `${i * 5}%`, left: 0, right: 0 }} />
//                 ))}
//                 {Array.from({ length: 20 }).map((_, i) => (
//                   <div key={`v-${i}`} className="absolute w-px bg-gray-400" style={{ left: `${i * 5}%`, top: 0, bottom: 0 }} />
//                 ))}
//               </div>
              
//               {/* علامة الموقع المختار */}
//               {selectedMarker && (
//                 <div 
//                   className="absolute w-6 h-6 -ml-3 -mt-6 pointer-events-none z-10"
//                   style={{
//                     left: `${((selectedMarker.lng - mapCenter.lng + 0.01) / 0.02) * 100}%`,
//                     top: `${(1 - (selectedMarker.lat - mapCenter.lat + 0.01) / 0.02) * 100}%`
//                   }}
//                 >
//                   <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
//                     <div className="w-2 h-2 bg-white rounded-full"></div>
//                   </div>
//                 </div>
//               )}
              
//               {/* محور الإحداثيات */}
//               <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
//                 شمال: {(mapCenter.lat + 0.01).toFixed(4)}
//               </div>
//               <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
//                 جنوب: {(mapCenter.lat - 0.01).toFixed(4)}
//               </div>
//               <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
//                 شرق: {(mapCenter.lng + 0.01).toFixed(4)}
//               </div>
//               <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
//                 غرب: {(mapCenter.lng - 0.01).toFixed(4)}
//               </div>
              
//               {/* إرشادات الاستخدام */}
//               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
//                 <div className="bg-blue-600 bg-opacity-80 text-white text-sm px-3 py-2 rounded-lg text-center">
//                   <MapPin className="w-5 h-5 mx-auto mb-1" />
//                   <div>انقر لاختيار الموقع</div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             /* خرائط iframe العادية */
//             <div className="w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
//               <iframe
//                 src={mapMode === 'osm' ? getOSMUrl() : getBingMapsUrl()}
//                 width="100%"
//                 height="100%"
//                 style={{ border: 0 }}
//                 allowFullScreen
//                 loading="lazy"
//                 referrerPolicy="no-referrer-when-downgrade"
//                 title={`خريطة ${mapMode === 'osm' ? 'مفتوحة المصدر' : 'بينغ'}`}
//                 onError={() => {
//                   console.error('خطأ في تحميل الخريطة:', mapMode)
//                   setMapError(true)
//                 }}
//                 onLoad={() => setMapError(false)}
//               />
//             </div>
//           )}
            
//             {/* زر فتح في نافذة جديدة */}
//             <button
//               type="button"
//               onClick={openInMaps}
//               className="absolute top-2 right-2 bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors border"
//               title="فتح في OpenStreetMap"
//             >
//               <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//               </svg>
//             </button>
            
//           {/* معلومات الإحداثيات */}
//           <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
//             {selectedMarker ? 
//               `${selectedMarker.lat.toFixed(6)}, ${selectedMarker.lng.toFixed(6)}` : 
//               `${mapCenter.lat.toFixed(6)}, ${mapCenter.lng.toFixed(6)}`
//             }
//           </div>
//           </div>
          
//         {/* إرشادات */}
//         <div className="mt-2 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
//           {mapMode === 'interactive' ? (
//             <div>
//               <p className="flex items-center gap-1 mb-1 text-blue-700 font-medium">
//                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                 </svg>
//                 خريطة تفاعلية: انقر في أي مكان لاختيار الموقع
//               </p>
//               <p className="text-green-600">
//                 ✓ يمكنك النقر في أي مكان على الخريطة لتحديد الموقع بدقة
//               </p>
//             </div>
//           ) : (
//             <p className="flex items-center gap-1">
//               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//               </svg>
//               يمكنك فتح الخريطة في تطبيق منفصل أو استخدام الخريطة التفاعلية
//             </p>
//           )}
//           <p className="text-green-600 font-medium mt-1">
//             🆓 جميع الخرائط مجانية بالكامل!
//           </p>
//         </div>
//       </div>
      
//       {/* رسائل الخطأ */}
//       {mapError && (
//         <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
//           <div className="flex items-center gap-2">
//             <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//             </svg>
//             <div>
//               <p className="font-medium">تعذر تحميل الخريطة</p>
//               <p className="text-xs mt-1">يمكنك إدخال الإحداثيات يدوياً أو تجربة الحصول على موقعك الحالي</p>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* معلومات مفيدة - تظهر دائماً */}
//       <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
//         <div className="flex items-start gap-2">
//           <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
//           <div>
//             <p className="font-medium">طرق تحديد الموقع:</p>
//             <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
//               <li>استخدم الخريطة التفاعلية وانقر على الموقع المطلوب</li>
//               <li>أو استخدم زر "موقعي الحالي" للحصول على إحداثيات GPS</li>
//               <li>أو أدخل الإحداثيات يدوياً (مثال: الرياض 24.7136, 46.6753)</li>
//               <li>جرب أنواع الخرائط المختلفة - كلها مجانية!</li>
//             </ul>
//             <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
//               <p className="font-medium text-xs">ملاحظة:</p>
//               <p className="text-xs">الخريطة تبدأ بموقع افتراضي (الرياض). استخدم أي طريقة من الطرق المذكورة أعلاه لتحديد الموقع الصحيح.</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Simple multi-select component
// interface MultiSelectProps {
//   options: string[]
//   selectedValues: string[]
//   onChange: (values: string[]) => void
//   placeholder: string
//   allowCustom?: boolean
// }

// const MultiSelect: React.FC<MultiSelectProps> = ({ 
//   options, 
//   selectedValues, 
//   onChange, 
//   placeholder,
//   allowCustom = false
// }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [newValue, setNewValue] = useState('')

//   const toggleOption = (value: string) => {
//     if (selectedValues.includes(value)) {
//       onChange(selectedValues.filter(v => v !== value))
//     } else {
//       onChange([...selectedValues, value])
//     }
//   }

//   const addCustomValue = () => {
//     if (newValue.trim() && !selectedValues.includes(newValue.trim()) && !options.includes(newValue.trim())) {
//       onChange([...selectedValues, newValue.trim()])
//       setNewValue('')
//     }
//   }

//   return (
//     <div className="relative">
//       <div
//         className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex flex-wrap items-center gap-1"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {selectedValues.map((value) => (
//           <span
//             key={value}
//             className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
//           >
//             {value}
//             <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation()
//                 onChange(selectedValues.filter(v => v !== value))
//               }}
//               className="mr-1 text-blue-600 hover:text-blue-800"
//             >
//               ×
//             </button>
//           </span>
//         ))}
//         {selectedValues.length === 0 && (
//           <span className="text-gray-500">{placeholder}</span>
//         )}
//       </div>

//       {isOpen && (
//         <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
//           {allowCustom && (
//             <div className="p-2 border-b">
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={newValue}
//                   onChange={(e) => setNewValue(e.target.value)}
//                   placeholder="إضافة قيمة جديدة..."
//                   className="flex-1 px-2 py-1 border rounded text-sm"
//                 />
//                 <button
//                   onClick={addCustomValue}
//                   className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
//                 >
//                   إضافة
//                 </button>
//               </div>
//             </div>
//           )}
//           {options.map((option) => (
//             <div
//               key={option}
//               onClick={() => toggleOption(option)}
//               className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
//                 selectedValues.includes(option) ? 'bg-blue-50 text-blue-700' : ''
//               }`}
//             >
//               <div className="flex items-center justify-between">
//                 <span>{option}</span>
//                 {selectedValues.includes(option) && (
//                   <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // Initial options
// // Removed unused initialFloorOptions
// const initialUnitOptions = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'))
// const initialBlockOptions = ['A', 'B', 'C']

// const BuildingBuilderPage: React.FC = () => {
//   const { language } = useLanguage()
//   const [currentStep, setCurrentStep] = useState<number>(1)
//   const [showFullScreenVisualization, setShowFullScreenVisualization] = useState(false)
//   const [view3D, setView3D] = useState(false)
//   const [buildingData, setBuildingData] = useState<BuildingData>({
//     name: '',
//     blocks: []
//   })

//   // بيانات نموذج إنشاء البرج (مع قيم افتراضية للخريطة)
//   const [towerFormData, setTowerFormData] = useState<TowerFormData>({
//     arabicName: '',
//     englishName: '',
//     arabicDescription: '',
//     englishDescription: '',
//     address: '',
//     latitude: '24.7136', // الرياض كقيمة افتراضية
//     longitude: '46.6753', // الرياض كقيمة افتراضية
//     constructionYear: new Date().getFullYear().toString(),
//     mainImageUrl: '',
//     countryId: 0,
//     cityId: 0,
//     areaId: 0,
//     isActive: true,
    
//     // الحقول الجديدة
//     developerName: '',
//     managementCompany: '',
//     definitionStage: 1
//   })

//   const [selectedCountry, setSelectedCountry] = useState<number>(0)
//   const [selectedCity, setSelectedCity] = useState<number>(0)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // Step 1: Building Name (legacy - محفوظ للتوافق)
//   // const [buildingName, setBuildingName] = useState('')

//   // Step 2: Blocks
//   const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])
//   const [blockFloorsCount, setBlockFloorsCount] = useState<{ [blockName: string]: number }>({}) // عدد الطوابق لكل بلوك

//   // Step 3: Floors - تعريف مفصل للطوابق
//   // Removed unused selectedFloors state
//   // Removed unused selectedBlocksForFloors state
//   const [floorDefinitions, setFloorDefinitions] = useState<{
//     [key: string]: {
//       floorCode: string;
//       arabicName: string;
//       englishName: string;
//       floorNumber: number;
//       floorType: FloorType;
//       unitsCount: number;
//       selectedFromVisualization: boolean;
//     }
//   }>({}) // تعريفات مفصلة للطوابق

//   // Step 4: Units
//   const [selectedUnits, setSelectedUnits] = useState<string[]>([])
//   const [selectedFloorsForUnits, setSelectedFloorsForUnits] = useState<string[]>([])
//   const [selectedBlocksForUnits, setSelectedBlocksForUnits] = useState<string[]>([])
  
//   // حالة الشقق المختارة بصرياً (للتفاعل في الرسم)
//   const [visuallySelectedUnits, setVisuallySelectedUnits] = useState<Set<string>>(new Set())
//   const [createdTowerId, setCreatedTowerId] = useState<number | null>(null)
//   const [createdBlocks, setCreatedBlocks] = useState<{ id: number; name: string; originalName: string }[]>([])
  
//   // متغيرات لتتبع إكمال كل خطوة
//   const [step1Completed, setStep1Completed] = useState(false) // برج مُنشأ
//   const [step2Completed, setStep2Completed] = useState(false) // بلوكات مُنشأة مع عدد الطوابق
//   const [step3Completed, setStep3Completed] = useState(false) // تعريف الطوابق التفصيلي
//   const [step4Completed, setStep4Completed] = useState(false) // إنشاء الطوابق في قاعدة البيانات
//   const [step5Completed, setStep5Completed] = useState(false) // شقق مُنشأة
  
//   // استخدام نظام الإشعارات
//   const { showSuccess, showError, showWarning, showInfo } = useNotifications()

//   // API Queries لجلب بيانات الدول والمدن والمناطق
//   const { data: countries } = useQuery({
//     queryKey: ['countries', language],
//     queryFn: () => RealEstateAPI.country.getAll(true, language),
//     select: (data) => data.data?.data || []
//   })

//   const { data: cities } = useQuery({
//     queryKey: ['cities', selectedCountry, language],
//     queryFn: () => RealEstateAPI.city.getAll(true, selectedCountry || null, language),
//     enabled: !!selectedCountry,
//     select: (data) => data.data?.data || []
//   })

//   const { data: areas } = useQuery({
//     queryKey: ['areas', selectedCity, language],
//     queryFn: () => RealEstateAPI.area.getAll(true, selectedCity || null, language),
//     enabled: !!selectedCity,
//     select: (data) => data.data?.data || []
//   })

//   // API Query لجلب البلوكات المتاحة من قاعدة البيانات
//   const { data: availableBlocks } = useQuery({
//     queryKey: ['blocks', language],
//     queryFn: () => RealEstateAPI.block.getAll(true, language),
//     select: (data) => data.data?.data || []
//   })

//   // API Query لجلب أسماء الطوابق المتاحة من قاعدة البيانات
//   const { data: availableFloors, isLoading: floorsLoading, error: floorsError, isSuccess: floorsSuccess } = useQuery({
//     queryKey: ['floorNames', language],
//     queryFn: async () => {
//       console.log('🔄 Fetching floor names from API...')
//       console.log('API URL will be: /FloorName?onlyActive=true&lang=' + language)
//       try {
//         const response = await RealEstateAPI.floorName.getAll({ onlyActive: true }, language)
//         console.log('✅ FloorNames API Raw Response:', response)
//         console.log('Response status:', response.status)
//         console.log('Response data structure:', Object.keys(response.data || {}))
        
//         if (response.status === 200 && response.data) {
//           console.log('📦 Response data.data:', response.data.data)
//           return response
//         } else {
//           console.warn('⚠️ Unexpected response structure')
//           return response
//         }
//       } catch (error) {
//         console.error('❌ FloorNames API Error:', error)
//         if (error instanceof Error && 'response' in error) {
//           const axiosError = error as { response?: { status?: number; data?: unknown } }
//           console.error('Error status:', axiosError.response?.status)
//           console.error('Error data:', axiosError.response?.data)
//         }
//         throw error
//       }
//     },
//     select: (data) => {
//       console.log('🔍 Processing FloorNames API data...')
//       console.log('Full raw response:', JSON.stringify(data, null, 2))
      
//       let floors = []
      
//       // طباعة تفصيلية للبنية
//       console.log('🔍 Data structure analysis:')
//       console.log('- typeof data:', typeof data)
//       console.log('- data keys:', Object.keys(data || {}))
//       console.log('- data.data exists:', !!data?.data)
//       console.log('- typeof data.data:', typeof data?.data)
//       console.log('- data.data keys:', Object.keys(data?.data || {}))
//       console.log('- data.data.floorNames exists:', !!data?.data?.floorNames)
//       console.log('- data.data.floorNames is array:', Array.isArray(data?.data?.floorNames))
//       console.log('- data.data.floorNames length:', data?.data?.floorNames?.length)
      
//       // محاولة استخراج البيانات بطرق مختلفة حسب الهيكل الفعلي للاستجابة
//       const possiblePaths = [
//         { path: 'data.data.floorNames', value: data?.data?.data?.floorNames },
//         { path: 'data.floorNames', value: data?.data?.floorNames },
//         { path: 'data.data', value: data?.data?.data },
//         { path: 'data', value: data?.data },
//         { path: 'root', value: data }
//       ]
      
//       console.log('🔍 Checking all possible paths:')
//       possiblePaths.forEach(({ path, value }) => {
//         console.log(`- ${path}:`, {
//           exists: !!value,
//           type: typeof value,
//           isArray: Array.isArray(value),
//           length: Array.isArray(value) ? value.length : 'N/A',
//           sample: Array.isArray(value) ? value[0] : value
//         })
//       })
      
//       // جرب كل مسار ممكن
//       for (const { path, value } of possiblePaths) {
//         if (Array.isArray(value) && value.length > 0) {
//           floors = value
//           console.log(`✅ SUCCESS: Found ${floors.length} floors in ${path}`)
//           break
//         }
//       }
      
//       // إذا لم نجد البيانات، جرب استخراج مباشر من الاستجابة
//       if (floors.length === 0 && data?.data) {
//         const responseData = data.data
//         console.log('🔄 Trying direct extraction from response.data:', responseData)
        
//         // جرب البحث في جميع خصائص البيانات
//         for (const [key, value] of Object.entries(responseData)) {
//           console.log(`Checking property "${key}":`, {
//             type: typeof value,
//             isArray: Array.isArray(value),
//             length: Array.isArray(value) ? (value as unknown[]).length : 'N/A'
//           })
          
//           if (Array.isArray(value) && value.length > 0) {
//             // تحقق من أن العناصر تبدو كأنها طوابق
//             const firstItem = value[0] as Record<string, unknown>
//             if (firstItem && (firstItem.floorCode || firstItem.arabicName || firstItem.englishName)) {
//               floors = value
//               console.log(`✅ SUCCESS: Found ${floors.length} floors in responseData.${key}`)
//               break
//             }
//           }
//         }
//       }
      
//       if (floors.length === 0) {
//         console.error('❌ FAILED: Could not extract floors data from any path')
//         console.log('Complete data dump:', JSON.stringify(data, null, 2))
//       }
      
//       console.log('🏢 FINAL RESULT:', floors.length, 'floors')
//       if (floors.length > 0) {
//         console.log('First 3 floors:', floors.slice(0, 3))
//       }
      
//       return floors
//     },
//     staleTime: 5 * 60 * 1000, // 5 دقائق
//     retry: 3,
//     retryDelay: 1000
//   })
  
//   // طباعة حالة الاستعلام
//   console.log('📈 Floor Query Status:', {
//     isLoading: floorsLoading,
//     isSuccess: floorsSuccess,
//     hasError: !!floorsError,
//     dataType: availableFloors ? typeof availableFloors : 'undefined',
//     isArray: Array.isArray(availableFloors),
//     length: availableFloors?.length
//   })

//   // الخطوة 1: إنشاء البرج الأساسي فقط
//   const handleSubmitTower = async () => {
//     // التحقق من البيانات المطلوبة
//     if (!towerFormData.arabicName.trim() || !towerFormData.englishName.trim() || 
//         !towerFormData.countryId || !towerFormData.cityId || !towerFormData.areaId) {
//       showError('يرجى ملء جميع الحقول المطلوبة', 'بيانات ناقصة')
//       return
//     }

//     setIsSubmitting(true)
//     showInfo('جاري إنشاء البرج...', 'انتظر من فضلك')
    
//     try {
//       const towerRequestData: CreateTowerWithFloorsRequest = {
//         arabicName: towerFormData.arabicName.trim(),
//         englishName: towerFormData.englishName.trim(),
//         arabicDescription: towerFormData.arabicDescription.trim(),
//         englishDescription: towerFormData.englishDescription.trim(),
//         address: towerFormData.address.trim(),
//         latitude: towerFormData.latitude,
//         longitude: towerFormData.longitude,
//         constructionYear: towerFormData.constructionYear ? new Date(towerFormData.constructionYear) : undefined,
//         mainImageUrl: towerFormData.mainImageUrl,
//         isActive: towerFormData.isActive,
//         countryId: towerFormData.countryId,
//         cityId: towerFormData.cityId,
//         areaId: towerFormData.areaId,
//         developerName: towerFormData.developerName.trim() || undefined,
//         managementCompany: towerFormData.managementCompany.trim() || undefined,
//         definitionStage: towerFormData.definitionStage,
//         lang: language
//       }

//       const towerResponse = await RealEstateAPI.tower.createWithFloors(towerRequestData, language)
      
//       // طباعة الاستجابة الكاملة للفحص
//       console.log('Tower Response Status:', towerResponse.status)
//       console.log('Tower Response Full:', towerResponse)
//       console.log('Tower Response Data:', towerResponse.data)
      
//       // محاولة الحصول على ID بطرق مختلفة بناءً على بنية الاستجابة الفعلية
//       const towerId = towerResponse.data?.data?.towerId || 
//                      towerResponse.data?.data?.statistics?.towerId || 
//                      towerResponse.data?.data?.id || 
//                      towerResponse.data?.data?.TowerId || 
//                      towerResponse.data?.id || 
//                      towerResponse.data?.TowerId 

//       console.log('Extracted Tower ID:', towerId)
//       console.log('Tower ID Type:', typeof towerId)

//       if (!towerId || towerId === 0) {
//         console.error('فشل في استخراج ID البرج من الاستجابة')
//         throw new Error('فشل في إنشاء البرج - لم يتم إرجاع ID صحيح')
//       }

//       // تأكد من أن التصويل الرقمي صحيح
//       let towerIdNumber: number
      
//       if (typeof towerId === 'number') {
//         towerIdNumber = towerId
//       } else if (typeof towerId === 'string' && !isNaN(parseInt(towerId, 10))) {
//         towerIdNumber = parseInt(towerId, 10)
//       } else if (typeof towerId === 'object' && towerId !== null) {
//         // إذا كان towerId كائناً، فهناك مشكلة في الاستخراج
//         console.error('Tower ID is an object instead of number:', towerId)
//         throw new Error('فشل في استخراج رقم البرج - تم إرجاع كائن بدلاً من رقم')
//       } else {
//         console.error('Invalid Tower ID format:', towerId)
//         throw new Error('فشل في استخراج رقم البرج - تنسيق غير صحيح')
//       }
      
//       console.log('Final Tower ID (as number):', towerIdNumber)
//       console.log('Tower ID validation passed - storing as number')
      
//       setCreatedTowerId(towerIdNumber)
//       setStep1Completed(true) // تم إكمال الخطوة الأولى
//       setCurrentStep(2)
      
//       // تحديث DefinitionStage إلى 1
//       await updateTowerDefinitionStage(1)
      
//       showSuccess(`تم إنشاء البرج "${towerFormData.arabicName}" بنجاح!`, 'تم إنشاء البرج')
      
//     } catch (error) {
//       console.error('خطأ في إنشاء البرج:', error)
      
//       let errorMessage = 'حدث خطأ في إنشاء البرج. يرجى المحاولة مرة أخرى.'
      
//       // استخراج رسالة الخطأ من الاستجابة إذا كانت متوفرة
//       if (error instanceof Error) {
//         console.error('Error message:', error.message)
//         if ('response' in error) {
//           const axiosError = error as { response?: { data?: { message?: string } } }
//           console.error('Error response:', axiosError.response)
//           console.error('Error data:', axiosError.response?.data)
          
//           if (axiosError.response?.data?.message) {
//             errorMessage = axiosError.response.data.message
//           }
//         } else {
//           errorMessage = error.message
//         }
//       }
      
//       showError(errorMessage, 'فشل في الإنشاء')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // الخطوة 2: ربط البلوكات الموجودة بالبرج باستخدام API الجديد
//   const handleCreateBlocks = async () => {
//     if (!createdTowerId) {
//       showError('يجب إنشاء البرج أولاً', 'خطأ في الترتيب')
//       return
//     }

//     console.log('Current Tower ID for blocks creation:', createdTowerId)
//     console.log('Tower ID Type:', typeof createdTowerId)
    
//     // التأكد من أن createdTowerId رقم صحيح وليس كائناً
//     if (typeof createdTowerId !== 'number') {
//       console.error('Tower ID is not a number:', createdTowerId)
//       showError('رقم البرج غير صحيح. يرجى إعادة إنشاء البرج.', 'خطأ في البيانات')
//       return
//     }

//     if (selectedBlocks.length === 0) {
//       showWarning('يرجى اختيار بلوك واحد على الأقل', 'لم يتم اختيار بلوكات')
//       return
//     }

//     if (!availableBlocks || availableBlocks.length === 0) {
//       showError('لا توجد بلوكات متاحة في النظام', 'خطأ في البيانات')
//       return
//     }

//     setIsSubmitting(true)
//     showInfo('جاري ربط البلوكات بالبرج...', 'انتظر من فضلك')

//     try {
//       // إعداد بيانات البلوكات للإنشاء المتعدد
//       const towerBlocksData: TowerBlockDto[] = []
//       const newCreatedBlocks: { id: number; name: string; originalName: string }[] = []

//       for (let blockIndex = 0; blockIndex < selectedBlocks.length; blockIndex++) {
//         const blockName = selectedBlocks[blockIndex]
        
//         // البحث عن البلوك المختار في البلوكات المتاحة
//         const selectedBlock = availableBlocks.find((b: { id: number; arabicName: string; englishName: string }) => 
//           (language === 'ar' ? b.arabicName : b.englishName) === blockName
//         )
        
//         if (!selectedBlock) {
//           showError(`البلوك ${blockName} غير موجود في البلوكات المتاحة`, 'خطأ في البيانات')
//           continue
//         }

//         // التأكد من أن جميع IDs أرقام صحيحة
//         if (typeof createdTowerId !== 'number' || typeof selectedBlock.id !== 'number') {
//           console.error('Invalid ID types:', { 
//             towerId: createdTowerId, 
//             towerIdType: typeof createdTowerId,
//             blockId: selectedBlock.id, 
//             blockIdType: typeof selectedBlock.id 
//           })
//           showError(`بيانات البلوك ${blockName} غير صحيحة`, 'خطأ في البيانات')
//           continue
//         }

//         // الحصول على عدد الطوابق لهذا البلوك (افتراضي = 5)
//         const floorsCountForBlock = blockFloorsCount[blockName] || 5
        
//         // إضافة بيانات البلوك إلى المصفوفة - مع عدد الطوابق
//         const towerBlockDto: TowerBlockDto = {
//           towerId: createdTowerId, // إرسال ID البرج كرقم فقط
//           blockId: selectedBlock.id, // إرسال ID البلوك كرقم فقط
//           blockNumber: String.fromCharCode(65 + blockIndex), // A, B, C...
//           floorsCount: floorsCountForBlock, // عدد الطوابق لهذا البلوك
//           notes: `البلوك ${blockName} - ${floorsCountForBlock} طوابق`,
//           isActive: true,
//           displayOrder: blockIndex + 1
//         }
        
//         console.log(`TowerBlock DTO for ${blockName}:`, towerBlockDto)
//         console.log('TowerID in DTO:', towerBlockDto.towerId, 'Type:', typeof towerBlockDto.towerId)
//         console.log('BlockID in DTO:', towerBlockDto.blockId, 'Type:', typeof towerBlockDto.blockId)
        
//         towerBlocksData.push(towerBlockDto)

//         newCreatedBlocks.push({
//           id: selectedBlock.id,
//           name: String.fromCharCode(65 + blockIndex),
//           originalName: blockName
//         })
//       }

//       if (towerBlocksData.length === 0) {
//         showError('لم يتم العثور على أي بلوك صحيح للربط', 'خطأ في البيانات')
//         return
//       }

//       // إنشاء جميع البلوكات دفعة واحدة باستخدام API الجديد
//       const bulkRequest: CreateMultipleTowerBlocksRequest = {
//         towerBlocks: towerBlocksData,
//         lang: language
//       }

//       // التحقق الأخير من صحة البيانات قبل الإرسال
//       const isDataValid = towerBlocksData.every(dto => 
//         typeof dto.towerId === 'number' && 
//         typeof dto.blockId === 'number' &&
//         dto.towerId > 0 &&
//         dto.blockId > 0
//       )
      
//       if (!isDataValid) {
//         console.error('Invalid data found in TowerBlocks array:', towerBlocksData)
//         showError('توجد بيانات غير صحيحة في البلوكات. يرجى المحاولة مرة أخرى.', 'خطأ في البيانات')
//         return
//       }
      
//       console.log('Creating multiple TowerBlocks with data:', bulkRequest)
//       console.log('TowerBlocks array (validated):', JSON.stringify(towerBlocksData, null, 2))
//       console.log('Tower ID being sent:', createdTowerId, 'Type:', typeof createdTowerId)
      
//       const response = await RealEstateAPI.towerBlock.createMultiple(bulkRequest, language)
//       console.log('Multiple TowerBlocks created successfully:', response)

//       if (newCreatedBlocks.length > 0) {
//         setCreatedBlocks(newCreatedBlocks)
        
//         // إضافة البلوكات إلى buildingData للعرض البصري
//         const newBlocks: Block[] = newCreatedBlocks.map(block => ({
//           id: `block-${block.name}`,
//           name: block.name,
//           floors: []
//         }))
//         setBuildingData(prev => ({ ...prev, blocks: newBlocks }))
        
//         setStep2Completed(true) // تم إكمال الخطوة الثانية
//         setCurrentStep(3)
        
//         // تحديث DefinitionStage إلى 2
//         await updateTowerDefinitionStage(2)
        
//         showSuccess(`تم إنشاء وربط ${newCreatedBlocks.length} بلوك بالبرج بنجاح!`, 'تم إنشاء البلوكات')
//       } else {
//         showError('لم يتم إنشاء أي بلوك بنجاح', 'فشل في الإنشاء')
//       }
      
//     } catch (error) {
//       console.error('خطأ عام في إنشاء البلوكات:', error)
//       showError('حدث خطأ عام في إنشاء البلوكات', 'فشل في الإنشاء')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // الخطوة 4: إنشاء الطوابق والوحدات باستخدام APIs الجديدة والتعريفات المفصلة - معطل مؤقتاً
//   /*
//   const handleCreateFloorsAndUnits = async () => {
//     if (!createdTowerId || createdBlocks.length === 0) {
//       showError('يجب إنشاء البرج والبلوكات أولاً', 'خطأ في الترتيب')
//       return
//     }

//     // التحقق من وجود تعريفات الطوابق
//     const floorDefinitionsCount = Object.keys(floorDefinitions).length
//     if (floorDefinitionsCount === 0) {
//       showWarning('يرجى تعريف الطوابق أولاً في الخطوة السابقة', 'طوابق غير معرفة')
//       return
//     }

//     setIsSubmitting(true)
//     showInfo('جاري إنشاء الطوابق والوحدات...', 'انتظر من فضلك')

//     try {
//       // إعداد بيانات الطوابق والوحدات للإنشاء المتعدد باستخدام البيانات المختارة
//       const blockFloorsData: BlockFloorDto[] = []
//       const allUnitsData: UnitDto[] = []

//       // استخدام تعريفات الطوابق المفصلة من الخطوة السابقة
//       for (const [floorKey, floorDef] of Object.entries(floorDefinitions)) {
//         // استخراج معلومات البلوك من مفتاح الطابق
//         const blockName = floorKey.split('-')[0] // مثل "A-floor-1" -> "A"
//         const createdBlock = createdBlocks.find(cb => cb.name === blockName)
        
//         if (!createdBlock) {
//           console.error(`لم يتم العثور على بيانات البلوك: ${blockName}`)
//           continue
//         }

//         // إنشاء بيانات الطابق باستخدام التعريف المفصل
//         blockFloorsData.push({
//           blockId: createdBlock.id,
//           towerId: createdTowerId,
//           // بيانات التعريف من الخطوة السابقة
//           floorCode: floorDef.floorCode,
//           floorArabicName: floorDef.arabicName,
//           floorEnglishName: floorDef.englishName,
//           floorNumber: floorDef.floorNumber,
//           sortOrder: floorDef.floorNumber,
//           floorType: floorDef.floorType,
//           floorDescription: `${floorDef.arabicName} في البلوك ${blockName}`,
          
//           // بيانات الوحدات
//           unitsCount: floorDef.unitsCount,
//           unitNumberPattern: `${blockName}${floorDef.floorCode}##`,
          
//           // معلومات إضافية
//           totalFloorArea: 250, // مساحة افتراضية
//           unitsArea: 200,
//           commonArea: 50,
//           hasSharedFacilities: true,
//           sharedFacilitiesDescription: 'مصعد وممرات مشتركة ومرافق عامة',
//           elevatorsCount: 1,
//           staircasesCount: 1,
//           hasEmergencyExit: true,
//           notes: `${floorDef.arabicName} في البلوك ${blockName} - ${floorDef.unitsCount} وحدات`,
//           isActive: true,
//           displayOrder: floorDef.floorNumber
//         })

//         // إنشاء وحدات افتراضية لهذا الطابق
//         for (let unitIndex = 1; unitIndex <= floorDef.unitsCount; unitIndex++) {
//           const unitNumber = `${blockName}${floorDef.floorCode}0${unitIndex.toString().padStart(2, '0')}`
          
//           allUnitsData.push({
//             unitNumber: unitNumber,
//             floorNumber: floorDef.floorNumber,
//             towerId: createdTowerId,
//             unitDesignId: 1, // تصميم افتراضي
//             blockId: createdBlock.id,
//             type: 1, // UnitType.Residential
//             status: 1, // UnitStatus.Available
//             isActive: true,
//             blockCode: blockName,
//             floorCode: floorDef.floorCode
//           })
//         }
//       }

//       // الكود التالي معطل مؤقتاً - يحتوي على await statements خارج دالة async
//       /*
//       console.log('تم إعداد بيانات الطوابق والوحدات باستخدام التعريفات الجديدة:')
//       console.log('عدد الطوابق المُعدة:', blockFloorsData.length)
//       console.log('عدد الوحدات المُعدة:', allUnitsData.length)
//       console.log('بيانات الطوابق:', blockFloorsData)
//       console.log('بيانات الوحدات:', allUnitsData)

//       // إنشاء جميع الطوابق دفعة واحدة
//       let totalFloorsCreated = 0
//       if (blockFloorsData.length > 0) {
//         const floorsRequest: CreateMultipleBlockFloorsRequest = {
//           blockFloors: blockFloorsData,
//           lang: language
//         }

//         // console.log('Creating multiple BlockFloors...')
//         // const floorsResponse = await RealEstateAPI.blockFloor.createMultiple(floorsRequest, language)
//         // console.log('Multiple BlockFloors created successfully:', floorsResponse)
        
//         // تحقق من النتيجة
//         if (floorsResponse.data?.data?.createdCount) {
//           totalFloorsCreated = floorsResponse.data.data.createdCount
//           console.log(`✅ Server confirmed: ${totalFloorsCreated} floors created`)
//         } else {
//           totalFloorsCreated = blockFloorsData.length
//           console.log(`⚠️ Using fallback count: ${totalFloorsCreated} floors`)
//         }
//       }

//       // إنشاء جميع الوحدات دفعة واحدة
//       let totalUnitsCreated = 0
//       if (allUnitsData.length > 0) {
//         const unitsRequest: CreateMultipleUnitsRequest = {
//           units: allUnitsData,
//           lang: language
//         }

//         // console.log('Creating multiple Units...')
//         // const unitsResponse = await RealEstateAPI.unit.createMultiple(unitsRequest, language)
//         // console.log('Multiple Units created successfully:', unitsResponse)
//         totalUnitsCreated = allUnitsData.length
//       }

//       // تحقق من نجاح إنشاء الطوابق على الأقل
//       if (totalFloorsCreated > 0) {
//         // تحديث buildingData بالطوابق والوحدات المُنشأة باستخدام التعريفات الجديدة
//         setBuildingData(prev => ({
//           ...prev,
//           blocks: prev.blocks.map(block => {
//             // البحث عن الطوابق المعرفة لهذا البلوك
//             const blockFloors = Object.entries(floorDefinitions)
//               .filter(([floorKey]) => floorKey.startsWith(block.name))
//               .map(([floorKey, floorDef]) => ({
//                 id: floorKey,
//                 number: floorDef.floorCode,
//                 units: Array.from({length: floorDef.unitsCount}, (_, i) => ({
//                   id: `unit-${block.name}-${floorDef.floorCode}-${i + 1}`,
//                   number: `${block.name}${floorDef.floorCode}0${(i + 1).toString().padStart(2, '0')}`
//                 }))
//               }))
            
//             if (blockFloors.length > 0) {
//               // دмج مع الطوابق الموجودة وتجنب التكرار
//               const existingFloorNumbers = block.floors.map(f => f.number)
//               const uniqueNewFloors = blockFloors.filter(f => !existingFloorNumbers.includes(f.number))
              
//               return { ...block, floors: [...block.floors, ...uniqueNewFloors] }
//             }
//             return block
//           })
//         }))
        
//         setStep4Completed(true) // تم إكمال الخطوة الرابعة
//         setCurrentStep(5)
        
//         // تحديث DefinitionStage إلى 4
//         // await updateTowerDefinitionStage(4)
        
//         if (totalUnitsCreated > 0) {
//           showSuccess(
//             `تم إنشاء ${totalFloorsCreated} طابق و ${totalUnitsCreated} وحدة بنجاح من التعريفات المفصلة!`,
//             'تم إنشاء الطوابق والوحدات'
//           )
//         } else {
//           showSuccess(
//             `تم إنشاء ${totalFloorsCreated} طابق بنجاح من التعريفات المفصلة!`,
//             'تم إنشاء الطوابق'
//           )
//         }
//       } else {
//         showError('لم يتم إنشاء أي طابق', 'فشل في الإنشاء')
//       }
      
//     } catch (error) {
//       console.error('خطأ عام في إنشاء الطوابق والوحدات:', error)
//       showError('حدث خطأ عام في إنشاء الطوابق والوحدات', 'فشل في الإنشاء')
//     } finally {
//       setIsSubmitting(false)
//     }
//     */

//   // Helper function for form handling already exists below

//   // تحديث المدن عند تغيير الدولة
//   useEffect(() => {
//     if (selectedCountry !== towerFormData.countryId) {
//       setTowerFormData(prev => ({ ...prev, countryId: selectedCountry, cityId: 0, areaId: 0 }))
//       setSelectedCity(0)
//     }
//   }, [selectedCountry, towerFormData.countryId])

//   // تحديث المناطق عند تغيير المدينة
//   useEffect(() => {
//     if (selectedCity !== towerFormData.cityId) {
//       setTowerFormData(prev => ({ ...prev, cityId: selectedCity, areaId: 0 }))
//     }
//   }, [selectedCity, towerFormData.cityId])

//   // معالجة تغيير بيانات النموذج
//   const handleFormChange = (field: keyof TowerFormData, value: string | number | boolean) => {
//     setTowerFormData(prev => ({ ...prev, [field]: value }))
//   }

//   // معالجة تحديد الموقع
//   const handleLocationSelect = (lat: string, lng: string, address: string) => {
//     setTowerFormData(prev => ({
//       ...prev,
//       latitude: lat,
//       longitude: lng,
//       address: address || prev.address
//     }))
//   }

//   // معالجة النقر على الشقق في الرسم
//   const handleUnitClick = (unitId: string) => {
//     console.log('تم النقر على الشقة:', unitId) // للتشخيص
//     setVisuallySelectedUnits(prev => {
//       const newSet = new Set(prev)
//       if (newSet.has(unitId)) {
//         newSet.delete(unitId)
//         console.log('تم إلغاء اختيار الشقة:', unitId)
//       } else {
//         newSet.add(unitId)
//         console.log('تم اختيار الشقة:', unitId)
//       }
//       console.log('الشقق المختارة حالياً:', Array.from(newSet))
//       return newSet
//     })
//   }

//   // دالة لمسح الاختيار البصري للشقق
//   const clearVisualSelection = () => {
//     setVisuallySelectedUnits(new Set())
//   }

//   // تم استبدال هذه الدالة بالدوال الجديدة المنفصلة

//   // Handle Step 1: Save building name (legacy - للتوافق مع الكود القديم)
//   // const handleSaveBuildingName = () => {
//   //   if (towerFormData.arabicName.trim()) {
//   //     setBuildingData(prev => ({ ...prev, name: towerFormData.arabicName.trim() }))
//   //     setCurrentStep(2)
//   //   }
//   // }

//   // Handle Step 2: Save blocks (Updated for new system)
//   // تم إزالة handleSaveBlocks لأنها غير مستخدمة - نستخدم handleCreateBlocks مباشرة

//   // Handle Step 3: Create floors and units directly via API
//   // تم إزالة handleAddFloors لأنها غير مستخدمة - نستخدم handleCreateFloorsAndUnits مباشرة

//   // Handle Step 4: Add units to floors using API
//   const handleAddUnits = async () => {
//     if (selectedUnits.length === 0 || selectedFloorsForUnits.length === 0 || selectedBlocksForUnits.length === 0) {
//       showError('يرجى اختيار الشقق والطوابق والبلوكات أولاً', 'بيانات ناقصة')
//       return
//     }

//     if (!createdTowerId) {
//       showError('لم يتم العثور على معرف البرج', 'خطأ في البيانات')
//       return
//     }

//     setIsSubmitting(true)
//     console.log('🏗️ Starting unit creation with API...')
    
//     try {
//       const allUnitsData: UnitDto[] = []
      
//       // العثور على البلوكات المُنشأة من قاعدة البيانات
//       const createdBlocks = buildingData.blocks.filter(block => 
//         selectedBlocksForUnits.includes(block.name)
//       )
      
//       if (createdBlocks.length === 0) {
//         throw new Error('لم يتم العثور على البلوكات المُنشأة')
//       }

//       // إعداد بيانات الشقق لكل بلوك وطابق
//       for (const block of createdBlocks) {
//         console.log(`Processing block: ${block.name}`)
        
//         // العثور على الطوابق المختارة في هذا البلوك
//         const selectedFloors = block.floors.filter(floor => 
//           selectedFloorsForUnits.includes(floor.number)
//         )
        
//         for (const floor of selectedFloors) {
//           console.log(`Processing floor: ${floor.number} in block: ${block.name}`)
          
//           // معلومات الطابق للمرجعية (UnitDto لا يحتاج floorNameId)
//           console.log(`Processing floor: ${floor.number} in block: ${block.name}`)
          
//           // إنشاء بيانات الشقق
//           for (const unitNumber of selectedUnits) {
//             const unitData: UnitDto = {
//               unitNumber: unitNumber,
//               floorNumber: parseInt(floor.number) || 1,
//               towerId: createdTowerId,
//               unitDesignId: 1, // تصميم افتراضي
//               blockId: parseInt(block.id) || 1,
//               type: 1 as UnitType, // UnitType.Residential
//               status: 1 as UnitStatus, // UnitStatus.Available
//               isActive: true,
//               blockCode: block.name,
//               floorCode: floor.number,
//               actualArea: 100, // مساحة افتراضية
//               notes: `شقة ${unitNumber} في الطابق ${floor.number} - البلوك ${block.name}`
//             }
            
//             console.log(`Prepared unit data:`, unitData)
//             allUnitsData.push(unitData)
//           }
//         }
//       }

//       if (allUnitsData.length === 0) {
//         throw new Error('لا توجد بيانات شقق لإنشائها')
//       }

//       console.log(`📊 Total units to create: ${allUnitsData.length}`)
      
//       // إنشاء الشقق باستخدام API
//       const unitsRequest: CreateMultipleUnitsRequest = {
//         units: allUnitsData,
//         lang: language
//       }

//       console.log('🔄 Calling API to create units...')
//       const unitsResponse = await RealEstateAPI.unit.createMultiple(unitsRequest, language)
//       console.log('✅ Units created successfully via API:', unitsResponse)
      
//       // تحديث البيانات المحلية بعد النجاح
//       setBuildingData(prev => ({
//         ...prev,
//         blocks: prev.blocks.map(block => {
//           if (selectedBlocksForUnits.includes(block.name)) {
//             return {
//               ...block,
//               floors: block.floors.map(floor => {
//                 if (selectedFloorsForUnits.includes(floor.number)) {
//                   const newUnits: Unit[] = selectedUnits.map(unitNum => ({
//                     id: `unit-${block.name}-${floor.number}-${unitNum}`,
//                     number: unitNum
//                   }))
//                   // دمج مع الشقق الموجودة، تجنب التكرار
//                   const existingUnitNumbers = floor.units.map(u => u.number)
//                   const uniqueNewUnits = newUnits.filter(u => !existingUnitNumbers.includes(u.number))
//                   return { ...floor, units: [...floor.units, ...uniqueNewUnits] }
//                 }
//                 return floor
//               })
//             }
//           }
//           return block
//         })
//       }))

//       // تنظيف الحقول المختارة
//       setSelectedUnits([])
//       setSelectedFloorsForUnits([])
//       setSelectedBlocksForUnits([])
      
//       // إظهار رسالة نجاح
//       const createdCount = unitsResponse.data?.data?.createdCount || allUnitsData.length
//       setStep5Completed(true) // تم إكمال الخطوة الخامسة
      
//       // تحديث DefinitionStage إلى 5 (مكتمل)
//       await updateTowerDefinitionStage(5)
      
//       showSuccess(
//         `تم إنشاء ${createdCount} شقة بنجاح في قاعدة البيانات!`,
//         'تم إنشاء الشقق'
//       )
      
//     } catch (error) {
//       console.error('❌ Error creating units via API:', error)
//       const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف'
//       showError(`فشل في إنشاء الشقق: ${errorMessage}`, 'خطأ في إنشاء الشقق')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // Advanced Building Visualization Component
//   const SimpleBuildingVisualization = () => {
//     if (view3D) {
//       return (
//         <ThreeDVisualization 
//           buildingData={buildingData} 
//           currentStep={currentStep} 
//           onUnitClick={handleUnitClick}
//           selectedUnits={visuallySelectedUnits}
//         />
//       );
//     }
    
//     return (
//       <RealisticBuildingVisualization 
//         buildingData={buildingData} 
//         currentStep={currentStep}
//         onUnitClick={handleUnitClick}
//         selectedUnits={visuallySelectedUnits}
//       />
//     );
//   };



//   /* 
//    * نظام تتبع مراحل تعريف البرج (DefinitionStage)
//    * ===============================================
//    * 
//    * يتم تحديث حقل DefinitionStage في جدول الأبراج بعد إكمال كل خطوة:
//    * - Stage 1: تم إنشاء البرج الأساسي (المعلومات الأساسية فقط)
//    * - Stage 2: تم إضافة البلوكات للبرج
//    * - Stage 3: تم إضافة الطوابق للبلوكات  
//    * - Stage 4: تم إضافة الوحدات/الشقق (البرج مكتمل التعريف)
//    * 
//    * هذا النظام يساعد في:
//    * - تتبع مستوى اكتمال تعريف البرج
//    * - إمكانية استكمال العملية من حيث توقفت
//    * - التقارير والإحصائيات حول حالة الأبراج
//    */

//   // دالة تحديث DefinitionStage في جدول الأبراج
//   const updateTowerDefinitionStage = async (stage: number) => {
//     if (!createdTowerId) {
//       console.error('No tower ID available for updating definition stage')
//       return
//     }

//     try {
//       console.log(`🔄 Updating tower definition stage to ${stage}...`)
      
//       // جلب بيانات البرج الحالية من قاعدة البيانات أولاً
//       console.log(`📥 Fetching current tower data for ID: ${createdTowerId}`)
//       const currentTowerResponse = await RealEstateAPI.tower.getById(createdTowerId, language)
      
//       if (!currentTowerResponse.data?.data) {
//         console.error('❌ Failed to fetch current tower data')
//         return
//       }
      
//       const currentTowerData = currentTowerResponse.data.data
//       console.log('📦 Full response structure:', JSON.stringify(currentTowerResponse.data, null, 2))
//       console.log('📦 Current tower data:', JSON.stringify(currentTowerData, null, 2))
      
//       // التحقق من صحة البيانات المستلمة
//       if (!currentTowerData.arabicName || !currentTowerData.englishName) {
//         console.error('❌ Essential tower data is missing:', {
//           arabicName: currentTowerData.arabicName,
//           englishName: currentTowerData.englishName,
//           countryId: currentTowerData.countryId,
//           cityId: currentTowerData.cityId,
//           areaId: currentTowerData.areaId
//         })
//         console.log('🔄 Falling back to form data...')
        
//         // استخدام بيانات النموذج كبديل
//         const fallbackData = {
//           id: createdTowerId,
//           arabicName: towerFormData.arabicName || 'اسم افتراضي',
//           englishName: towerFormData.englishName || 'Default Name',
//           arabicDescription: towerFormData.arabicDescription || null,
//           englishDescription: towerFormData.englishDescription || null,
//           address: towerFormData.address || null,
//           latitude: towerFormData.latitude || null,
//           longitude: towerFormData.longitude || null,
//           totalFloors: 0,
//           unitsPerFloor: 0,
//           constructionYear: towerFormData.constructionYear ? new Date(towerFormData.constructionYear).toISOString() : null,
//           mainImageUrl: towerFormData.mainImageUrl || null,
//           isActive: towerFormData.isActive !== undefined ? towerFormData.isActive : true,
//           countryId: towerFormData.countryId || 1,
//           cityId: towerFormData.cityId || 1,
//           areaId: towerFormData.areaId || 1,
//           developerName: towerFormData.developerName || null,
//           managementCompany: towerFormData.managementCompany || null,
//           definitionStage: stage,
//           lang: language
//         }
        
//         console.log('📤 Sending fallback data:', JSON.stringify(fallbackData, null, 2))
        
//         // استدعاء API لتحديث البرج بالبيانات البديلة
//         const response = await RealEstateAPI.tower.update(createdTowerId, fallbackData, language)
//         console.log(`✅ Tower definition stage updated to ${stage} with fallback data:`, response)
        
//         // تحديث البيانات المحلية
//         setTowerFormData(prev => ({ ...prev, definitionStage: stage }))
//         return
//       }
      
//       // حساب العدد الحقيقي للطوابق والوحدات من البيانات المنشأة
//       let actualTotalFloors = currentTowerData.totalFloors || 0
//       let actualUnitsPerFloor = currentTowerData.unitsPerFloor || 0
      
//       // إذا كانت هناك بيانات محلية محدثة، استخدمها
//       if (buildingData.blocks.length > 0) {
//         // حساب العدد الإجمالي للطوابق من جميع البلوكات
//         actualTotalFloors = buildingData.blocks.reduce((total, block) => 
//           total + block.floors.length, 0
//         )
        
//         // حساب متوسط الوحدات لكل طابق
//         const totalUnits = buildingData.blocks.reduce((total, block) => 
//           total + block.floors.reduce((floorTotal, floor) => 
//             floorTotal + floor.units.length, 0
//           ), 0
//         )
        
//         if (actualTotalFloors > 0) {
//           actualUnitsPerFloor = Math.ceil(totalUnits / actualTotalFloors)
//         }
//       }
      
//       console.log(`📊 Calculated stats - Floors: ${actualTotalFloors}, Units per floor: ${actualUnitsPerFloor}`)
      
//       // إعداد بيانات التحديث باستخدام البيانات الحالية مع التحديثات المطلوبة
//       const updateData = {
//         id: createdTowerId,
//         arabicName: currentTowerData.arabicName || towerFormData.arabicName || 'اسم افتراضي',
//         englishName: currentTowerData.englishName || towerFormData.englishName || 'Default Name',
//         arabicDescription: currentTowerData.arabicDescription || towerFormData.arabicDescription || null,
//         englishDescription: currentTowerData.englishDescription || towerFormData.englishDescription || null,
//         address: currentTowerData.address || towerFormData.address || null,
//         latitude: currentTowerData.latitude || towerFormData.latitude || null,
//         longitude: currentTowerData.longitude || towerFormData.longitude || null,
//         totalFloors: actualTotalFloors, // العدد المحدث للطوابق
//         unitsPerFloor: actualUnitsPerFloor, // العدد المحدث للوحدات لكل طابق
//         constructionYear: currentTowerData.constructionYear || (towerFormData.constructionYear ? new Date(towerFormData.constructionYear).toISOString() : null),
//         mainImageUrl: currentTowerData.mainImageUrl || towerFormData.mainImageUrl || null,
//         isActive: currentTowerData.isActive !== undefined ? currentTowerData.isActive : (towerFormData.isActive !== undefined ? towerFormData.isActive : true),
//         countryId: currentTowerData.countryId || towerFormData.countryId || 1,
//         cityId: currentTowerData.cityId || towerFormData.cityId || 1,
//         areaId: currentTowerData.areaId || towerFormData.areaId || 1,
//         developerName: currentTowerData.developerName || towerFormData.developerName || null,
//         managementCompany: currentTowerData.managementCompany || towerFormData.managementCompany || null,
//         definitionStage: stage, // التحديث المطلوب
//         lang: language
//       }
      
//       // التحقق النهائي من البيانات قبل الإرسال
//       console.log('🔍 Final validation of update data:')
//       console.log('- arabicName:', updateData.arabicName)
//       console.log('- englishName:', updateData.englishName)
//       console.log('- countryId:', updateData.countryId)
//       console.log('- cityId:', updateData.cityId)
//       console.log('- areaId:', updateData.areaId)
//       console.log('- definitionStage:', updateData.definitionStage)
      
//       console.log('📤 Sending update data:', JSON.stringify(updateData, null, 2))
      
//       // التحقق من أن البيانات ليست فارغة
//       if (!updateData.arabicName || !updateData.englishName || !updateData.countryId || !updateData.cityId || !updateData.areaId) {
//         console.error('❌ Critical fields are empty, cannot proceed with update:', {
//           arabicName: updateData.arabicName,
//           englishName: updateData.englishName,
//           countryId: updateData.countryId,
//           cityId: updateData.cityId,
//           areaId: updateData.areaId
//         })
//         return
//       }

//       // طباعة معلومات الطلب
//       console.log('🌐 Making API request to:')
//       console.log(`- URL: /Tower/${createdTowerId}?lang=${language}`)
//       console.log(`- Method: PUT`)
//       console.log(`- Tower ID: ${createdTowerId}`)
//       console.log(`- Language: ${language}`)

//       // استدعاء API لتحديث البرج
//       const response = await RealEstateAPI.tower.update(createdTowerId, updateData, language)
//       console.log(`✅ Tower definition stage updated to ${stage}:`, response)
//       console.log('✅ Response status:', response.status)
//       console.log('✅ Response data:', JSON.stringify(response.data, null, 2))
      
//       // تحديث البيانات المحلية
//       setTowerFormData(prev => ({ ...prev, definitionStage: stage }))
      
//     } catch (error) {
//       console.error(`❌ Error updating tower definition stage to ${stage}:`, error)
      
//       // طباعة تفاصيل أكثر عن الخطأ
//       if (error instanceof Error && 'response' in error) {
//         const axiosError = error as { response?: { status?: number; data?: unknown } }
//         console.error('Error status:', axiosError.response?.status)
//         console.error('Error data:', axiosError.response?.data)
//       }
      
//       // لا نعرض خطأ للمستخدم لأن هذا تحديث ثانوي
//     }
//   }

//   // دالة للتحقق من إمكانية الانتقال للخطوة التالية
//   const canGoToNextStep = () => {
//     switch (currentStep) {
//       case 1:
//         return step1Completed // يمكن الانتقال للخطوة 2 إذا تم إنشاء البرج
//       case 2:
//         return step2Completed // يمكن الانتقال للخطوة 3 إذا تم إنشاء البلوكات مع عدد الطوابق
//       case 3:
//         return step3Completed // يمكن الانتقال للخطوة 4 إذا تم تعريف الطوابق
//       case 4:
//         return step4Completed // يمكن الانتقال للخطوة 5 إذا تم إنشاء الطوابق
//       case 5:
//         return false // الخطوة الأخيرة
//       default:
//         return false
//     }
//   }

//   // Step navigation
//   const goToNextStep = () => {
//     if (currentStep < 5 && canGoToNextStep()) {
//       setCurrentStep(currentStep + 1)
//     }
//   }

//   const goToPreviousStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1)
//   }

//   // Complete building creation
//   const handleCompleteBuilding = () => {
//     console.log('Building data ready for API:', buildingData)
//     // Here you would send the data to your API
//     alert('تم إنشاء البرج بنجاح!')
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Debug Panel for FloorName API - Commented out for now */}

//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
//             منشئ الأبراج التفاعلي
//           </h1>
//           <p className="text-gray-600 text-center">
//             اتبع الخطوات لإنشاء برج جديد مع البلوكات والطوابق والشقق
//           </p>
//         </div>

//         {/* Progress Steps */}
//         <div className="flex justify-center mb-8">
//           <div className="flex items-center space-x-4 rtl:space-x-reverse">
//             {[1, 2, 3, 4, 5].map((step) => {
//               // تحديد حالة كل خطوة
//               const isCompleted = 
//                 (step === 1 && step1Completed) ||
//                 (step === 2 && step2Completed) ||
//                 (step === 3 && step3Completed) ||
//                 (step === 4 && step4Completed) ||
//                 (step === 5 && step5Completed)
              
//               const isCurrent = step === currentStep
//               const isAccessible = step <= currentStep || isCompleted
              
//               return (
//                 <div key={step} className="flex items-center">
//                   <div
//                     className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer relative ${
//                       isCompleted
//                         ? 'bg-green-600 text-white'
//                         : isCurrent
//                         ? 'bg-blue-600 text-white'
//                         : isAccessible
//                         ? 'bg-blue-400 text-white'
//                         : 'bg-gray-300 text-gray-500'
//                     }`}
//                     onClick={() => {
//                       // السماح بالانتقال للخطوات المكتملة أو الحالية
//                       if (isAccessible && (step <= currentStep || isCompleted)) {
//                         setCurrentStep(step)
//                       }
//                     }}
//                   >
//                     {isCompleted ? '✓' : step}
//                     {/* مؤشر الخطوة الحالية */}
//                     {isCurrent && (
//                       <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
//                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//                       </div>
//                     )}
//                   </div>
//                   {step < 5 && (
//                     <div
//                       className={`w-16 h-1 mx-2 transition-all ${
//                         isCompleted || (step < currentStep && (
//                           (step === 1 && step1Completed) ||
//                           (step === 2 && step2Completed) ||
//                           (step === 3 && step3Completed) ||
//                           (step === 4 && step4Completed)
//                         ))
//                           ? 'bg-green-500'
//                           : step < currentStep
//                           ? 'bg-blue-600'
//                           : 'bg-gray-300'
//                       }`}
//                     />
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         </div>

//         {/* Step Status Legend */}
//         <div className="flex justify-center mb-6">
//           <div className="flex items-center space-x-6 rtl:space-x-reverse text-xs">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
//               <span className="text-gray-600">خطوة مكتملة</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
//               <span className="text-gray-600">خطوة حالية</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
//               <span className="text-gray-600">خطوة قادمة</span>
//             </div>
//           </div>
//         </div>

//         {/* Status Information and Reset Button */}
//         <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
//           <div className="flex items-center space-x-4 rtl:space-x-reverse">
//             {/* Tower Status */}
//             {step1Completed && (
//               <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
//                 <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                 <span className="text-sm font-medium">✓ البرج منشأ</span>
//               </div>
//             )}
            
//             {/* Blocks Status */}
//             {step2Completed && (
//               <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
//                 <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                 <span className="text-sm font-medium">✓ البلوكات منشأة</span>
//               </div>
//             )}

//             {/* Floor Definitions Status */}
//             {step3Completed && (
//               <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
//                 <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                 <span className="text-sm font-medium">✓ تعريف الطوابق</span>
//               </div>
//             )}

//             {/* Floors Status */}
//             {step4Completed && (
//               <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
//                 <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                 <span className="text-sm font-medium">✓ الطوابق منشأة</span>
//               </div>
//             )}

//             {/* Units Status */}
//             {step5Completed && (
//               <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
//                 <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                 <span className="text-sm font-medium">✓ الشقق منشأة</span>
//               </div>
//             )}
//           </div>
          
//           {/* Reset Button */}
//           <Button 
//             onClick={() => {
//               setTowerFormData({
//                 arabicName: '',
//                 englishName: '',
//                 arabicDescription: '',
//                 englishDescription: '',
//                 address: '',
//                 latitude: '',
//                 longitude: '',
//                 constructionYear: '',
//                 mainImageUrl: '',
//                 countryId: 0,
//                 cityId: 0,
//                 areaId: 0,
//                 isActive: true,
//                 developerName: '',
//                 managementCompany: '',
//                 definitionStage: 1
//               })
//               setBuildingData({ name: '', blocks: [] })
//               setSelectedBlocks([])
//               setCreatedTowerId(null)
//               setCreatedBlocks([])
//               setCurrentStep(1)
//               // إعادة تعيين البيانات الجديدة
//               setBlockFloorsCount({})
//               setFloorDefinitions({})
//               // إعادة تعيين حالة إكمال الخطوات
//               setStep1Completed(false)
//               setStep2Completed(false)
//               setStep3Completed(false)
//               setStep4Completed(false)
//               setStep5Completed(false)
//               showInfo('تم إعادة تعيين النظام', 'إعادة تعيين')
//             }}
//             variant="outline" 
//             size="sm"
//             className="text-red-600 border-red-200 hover:bg-red-50"
//           >
//             <Settings className="w-4 h-4 mr-2" />
//             إعادة تعيين
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
//           {/* Left Panel: Form */}
//           <div className={currentStep===1?"xl:col-span-5 space-y-6":"xl:col-span-2 space-y-6"}>
//             {/* Step 1: Comprehensive Tower Creation */}
//             {currentStep === 1 && (
//               <Card className="p-6">
//                 <div className="flex items-center gap-3 mb-6">
//                   <Building2 className="w-6 h-6 text-blue-600" />
//                   <h2 className="text-xl font-semibold">إنشاء برج جديد</h2>
//                 </div>
                
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* العمود الأيسر - المعلومات الأساسية */}
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-medium text-gray-900 mb-4">المعلومات الأساسية</h3>
                    
//                     {/* اسم البرج بالعربية */}
//                     <div>
//                       <Label htmlFor="arabicName">اسم البرج (عربي) *</Label>
//                       <Input
//                         id="arabicName"
//                         type="text"
//                         value={towerFormData.arabicName}
//                         onChange={(e) => handleFormChange('arabicName', e.target.value)}
//                         placeholder="برج المملكة"
//                         className="mt-1"
//                         required
//                       />
//                     </div>

//                     {/* اسم البرج بالإنجليزية */}
//                     <div>
//                       <Label htmlFor="englishName">اسم البرج (إنجليزي) *</Label>
//                       <Input
//                         id="englishName"
//                         type="text"
//                         value={towerFormData.englishName}
//                         onChange={(e) => handleFormChange('englishName', e.target.value)}
//                         placeholder="Kingdom Tower"
//                         className="mt-1"
//                         required
//                       />
//                     </div>

//                     {/* الوصف بالعربية */}
//                     <div>
//                       <Label htmlFor="arabicDescription">الوصف (عربي)</Label>
//                       <textarea
//                         id="arabicDescription"
//                         value={towerFormData.arabicDescription}
//                         onChange={(e) => handleFormChange('arabicDescription', e.target.value)}
//                         placeholder="وصف مختصر للبرج..."
//                         className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         rows={3}
//                       />
//                     </div>

//                     {/* الوصف بالإنجليزية */}
//                     <div>
//                       <Label htmlFor="englishDescription">الوصف (إنجليزي)</Label>
//                       <textarea
//                         id="englishDescription"
//                         value={towerFormData.englishDescription}
//                         onChange={(e) => handleFormChange('englishDescription', e.target.value)}
//                         placeholder="Brief description of the tower..."
//                         className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         rows={3}
//                       />
//                     </div>

//                     {/* سنة البناء */}
//                     <div>
//                       <Label htmlFor="constructionYear">سنة البناء</Label>
//                       <div className="relative">
//                         <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <Input
//                           id="constructionYear"
//                           type="number"
//                           value={towerFormData.constructionYear}
//                           onChange={(e) => handleFormChange('constructionYear', e.target.value)}
//                           placeholder="2024"
//                           className="mt-1 pl-10"
//                           min="1900"
//                           max={new Date().getFullYear() + 10}
//                         />
//                       </div>
//                     </div>

//                     {/* رابط الصورة الرئيسية */}
//                     <div>
//                       <Label htmlFor="mainImageUrl">رابط الصورة الرئيسية</Label>
//                       <div className="relative">
//                         <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <Input
//                           id="mainImageUrl"
//                           type="url"
//                           value={towerFormData.mainImageUrl}
//                           onChange={(e) => handleFormChange('mainImageUrl', e.target.value)}
//                           placeholder="https://example.com/tower-image.jpg"
//                           className="mt-1 pl-10"
//                         />
//                       </div>
//                     </div>

//                     {/* اسم المطور */}
//                     <div>
//                       <Label htmlFor="developerName">اسم المطور</Label>
//                       <div className="relative">
//                         <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <Input
//                           id="developerName"
//                           type="text"
//                           value={towerFormData.developerName}
//                           onChange={(e) => handleFormChange('developerName', e.target.value)}
//                           placeholder="شركة التطوير العقاري"
//                           className="mt-1 pl-10"
//                         />
//                       </div>
//                     </div>

//                     {/* شركة الإدارة */}
//                     <div>
//                       <Label htmlFor="managementCompany">شركة الإدارة</Label>
//                       <div className="relative">
//                         <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <Input
//                           id="managementCompany"
//                           type="text"
//                           value={towerFormData.managementCompany}
//                           onChange={(e) => handleFormChange('managementCompany', e.target.value)}
//                           placeholder="شركة الإدارة والصيانة"
//                           className="mt-1 pl-10"
//                         />
//                       </div>
//                     </div>

//                     {/* مرحلة التعريف */}
//                     <div>
//                       <Label htmlFor="definitionStage">مرحلة التعريف</Label>
//                       <div className="relative">
//                         <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
//                         <select
//                           id="definitionStage"
//                           value={towerFormData.definitionStage}
//                           onChange={(e) => handleFormChange('definitionStage', parseInt(e.target.value))}
//                           className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//                         >
//                           <option value={1}>المرحلة 1: المعلومات الأساسية</option>
//                           <option value={2}>المرحلة 2: الطوابق والبلوكات</option>
//                           <option value={3}>المرحلة 3: الوحدات والشقق</option>
//                           <option value={4}>المرحلة 4: التصاميم والمخططات</option>
//                           <option value={5}>المرحلة 5: الأسعار والمدفوعات</option>
//                           <option value={6}>المرحلة 6: مكتمل</option>
//                         </select>
//                         {/* سهم القائمة المنسدلة */}
//                         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                           <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* العمود الأيمن - الموقع والعنوان */}
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-medium text-gray-900 mb-4">الموقع والعنوان</h3>
                    
//                     {/* الدولة */}
//                     <div>
//                       <Label htmlFor="countryId">الدولة *</Label>
//                       <select
//                         id="countryId"
//                         value={towerFormData.countryId}
//                         onChange={(e) => {
//                           const countryId = parseInt(e.target.value)
//                           handleFormChange('countryId', countryId)
//                           setSelectedCountry(countryId)
//                         }}
//                         className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         required
//                       >
//                         <option value={0}>اختر الدولة</option>
//                         {countries?.map((country: {id: number, arabicName: string, englishName: string}) => (
//                           <option key={country.id} value={country.id}>
//                             {language === 'ar' ? country.arabicName : country.englishName}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* المدينة */}
//                     <div>
//                       <Label htmlFor="cityId">المدينة *</Label>
//                       <select
//                         id="cityId"
//                         value={towerFormData.cityId}
//                         onChange={(e) => {
//                           const cityId = parseInt(e.target.value)
//                           handleFormChange('cityId', cityId)
//                           setSelectedCity(cityId)
//                         }}
//                         className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         disabled={!selectedCountry}
//                         required
//                       >
//                         <option value={0}>اختر المدينة</option>
//                         {cities?.map((city: {id: number, arabicName: string, englishName: string}) => (
//                           <option key={city.id} value={city.id}>
//                             {language === 'ar' ? city.arabicName : city.englishName}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* المنطقة */}
//                     <div>
//                       <Label htmlFor="areaId">المنطقة *</Label>
//                       <select
//                         id="areaId"
//                         value={towerFormData.areaId}
//                         onChange={(e) => handleFormChange('areaId', parseInt(e.target.value))}
//                         className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         disabled={!selectedCity}
//                         required
//                       >
//                         <option value={0}>اختر المنطقة</option>
//                         {areas?.map((area: {id: number, arabicName: string, englishName: string}) => (
//                           <option key={area.id} value={area.id}>
//                             {language === 'ar' ? area.arabicName : area.englishName}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* العنوان التفصيلي */}
//                     <div>
//                       <Label htmlFor="address">العنوان التفصيلي</Label>
//                       <Input
//                         id="address"
//                         type="text"
//                         value={towerFormData.address}
//                         onChange={(e) => handleFormChange('address', e.target.value)}
//                         placeholder="شارع الملك فهد، حي العليا"
//                         className="mt-1"
//                       />
//                     </div>

//                     {/* خريطة تحديد الموقع */}
//                     <MapComponent 
//                       latitude={towerFormData.latitude}
//                       longitude={towerFormData.longitude}
//                       onLocationSelect={handleLocationSelect}
//                     />
//                   </div>
//                 </div>

//                 {/* أزرار التحكم */}
//                 <div className="mt-8 flex justify-between gap-4">
//                   <div>
//                     {/* زر التالي - يظهر إذا تم إكمال الخطوة الأولى */}
//                     {step1Completed && (
//                       <Button 
//                         onClick={goToNextStep}
//                         variant="outline"
//                         className="px-6 py-2 flex items-center gap-2"
//                       >
//                         <>
//                           <ArrowRight className="w-4 h-4" />
//                           التالي
//                         </>
//                       </Button>
//                     )}
//                   </div>
                  
//                   <Button 
//                     onClick={handleSubmitTower}
//                     disabled={isSubmitting || !towerFormData.arabicName.trim() || !towerFormData.englishName.trim() || 
//                               !towerFormData.countryId || !towerFormData.cityId || !towerFormData.areaId}
//                     className="px-6 py-2 flex items-center gap-2"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                         جاري الحفظ...
//                       </>
//                     ) : (
//                       <>
//                         <Save className="w-4 h-4" />
//                         {step1Completed ? 'إعادة إنشاء البرج' : 'حفظ والمتابعة'}
//                         <ArrowRight className="w-4 h-4" />
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </Card>
//             )}

//             {/* Step 2: Blocks */}
//             {currentStep === 2 && (
//               <Card className="p-6">
//                 <h3 className="text-xl font-semibold mb-4 text-gray-900">
//                   المرحلة الثانية: البلوكات وعدد الطوابق
//                 </h3>
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       اختر البلوكات من القائمة المتاحة <span className="text-red-500">*</span>
//                     </label>
//                     <div className="mb-2 p-2 bg-blue-50 rounded-md">
//                       <p className="text-xs text-blue-700">
//                         💡 يتم تحميل البلوكات من قاعدة البيانات. سيتم ربط البلوكات المختارة بهذا البرج فقط.
//                       </p>
//                     </div>
//                     <MultiSelect
//                       options={availableBlocks?.map((block: { arabicName: string; englishName: string }) => 
//                         language === 'ar' ? block.arabicName : block.englishName
//                       ) || initialBlockOptions}
//                       selectedValues={selectedBlocks}
//                       onChange={(newBlocks) => {
//                         setSelectedBlocks(newBlocks)
//                         // إعادة تعيين عدد الطوابق للبلوكات الجديدة
//                         const newBlockFloorsCount = { ...blockFloorsCount }
//                         newBlocks.forEach(blockName => {
//                           if (!newBlockFloorsCount[blockName]) {
//                             newBlockFloorsCount[blockName] = 5 // قيمة افتراضية
//                           }
//                         })
//                         // حذف البلوكات غير المختارة
//                         Object.keys(newBlockFloorsCount).forEach(blockName => {
//                           if (!newBlocks.includes(blockName)) {
//                             delete newBlockFloorsCount[blockName]
//                           }
//                         })
//                         setBlockFloorsCount(newBlockFloorsCount)
//                       }}
//                       placeholder="اختر بلوكات من البلوكات المتاحة..."
//                       allowCustom={false}
//                     />
//                     {availableBlocks && availableBlocks.length > 0 && (
//                       <p className="text-xs text-gray-500 mt-1">
//                         {availableBlocks.length} بلوك متاح في النظام
//                       </p>
//                     )}
//                   </div>

//                   {/* إدخال عدد الطوابق لكل بلوك */}
//                   {selectedBlocks.length > 0 && (
//                     <div className="border-t pt-4">
//                       <h4 className="text-lg font-medium text-gray-900 mb-3">
//                         تحديد عدد الطوابق لكل بلوك
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {selectedBlocks.map((blockName, index) => (
//                           <div key={blockName} className="p-4 bg-gray-50 rounded-lg">
//                             <div className="flex items-center justify-between mb-2">
//                               <label className="text-sm font-medium text-gray-700">
//                                 البلوك {String.fromCharCode(65 + index)} ({blockName})
//                               </label>
//                               <div className="flex items-center gap-2">
//                                 <Building2 className="w-4 h-4 text-blue-600" />
//                                 <span className="text-xs text-gray-500">طوابق</span>
//                               </div>
//                             </div>
//                             <Input
//                               type="number"
//                               min="1"
//                               max="50"
//                               value={blockFloorsCount[blockName] || 5}
//                               onChange={(e) => {
//                                 const count = parseInt(e.target.value) || 1
//                                 setBlockFloorsCount(prev => ({
//                                   ...prev,
//                                   [blockName]: count
//                                 }))
//                               }}
//                               placeholder="عدد الطوابق"
//                               className="text-center font-semibold"
//                             />
//                             <p className="text-xs text-gray-500 mt-1 text-center">
//                               الطوابق: من الطابق الأول إلى الطابق {blockFloorsCount[blockName] || 5}
//                             </p>
//                           </div>
//                         ))}
//                       </div>
//                       <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                         <p className="text-sm text-green-700">
//                           💡 <strong>إجمالي الطوابق المختارة:</strong> {Object.values(blockFloorsCount).reduce((sum, count) => sum + count, 0)} طابق
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                   <div className="flex gap-2">
                   
                  
//                     <Button
//                       onClick={handleCreateBlocks}
//                       disabled={selectedBlocks.length === 0 || !createdTowerId || isSubmitting}
//                       className="flex-1 bg-green-600 hover:bg-green-700"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                           جاري الإنشاء...
//                         </>
//                       ) : (
//                         <>
//                           <Building className="w-4 h-4" />
//                           {step2Completed ? 'إعادة إنشاء البلوكات' : 'حفظ  '}
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                   <div className='flex gap-2 '>
//                      <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
//                       السابق
//                     </Button>
//                     {step2Completed && (
//                       <Button
//                         onClick={goToNextStep}
//                         variant="outline"
//                         className="flex-1"
//                       >
//                         <>
//                           <ArrowRight className="w-4 h-4" />
//                           التالي
//                         </>
//                       </Button>
//                     )}
//                     </div>
                  
//                   {/* معلومات إضافية */}
//                   {createdTowerId && (
//                     <div className="bg-blue-50 p-3 rounded-lg">
//                       <p className="text-sm text-blue-700">
//                         ✅ تم إنشاء البرج بنجاح. قم باختيار البلوكات وإنشائها.
//                       </p>
//                     </div>
//                   )}
                  
//                   {createdBlocks.length > 0 && (
//                     <div className="bg-green-50 p-3 rounded-lg">
//                       <p className="text-sm text-green-700">
//                         ✅ تم إنشاء {createdBlocks.length} بلوك: {createdBlocks.map(b => b.name).join(', ')}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             )}

//             {/* Step 3: Floor Definitions - تعريف الطوابق التفصيلي */}
//             {currentStep === 3 && (
//               <Card className="p-6">
//                 <h3 className="text-xl font-semibold mb-4 text-gray-900">
//                   المرحلة الثالثة: تعريف الطوابق
//                 </h3>
                
//                 {/* عرض البلوكات المنشأة وعدد طوابقها */}
//                 {createdBlocks.length > 0 && (
//                   <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
//                     <h4 className="text-lg font-medium text-blue-900 mb-3">البلوكات المنشأة:</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                       {createdBlocks.map((block, index) => (
//                         <div key={block.id} className="bg-white p-3 rounded-lg shadow-sm border">
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <div className="font-semibold text-gray-900">
//                                 البلوك {String.fromCharCode(65 + index)}
//                               </div>
//                               <div className="text-sm text-gray-600">{block.originalName}</div>
//                             </div>
//                             <div className="text-right">
//                               <div className="text-lg font-bold text-blue-600">
//                                 {blockFloorsCount[block.originalName] || 0}
//                               </div>
//                               <div className="text-xs text-gray-500">طابق</div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="mt-3 text-center">
//                       <span className="text-sm font-medium text-green-700">
//                         إجمالي الطوابق المطلوب تعريفها: {Object.values(blockFloorsCount).reduce((sum, count) => sum + count, 0)} طابق
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 {/* الرسم التفاعلي للطوابق - مشابه لرسم الشقق */}
//                 <div className="mb-6">
//                   <h4 className="text-lg font-medium text-gray-900 mb-3">الرسم التفاعلي للطوابق</h4>
//                   <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[300px]">
//                     <div className="space-y-4">
//                       {createdBlocks.map((block, blockIndex) => {
//                         const floorsCount = blockFloorsCount[block.originalName] || 0
//                         return (
//                           <div key={block.id} className="bg-white p-4 rounded-lg shadow-sm">
//                             <div className="text-lg font-semibold text-gray-900 mb-3 text-center">
//                               البلوك {String.fromCharCode(65 + blockIndex)} ({block.originalName})
//                             </div>
//                             <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
//                               {Array.from({ length: floorsCount }, (_, floorIndex) => {
//                                 const floorNumber = floorIndex + 1
//                                 const floorKey = `${block.name}-floor-${floorNumber}`
//                                 const isSelected = floorDefinitions[floorKey]?.selectedFromVisualization || false
                                
//                                 return (
//                                   <button
//                                     key={floorKey}
//                                     type="button"
//                                     onClick={() => {
//                                       const newDefinitions = { ...floorDefinitions }
//                                       if (isSelected) {
//                                         delete newDefinitions[floorKey]
//                                       } else {
//                                         newDefinitions[floorKey] = {
//                                           floorCode: `F${floorNumber}`,
//                                           arabicName: `الطابق ${floorNumber}`,
//                                           englishName: `Floor ${floorNumber}`,
//                                           floorNumber: floorNumber,
//                                           floorType: FloorType.Regular,
//                                           unitsCount: 4,
//                                           selectedFromVisualization: true
//                                         }
//                                       }
//                                       setFloorDefinitions(newDefinitions)
//                                     }}
//                                     className={`
//                                       relative w-12 h-12 rounded-lg border-2 transition-all duration-200 
//                                       flex items-center justify-center text-xs font-semibold
//                                       ${isSelected 
//                                         ? 'bg-blue-600 text-white border-blue-700 shadow-lg transform scale-105' 
//                                         : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100 hover:border-blue-400'
//                                       }
//                                     `}
//                                     title={`الطابق ${floorNumber} - البلوك ${String.fromCharCode(65 + blockIndex)}`}
//                                   >
//                                     {floorNumber}
//                                     {isSelected && (
//                                       <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
//                                         <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
//                                       </div>
//                                     )}
//                                   </button>
//                                 )
//                               })}
//                             </div>
//                           </div>
//                         )
//                       })}
//                     </div>
                    
//                     {Object.keys(floorDefinitions).length > 0 && (
//                       <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//                         <div className="flex items-center justify-between">
//                           <span className="text-sm font-medium text-blue-900">
//                             تم اختيار {Object.keys(floorDefinitions).length} طابق من الرسم
//                           </span>
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setFloorDefinitions({})}
//                             className="text-xs"
//                           >
//                             مسح الكل
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 </Card>
//             )}

//             {/* النموذج التفصيلي لتعريف الطوابق - في كارد منفصل */}
//             {currentStep === 3 && Object.keys(floorDefinitions).length > 0 && (
//                   <Card className="p-6">
//                     <h4 className="text-lg font-medium text-gray-900">تفاصيل الطوابق المختارة</h4>
//                     <div className="space-y-4">
//                     {Object.entries(floorDefinitions).map(([floorKey, definition]) => (
//                       <div key={floorKey} className="p-4 bg-gray-50 rounded-lg border">
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                           {/* كود الطابق */}
//                           <div>
//                             <Label htmlFor={`floorCode-${floorKey}`}>كود الطابق</Label>
//                             <Input
//                               id={`floorCode-${floorKey}`}
//                               value={definition.floorCode}
//                               onChange={(e) => {
//                                 setFloorDefinitions(prev => ({
//                                   ...prev,
//                                   [floorKey]: { ...prev[floorKey], floorCode: e.target.value }
//                                 }))
//                               }}
//                               placeholder="F1, B1, G..."
//                             />
//                           </div>

//                           {/* الاسم العربي */}
//                           <div>
//                             <Label htmlFor={`arabicName-${floorKey}`}>الاسم العربي</Label>
//                             <Input
//                               id={`arabicName-${floorKey}`}
//                               value={definition.arabicName}
//                               onChange={(e) => {
//                                 setFloorDefinitions(prev => ({
//                                   ...prev,
//                                   [floorKey]: { ...prev[floorKey], arabicName: e.target.value }
//                                 }))
//                               }}
//                               placeholder="الطابق الأول"
//                             />
//                           </div>

//                           {/* الاسم الإنجليزي */}
//                           <div>
//                             <Label htmlFor={`englishName-${floorKey}`}>الاسم الإنجليزي</Label>
//                             <Input
//                               id={`englishName-${floorKey}`}
//                               value={definition.englishName}
//                               onChange={(e) => {
//                                 setFloorDefinitions(prev => ({
//                                   ...prev,
//                                   [floorKey]: { ...prev[floorKey], englishName: e.target.value }
//                                 }))
//                               }}
//                               placeholder="First Floor"
//                             />
//                           </div>

//                           {/* نوع الطابق */}
//                           <div>
//                             <Label htmlFor={`floorType-${floorKey}`}>نوع الطابق</Label>
//                             <select
//                               id={`floorType-${floorKey}`}
//                               value={definition.floorType}
//                               onChange={(e) => {
//                                 setFloorDefinitions(prev => ({
//                                   ...prev,
//                                   [floorKey]: { ...prev[floorKey], floorType: parseInt(e.target.value) as FloorType }
//                                 }))
//                               }}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             >
//                               <option value={FloorType.Regular}>طابق عادي</option>
//                               <option value={FloorType.Ground}>طابق أرضي</option>
//                               <option value={FloorType.Basement}>قبو/بدروم</option>
//                               <option value={FloorType.Parking}>موقف سيارات</option>
//                               <option value={FloorType.Commercial}>تجاري</option>
//                               <option value={FloorType.Office}>مكاتب</option>
//                               <option value={FloorType.Rooftop}>سطح</option>
//                               <option value={FloorType.Amenities}>مرافق</option>
//                             </select>
//                           </div>

//                           {/* عدد الوحدات */}
//                           <div>
//                             <Label htmlFor={`unitsCount-${floorKey}`}>عدد الوحدات</Label>
//                             <Input
//                               id={`unitsCount-${floorKey}`}
//                               type="number"
//                               min="0"
//                               max="20"
//                               value={definition.unitsCount}
//                               onChange={(e) => {
//                                 setFloorDefinitions(prev => ({
//                                   ...prev,
//                                   [floorKey]: { ...prev[floorKey], unitsCount: parseInt(e.target.value) || 0 }
//                                 }))
//                               }}
//                               placeholder="4"
//                             />
//                           </div>

//                           {/* رقم الطابق */}
//                           <div>
//                             <Label htmlFor={`floorNumber-${floorKey}`}>رقم الطابق</Label>
//                             <Input
//                               id={`floorNumber-${floorKey}`}
//                               type="number"
//                               value={definition.floorNumber}
//                               onChange={(e) => {
//                                 setFloorDefinitions(prev => ({
//                                   ...prev,
//                                   [floorKey]: { ...prev[floorKey], floorNumber: parseInt(e.target.value) || 1 }
//                                 }))
//                               }}
//                               placeholder="1"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   </Card>
//                 )}

//                 {/* أزرار التحكم */}
//                 <Card className="p-6">
//                 <div className="flex gap-2 mt-6">
//                   <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
//                     السابق
//                   </Button>
//                   <Button
//                     onClick={() => {
//                       if (Object.keys(floorDefinitions).length > 0) {
//                         setStep3Completed(true)
//                         setCurrentStep(4)
//                         showSuccess(`تم تعريف ${Object.keys(floorDefinitions).length} طابق بنجاح!`, 'تم التعريف')
//                       } else {
//                         showWarning('يرجى تعريف طابق واحد على الأقل', 'لم يتم التعريف')
//                       }
//                     }}
//                     disabled={Object.keys(floorDefinitions).length === 0}
//                     className="flex-1 bg-green-600 hover:bg-green-700"
//                   >
//                     حفظ تعريف الطوابق
//                   </Button>
//                 </div>

//                 {step3Completed && (
//                   <div className="mt-4">
//                     <Button
//                       onClick={goToNextStep}
//                       variant="outline"
//                       className="w-full"
//                     >
//                       <>
//                         <ArrowRight className="w-4 h-4" />
//                         التالي - إنشاء الطوابق
//                       </>
//                     </Button>
//                   </div>
//                 )}
//                 </Card>
//             )}

//             {/* Step 4: Create Floors in Database */}
//             {currentStep === 4 && (
//               <Card className="p-6">
//                 <h3 className="text-xl font-semibold mb-4 text-gray-900">
//                   المرحلة الرابعة: إنشاء الطوابق في قاعدة البيانات
//                 </h3>
                
//                 {/* ملخص تعريفات الطوابق */}
//                 {Object.keys(floorDefinitions).length > 0 && (
//                   <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
//                     <h4 className="text-lg font-medium text-green-900 mb-3">ملخص الطوابق المعرفة:</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       {Object.entries(floorDefinitions).map(([floorKey, floorDef]) => {
//                         const blockName = floorKey.split('-')[0]
//                         return (
//                           <div key={floorKey} className="bg-white p-3 rounded-lg shadow-sm border">
//                             <div className="flex items-center justify-between">
//                               <div>
//                                 <div className="font-semibold text-gray-900">
//                                   {floorDef.arabicName}
//                                 </div>
//                                 <div className="text-sm text-gray-600">
//                                   البلوك {blockName} - {floorDef.floorCode}
//                                 </div>
//                                 <div className="text-xs text-blue-600">
//                                   {floorDef.floorType === FloorType.Regular ? 'طابق عادي' :
//                                    floorDef.floorType === FloorType.Ground ? 'طابق أرضي' :
//                                    floorDef.floorType === FloorType.Commercial ? 'تجاري' :
//                                    floorDef.floorType === FloorType.Parking ? 'موقف سيارات' :
//                                    'نوع آخر'}
//                                 </div>
//                               </div>
//                               <div className="text-right">
//                                 <div className="text-lg font-bold text-blue-600">
//                                   {floorDef.unitsCount}
//                                 </div>
//                                 <div className="text-xs text-gray-500">وحدة</div>
//                               </div>
//                             </div>
//                           </div>
//                         )
//                       })}
//                     </div>
//                     <div className="mt-3 text-center">
//                       <span className="text-sm font-medium text-green-700">
//                         إجمالي: {Object.keys(floorDefinitions).length} طابق، {Object.values(floorDefinitions).reduce((sum, def) => sum + def.unitsCount, 0)} وحدة
//                       </span>
//                     </div>
//                   </div>
//                 )}
//                 <div className="space-y-4">
//                   <div className="p-4 bg-blue-50 rounded-lg">
//                     <p className="text-sm text-blue-700">
//                       🚀 <strong>جاهز للإنشاء!</strong> سيتم إنشاء الطوابق والوحدات في قاعدة البيانات باستخدام التعريفات المفصلة من الخطوة السابقة.
//                     </p>
//                   </div>
//                      <div className="mb-2 p-2 bg-blue-50 rounded-md">
//                       <p className="text-xs text-blue-700">
//                         � جاري جلب أسماء الطوابق من قاعدة البيانات... انظر إلى لوحة التشخيص أعلاه لمعرفة الحالة.
//                       </p>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
//                       السابق
//                     </Button>
//                     <Button
//                       onClick={() => {
//                         // مؤقتاً نفترض أن الطوابق تم إنشاؤها بنجاح
//                         setStep4Completed(true)
//                         showSuccess('تم تحضير البيانات للمرحلة التالية!', 'جاهز للمتابعة')
//                       }}
//                       disabled={Object.keys(floorDefinitions).length === 0 || isSubmitting}
//                       className="flex-1 bg-green-600 hover:bg-green-700"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                           جاري الإنشاء...
//                         </>
//                       ) : (
//                         <>
//                           <Building2 className="w-4 h-4" />
//                           {step4Completed ? 'إعادة إنشاء الطوابق' : 'إنشاء الطوابق والوحدات'}
//                         </>
//                       )}
//                     </Button>
//                   </div>

//                   {step4Completed && (
//                     <div className="mt-4">
//                       <Button
//                         onClick={goToNextStep}
//                         variant="outline"
//                         className="w-full"
//                       >
//                         <>
//                           <ArrowRight className="w-4 h-4" />
//                           التالي - إدارة الشقق
//                         </>
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             )}

//             {/* Step 5: Unit Management */}
//             {currentStep === 5 && (
//               <Card className="p-6">
//                 <h3 className="text-xl font-semibold mb-4 text-gray-900">
//                   المرحلة الخامسة: الشقق
//                 </h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       اختر أرقام الشقق <span className="text-red-500">*</span>
//                     </label>
//                     <MultiSelect
//                       options={initialUnitOptions}
//                       selectedValues={selectedUnits}
//                       onChange={setSelectedUnits}
//                       placeholder="اختر أو أضف شقق..."
//                       allowCustom={true}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       اختر البلوكات <span className="text-red-500">*</span>
//                     </label>
//                     <MultiSelect
//                       options={buildingData.blocks.map(block => block.name)}
//                       selectedValues={selectedBlocksForUnits}
//                       onChange={(values) => {
//                         setSelectedBlocksForUnits(values)
//                         setSelectedFloorsForUnits([]) // Reset floors when blocks change
//                       }}
//                       placeholder="اختر البلوكات..."
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       اختر الطوابق <span className="text-red-500">*</span>
//                     </label>
//                     <MultiSelect
//                       options={(() => {
//                         const floors = new Set<string>()
//                         buildingData.blocks.forEach(block => {
//                           if (selectedBlocksForUnits.includes(block.name)) {
//                             block.floors.forEach(floor => floors.add(floor.number))
//                           }
//                         })
//                         return Array.from(floors)
//                       })()}
//                       selectedValues={selectedFloorsForUnits}
//                       onChange={setSelectedFloorsForUnits}
//                       placeholder="اختر الطوابق..."
//                     />
//                   </div>
//                   <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
//                     <p className="text-sm text-blue-700">
//                       💾 <strong>ملاحظة:</strong> عند الضغط على "إنشاء الشقق"، سيتم إنشاؤها فعلياً في قاعدة البيانات باستخدام الـ API.
//                     </p>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
//                       السابق
//                     </Button>
//                     <Button
//                       onClick={handleAddUnits}
//                       disabled={isSubmitting || selectedUnits.length === 0 || selectedFloorsForUnits.length === 0 || selectedBlocksForUnits.length === 0}
//                       className="flex-1"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                           جاري إنشاء الشقق...
//                         </>
//                       ) : (
//                         '🏠 إنشاء الشقق '
//                       )}
//                     </Button>
//                   </div>
                  
//                   {/* أزرار التحكم في الاختيار البصري */}
//                   {visuallySelectedUnits.size > 0 && (
//                     <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
//                       <div className="flex items-center justify-between mb-3">
//                         <span className="text-sm font-bold text-blue-900 flex items-center gap-1">
//                           ✅ تم اختيار {visuallySelectedUnits.size} شقة من الرسم
//                         </span>
//                         <Button 
//                           onClick={clearVisualSelection} 
//                           variant="outline" 
//                           size="sm"
//                           className="text-xs bg-white hover:bg-red-50 border-red-200 text-red-700"
//                         >
//                           🗑️ مسح الكل
//                         </Button>
//                       </div>
//                       <div className="text-xs text-blue-700 bg-white bg-opacity-50 p-2 rounded">
//                         <strong>الشقق المختارة:</strong> {Array.from(visuallySelectedUnits).map(unitId => {
//                           // استخراج رقم الشقة من الID
//                           const parts = unitId.split('-')
//                           const blockName = parts[1] || 'غير معروف'
//                           const floorNumber = parts[2] || 'غير معروف'
//                           const unitNumber = parts[3] || parts.pop()
//                           return `${blockName}-${floorNumber}-${unitNumber}`
//                         }).join(' • ')}
//                       </div>
//                       <div className="text-xs text-green-700 mt-2 font-medium">
//                         💡 يمكنك لاحقاً تطبيق تصاميم على هذه الشقق المختارة
//                       </div>
//                     </div>
//                   )}
                  
//                   {/* تعليمات إضافية للمستخدم */}
//                   {visuallySelectedUnits.size === 0 && buildingData.blocks.some(block => 
//                     block.floors.some(floor => floor.units.length > 0)
//                   ) && (
//                     <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                       <div className="text-sm text-yellow-800">
//                         <div className="font-bold mb-1">💡 نصيحة:</div>
//                         <div>انظر إلى الرسم على اليمين واضغط على أي شقة لاختيارها.</div>
//                         <div className="text-xs mt-1">كل مربع صغير في الرسم يمثل شقة قابلة للنقر.</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Complete Building Button */}
//                 {buildingData.blocks.some(block => 
//                   block.floors.some(floor => floor.units.length > 0)
//                 ) && (
//                   <div className="mt-6 pt-4 border-t">
//                     <Button
//                       onClick={handleCompleteBuilding}
//                       className="w-full bg-green-600 hover:bg-green-700"
//                     >
//                       🎉 إكمال إنشاء البرج
//                     </Button>
//                   </div>
//                 )}
//               </Card>
//             )}

//             {/* Building Summary */}
//             {currentStep > 1 && (
//               <Card className="p-6 bg-blue-50">
//                 <h4 className="text-lg font-semibold mb-3 text-blue-900">ملخص البرج</h4>
//                 <div className="space-y-2 text-sm text-blue-800">
//                   <p><strong>اسم البرج:</strong> {buildingData.name || towerFormData.arabicName || 'غير محدد'}</p>
//                   {towerFormData.developerName && (
//                     <p><strong>المطور:</strong> {towerFormData.developerName}</p>
//                   )}
//                   {towerFormData.managementCompany && (
//                     <p><strong>شركة الإدارة:</strong> {towerFormData.managementCompany}</p>
//                   )}
//                   <p>
//                     <strong>مرحلة التعريف:</strong> 
//                     <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
//                       towerFormData.definitionStage === 6 ? 'bg-green-100 text-green-800' :
//                       towerFormData.definitionStage >= 4 ? 'bg-blue-100 text-blue-800' :
//                       towerFormData.definitionStage >= 2 ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-gray-100 text-gray-800'
//                     }`}>
//                       المرحلة {towerFormData.definitionStage}
//                       {towerFormData.definitionStage === 6 && ' ✓'}
//                     </span>
//                   </p>
//                   <p><strong>عدد البلوكات:</strong> {buildingData.blocks.length}</p>
//                   <p><strong>إجمالي الطوابق:</strong> {buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)}</p>
//                   <p><strong>إجمالي الشقق:</strong> {buildingData.blocks.reduce((total, block) => 
//                     total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
//                   )}</p>
//                   {visuallySelectedUnits.size > 0 && (
//                     <p><strong>الشقق المختارة بصرياً:</strong> {visuallySelectedUnits.size}</p>
//                   )}
//                 </div>
//               </Card>
//             )}
//           </div>

//           {/* Right Panel: Visualization */}
//           <div className={currentStep === 1 ? "xl:col-span-2 xl:sticky xl:top-4" : "xl:col-span-5 xl:sticky xl:top-4"}>
//             <Card className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h4 className="text-lg font-semibold text-gray-900">المعاينة المرئية</h4>
//                 <div className="flex gap-2">
//                   <div className="flex bg-gray-100 rounded-lg p-1">
//                     <button
//                       onClick={() => setView3D(false)}
//                       className={`px-3 py-1 rounded-md text-sm transition-colors ${
//                         !view3D 
//                           ? 'bg-white text-blue-600 shadow-sm' 
//                           : 'text-gray-600 hover:text-gray-900'
//                       }`}
//                     >
//                       2D
//                     </button>
//                     <button
//                       onClick={() => setView3D(true)}
//                       className={`px-3 py-1 rounded-md text-sm transition-colors ${
//                         view3D 
//                           ? 'bg-white text-blue-600 shadow-sm' 
//                           : 'text-gray-600 hover:text-gray-900'
//                       }`}
//                     >
//                       3D
//                     </button>
//                   </div>
//                   <button
//                     onClick={() => setShowFullScreenVisualization(true)}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
//                     title="عرض بحجم كامل"
//                   >
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
//                     </svg>
//                     عرض كامل
//                   </button>
//                 </div>
//               </div>
//               <div 
//                 style={{height: '600px', overflow: 'hidden'}} 
//                 className="rounded-lg border border-gray-200 relative group"
//               >
//                 <SimpleBuildingVisualization />
//                 {/* Scroll indicator */}
//                 <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
//                   اسحب للتنقل
//                 </div>
//               </div>
//             </Card>
//           </div>
//         </div>

//         {/* Full Screen Visualization Modal */}
//         {showFullScreenVisualization && (
//           <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-2xl max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col">
//             {/* Modal Header */}
//             <div className="flex justify-between items-center p-4 border-b border-gray-200">
//               <div>
//                 <h3 className="text-xl font-bold text-gray-900">
//                   المعاينة الكاملة - {buildingData.name || 'البرج'}
//                 </h3>
//                 <p className="text-sm text-gray-600 mt-1">
//                   عرض تفصيلي بحجم كامل للمبنى
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowFullScreenVisualization(false)}
//                 className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                 title="إغلاق"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="flex-1 p-4 overflow-auto">
//               <div className="w-full h-full min-h-[600px]">
//                 <SimpleBuildingVisualization />
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="p-4 border-t border-gray-200 bg-gray-50">
//               <div className="flex justify-between items-center">
//                 <div className="text-sm text-gray-600">
//                   💡 يمكنك التكبير والتصغير باستخدام عجلة الماوس أو إيماءات اللمس
//                 </div>
//                 <button
//                   onClick={() => setShowFullScreenVisualization(false)}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   إغلاق العرض الكامل
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//         </div>
      
   
//   )


// export default BuildingBuilderPage