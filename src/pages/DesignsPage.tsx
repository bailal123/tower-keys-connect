import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { Plus } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { RealEstateAPI } from '../services/api'
import type { UnitDesignListDto, DesignFormData } from '../types/api'
import { DesignCategory, TargetMarket, MaintenanceType, GasType } from '../types/api'

// Import new components
import {
  DesignCard,
  DesignTable,
  StatsCards,
  SearchAndFilters,
  EmptyState,
  DesignWizard
} from '../components/ui'



const DesignsPage: React.FC = () => {
  const { language, t } = useLanguage()

  // States
  const [designs, setDesigns] = useState<UnitDesignListDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<UnitDesignListDto | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DesignCategory | ''>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Form data state
  const [formData, setFormData] = useState<DesignFormData>({
    // Basic Design Info
    arabicName: '',
    englishName: '',
    arabicDescription: '',
    englishDescription: '',
    
    // Design Category and Target
    category: DesignCategory.Standard,
    targetMarket: TargetMarket.Families,
    
    // Area and Room Details
    areaSquareMeters: 0,
    bedroomsCount: 0,
    bathroomsCount: 0,
    livingRoomsCount: 0,
    kitchensCount: 0,
    balconiesCount: 0,
    
    // Pricing Information
    originalRentPrice: 0,
    discountPercentage: 0,
    freePeriodDays: 0,
    officeCommission: 0,
    
    // Expenses
    municipalityFees: 0,
    electricityFees: 0,
    proFees: 0,
    insuranceAmount: 0,
    maintenanceAmount: 0,
    maintenanceType: MaintenanceType.Annual,
    gasType: GasType.Central,
    additionalExpensesDescription: '',
    additionalExpensesAmount: 0,
    
    isActive: true,
    
    // Media Files
    coverImage: null,
    images: null,
    video: null,
    
    // Features and Appliances
    selectedFeatures: [],
    selectedAppliances: [],
    
    // Payment Plans
    paymentPlans: []
  })

  // Load designs
  const loadDesigns = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await RealEstateAPI.unitDesign.getAll(
        true, // onlyActive
        selectedCategory ? Number(selectedCategory) : null,
        null, // targetMarket
        null, // minPrice
        null, // maxPrice
        null, // minArea
        null, // maxArea
        searchTerm || null,
        language
      )
      setDesigns(response.data?.data || [])
    } catch (err) {
      console.error('Error loading designs:', err)
      setError(t('errorLoadingData') || 'Error loading data')
    } finally {
      setIsLoading(false)
    }
  }, [language, searchTerm, selectedCategory, t])

  useEffect(() => {
    loadDesigns()
  }, [loadDesigns])

  // Helper to create FormData
  const createFormData = (data: DesignFormData) => {
    const formDataObj = new FormData()
    
    // Basic Design Info
    formDataObj.append('arabicName', data.arabicName)
    formDataObj.append('englishName', data.englishName)
    formDataObj.append('arabicDescription', data.arabicDescription)
    formDataObj.append('englishDescription', data.englishDescription)
    
    // Design Category and Target
    formDataObj.append('category', data.category.toString())
    formDataObj.append('targetMarket', data.targetMarket.toString())
    
    // Area and Room Details
    formDataObj.append('areaSquareMeters', data.areaSquareMeters.toString())
    formDataObj.append('bedroomsCount', data.bedroomsCount.toString())
    formDataObj.append('bathroomsCount', data.bathroomsCount.toString())
    formDataObj.append('livingRoomsCount', data.livingRoomsCount.toString())
    formDataObj.append('kitchensCount', data.kitchensCount.toString())
    formDataObj.append('balconiesCount', data.balconiesCount.toString())
    
    // Pricing Information
    formDataObj.append('originalRentPrice', data.originalRentPrice.toString())
    formDataObj.append('discountPercentage', data.discountPercentage.toString())
    formDataObj.append('freePeriodDays', data.freePeriodDays.toString())
    formDataObj.append('officeCommission', data.officeCommission.toString())
    
    // Expenses
    formDataObj.append('municipalityFees', data.municipalityFees.toString())
    formDataObj.append('electricityFees', data.electricityFees.toString())
    formDataObj.append('proFees', data.proFees.toString())
    formDataObj.append('insuranceAmount', data.insuranceAmount.toString())
    formDataObj.append('maintenanceAmount', data.maintenanceAmount.toString())
    formDataObj.append('maintenanceType', data.maintenanceType.toString())
    formDataObj.append('gasType', data.gasType.toString())
    formDataObj.append('additionalExpensesDescription', data.additionalExpensesDescription)
    formDataObj.append('additionalExpensesAmount', data.additionalExpensesAmount.toString())
    
    formDataObj.append('isActive', data.isActive.toString())
    formDataObj.append('lang', language)

    // Cover Image
    if (data.coverImage) {
      formDataObj.append('coverImage', data.coverImage)
    }

    // Additional Images
    if (data.images) {
      data.images.forEach((image) => {
        formDataObj.append('images', image)
      })
    }

    // Video
    if (data.video) {
      formDataObj.append('video', data.video)
    }

    // Features
    data.selectedFeatures.forEach((featureId, index) => {
      formDataObj.append(`features[${index}].towerFeatureId`, featureId.toString())
    })

    // Appliances
    data.selectedAppliances.forEach((appliance, index) => {
      formDataObj.append(`appliances[${index}].applianceId`, appliance.id.toString())
      formDataObj.append(`appliances[${index}].quantity`, appliance.quantity.toString())
      if (appliance.notes) {
        formDataObj.append(`appliances[${index}].notes`, appliance.notes)
      }
    })

    return formDataObj
  }

  // Helper functions
  const resetForm = () => {
    setFormData({
      // Basic Design Info
      arabicName: '',
      englishName: '',
      arabicDescription: '',
      englishDescription: '',
      
      // Design Category and Target
      category: DesignCategory.Standard,
      targetMarket: TargetMarket.Families,
      
      // Area and Room Details
      areaSquareMeters: 0,
      bedroomsCount: 0,
      bathroomsCount: 0,
      livingRoomsCount: 0,
      kitchensCount: 0,
      balconiesCount: 0,
      
      // Pricing Information
      originalRentPrice: 0,
      discountPercentage: 0,
      freePeriodDays: 0,
      officeCommission: 0,
      
      // Expenses
      municipalityFees: 0,
      electricityFees: 0,
      proFees: 0,
      insuranceAmount: 0,
      maintenanceAmount: 0,
      maintenanceType: MaintenanceType.Annual,
      gasType: GasType.Central,
      additionalExpensesDescription: '',
      additionalExpensesAmount: 0,
      
      isActive: true,
      
      // Media Files
      coverImage: null,
      images: null,
      video: null,
      
      // Features and Appliances
      selectedFeatures: [],
      selectedAppliances: [],
      
      // Payment Plans
      paymentPlans: []
    })
  }

  const handleCreate = () => {
    setIsCreateModalOpen(true)
    resetForm()
  }

  const handleEdit = (design: UnitDesignListDto) => {
    setSelectedDesign(design)
    setFormData({
      // Basic Design Info
      arabicName: design.arabicName,
      englishName: design.englishName,
      arabicDescription: design.arabicDescription || '',
      englishDescription: design.englishDescription || '',
      
      // Design Category and Target
      category: design.category,
      targetMarket: design.targetMarket,
      
      // Area and Room Details
      areaSquareMeters: design.areaSquareMeters || 0,
      bedroomsCount: design.bedroomsCount || 0,
      bathroomsCount: design.bathroomsCount || 0,
      livingRoomsCount: design.livingRoomsCount || 0,
      kitchensCount: design.kitchensCount || 0,
      balconiesCount: design.balconiesCount || 0,
      
      // Pricing Information
      originalRentPrice: design.originalRentPrice || 0,
      discountPercentage: design.discountPercentage || 0,
      freePeriodDays: design.freePeriodDays || 0,
      officeCommission: 0, // Not available in list DTO
      
      // Expenses (using default values for now)
      municipalityFees: 0,
      electricityFees: 0,
      proFees: 0,
      insuranceAmount: 0,
      maintenanceAmount: 0,
      maintenanceType: MaintenanceType.Annual,
      gasType: GasType.Central,
      additionalExpensesDescription: '',
      additionalExpensesAmount: 0,
      
      isActive: design.isActive,
      
      // Media Files
      coverImage: null,
      images: null,
      video: null,
      
      // Features and Appliances
      selectedFeatures: [],
      selectedAppliances: [],
      
      // Payment Plans
      paymentPlans: []
    })
    setIsEditModalOpen(true)
  }

  const handleCopy = (design: UnitDesignListDto) => {
    setSelectedDesign(design)
    setFormData({
      // Basic Design Info
      arabicName: `${design.arabicName} - ${t('copy') || 'Copy'}`,
      englishName: `${design.englishName} - Copy`,
      arabicDescription: design.arabicDescription || '',
      englishDescription: design.englishDescription || '',
      
      // Design Category and Target
      category: design.category,
      targetMarket: design.targetMarket,
      
      // Area and Room Details
      areaSquareMeters: design.areaSquareMeters || 0,
      bedroomsCount: design.bedroomsCount || 0,
      bathroomsCount: design.bathroomsCount || 0,
      livingRoomsCount: design.livingRoomsCount || 0,
      kitchensCount: design.kitchensCount || 0,
      balconiesCount: design.balconiesCount || 0,
      
      // Pricing Information
      originalRentPrice: design.originalRentPrice || 0,
      discountPercentage: design.discountPercentage || 0,
      freePeriodDays: design.freePeriodDays || 0,
      officeCommission: 0,
      
      // Expenses
      municipalityFees: 0,
      electricityFees: 0,
      proFees: 0,
      insuranceAmount: 0,
      maintenanceAmount: 0,
      maintenanceType: MaintenanceType.Annual,
      gasType: GasType.Central,
      additionalExpensesDescription: '',
      additionalExpensesAmount: 0,
      
      isActive: design.isActive,
      
      // Media Files
      coverImage: null,
      images: null,
      video: null,
      
      // Features and Appliances
      selectedFeatures: [],
      selectedAppliances: [],
      
      // Payment Plans
      paymentPlans: []
    })
    setIsCopyModalOpen(true)
  }

  const handleDelete = (design: UnitDesignListDto) => {
    setSelectedDesign(design)
    setDeleteConfirmOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      
      if (isEditModalOpen && selectedDesign) {
        // Update design using simple API call
        await RealEstateAPI.unitDesign.update(selectedDesign.id, {
          id: selectedDesign.id,
          arabicName: formData.arabicName,
          englishName: formData.englishName,
          arabicDescription: formData.arabicDescription,
          englishDescription: formData.englishDescription,
          areaSquareMeters: formData.areaSquareMeters,
          originalRentPrice: formData.originalRentPrice,
          maintenanceType: formData.maintenanceType,
          gasType: formData.gasType,
          isActive: formData.isActive
        }, language)
        
        setIsEditModalOpen(false)
        setSelectedDesign(null)
      } else {
        // Create new design using simple API call
        await RealEstateAPI.unitDesign.createWithMedia(createFormData(formData), language)
        setIsCreateModalOpen(false)
      }
      
      resetForm()
      await loadDesigns() // Reload data
    } catch (error) {
      console.error('Error saving design:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopySubmit = async () => {
    try {
      setIsSaving(true)
      await RealEstateAPI.unitDesign.createWithMedia(createFormData(formData), language)
      setIsCopyModalOpen(false)
      setSelectedDesign(null)
      resetForm()
      await loadDesigns()
    } catch (error) {
      console.error('Error copying design:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedDesign) return
    
    try {
      setIsSaving(true)
      await RealEstateAPI.unitDesign.delete(selectedDesign.id, language)
      setDeleteConfirmOpen(false)
      setSelectedDesign(null)
      await loadDesigns()
    } catch (error) {
      console.error('Error deleting design:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getCategoryColor = (category: number) => {
    const categoryName = Object.keys(DesignCategory).find(key => DesignCategory[key as keyof typeof DesignCategory] === category) || 'Standard'
    switch (categoryName) {
      case 'Luxury': return 'bg-purple-100 text-purple-800'
      case 'Premium': return 'bg-yellow-100 text-yellow-800'
      case 'Economic': return 'bg-green-100 text-green-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getCategoryLabel = (category: number) => {
    const categoryName = Object.keys(DesignCategory).find(key => DesignCategory[key as keyof typeof DesignCategory] === category) || 'Standard'
    const labels = {
      'Standard': t('standard') || 'Standard',
      'Luxury': t('luxury') || 'Luxury',
      'Premium': t('premium') || 'Premium',
      'Economic': t('economic') || 'Economic'
    }
    return labels[categoryName as keyof typeof labels] || categoryName
  }

  // Calculate designs by category
  const designsByCategory = designs.reduce((acc, design) => {
    acc[design.category] = (acc[design.category] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('unitDesigns') || 'Unit Designs'}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('manageUnitDesigns') || 'Manage unit designs with full CRUD operations and copy functionality'}
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          {t('addNew') || 'Add New'}
        </Button>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-6 w-6"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('error') || 'Error'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Stats */}
          <StatsCards
            totalDesigns={designs.length}
            designsByCategory={designsByCategory}
            getCategoryColor={getCategoryColor}
            getCategoryLabel={getCategoryLabel}
          />

          {/* Designs Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs?.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  onEdit={handleEdit}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                  getCategoryColor={getCategoryColor}
                  getCategoryLabel={getCategoryLabel}
                />
              ))}
            </div>
          ) : (
            <DesignTable
              designs={designs}
              onEdit={handleEdit}
              onCopy={handleCopy}
              onDelete={handleDelete}
              getCategoryColor={getCategoryColor}
              getCategoryLabel={getCategoryLabel}
            />
          )}

          {/* Empty State */}
          {(!designs || designs.length === 0) && (
            <EmptyState
              type="no-data"
              title={t('noDesigns') || 'لا توجد تصميمات'}
              description={t('noDesignsDescription') || 'لم يتم العثور على أي تصميمات. قم بإنشاء تصميم جديد للبدء.'}
              action={{
                label: t('addNew') || 'إضافة جديد',
                onClick: handleCreate
              }}
            />
          )}
        </>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('addNewDesign') || 'إضافة تصميم جديد'}
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <DesignWizard
                formData={formData}
                setFormData={setFormData}
                onSave={handleSubmit}
                isLoading={isSaving}
                isEditing={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('editDesign') || 'تعديل التصميم'}
                </h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedDesign(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <DesignWizard
                formData={formData}
                setFormData={setFormData}
                onSave={handleSubmit}
                isLoading={isSaving}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Copy Modal */}
      {isCopyModalOpen && selectedDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('copyDesign') || 'نسخ التصميم'}
                </h2>
                <button
                  onClick={() => {
                    setIsCopyModalOpen(false)
                    setSelectedDesign(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <DesignWizard
                formData={formData}
                setFormData={setFormData}
                onSave={handleCopySubmit}
                isLoading={isSaving}
                isEditing={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmOpen && selectedDesign && (
        <ConfirmationDialog
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false)
            setSelectedDesign(null)
          }}
          onConfirm={confirmDelete}
          title={t('deleteDesign') || 'Delete Design'}
          message={t('deleteDesignConfirm') || 'Are you sure you want to delete this design? This action cannot be undone.'}
        />
      )}
    </div>
  )
}

export default DesignsPage