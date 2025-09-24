import React from 'react'
import { Button } from '../components/ui/Button'
import { FormModal } from '../components/ui/FormModal'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { PageHeader } from '../components/ui/PageHeader'
import { DataTable } from '../components/ui/DataTable'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { getLocalizedName } from '../lib/localization'
import { useLanguage } from '../hooks/useLanguage'
import { useNotifications } from '../hooks/useNotificationContext'
import { useConfirmation } from '../hooks/useConfirmation'
import { useFormModal } from '../hooks/useFormModal'
import type { BlockListDto, CreateBlockRequest, UpdateBlockRequest } from '../types/api'
import { RealEstateAPI } from '../services/api'
import { useQuery, useMutation } from '@tanstack/react-query'

const BlocksPage: React.FC = () => {
  const { language, t } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const confirmation = useConfirmation()

  // Fetch blocks data
  const { data: blocksResponse, isLoading, refetch: refetchBlocks } = useQuery({
    queryKey: ['blocks', language],
    queryFn: () => RealEstateAPI.block.getAll(true, language),
  })
  
  console.log('API Response:', blocksResponse)
  const blocks = blocksResponse?.data?.data || []

  // Block form modal
  const blockModal = useFormModal<{
    id?: number
    code: string
    arabicName: string
    englishName: string
    arabicDescription?: string
    englishDescription?: string
    isActive: boolean
    displayOrder: number
  }>({
    initialData: {
      code: '',
      arabicName: '',
      englishName: '',
      arabicDescription: '',
      englishDescription: '',
      isActive: true,
      displayOrder: 1
    },
    onSave: async () => {
      const formData = blockModal.formData
      if (!formData.code || !formData.arabicName || !formData.englishName) {
        showError(t('please_fill_required_fields'))
        return
      }

      try {
        if (blockModal.editingId) {
          const updateData: UpdateBlockRequest = {
            id: blockModal.editingId,
            code: formData.code,
            arabicName: formData.arabicName,
            englishName: formData.englishName,
            isActive: formData.isActive,
            displayOrder: formData.displayOrder,
          }
          await updateMutation.mutateAsync({ id: blockModal.editingId, data: updateData })
        } else {
          const createData: CreateBlockRequest = {
            code: formData.code,
            arabicName: formData.arabicName,
            englishName: formData.englishName,
            isActive: formData.isActive,
            displayOrder: formData.displayOrder,
          }
          await createMutation.mutateAsync(createData)
        }
      } catch {
        // Error is handled in mutation onError
      }
    }
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateBlockRequest) => RealEstateAPI.block.create(data, language),
    onSuccess: () => {
      showSuccess(t('block_created_successfully'))
      blockModal.closeModal()
      refetchBlocks()
    },
    onError: () => {
      showError(t('error_creating_block'))
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBlockRequest }) => 
      RealEstateAPI.block.update(id, data, language),
    onSuccess: () => {
      showSuccess(t('block_updated_successfully'))
      blockModal.closeModal()
      refetchBlocks()
    },
    onError: () => {
      showError(t('error_updating_block'))
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => RealEstateAPI.block.delete(id, language),
    onSuccess: () => {
      showSuccess(t('block_deleted_successfully'))
      refetchBlocks()
    },
    onError: () => {
      showError(t('error_deleting_block'))
    }
  })

  // Handle edit
  const handleEdit = (block: BlockListDto) => {
    blockModal.openModal({
      id: block.id,
      code: block.code || '',
      arabicName: block.arabicName || '',
      englishName: block.englishName || '',
      arabicDescription: block.arabicDescription || '',
      englishDescription: block.englishDescription || '',
      isActive: block.isActive ?? true,
      displayOrder: block.displayOrder || 1
    })
  }

  const handleDelete = async (block: BlockListDto) => {
    const blockName = block ? getLocalizedName(block, language) : t('unknown')
    const confirmed = await confirmation.confirm({
      title: t('confirm_delete'),
      message: t('confirm_delete_block') + ': ' + blockName,
      confirmText: t('delete'),
      cancelText: t('cancel')
    })

    if (confirmed && block?.id) {
      deleteMutation.mutate(block.id)
    }
  }

  // Table columns for DataTable
  const columns = [
    {
      key: 'code',
      title: t('code'),
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span className="font-medium">{(row as unknown as BlockListDto)?.code || ''}</span>
      )
    },
    {
      key: 'name',
      title: t('name'),
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const block = row as unknown as BlockListDto
        return (
          <div>
            <div className="font-medium">
              {block ? getLocalizedName(block, language) : ''}
            </div>
            {(block?.arabicDescription || block?.englishDescription) && (
              <div className="text-sm text-gray-500 mt-1">
                {language === 'ar' ? (block.arabicDescription || block.englishDescription) : (block.englishDescription || block.arabicDescription)}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'displayOrder',
      title: t('display_order'),
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => (
        <span className="text-gray-600">{(row as unknown as BlockListDto)?.displayOrder || 0}</span>
      )
    },
    {
      key: 'isActive',
      title: t('status'),
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const block = row as unknown as BlockListDto
        return (
          <span className={cn(
            "px-2 py-1 rounded-full text-sm",
            block?.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {block?.isActive ? t('active') : t('inactive')}
          </span>
        )
      }
    },
    {
      key: 'actions',
      title: t('actions'),
      render: (_: unknown, row: Record<string, unknown>) => {
        const block = row as unknown as BlockListDto
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => block && handleEdit(block)}
              className="h-8 w-8 p-0"
              disabled={!block}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => block && handleDelete(block)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              disabled={!block}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('blocks')}
        description={t('blocks_description')}
        actions={
          <Button onClick={() => blockModal.openModal()}>
            <Plus className="h-4 w-4 ml-2" />
            {t('add_block')}
          </Button>
        }
      />

      <DataTable
        data={blocks}
        columns={columns}
        loading={isLoading}
        searchable={true}
        sortable={true}
        filterable={true}
      />

      {/* Block Form Modal */}
      <FormModal
        isOpen={blockModal.isOpen}
        onClose={blockModal.closeModal}
        title={blockModal.editingId ? t('edit_block') : t('add_block')}
        onSave={blockModal.handleSave}
        isLoading={blockModal.isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('code')} *
            </label>
            <Input
              value={blockModal.formData.code}
              onChange={(e) => blockModal.setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder={t('enter_block_code')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('display_order')}
            </label>
            <Input
              type="number"
              min="1"
              value={blockModal.formData.displayOrder}
              onChange={(e) => blockModal.setFormData(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
              placeholder={t('enter_display_order')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('arabic_name')} *
            </label>
            <Input
              value={blockModal.formData.arabicName}
              onChange={(e) => blockModal.setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
              placeholder={t('enter_arabic_name')}
              dir="rtl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('english_name')} *
            </label>
            <Input
              value={blockModal.formData.englishName}
              onChange={(e) => blockModal.setFormData(prev => ({ ...prev, englishName: e.target.value }))}
              placeholder={t('enter_english_name')}
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('arabic_description')}
            </label>
            <Textarea
              value={blockModal.formData.arabicDescription || ''}
              onChange={(e) => blockModal.setFormData(prev => ({ ...prev, arabicDescription: e.target.value }))}
              placeholder={t('enter_arabic_description')}
              dir="rtl"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('english_description')}
            </label>
            <Textarea
              value={blockModal.formData.englishDescription || ''}
              onChange={(e) => blockModal.setFormData(prev => ({ ...prev, englishDescription: e.target.value }))}
              placeholder={t('enter_english_description')}
              dir="ltr"
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={blockModal.formData.isActive}
                onChange={(e) => blockModal.setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                {t('is_active')}
              </label>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={confirmation.isOpen}
        title={confirmation.options?.title || ''}
        message={confirmation.options?.message || ''}
        confirmText={confirmation.options?.confirmText || t('confirm')}
        cancelText={confirmation.options?.cancelText || t('cancel')}
        onConfirm={() => {
          confirmation.onConfirm?.()
          confirmation.close()
        }}
        onClose={confirmation.close}
      />
    </div>
  )
}

export default BlocksPage