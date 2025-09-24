import React from 'react'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
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
import { useAppliances } from '../hooks/useApi'
import { RealEstateAPI } from '../services/api'

import type { ApplianceListDto } from '../types/api'

const AppliancesPage: React.FC = () => {
  const { language, t } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const confirmation = useConfirmation()
  
  // API hooks
  const { data: appliancesData = [], isLoading: appliancesLoading, refetch: refetchAppliances } = useAppliances({ 
    onlyActive: false, 
    lang: language 
  })
  
  // Extract data from API response
  const appliances: ApplianceListDto[] = (appliancesData as ApplianceListDto[]) || []

  // Appliance form modal
  const applianceModal = useFormModal<{
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
          await RealEstateAPI.appliance.update(data.id, {
            id: data.id,
            arabicName: data.arabicName,
            englishName: data.englishName,
            arabicDescription: data.arabicDescription,
            englishDescription: data.englishDescription,
            iconUrl: data.iconUrl,
            isActive: data.isActive,
            displayOrder: data.displayOrder
          }, language)
          showSuccess(t('appliance_updated'))
        } else {
          await RealEstateAPI.appliance.create({
            arabicName: data.arabicName,
            englishName: data.englishName,
            arabicDescription: data.arabicDescription,
            englishDescription: data.englishDescription,
            iconUrl: data.iconUrl,
            isActive: data.isActive,
            displayOrder: data.displayOrder
          }, language)
          showSuccess(t('appliance_added'))
        }
        refetchAppliances()
      } catch (error) {
        console.error('خطأ في حفظ الجهاز:', error)
        showError('فشل في حفظ الجهاز')
      }
    }
  })

  // CRUD operations
  const handleAddAppliance = () => {
    applianceModal.openModal()
  }

  const handleEditAppliance = (appliance: ApplianceListDto) => {
    applianceModal.openModal(appliance)
  }

  const handleDeleteAppliance = async (id: number) => {
    const confirmed = await confirmation.confirm({
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذا الجهاز؟',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.appliance.delete(id, language)
        showSuccess('تم حذف الجهاز بنجاح')
        refetchAppliances()
      } catch (error) {
        console.error('حدث خطأ أثناء حذف الجهاز:', error)
        showError('تعذر حذف الجهاز')
      }
    }
  }

  // DataTable columns
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
        const appliance = row as unknown as ApplianceListDto
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditAppliance(appliance)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteAppliance(appliance.id)}
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
          title="إدارة الأجهزة والأدوات"
          description={`إضافة وتعديل وحذف الأجهزة والأدوات (${appliances.length} جهاز)`}
          actions={
            <Button 
              onClick={handleAddAppliance}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              size="lg"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة جهاز جديد
            </Button>
          }
        />

        {/* Appliances DataTable */}
        {appliancesLoading ? (
          <div className="mt-6">
            <Loader text="جارٍ تحميل الأجهزة..." />
          </div>
        ) : appliances.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Package className="h-12 w-12 text-blue-400" />}
              title="لا توجد أجهزة"
              description="لم يتم إنشاء أي أجهزة بعد. ابدأ بإضافة جهاز جديد."
              action={{
                label: "إضافة جهاز جديد",
                onClick: handleAddAppliance,
                variant: "default"
              }}
            />
          </div>
        ) : (
          <div className="mt-6">
            <DataTable
              data={appliances as unknown as Record<string, unknown>[]}
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

      {/* Appliance Form Modal */}
      <FormModal
        isOpen={applianceModal.isOpen}
        onClose={applianceModal.closeModal}
        onSave={applianceModal.handleSave}
        title={applianceModal.isEditing ? 'تعديل الجهاز' : 'إضافة جهاز جديد'}
        saveText={applianceModal.isEditing ? 'حفظ التغييرات' : 'إضافة'}
        isLoading={applianceModal.isLoading}
      >
        <div className="space-y-8">
          <Grid cols={2} gap="lg">
            <Input
              label="الاسم بالإنجليزية"
              value={applianceModal.formData.englishName || ''}
              onChange={(e) => applianceModal.updateFormData({ englishName: e.target.value })}
              placeholder="Air Conditioner"
              variant="default"
              required
            />
            <Input
              label="الاسم بالعربية"
              value={applianceModal.formData.arabicName || ''}
              onChange={(e) => applianceModal.updateFormData({ arabicName: e.target.value })}
              placeholder="مكيف هواء"
              variant="default"
              required
            />
            <Input
              label="الوصف بالإنجليزية"
              value={applianceModal.formData.englishDescription || ''}
              onChange={(e) => applianceModal.updateFormData({ englishDescription: e.target.value })}
              placeholder="High efficiency air conditioning system..."
              variant="default"
            />
            <Input
              label="الوصف بالعربية"
              value={applianceModal.formData.arabicDescription || ''}
              onChange={(e) => applianceModal.updateFormData({ arabicDescription: e.target.value })}
              placeholder="نظام تكييف عالي الكفاءة..."
              variant="default"
            />
            {/* <Input
              label="رابط الأيقونة"
              value={applianceModal.formData.iconUrl || ''}
              onChange={(e) => applianceModal.updateFormData({ iconUrl: e.target.value })}
              placeholder="https://example.com/icon.png"
              variant="default"
            /> */}
            <Input
              label="ترتيب العرض"
              type="number"
              value={applianceModal.formData.displayOrder?.toString() || '0'}
              onChange={(e) => applianceModal.updateFormData({ displayOrder: parseInt(e.target.value) || 0 })}
              placeholder="1"
              variant="default"
              required
            />
          </Grid>
          
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              checked={applianceModal.formData.isActive ?? true}
              onChange={(e) => applianceModal.updateFormData({ isActive: e.target.checked })}
              label="الجهاز نشط"
              description="هل هذا الجهاز متاح للاستخدام؟"
              variant="default"
            />
          </div>
        </div>
      </FormModal>
    </div>
  )
}

export default AppliancesPage