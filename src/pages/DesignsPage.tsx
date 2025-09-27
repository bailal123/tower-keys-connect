import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  SearchAndFilters,
  EmptyState,
  DesignWizard,
  StatsCards
} from '../components/ui'




const DesignsPage: React.FC = () => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()

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
    category: DesignCategory.Family,  // Use Family as default (matches backend value 5)
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
    includeMunicipalityFreePeriod: false,
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
        searchTerm || null, // searchTerm
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
    
    // Basic Design Info - exact field names from API
    formDataObj.append('ArabicName', data.arabicName)
    formDataObj.append('EnglishName', data.englishName)
    formDataObj.append('ArabicDescription', data.arabicDescription || '')
    formDataObj.append('EnglishDescription', data.englishDescription || '')
    
    // Design Category and Target - exact field names from API
    formDataObj.append('Category', data.category.toString())
    formDataObj.append('TargetMarket', data.targetMarket.toString())
    
    // Area and Room Details - exact field names from API
    formDataObj.append('AreaSquareMeters', data.areaSquareMeters.toString())
    formDataObj.append('BedroomsCount', data.bedroomsCount.toString())
    formDataObj.append('BathroomsCount', data.bathroomsCount.toString())
    formDataObj.append('LivingRoomsCount', data.livingRoomsCount.toString())
    formDataObj.append('KitchensCount', data.kitchensCount.toString())
    formDataObj.append('BalconiesCount', data.balconiesCount.toString())
    
    // Pricing Information - exact field names from API
    formDataObj.append('OriginalRentPrice', data.originalRentPrice.toString())
    formDataObj.append('DiscountPercentage', data.discountPercentage.toString())
    formDataObj.append('FreePeriodDays', data.freePeriodDays.toString())
    formDataObj.append('OfficeCommission', data.officeCommission.toString())
    
    // Expenses - exact field names from API
    formDataObj.append('MunicipalityFees', data.municipalityFees.toString())
    formDataObj.append('ElectricityFees', data.electricityFees.toString())
    formDataObj.append('ProFees', data.proFees.toString())
    formDataObj.append('InsuranceAmount', data.insuranceAmount.toString())
    formDataObj.append('MaintenanceAmount', data.maintenanceAmount.toString())
    formDataObj.append('MaintenanceType', data.maintenanceType.toString())
    formDataObj.append('GasType', data.gasType.toString())
    formDataObj.append('AdditionalExpensesDescription', data.additionalExpensesDescription || '')
    formDataObj.append('AdditionalExpensesAmount', data.additionalExpensesAmount.toString())
    
    // Status
    formDataObj.append('IsActive', data.isActive.toString())

    // Media Files
    // Cover Image (only append if it's a new File, not an existing URL string)
    if (data.coverImage && data.coverImage instanceof File) {
      formDataObj.append('CoverImage', data.coverImage)
    }

    // Additional Images
    if (data.images && data.images.length > 0) {
      (Array.from(data.images) as Array<File | string>).forEach((image) => {
        if (image instanceof File) {
          formDataObj.append('Images', image)
        }
      })
    }

    // Videos
    if (data.video && data.video instanceof File) {
      formDataObj.append('Videos', data.video)
    }

    // Features array with proper structure for creation
    data.selectedFeatures.forEach((featureId, index) => {
      formDataObj.append(`Features[${index}].TowerFeatureId`, featureId.toString())
      formDataObj.append(`Features[${index}].Notes`, '') // Default empty notes
      formDataObj.append(`Features[${index}].AdditionalCost`, '0') // Default 0 cost
    })

    // Appliances array with proper structure for creation
    data.selectedAppliances.forEach((appliance, index) => {
      formDataObj.append(`Appliances[${index}].ApplianceId`, appliance.id.toString())
      formDataObj.append(`Appliances[${index}].Quantity`, appliance.quantity.toString())
      formDataObj.append(`Appliances[${index}].Notes`, appliance.notes || '')
      formDataObj.append(`Appliances[${index}].IsOptional`, 'false') // Set as required by default
      formDataObj.append(`Appliances[${index}].AdditionalCost`, '0') // Default 0 cost
    })

    // Auto-generate ImageDetails if images exist for creation
    if (data.images && data.images.length > 0) {
      const newImages = (Array.from(data.images) as Array<File | string>).filter((img): img is File => img instanceof File)
      newImages.forEach((image, index) => {
        const fileName = image.name.split('.')[0] // Get filename without extension
        formDataObj.append(`ImageDetails[${index}].Index`, index.toString())
        formDataObj.append(`ImageDetails[${index}].ArabicTitle`, `صورة ${fileName}`)
        formDataObj.append(`ImageDetails[${index}].EnglishTitle`, `Image ${fileName}`)
        formDataObj.append(`ImageDetails[${index}].ArabicDescription`, `وصف الصورة ${index + 1}`)
        formDataObj.append(`ImageDetails[${index}].EnglishDescription`, `Image ${index + 1} description`)
        formDataObj.append(`ImageDetails[${index}].ImageType`, '1') // Interior type default
        formDataObj.append(`ImageDetails[${index}].DisplayOrder`, (index + 1).toString())
      })
    }

    // Auto-generate VideoDetails if video exists for creation
    if (data.video && data.video instanceof File) {
      const fileName = data.video.name.split('.')[0] // Get filename without extension
      formDataObj.append('VideoDetails[0].Index', '0')
      formDataObj.append('VideoDetails[0].ArabicTitle', `فيديو ${fileName}`)
      formDataObj.append('VideoDetails[0].EnglishTitle', `Video ${fileName}`)
      formDataObj.append('VideoDetails[0].ArabicDescription', 'وصف الفيديو')
      formDataObj.append('VideoDetails[0].EnglishDescription', 'Video description')
      formDataObj.append('VideoDetails[0].VideoType', '1') // Tour type default
      formDataObj.append('VideoDetails[0].DisplayOrder', '1')
      formDataObj.append('VideoDetails[0].IsMainVideo', 'true')
    }

    // Payment Plans (if any) - Updated structure for creation
    console.log('Processing Payment Plans for creation:', data.paymentPlans)
    console.log('Current pricing for creation - Original Price:', data.originalRentPrice, 'Discount:', data.discountPercentage)
    
    // Calculate current final price based on latest pricing
    const currentFinalPrice = data.originalRentPrice * (1 - data.discountPercentage / 100)
    console.log('Calculated final price for creation:', currentFinalPrice)
    
    if (data.paymentPlans && data.paymentPlans.length > 0) {
      data.paymentPlans.forEach((plan, index) => {
        // Calculate CORRECT price per installment based on current pricing
        const correctPricePerInstallment = Math.round(currentFinalPrice / plan.NumberOfPayments)
        
        console.log(`Adding Payment Plan ${index} for creation with CORRECTED price:`, correctPricePerInstallment)
        console.log(`Original plan.FinalPrice:`, plan.FinalPrice, '-> Corrected:', correctPricePerInstallment)
        
        // Convert from frontend format to backend format
        const arabicName = plan.NumberOfPayments === 1 ? 'دفعة واحدة' : `${plan.NumberOfPayments} دفعات`
        const englishName = plan.NumberOfPayments === 1 ? 'Single Payment' : `${plan.NumberOfPayments} Installments`
        
        formDataObj.append(`PaymentPlans[${index}].ArabicName`, arabicName)
        formDataObj.append(`PaymentPlans[${index}].EnglishName`, englishName)
        formDataObj.append(`PaymentPlans[${index}].NumberOfPayments`, (plan.NumberOfPayments || 1).toString())
        formDataObj.append(`PaymentPlans[${index}].FinalPrice`, correctPricePerInstallment.toString()) // Use corrected price
        formDataObj.append(`PaymentPlans[${index}].DiscountPercentage`, '0') // Default 0 discount
        formDataObj.append(`PaymentPlans[${index}].DisplayOrder`, (index + 1).toString())
        formDataObj.append(`PaymentPlans[${index}].IsActive`, 'true')
      })
    } else {
      console.log('No payment plans found in formData')
    }

    // Language setting
    formDataObj.append('lang', language)

    return formDataObj
  }

  // Helper to create FormData for updating existing design
  const createUpdateFormData = (id: number, data: DesignFormData) => {
    const formDataObj = new FormData()
    
    // Design ID for update
    formDataObj.append('Id', id.toString())
    
    // Basic Design Info - exact field names from UpdateUnitDesignWithMediaCommand
    formDataObj.append('ArabicName', data.arabicName)
    formDataObj.append('EnglishName', data.englishName)
    formDataObj.append('ArabicDescription', data.arabicDescription || '')
    formDataObj.append('EnglishDescription', data.englishDescription || '')
    
    // Design Category and Target - exact field names from API
    formDataObj.append('Category', data.category.toString())
    formDataObj.append('TargetMarket', data.targetMarket.toString())
    
    // Area and Room Details - exact field names from API
    formDataObj.append('AreaSquareMeters', data.areaSquareMeters.toString())
    formDataObj.append('BedroomsCount', data.bedroomsCount.toString())
    formDataObj.append('BathroomsCount', data.bathroomsCount.toString())
    formDataObj.append('LivingRoomsCount', data.livingRoomsCount.toString())
    formDataObj.append('KitchensCount', data.kitchensCount.toString())
    formDataObj.append('BalconiesCount', data.balconiesCount.toString())
    
    // Pricing Information - exact field names from API
    formDataObj.append('OriginalRentPrice', data.originalRentPrice.toString())
    formDataObj.append('DiscountPercentage', data.discountPercentage.toString())
    formDataObj.append('FreePeriodDays', data.freePeriodDays.toString())
    formDataObj.append('OfficeCommission', data.officeCommission.toString())
    
    // Expenses - exact field names from API
    formDataObj.append('MunicipalityFees', data.municipalityFees.toString())
    formDataObj.append('ElectricityFees', data.electricityFees.toString())
    formDataObj.append('ProFees', data.proFees.toString())
    formDataObj.append('InsuranceAmount', data.insuranceAmount.toString())
    formDataObj.append('MaintenanceAmount', data.maintenanceAmount.toString())
    formDataObj.append('MaintenanceType', data.maintenanceType.toString())
    formDataObj.append('GasType', data.gasType.toString())
    formDataObj.append('AdditionalExpensesDescription', data.additionalExpensesDescription || '')
    formDataObj.append('AdditionalExpensesAmount', data.additionalExpensesAmount.toString())
    
    // Status
    formDataObj.append('IsActive', data.isActive.toString())

    // Media Files - New media
    // Cover Image (only append if it's a new File)
    if (data.coverImage && data.coverImage instanceof File) {
      formDataObj.append('CoverImage', data.coverImage)
    }

    // Additional Images
    if (data.images && data.images.length > 0) {
      (Array.from(data.images) as Array<File | string>).forEach((image) => {
        if (image instanceof File) {
          formDataObj.append('Images', image)
        }
      })
    }

    // Videos
    if (data.video && data.video instanceof File) {
      formDataObj.append('Videos', data.video)
    }

    // Features array with proper structure for update
    data.selectedFeatures.forEach((featureId, index) => {
      formDataObj.append(`Features[${index}].TowerFeatureId`, featureId.toString())
      formDataObj.append(`Features[${index}].Notes`, '') // Default empty notes
      formDataObj.append(`Features[${index}].AdditionalCost`, '0') // Default 0 cost
      formDataObj.append(`Features[${index}].IsDeleted`, 'false')
    })

    // Appliances array with proper structure for update
    data.selectedAppliances.forEach((appliance, index) => {
      formDataObj.append(`Appliances[${index}].ApplianceId`, appliance.id.toString())
      formDataObj.append(`Appliances[${index}].Quantity`, appliance.quantity.toString())
      formDataObj.append(`Appliances[${index}].Notes`, appliance.notes || '')
      formDataObj.append(`Appliances[${index}].IsOptional`, 'false') // Set as required by default for update
      formDataObj.append(`Appliances[${index}].AdditionalCost`, '0') // Default 0 cost
      formDataObj.append(`Appliances[${index}].IsDeleted`, 'false')
    })

    // Auto-generate ImageDetails for new images if they exist
    if (data.images && data.images.length > 0) {
      const newImages = (Array.from(data.images) as Array<File | string>).filter((img): img is File => img instanceof File)
      newImages.forEach((image, index) => {
        const fileName = image.name.split('.')[0]
        formDataObj.append(`ImageDetails[${index}].Index`, index.toString())
        formDataObj.append(`ImageDetails[${index}].ArabicTitle`, `صورة ${fileName}`)
        formDataObj.append(`ImageDetails[${index}].EnglishTitle`, `Image ${fileName}`)
        formDataObj.append(`ImageDetails[${index}].ArabicDescription`, `وصف الصورة ${index + 1}`)
        formDataObj.append(`ImageDetails[${index}].EnglishDescription`, `Image ${index + 1} description`)
        formDataObj.append(`ImageDetails[${index}].ImageType`, '1') // Interior type default
        formDataObj.append(`ImageDetails[${index}].DisplayOrder`, (index + 1).toString())
      })
    }

    // Auto-generate VideoDetails for new video if it exists
    if (data.video && data.video instanceof File) {
      const fileName = data.video.name.split('.')[0]
      formDataObj.append('VideoDetails[0].Index', '0')
      formDataObj.append('VideoDetails[0].ArabicTitle', `فيديو ${fileName}`)
      formDataObj.append('VideoDetails[0].EnglishTitle', `Video ${fileName}`)
      formDataObj.append('VideoDetails[0].ArabicDescription', 'وصف الفيديو')
      formDataObj.append('VideoDetails[0].EnglishDescription', 'Video description')
      formDataObj.append('VideoDetails[0].VideoType', '1') // Tour type default
      formDataObj.append('VideoDetails[0].DisplayOrder', '1')
      formDataObj.append('VideoDetails[0].IsMainVideo', 'true')
    }

    // Payment Plans for update
    console.log('Processing Payment Plans for update:', data.paymentPlans)
    console.log('Current pricing - Original Price:', data.originalRentPrice, 'Discount:', data.discountPercentage)
    
    // Calculate current final price based on latest pricing
    const currentFinalPrice = data.originalRentPrice * (1 - data.discountPercentage / 100)
    console.log('Calculated final price:', currentFinalPrice)
    
    if (data.paymentPlans && data.paymentPlans.length > 0) {
      data.paymentPlans.forEach((plan, index) => {
        console.log(`Payment Plan ${index}:`, plan)
        
        // Calculate CORRECT price per installment based on current pricing
        const correctPricePerInstallment = Math.round(currentFinalPrice / plan.NumberOfPayments)
        
        console.log(`Adding Payment Plan ${index} for update with CORRECTED price:`, correctPricePerInstallment)
        console.log(`Original plan.FinalPrice:`, plan.FinalPrice, '-> Corrected:', correctPricePerInstallment)
        
        // Convert from frontend format to backend format
        const arabicName = plan.NumberOfPayments === 1 ? 'دفعة واحدة' : `${plan.NumberOfPayments} دفعات`
        const englishName = plan.NumberOfPayments === 1 ? 'Single Payment' : `${plan.NumberOfPayments} Installments`
        
        formDataObj.append(`PaymentPlans[${index}].ArabicName`, arabicName)
        formDataObj.append(`PaymentPlans[${index}].EnglishName`, englishName)
        formDataObj.append(`PaymentPlans[${index}].NumberOfPayments`, (plan.NumberOfPayments || 1).toString())
        formDataObj.append(`PaymentPlans[${index}].FinalPrice`, correctPricePerInstallment.toString()) // Use corrected price
        formDataObj.append(`PaymentPlans[${index}].DiscountPercentage`, '0') // Default 0 discount
        formDataObj.append(`PaymentPlans[${index}].DisplayOrder`, (index + 1).toString())
        formDataObj.append(`PaymentPlans[${index}].IsActive`, 'true')
        formDataObj.append(`PaymentPlans[${index}].IsDeleted`, 'false')
      })
    }

    // Language setting
    formDataObj.append('lang', language)

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
      category: DesignCategory.Family,  // Use Family as default (matches backend value 5)
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
      includeMunicipalityFreePeriod: false,
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

  // Load full design details for editing/copying
  const loadDesignDetails = async (designId: number) => {
    try {
      setIsLoading(true)
      const response = await RealEstateAPI.unitDesign.getById(designId, language)
      const design = response.data.data
      
      // Try to fetch features and appliances explicitly in case getById doesn't include them
      let designFeatures: unknown[] = Array.isArray(design?.features) ? design.features : []
      let designAppliances: unknown[] = Array.isArray(design?.appliances) ? design.appliances : []
      
      try {
        const [featuresResp, appliancesResp] = await Promise.all([
          RealEstateAPI.unitDesign.getFeatures(designId, language),
          RealEstateAPI.unitDesign.getAppliances(designId, language)
        ])
        // Normalize payloads: support both { data: T[] } and direct T[] responses
        const featuresPayload: unknown[] = Array.isArray(featuresResp?.data?.data)
          ? (featuresResp!.data!.data as unknown[])
          : (Array.isArray(featuresResp?.data) ? (featuresResp!.data as unknown[]) : [])

        const appliancesPayload: unknown[] = Array.isArray(appliancesResp?.data?.data)
          ? (appliancesResp!.data!.data as unknown[])
          : (Array.isArray(appliancesResp?.data) ? (appliancesResp!.data as unknown[]) : [])

        if (featuresPayload.length > 0) {
          designFeatures = featuresPayload
        }
        if (appliancesPayload.length > 0) {
          designAppliances = appliancesPayload
        }
      } catch (subErr) {
        console.warn('Could not load design features/appliances from dedicated endpoints, falling back to getById payload.', subErr)
      }
      
  console.log('Full design data from API:', design)
  console.log('Features:', design.features)
  console.log('designFeatures variable (to be mapped):', designFeatures)
  console.log('Appliances:', design.appliances)
      console.log('Images:', design.images)
      console.log('Videos:', design.videos)
      console.log('Payment Plans:', design.paymentPlans)
      
  return {
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
        officeCommission: design.officeCommission || 0,
        
        // Expenses
        municipalityFees: design.municipalityFees || 0,
        electricityFees: design.electricityFees || 0,
        proFees: design.proFees || 0,
        insuranceAmount: design.insuranceAmount || 0,
        maintenanceAmount: design.maintenanceAmount || 0,
        maintenanceType: design.maintenanceType || MaintenanceType.Annual,
        gasType: design.gasType || GasType.Central,
        additionalExpensesDescription: design.additionalExpensesDescription || '',
        additionalExpensesAmount: design.additionalExpensesAmount || 0,
        
        isActive: design.isActive,
        
        // Media Files - Store URLs for existing files, will be handled differently in DesignWizard
        // Prefer coverImageUrl from API; fallback to image with isCover=true
        coverImage: design.coverImageUrl || (design.images?.find((img: { isCover?: boolean }) => !!img.isCover)?.imageUrl) || null,
        images: design.images?.length > 0 ? design.images.map((img: {imageUrl: string}) => img.imageUrl) : null,
        video: design.videos?.length > 0 ? design.videos[0].videoUrl : null,
        
        // Features and Appliances - Map from API response correctly (support both nested and flat shapes)
        selectedAppliances: (() => {
          console.log('Raw designAppliances for mapping:', designAppliances)
          if (!Array.isArray(designAppliances) || designAppliances.length === 0) {
            console.log('No appliances found, returning empty array')
            return []
          }
          
          // Simple direct mapping - try common API response formats
          const result = designAppliances.map((item: unknown) => {
            const obj = item as Record<string, unknown>
            // Handle direct format: { applianceId: 1, quantity: 2 }
            if (obj.applianceId && obj.quantity) {
              return { id: Number(obj.applianceId), quantity: Number(obj.quantity), notes: obj.notes || '' }
            }
            // Handle nested format: { appliance: { id: 1 }, quantity: 2 }
            if (obj.appliance && typeof obj.appliance === 'object' && obj.appliance !== null && 'id' in obj.appliance && obj.quantity) {
              const appliance = obj.appliance as { id: unknown }
              return { id: Number(appliance.id), quantity: Number(obj.quantity), notes: (obj.notes as string) || '' }
            }
            // Handle simple format: { id: 1, quantity: 2 }
            if (obj.id && obj.quantity) {
              return { id: Number(obj.id), quantity: Number(obj.quantity), notes: obj.notes || '' }
            }
            return undefined
          }).filter((item): item is { id: number; quantity: number; notes: string } => item !== undefined)
          
          console.log('Final selectedAppliances:', result)
          return result
        })(),
        selectedFeatures: (() => {
          console.log('Raw designFeatures for mapping:', designFeatures)
          if (!Array.isArray(designFeatures) || designFeatures.length === 0) {
            console.log('No features found, returning empty array')
            return []
          }
          
          // Simple direct mapping - try common API response formats
          const result = designFeatures.map((item: unknown) => {
            const obj = item as Record<string, unknown>
            // Handle direct format: { towerFeatureId: 1 }
            if (obj.towerFeatureId) {
              return Number(obj.towerFeatureId)
            }
            // Handle nested format: { towerFeature: { id: 1 } }
            if (obj.towerFeature && typeof obj.towerFeature === 'object' && obj.towerFeature !== null && 'id' in obj.towerFeature) {
              const towerFeature = obj.towerFeature as { id: unknown }
              return Number(towerFeature.id)
            }
            // Handle simple format: { id: 1 }
            if (obj.id) {
              return Number(obj.id)
            }
            // Handle direct number/string
            if (typeof item === 'number' || typeof item === 'string') {
              return Number(item)
            }
            return undefined
          }).filter((id): id is number => typeof id === 'number' && !isNaN(id))
          
          console.log('Final selectedFeatures:', result)
          return [...new Set(result)] // Remove duplicates
        })(),
       // selectedFeatures: design.features.towerFeatureId,
        // Payment Plans - Map from API response
        paymentPlans: design.paymentPlans?.map((pp: {arabicName?: string, englishName?: string, arabicDescription?: string, englishDescription?: string, numberOfPayments: number, discountPercentage?: number, finalPrice: number, displayOrder?: number, isActive?: boolean}) => ({
          ArabicName: pp.arabicName || '',
          EnglishName: pp.englishName || '',
          ArabicDescription: pp.arabicDescription || '',
          EnglishDescription: pp.englishDescription || '',
          NumberOfPayments: pp.numberOfPayments,
          DiscountPercentage: pp.discountPercentage || 0,
          FinalPrice: pp.finalPrice,
          DisplayOrder: pp.displayOrder || 0,
          IsActive: pp.isActive !== false
        })) || []
      }
    } catch (error) {
      console.error('Error loading design details:', error)
      setError('Failed to load design details')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (design: UnitDesignListDto) => {
    try {
      setSelectedDesign(design)
      const fullDesignData = await loadDesignDetails(design.id)
      setFormData({
        ...fullDesignData,
        includeMunicipalityFreePeriod: false
      })
      setIsEditModalOpen(true)
    } catch (error) {
      console.error('Error opening edit modal:', error)
    }
  }

  const handleCopy = async (design: UnitDesignListDto) => {
    try {
      setSelectedDesign(design)
      const fullDesignData = await loadDesignDetails(design.id)
      
      // Modify the name to indicate it's a copy
      fullDesignData.arabicName = `${fullDesignData.arabicName} - ${t('copy') || 'نسخة'}`
      fullDesignData.englishName = `${fullDesignData.englishName} - Copy`
      
      // Clear media files for copy (user needs to re-upload)
      fullDesignData.coverImage = null
      fullDesignData.images = null
      fullDesignData.video = null
      
      setFormData({
        ...fullDesignData,
        includeMunicipalityFreePeriod: false
      })
      setIsCopyModalOpen(true)
    } catch (error) {
      console.error('Error opening copy modal:', error)
    }
  }

  const handleDelete = (design: UnitDesignListDto) => {
    setSelectedDesign(design)
    setDeleteConfirmOpen(true)
  }

  const handleView = (design: UnitDesignListDto) => {
    navigate(`/designs/${design.id}`)
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      
      console.log('HandleSubmit called with formData:', formData)
      console.log('Payment plans in formData:', formData.paymentPlans)
      
      if (isEditModalOpen && selectedDesign) {
        // Update design using updateWithMedia API call with proper FormData
        const updateFormDataToSend = createUpdateFormData(selectedDesign.id, formData)
        
        // Debug: Log FormData contents for update
        console.log('Sending Update FormData with these entries:')
        for (const [key, value] of updateFormDataToSend.entries()) {
          console.log(`${key}:`, value)
        }
        
        await RealEstateAPI.unitDesign.updateWithMedia(selectedDesign.id, updateFormDataToSend, language)
        
        setIsEditModalOpen(false)
        setSelectedDesign(null)
      } else {
        // Create new design using createWithMedia API call with proper FormData
        const formDataToSend = createFormData(formData)
        
        // Debug: Log FormData contents
        console.log('Sending FormData with these entries:')
        for (const [key, value] of formDataToSend.entries()) {
          console.log(`${key}:`, value)
        }
        
        await RealEstateAPI.unitDesign.createWithMedia(formDataToSend, language)
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
      // Create copy using createWithMedia API call with proper FormData
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
    const categoryName = Object.keys(DesignCategory).find(key => DesignCategory[key as keyof typeof DesignCategory] === category) || 'Family'
    switch (categoryName) {
      case 'Standard': return 'bg-blue-100 text-blue-800'
      case 'Luxury': return 'bg-purple-100 text-purple-800'
      case 'Premium': return 'bg-yellow-100 text-yellow-800'
      case 'Economic': return 'bg-green-100 text-green-800'
      case 'Family': return 'bg-orange-100 text-orange-800'
      case 'Executive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: number) => {
    const categoryName = Object.keys(DesignCategory).find(key => DesignCategory[key as keyof typeof DesignCategory] === category) || 'Family'
    const labels = {
      'Standard': t('category_normal') || 'Standard',
      'Luxury': t('category_luxury') || 'Luxury',
      'Premium': t('category_excellent') || 'Premium',
      'Economic': t('category_economic') || 'Economic',
      'Family': t('category_family') || 'Family',
      'Executive': t('category_executive') || 'Executive'
    }
    return labels[categoryName as keyof typeof labels] || categoryName
  }

  // Calculate designs by category
  const designsByCategory = designs.reduce((acc, design) => {
    acc[design.category] = (acc[design.category] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="p-4 space-y-4">
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
                  onView={handleView}
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
              onView={handleView}
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