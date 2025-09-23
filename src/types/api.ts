// ==============================================================================
// BASE RESPONSE TYPES
// ==============================================================================

export interface BaseResponse<T> {
  message: string;
  success: boolean;
  statusCode: number;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ==============================================================================
// AUTHENTICATION TYPES
// ==============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  
  refreshToken: string;
  user: UserData;
  permissions: UserPermission[];
  key?: string;
  token?: string;
  data?: UserData;
}

export interface UserData {
  id: number;
  arabicName: string;
  englishName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  roles: string[];
}

export interface UserPermission {
  permissionName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface SignUpRequest {
  arabicName: string;
  englishName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

// ==============================================================================
// MASTER DATA TYPES
// ==============================================================================

// Country Types
export interface CountryListDto {
  id: number;
  arabicName: string;
  englishName: string;
  countryCode: string;
  isActive: boolean;
  citiesCount: number;
}

export interface CountryDetailsDto {
  id: number;
  arabicName: string;
  englishName: string;
  countryCode: string;
  isActive: boolean;
  cities: CitySummaryDto[];
}

export interface CreateCountryRequest {
  arabicName: string;
  englishName: string;
  countryCode: string;
  isActive: boolean;
}

export interface UpdateCountryRequest extends CreateCountryRequest {
  id: number;
}

// City Types
export interface CityListDto {
  id: number;
  arabicName: string;
  englishName: string;
  isActive: boolean;
  country: CountryReferenceDto;
  areasCount: number;
  countryId: number;
}

export interface CityDetailsDto {
  id: number;
  arabicName: string;
  englishName: string;
  isActive: boolean;
  country: CountryReferenceDto;
  areas: AreaSummaryDto[];
}

export interface CitySummaryDto {
  id: number;
  arabicName: string;
  englishName: string;
  isActive: boolean;
}

export interface CreateCityRequest {
  arabicName: string;
  englishName: string;
  countryId: number;
  isActive: boolean;
}

export interface UpdateCityRequest extends CreateCityRequest {
  id: number;
}

// Area Types
export interface AreaListDto {
  id: number;
  arabicName: string;
  englishName: string;
  isActive: boolean;
  city: CityReferenceDto;
  cityId: number;
  country: CountryReferenceDto;
}

export interface CreateAreaRequest {
  arabicName: string;
  englishName: string;
  cityId: number;
  isActive: boolean;
}

export interface UpdateAreaRequest extends CreateAreaRequest {
  id: number;
}

// Reference Types
export interface CountryReferenceDto {
  id: number;
  arabicName: string;
  englishName: string;
  countryCode: string;
}

export interface CityReferenceDto {
  id: number;
  arabicName: string;
  englishName: string;
  country: CountryReferenceDto;
}

export interface AreaSummaryDto {
  id: number;
  arabicName: string;
  englishName: string;
  isActive: boolean;
}

// ==============================================================================
// TOWER FEATURE TYPES
// ==============================================================================

export interface TowerFeatureListDto {
  id: number;
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateTowerFeatureRequest {
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateTowerFeatureRequest extends CreateTowerFeatureRequest {
  id: number;
}

// ==============================================================================
// BLOCK TYPES
// ==============================================================================

export interface BlockListDto {
  id: number;
  code: string;
  arabicName: string;
  englishName: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateBlockRequest {
  code: string;
  arabicName: string;
  englishName: string;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateBlockRequest extends CreateBlockRequest {
  id: number;
}

// ==============================================================================
// APPLIANCE TYPES
// ==============================================================================

export interface ApplianceListDto {
  id: number;
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateApplianceRequest {
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateApplianceRequest extends CreateApplianceRequest {
  id: number;
}

// ==============================================================================
// TOWER TYPES
// ==============================================================================

export interface TowerListDto {
  id: number;
  arabicName: string;
  englishName: string;
  totalFloors: number;
  totalUnits: number;
  isActive: boolean;
  location: TowerLocationDto;
  unitsCount: number;
  coverImageUrl?: string;
}

export interface TowerLocationDto {
  country: CountryReferenceDto;
  city: CityReferenceDto;
  area: AreaSummaryDto;
}

export interface CreateTowerRequest {
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  countryId: number;
  cityId: number;
  areaId: number;
  totalFloors: number;
  totalUnits: number;
  isActive: boolean;
  autoCreateUnits?: boolean;
  floorDefinitions?: FloorDefinitionDto[];
}

export interface FloorDefinitionDto {
  floorNumber: number;
  floorArabicName: string;
  floorEnglishName: string;
  floorType: FloorType;
  unitsCount: number;
  unitNumberPattern: string;
  defaultUnitType: UnitType;
}

export const FloorType = {
  Parking: 'Parking',
  Residential: 'Residential',
  Commercial: 'Commercial',
  Facilities: 'Facilities'
} as const;

export type FloorType = typeof FloorType[keyof typeof FloorType];

export const UnitType = {
  Residential: 'Residential',
  Commercial: 'Commercial',
  Parking: 'Parking',
  Storage: 'Storage'
} as const;

export type UnitType = typeof UnitType[keyof typeof UnitType];

export interface UpdateTowerRequest extends CreateTowerRequest {
  id: number;
}

// ==============================================================================
// UNIT TYPES
// ==============================================================================

export interface UnitListDto {
  id: number;
  unitNumber: string;
  floorNumber: number;
  unitType: UnitType;
  status: UnitStatus;
  tower: TowerSummaryDto;
  unitDesign?: UnitDesignSummaryDto;
  block?: BlockSummaryDto;
  currentRentPrice?: number;
}

export interface TowerSummaryDto {
  id: number;
  arabicName: string;
  englishName: string;
}

export interface UnitDesignSummaryDto {
  id: number;
  arabicName: string;
  englishName: string;
  areaSquareMeters: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface BlockSummaryDto {
  id: number;
  code: string;
  arabicName: string;
  englishName: string;
}

export const UnitStatus = {
  Available: 'Available',
  Reserved: 'Reserved',
  Rented: 'Rented',
  UnderMaintenance: 'UnderMaintenance'
} as const;

export type UnitStatus = typeof UnitStatus[keyof typeof UnitStatus];

export interface CreateUnitRequest {
  unitNumber: string;
  floorNumber: number;
  unitType: UnitType;
  towerId: number;
  unitDesignId?: number;
  blockId?: number;
  status: UnitStatus;
  customRentPrice?: number;
}

export interface UpdateUnitRequest extends CreateUnitRequest {
  id: number;
}

export interface AssignDesignToUnitsRequest {
  unitIds: number[];
  unitDesignId: number;
}

export interface UnitForTowerManagementDto {
  tower: TowerSummaryDto;
  floors: FloorUnitsDto[];
}

export interface FloorUnitsDto {
  floorNumber: number;
  units: UnitListDto[];
}

// ==============================================================================
// UNIT DESIGN TYPES
// ==============================================================================

export interface UnitDesignListDto {
  id: number;
  arabicName: string;
  englishName: string;
  areaSquareMeters: number;
  bedrooms?: number;
  bathrooms?: number;
  originalRentPrice: number;
  finalRentPrice: number;
  isActive: boolean;
  featuresCount: number;
  appliancesCount: number;
  paymentPlansCount: number;
  coverImageUrl?: string;
}

export interface CreateUnitDesignRequest {
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  areaSquareMeters: number;
  bedrooms?: number;
  bathrooms?: number;
  originalRentPrice: number;
  discountPercentage?: number;
  freeDays?: number;
  officeCommission?: number;
  municipalityFees?: number;
  electricityFees?: number;
  proFees?: number;
  insurance?: number;
  maintenanceType: MaintenanceType;
  maintenanceFees?: number;
  gasType: GasType;
  additionalExpenses?: number;
  isActive: boolean;
  paymentPlans?: CreatePaymentPlanRequest[];
}

export const MaintenanceType = {
  Annual: 'Annual',
  NotIncluded: 'NotIncluded',
  Optional: 'Optional',
  Free: 'Free'
} as const;

export type MaintenanceType = typeof MaintenanceType[keyof typeof MaintenanceType];

export const GasType = {
  Central: 'Central',
  Cylinder: 'Cylinder'
} as const;

export type GasType = typeof GasType[keyof typeof GasType];

export interface UpdateUnitDesignRequest extends CreateUnitDesignRequest {
  id: number;
}

// ==============================================================================
// PAYMENT PLAN TYPES
// ==============================================================================

export interface PaymentPlanListDto {
  id: number;
  arabicName: string;
  englishName: string;
  downPaymentPercentage: number;
  downPaymentMonths: number;
  installmentPercentage: number;
  installmentMonths: number;
  discountPercentage?: number;
  finalPrice: number;
  unitDesign: UnitDesignSummaryDto;
}

export interface CreatePaymentPlanRequest {
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  unitDesignId: number;
  downPaymentPercentage: number;
  downPaymentMonths: number;
  installmentPercentage: number;
  installmentMonths: number;
  discountPercentage?: number;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdatePaymentPlanRequest extends CreatePaymentPlanRequest {
  id: number;
}

// ==============================================================================
// USER MANAGEMENT TYPES
// ==============================================================================

export interface User {
  id: number;
  arabicName: string;
  englishName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  roles: Role[];
}

export interface CreateUserRequest {
  arabicName: string;
  englishName: string;
  email: string;
  password: string;
  phoneNumber: string;
  isActive: boolean;
  roleIds: number[];
}

export interface UpdateUserRequest {
  id: number;
  arabicName: string;
  englishName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  roleIds: number[];
}

// ==============================================================================
// ROLE TYPES
// ==============================================================================

export interface Role {
  id: number;
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  isActive: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  permissionName: string;
  arabicDisplayName: string;
  englishDisplayName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateRoleRequest {
  arabicName: string;
  englishName: string;
  arabicDescription?: string;
  englishDescription?: string;
  isActive: boolean;
  permissionIds: number[];
}

export interface UpdateRoleRequest {
  arabicName?: string;
  englishName?: string;
  arabicDescription?: string;
  englishDescription?: string;
  isActive?: boolean;
  permissionIds?: number[];
}

// ==============================================================================
// FILE & ATTACHMENT TYPES
// ==============================================================================

export interface AttachmentDto {
  id: number;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface UploadAttachmentRequest {
  file: File;
  description?: string;
  category?: string;
}

export interface FilePropertiesDto {
  fileName: string;
  fileSize: number;
  fileType: string;
  createdDate: string;
  modifiedDate: string;
  isReadOnly: boolean;
}

// ==============================================================================
// NOTIFICATION TYPES
// ==============================================================================

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  userId: number;
}

export const NotificationType = {
  Info: 'Info',
  Warning: 'Warning',
  Error: 'Error',
  Success: 'Success'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  userIds: number[];
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  type?: NotificationType;
  userIds?: number[];
  isRead?: boolean;
}

export interface CreateNotificationTemplateRequest {
  name: string;
  arabicTemplate: string;
  englishTemplate: string;
  type: NotificationType;
  variables?: string[];
}

export interface UpdateNotificationTemplateRequest {
  name?: string;
  arabicTemplate?: string;
  englishTemplate?: string;
  type?: NotificationType;
  variables?: string[];
  isActive?: boolean;
}

export interface ReportParameters {
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  towerId?: number;
  userId?: number;
  unitType?: string;
  [key: string]: string | number | string[] | undefined; // For additional dynamic parameters
}

// ==============================================================================
// QUERY PARAMETERS
// ==============================================================================

export interface QueryParams {
  pageSize?: number;
  pageNumber?: number;
  searchKeyword?: string;
  onlyActive?: boolean;
  lang?: 'en' | 'ar';
}

export interface TowerQueryParams extends QueryParams {
  countryId?: number;
  cityId?: number;
  areaId?: number;
}

export interface UnitQueryParams extends QueryParams {
  towerId?: number;
  status?: UnitStatus;
  floorNumber?: number;
  includeUnassignedOnly?: boolean;
}

export interface CityQueryParams extends QueryParams {
  countryId?: number;
}

export interface AreaQueryParams extends QueryParams {
  cityId?: number;
}

export interface PaymentPlanQueryParams extends QueryParams {
  unitDesignId?: number;
}