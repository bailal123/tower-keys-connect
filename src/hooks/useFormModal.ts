import { useState, useCallback } from 'react'

interface UseFormModalOptions<T> {
  initialData: T
  onSave: (data: T, isEditing: boolean) => Promise<void> | void
  onSuccess?: () => void
}

export const useFormModal = <T extends Record<string, unknown>>({
  initialData,
  onSave,
  onSuccess
}: UseFormModalOptions<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<T>(initialData)
  const [editingId, setEditingId] = useState<number | null>(null)

  const openModal = useCallback((data?: T & { id?: number }) => {
    if (data && data.id) {
      // Edit mode
      setEditingId(data.id)
      setFormData(data)
    } else {
      // Add mode
      setEditingId(null)
      setFormData(initialData)
    }
    setIsOpen(true)
  }, [initialData])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setEditingId(null)
    setFormData(initialData)
    setIsLoading(false)
  }, [initialData])

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true)
      const dataToSave = editingId ? { ...formData, id: editingId } : formData
      await onSave(dataToSave, editingId !== null)
      closeModal()
      onSuccess?.()
    } catch (error) {
      console.error('Error saving:', error)
      // Keep modal open on error
    } finally {
      setIsLoading(false)
    }
  }, [formData, editingId, onSave, onSuccess, closeModal])

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    isOpen,
    isLoading,
    formData,
    editingId,
    isEditing: editingId !== null,
    openModal,
    closeModal,
    handleSave,
    updateFormData,
    setFormData
  }
}

export default useFormModal