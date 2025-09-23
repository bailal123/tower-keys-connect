import React from 'react'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { DataTable } from '../components/ui/DataTable'
import {
  Button,
  Input,
  Checkbox,
  Grid,
  FormModal,
  ConfirmationDialog,
  Badge,
  Loader,
  EmptyState
} from '../components/ui'

import { useLanguage } from '../hooks/useLanguage'
import { useNotifications } from '../hooks/useNotificationContext'
import { useConfirmation } from '../hooks/useConfirmation'
import { useFormModal } from '../hooks/useFormModal'
import { useTowerFeatures } from '../hooks/useApi'
import { RealEstateAPI } from '../services/api'

import type { TowerFeatureListDto } from '../types/api'

const FeaturesPage: React.FC = () => {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const confirmation = useConfirmation()
  
  // API hooks
  const { data: featuresData = [], isLoading: featuresLoading, refetch: refetchFeatures } = useTowerFeatures({ 
    onlyActive: false, 
    lang: language 
  })
  
  // Extract data from API response
  const features: TowerFeatureListDto[] = (featuresData as TowerFeatureListDto[]) || []

  // Feature form modal
  const featureModal = useFormModal<{
    id?: number
    arabicName: string
    englishName: string
    arabicDescription?: string
    englishDescription?: string
    iconUrl?: string
    isActive: boolean
    displayOrder: number
  }>({
    initialData: {
      arabicName: '',
      englishName: '',
      arabicDescription: '',
      englishDescription: '',
      iconUrl: '',
      isActive: true,
      displayOrder: 0
    },
    onSave: async (data, isEditing) => {
      try {
        if (isEditing && data.id) {
          await RealEstateAPI.towerFeature.update(data.id, {
            id: data.id,
            arabicName: data.arabicName,
            englishName: data.englishName,
            arabicDescription: data.arabicDescription,
            englishDescription: data.englishDescription,
            iconUrl: data.iconUrl,
            isActive: data.isActive,
            displayOrder: data.displayOrder
          }, language)
          showSuccess('تم تحديث الميزة بنجاح')
        } else {
          await RealEstateAPI.towerFeature.create({
            arabicName: data.arabicName,
            englishName: data.englishName,
            arabicDescription: data.arabicDescription,
            englishDescription: data.englishDescription,
            iconUrl: data.iconUrl,
            isActive: data.isActive,
            displayOrder: data.displayOrder
          }, language)
          showSuccess('تم إضافة الميزة بنجاح')
        }
        refetchFeatures()
      } catch (error) {
        console.error('خطأ في حفظ الميزة:', error)
        showError('فشل في حفظ الميزة')
      }
    }
  })

  // CRUD operations
  const handleAddFeature = () => {
    featureModal.openModal()
  }

  const handleEditFeature = (feature: TowerFeatureListDto) => {
    featureModal.openModal(feature)
  }

  const handleDeleteFeature = async (id: number) => {
    const confirmed = await confirmation.confirm({
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذه الميزة؟',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.towerFeature.delete(id, language)
        showSuccess('تم حذف الميزة بنجاح')
        refetchFeatures()
      } catch (error) {
        console.error('حدث خطأ أثناء حذف الميزة:', error)
        showError('تعذر حذف الميزة')
      }
    }
  }

  // DataTable columns with proper typing
  const columns = [
    {
      key: 'arabicName',
      title: 'الاسم بالعربية',
      sortable: true,
      filterable: true
    },
    {
      key: 'englishName', 
      title: 'الاسم بالإنجليزية',
      sortable: true,
      filterable: true
    },
    {
      key: 'displayOrder',
      title: 'ترتيب العرض',
      sortable: true,
      render: (value: unknown) => (
        <Badge variant="neutral" size="sm">
          {value as number}
        </Badge>
      )
    },
    {
      key: 'isActive',
      title: 'الحالة',
      render: (value: unknown) => (
        <Badge 
          variant={(value as boolean) ? 'success' : 'error'} 
          size="sm"
        >
          {(value as boolean) ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (_: unknown, row: Record<string, unknown>) => {
        const feature = row as unknown as TowerFeatureListDto
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditFeature(feature)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteFeature(feature.id)}
              className="text-red-600 border-red-600 hover:bg-red-50 bg-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Page Header */}
        <PageHeader
          title="إدارة ميزات الأبراج"
          description={`إضافة وتعديل وحذف ميزات الأبراج (${features.length} ميزة)`}
          actions={
            <Button 
              onClick={handleAddFeature}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
              size="lg"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة ميزة جديدة
            </Button>
          }
        />

        {/* Features DataTable */}
        {featuresLoading ? (
          <div className="mt-6">
            <Loader text="جارٍ تحميل الميزات..." />
          </div>
        ) : features.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Star className="h-12 w-12 text-purple-400" />}
              title="لا توجد ميزات"
              description="لم يتم إنشاء أي ميزات بعد. ابدأ بإضافة ميزة جديدة."
              action={{
                label: "إضافة ميزة جديدة",
                onClick: handleAddFeature,
                variant: "default"
              }}
            />
          </div>
        ) : (
          <div className="mt-6">
            <DataTable
              data={features as unknown as Record<string, unknown>[]}
              columns={columns}
              searchable={true}
              sortable={true}
              className="bg-white"
            />
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.close}
        onConfirm={confirmation.onConfirm || (() => {})}
        title={confirmation.options?.title || ''}
        message={confirmation.options?.message || ''}
        confirmText={confirmation.options?.confirmText}
        cancelText={confirmation.options?.cancelText}
        type={confirmation.options?.type}
      />

      {/* Feature Form Modal */}
      <FormModal
        isOpen={featureModal.isOpen}
        onClose={featureModal.closeModal}
        onSave={featureModal.handleSave}
        title={featureModal.isEditing ? 'تعديل الميزة' : 'إضافة ميزة جديدة'}
        saveText={featureModal.isEditing ? 'حفظ التغييرات' : 'إضافة'}
        isLoading={featureModal.isLoading}
      >
        <div className="space-y-6">
          <Grid cols={2} gap="lg">
            <Input
              label="الاسم بالإنجليزية"
              value={featureModal.formData.englishName || ''}
              onChange={(e) => featureModal.updateFormData({ englishName: e.target.value })}
              placeholder="Swimming Pool"
              variant="default"
              required
            />
            <Input
              label="الاسم بالعربية"
              value={featureModal.formData.arabicName || ''}
              onChange={(e) => featureModal.updateFormData({ arabicName: e.target.value })}
              placeholder="مسبح"
              variant="default"
              required
            />
            <Input
              label="الوصف بالإنجليزية"
              value={featureModal.formData.englishDescription || ''}
              onChange={(e) => featureModal.updateFormData({ englishDescription: e.target.value })}
              placeholder="Luxury swimming pool with..."
              variant="default"
            />
            <Input
              label="الوصف بالعربية"
              value={featureModal.formData.arabicDescription || ''}
              onChange={(e) => featureModal.updateFormData({ arabicDescription: e.target.value })}
              placeholder="مسبح فاخر مع..."
              variant="default"
            />
            {/* <Input
              label="رابط الأيقونة"
              value={featureModal.formData.iconUrl || ''}
              onChange={(e) => featureModal.updateFormData({ iconUrl: e.target.value })}
              placeholder="https://example.com/icon.png"
              variant="default"
            /> */}
            <Input
              label="ترتيب العرض"
              type="number"
              value={featureModal.formData.displayOrder?.toString() || '0'}
              onChange={(e) => featureModal.updateFormData({ displayOrder: parseInt(e.target.value) || 0 })}
              placeholder="1"
              variant="default"
              required
            />
          </Grid>
          
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Checkbox
              checked={featureModal.formData.isActive ?? true}
              onChange={(e) => featureModal.updateFormData({ isActive: e.target.checked })}
              label="الميزة نشطة"
              description="هل هذه الميزة متاحة للاستخدام؟"
              variant="default"
            />
          </div>
        </div>
      </FormModal>
    </div>
  )
}

export default FeaturesPage