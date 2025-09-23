// import React from 'react'
// import { Plus, Edit, Trash2, MapPin } from 'lucide-react'
// import { PageHeader } from '../components/ui/PageHeader'
// import { DataTable } from '../components/ui/DataTable'
// import {
//   Button,
//   Input,
//   Select,
//   Checkbox,
//   Grid,
//   FormModal,
//   ConfirmationDialog,
//   Badge,
//   Loader,
//   EmptyState
// } from '../components/ui'

// import { useLanguage } from '../hooks/useLanguage'
// import { useNotifications } from '../hooks/useNotificationContext'
// import { useConfirmation } from '../hooks/useConfirmation'
// import { useFormModal } from '../hooks/useFormModal'
// import { useAreas, useCities } from '../hooks/useApi'
// import { RealEstateAPI } from '../services/api'

// import type { AreaListDto, CityListDto } from '../types/api'

// const AreasPage: React.FC = () => {
//   const [areasList, setAreasList] = useState<Area[]>(areas)
//   const [isAddingNew, setIsAddingNew] = useState(false)
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [formData, setFormData] = useState({
//     name: '',
//     nameAr: '',
//     cityId: '',
//     isActive: true
//   })

//   const getCityName = (cityId: string) => {
//     const city = cities.find(c => c.id === cityId)
//     return city ? city.nameAr : 'غير محدد'
//   }

//   const getCountryName = (cityId: string) => {
//     const city = cities.find(c => c.id === cityId)
//     if (city) {
//       const country = countries.find(co => co.id === city.countryId)
//       return country ? country.nameAr : 'غير محدد'
//     }
//     return 'غير محدد'
//   }

//   const handleAdd = () => {
//     setIsAddingNew(true)
//     setFormData({ name: '', nameAr: '', cityId: '', isActive: true })
//   }

//   const handleEdit = (area: Area) => {
//     setEditingId(area.id)
//     setFormData({
//       name: area.name,
//       nameAr: area.nameAr,
//       cityId: area.cityId,
//       isActive: area.isActive
//     })
//   }

//   const handleSave = () => {
//     if (isAddingNew) {
//       const newArea: Area = {
//         id: Date.now().toString(),
//         ...formData
//       }
//       setAreasList([...areasList, newArea])
//       setIsAddingNew(false)
//     } else if (editingId) {
//       setAreasList(areasList.map(area => 
//         area.id === editingId ? { ...area, ...formData } : area
//       ))
//       setEditingId(null)
//     }
//     setFormData({ name: '', nameAr: '', cityId: '', isActive: true })
//   }

//   const handleCancel = () => {
//     setIsAddingNew(false)
//     setEditingId(null)
//     setFormData({ name: '', nameAr: '', cityId: '', isActive: true })
//   }

//   const handleDelete = (id: string) => {
//     setAreasList(areasList.filter(area => area.id !== id))
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="p-3 bg-orange-100 rounded-xl">
//             <MapPin className="h-8 w-8 text-orange-600" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">إدارة المناطق</h1>
//             <p className="text-gray-600">إضافة وتعديل وحذف المناطق في النظام</p>
//           </div>
//         </div>
//         <Button onClick={handleAdd} className="flex items-center gap-2">
//           <Plus className="h-4 w-4" />
//           إضافة منطقة جديدة
//         </Button>
//       </div>

//       {/* Add/Edit Form */}
//       {(isAddingNew || editingId) && (
//         <Card>
//           <CardHeader>
//             <CardTitle>{isAddingNew ? 'إضافة منطقة جديدة' : 'تعديل المنطقة'}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   اسم المنطقة (بالإنجليزية)
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="Downtown"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   اسم المنطقة (بالعربية)
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.nameAr}
//                   onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="وسط المدينة"
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   المدينة
//                 </label>
//                 <select
//                   value={formData.cityId}
//                   onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 >
//                   <option value="">اختر المدينة</option>
//                   {cities.map((city) => (
//                     <option key={city.id} value={city.id}>
//                       {city.nameAr} - {getCountryName(city.id)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 mt-4">
//               <input
//                 type="checkbox"
//                 id="isActive"
//                 checked={formData.isActive}
//                 onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                 className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
//               />
//               <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
//                 المنطقة نشطة
//               </label>
//             </div>
//             <div className="flex gap-2 mt-6">
//               <Button onClick={handleSave}>
//                 {isAddingNew ? 'إضافة' : 'حفظ التغييرات'}
//               </Button>
//               <Button variant="outline" onClick={handleCancel}>
//                 إلغاء
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Areas Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>قائمة المناطق ({areasList.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="text-right py-3 px-4 font-semibold text-gray-700">الاسم بالعربية</th>
//                   <th className="text-right py-3 px-4 font-semibold text-gray-700">الاسم بالإنجليزية</th>
//                   <th className="text-right py-3 px-4 font-semibold text-gray-700">المدينة</th>
//                   <th className="text-right py-3 px-4 font-semibold text-gray-700">الدولة</th>
//                   <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
//                   <th className="text-right py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {areasList.map((area) => (
//                   <tr key={area.id} className="border-b border-gray-100 hover:bg-gray-50">
//                     <td className="py-3 px-4 font-medium">{area.nameAr}</td>
//                     <td className="py-3 px-4 text-gray-600">{area.name}</td>
//                     <td className="py-3 px-4">{getCityName(area.cityId)}</td>
//                     <td className="py-3 px-4">{getCountryName(area.cityId)}</td>
//                     <td className="py-3 px-4">
//                       <span className={cn(
//                         'px-2 py-1 rounded-full text-xs font-medium',
//                         area.isActive 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       )}>
//                         {area.isActive ? 'نشط' : 'غير نشط'}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">
//                       <div className="flex gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleEdit(area)}
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="destructive"
//                           size="sm"
//                           onClick={() => handleDelete(area.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default AreasPage