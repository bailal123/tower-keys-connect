import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Plus, Edit, Trash2, Palette, Upload, Eye } from 'lucide-react'
import { cn } from '../lib/utils'
import { designs } from '../data/mockData'

interface Design {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  imageUrl: string
  videoUrl?: string
  category: 'interior' | 'exterior' | 'landscape'
  isActive: boolean
  createdAt: string
}

const DesignsPage: React.FC = () => {
  const [designsList, setDesignsList] = useState<Design[]>(designs)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    imageUrl: '',
    videoUrl: '',
    category: 'interior' as 'interior' | 'exterior' | 'landscape',
    isActive: true
  })

  const categoryLabels = {
    interior: 'التصميم الداخلي',
    exterior: 'التصميم الخارجي',
    landscape: 'تنسيق الحدائق'
  }

  const categoryColors = {
    interior: 'bg-blue-100 text-blue-800',
    exterior: 'bg-green-100 text-green-800',
    landscape: 'bg-orange-100 text-orange-800'
  }

  const filteredDesigns = selectedCategory === 'all' 
    ? designsList 
    : designsList.filter(design => design.category === selectedCategory)

  const handleAdd = () => {
    setIsAddingNew(true)
    setFormData({ 
      name: '', 
      nameAr: '', 
      description: '', 
      descriptionAr: '', 
      imageUrl: '', 
      videoUrl: '', 
      category: 'interior', 
      isActive: true 
    })
  }

  const handleEdit = (design: Design) => {
    setEditingId(design.id)
    setFormData({
      name: design.name,
      nameAr: design.nameAr,
      description: design.description,
      descriptionAr: design.descriptionAr,
      imageUrl: design.imageUrl,
      videoUrl: design.videoUrl || '',
      category: design.category,
      isActive: design.isActive
    })
  }

  const handleSave = () => {
    if (isAddingNew) {
      const newDesign: Design = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      }
      setDesignsList([...designsList, newDesign])
      setIsAddingNew(false)
    } else if (editingId) {
      setDesignsList(designsList.map(design => 
        design.id === editingId ? { ...design, ...formData } : design
      ))
      setEditingId(null)
    }
    setFormData({ 
      name: '', 
      nameAr: '', 
      description: '', 
      descriptionAr: '', 
      imageUrl: '', 
      videoUrl: '', 
      category: 'interior', 
      isActive: true 
    })
  }

  const handleCancel = () => {
    setIsAddingNew(false)
    setEditingId(null)
    setFormData({ 
      name: '', 
      nameAr: '', 
      description: '', 
      descriptionAr: '', 
      imageUrl: '', 
      videoUrl: '', 
      category: 'interior', 
      isActive: true 
    })
  }

  const handleDelete = (id: string) => {
    setDesignsList(designsList.filter(design => design.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Palette className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة التصاميم</h1>
            <p className="text-gray-600">إضافة وتعديل وحذف تصاميم المشاريع</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            <Eye className="h-4 w-4 mr-2" />
            {viewMode === 'grid' ? 'عرض جدولي' : 'عرض شبكي'}
          </Button>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة تصميم جديد
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              جميع التصاميم ({designsList.length})
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(key)}
              >
                {label} ({designsList.filter(d => d.category === key).length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? 'إضافة تصميم جديد' : 'تعديل التصميم'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم التصميم (بالإنجليزية)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Modern Living Room"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم التصميم (بالعربية)
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="غرفة معيشة عصرية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (بالإنجليزية)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Description of the design..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (بالعربية)
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="وصف التصميم..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الفيديو (اختياري)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  فئة التصميم
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'interior' | 'exterior' | 'landscape' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="interior">التصميم الداخلي</option>
                  <option value="exterior">التصميم الخارجي</option>
                  <option value="landscape">تنسيق الحدائق</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                التصميم نشط
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave}>
                {isAddingNew ? 'إضافة' : 'حفظ التغييرات'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Designs Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigns.map((design) => (
            <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                {design.imageUrl ? (
                  <img 
                    src={design.imageUrl} 
                    alt={design.nameAr}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    categoryColors[design.category]
                  )}>
                    {categoryLabels[design.category]}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{design.nameAr}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{design.descriptionAr}</p>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    design.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  )}>
                    {design.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(design)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(design.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>قائمة التصاميم ({filteredDesigns.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الصورة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الاسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الوصف</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الفئة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesigns.map((design) => (
                    <tr key={design.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                          {design.imageUrl ? (
                            <img 
                              src={design.imageUrl} 
                              alt={design.nameAr}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Upload className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{design.nameAr}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{design.descriptionAr}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          categoryColors[design.category]
                        )}>
                          {categoryLabels[design.category]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          design.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        )}>
                          {design.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(design)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(design.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DesignsPage