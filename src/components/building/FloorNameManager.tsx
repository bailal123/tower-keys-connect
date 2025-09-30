import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Label } from '../ui/Label'
import { Plus, Trash2, Edit } from 'lucide-react'

export interface FloorName {
  id: number
  arabicName: string
  englishName: string
  floorNumber: number
  floorType: 'Parking' | 'Residential' | 'Commercial' | 'Facilities'
}

interface FloorNameManagerProps {
  floorNames: FloorName[]
  onAddFloorName: (floorName: Omit<FloorName, 'id'>) => void
  onUpdateFloorName: (id: number, floorName: Omit<FloorName, 'id'>) => void
  onDeleteFloorName: (id: number) => void
}

const FloorNameManager: React.FC<FloorNameManagerProps> = ({
  floorNames,
  onAddFloorName,
  onUpdateFloorName,
  onDeleteFloorName
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<{
    arabicName: string
    englishName: string
    floorNumber: number
    floorType: 'Parking' | 'Residential' | 'Commercial' | 'Facilities'
  }>({
    arabicName: '',
    englishName: '',
    floorNumber: 0,
    floorType: 'Residential'
  })

  const handleSubmit = () => {
    if (!formData.arabicName.trim() || !formData.englishName.trim() || formData.floorNumber <= 0) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (editingId) {
      onUpdateFloorName(editingId, formData)
      setEditingId(null)
    } else {
      onAddFloorName(formData)
    }

    setFormData({
      arabicName: '',
      englishName: '',
      floorNumber: 0,
      floorType: 'Residential'
    })
    setIsAdding(false)
  }

  const handleEdit = (floorName: FloorName) => {
    setFormData({
      arabicName: floorName.arabicName,
      englishName: floorName.englishName,
      floorNumber: floorName.floorNumber,
      floorType: floorName.floorType
    })
    setEditingId(floorName.id)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setFormData({
      arabicName: '',
      englishName: '',
      floorNumber: 0,
      floorType: 'Residential'
    })
    setEditingId(null)
    setIsAdding(false)
  }

  const floorTypeOptions = [
    { value: 'Parking', label: 'مواقف سيارات' },
    { value: 'Residential', label: 'سكني' },
    { value: 'Commercial', label: 'تجاري' },
    { value: 'Facilities', label: 'مرافق' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">إدارة أسماء الطوابق</h3>
        <Button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          إضافة طابق جديد
        </Button>
      </div>

      {/* Form for adding/editing */}
      {isAdding && (
        <Card className="p-4 border-2 border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arabicName">الاسم بالعربية *</Label>
              <Input
                id="arabicName"
                value={formData.arabicName}
                onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
                placeholder="مثل: الطابق الأرضي"
                className="text-right"
              />
            </div>
            
            <div>
              <Label htmlFor="englishName">الاسم بالإنجليزية *</Label>
              <Input
                id="englishName"
                value={formData.englishName}
                onChange={(e) => setFormData(prev => ({ ...prev, englishName: e.target.value }))}
                placeholder="e.g: Ground Floor"
              />
            </div>

            <div>
              <Label htmlFor="floorNumber">رقم الطابق *</Label>
              <Input
                id="floorNumber"
                type="number"
                value={formData.floorNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, floorNumber: parseInt(e.target.value) || 0 }))}
                placeholder="0, 1, 2, ..."
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="floorType">نوع الطابق *</Label>
              <select
                id="floorType"
                value={formData.floorType}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  floorType: e.target.value as 'Parking' | 'Residential' | 'Commercial' | 'Facilities'
                }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {floorTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              {editingId ? 'تحديث' : 'إضافة'}
            </Button>
            <Button onClick={handleCancel} variant="outline">
              إلغاء
            </Button>
          </div>
        </Card>
      )}

      {/* List of existing floor names */}
      <div className="space-y-2">
        {floorNames.map(floorName => (
          <Card key={floorName.id} className="p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">
                {floorName.arabicName} - {floorName.englishName}
              </div>
              <div className="text-sm text-gray-600">
                رقم الطابق: {floorName.floorNumber} | النوع: {
                  floorTypeOptions.find(opt => opt.value === floorName.floorType)?.label || floorName.floorType
                }
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(floorName)}
                className="flex items-center gap-1"
              >
                <Edit size={14} />
                تعديل
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDeleteFloorName(floorName.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
                حذف
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {floorNames.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          لم يتم إضافة أسماء طوابق بعد. أضف الطابق الأول لبدء العمل.
        </div>
      )}
    </div>
  )
}

export default FloorNameManager