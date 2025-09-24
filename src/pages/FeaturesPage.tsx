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
import { getLocalizedName } from '../lib/localization'

import type { TowerFeatureListDto } from '../types/api'

const FeaturesPage: React.FC = () => {
  const { language, t } = useLanguage()
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
          showSuccess(t('feature_updated'))
        } else {
          await RealEstateAPI.towerFeature.create({
            arabicName: data.arabicName,
            englishName: data.englishName,
            arabicDescription: data.arabicDescription || '',
            englishDescription: data.englishDescription || '',
            isActive: data.isActive,
            displayOrder: data.displayOrder || 0
          }, language)
          showSuccess(t('feature_added'))
        }
        refetchFeatures()
      } catch (error) {
        console.error('خطأ في حفظ الميزة:', error)
        showError(t('save_failed'))
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
      title: t('confirm_delete'),
      message: t('delete_feature_confirmation'),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.towerFeature.delete(id, language)
        showSuccess(t('feature_deleted'))
        refetchFeatures()
      } catch (error) {
        console.error('حدث خطأ أثناء حذف الميزة:', error)
        showError(t('delete_failed'))
      }
    }
  }

  // DataTable columns with proper typing
  const columns = [
    {
      key: 'arabicName',
      title: t('arabic_name'),
      sortable: true,
      filterable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const feature = row as unknown as TowerFeatureListDto
        return getLocalizedName(feature, language)
      }
    },
    {
      key: 'englishName', 
      title: t('english_name'),
      sortable: true,
      filterable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const feature = row as unknown as TowerFeatureListDto
        return language === 'ar' ? feature.englishName : feature.arabicName
      }
    },
    {
      key: 'displayOrder',
      title: t('display_order'),
      sortable: true,
      render: (value: unknown) => (
        <Badge variant="neutral" size="sm">
          {value as number}
        </Badge>
      )
    },
    {
      key: 'isActive',
      title: t('status'),
      render: (value: unknown) => (
        <Badge 
          variant={(value as boolean) ? 'success' : 'error'} 
          size="sm"
        >
          {(value as boolean) ? t('active') : t('inactive')}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: t('actions'),
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
          title={t('features_management')}
          description={`${t('features_management_description')} (${features.length})`}
          actions={
            <Button 
              onClick={handleAddFeature}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
              size="lg"
            >
              <Plus className="h-4 w-4 ml-2" />
              {t('add_new_feature')}
            </Button>
          }
        />

        {/* Features DataTable */}
        {featuresLoading ? (
          <div className="mt-6">
            <Loader text={t('loading_features')} />
          </div>
        ) : features.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Star className="h-12 w-12 text-purple-400" />}
              title={t('no_features')}
              description={t('no_features_description')}
              action={{
                label: t('add_new_feature'),
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
        title={featureModal.isEditing ? t('edit_feature') : t('add_new_feature')}
        saveText={featureModal.isEditing ? t('save_changes') : t('add')}
        isLoading={featureModal.isLoading}
      >
        <div className="space-y-6">
          <Grid cols={2} gap="lg">
            <Input
              label={t('english_name')}
              value={featureModal.formData.englishName || ''}
              onChange={(e) => featureModal.updateFormData({ englishName: e.target.value })}
              placeholder="Swimming Pool"
              variant="default"
              required
            />
            <Input
              label={t('arabic_name')}
              value={featureModal.formData.arabicName || ''}
              onChange={(e) => featureModal.updateFormData({ arabicName: e.target.value })}
              placeholder="مسبح"
              variant="default"
              required
            />
            <Input
              label={t('english_description')}
              value={featureModal.formData.englishDescription || ''}
              onChange={(e) => featureModal.updateFormData({ englishDescription: e.target.value })}
              placeholder="Luxury swimming pool with..."
              variant="default"
            />
            <Input
              label={t('arabic_description')}
              value={featureModal.formData.arabicDescription || ''}
              onChange={(e) => featureModal.updateFormData({ arabicDescription: e.target.value })}
              placeholder="مسبح فاخر مع..."
              variant="default"
            />
            <Input
              label={t('display_order')}
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
              label={t('feature_active')}
              description={t('feature_active_description')}
              variant="default"
            />
          </div>
        </div>
      </FormModal>
    </div>
  )
}

export default FeaturesPage