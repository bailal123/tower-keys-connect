import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Save, X } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSave: () => void
  onCancel?: () => void
  saveText?: string
  cancelText?: string
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  saveDisabled?: boolean
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  onCancel,
  saveText,
  cancelText,
  isLoading = false,
  size = 'md',
  saveDisabled = false
}) => {
  const { t } = useLanguage()
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading && !saveDisabled) {
      onSave()
    }
  }

  const footer = (
    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={isLoading}
        className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <X className="h-4 w-4" />
        {cancelText || t('cancel')}
      </Button>
      <Button
        onClick={handleSave}
        disabled={isLoading || saveDisabled}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        <Save className="h-4 w-4" />
        {isLoading ? t('saving_text') : (saveText || t('save'))}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer}
      closeOnBackdropClick={!isLoading}
    >
      <form onSubmit={handleSave} className="space-y-6">
        {children}
      </form>
    </Modal>
  )
}

export default FormModal