import axios from 'axios';
import type {
  LoginRequest,
  SignUpRequest,
  CreateCountryRequest,
  UpdateCountryRequest,
  CreateCityRequest,
  UpdateCityRequest,
  CreateAreaRequest,
  UpdateAreaRequest,
  CreateTowerFeatureRequest,
  UpdateTowerFeatureRequest,
  CreateBlockRequest,
  UpdateBlockRequest,
  CreateApplianceRequest,
  UpdateApplianceRequest,
  CreateTowerRequest,
  UpdateTowerRequest,
  CreateUnitRequest,
  UpdateUnitRequest,
  AssignDesignToUnitsRequest,
  CreateUnitDesignRequest,
  UpdateUnitDesignRequest,
  CreatePaymentPlanRequest,
  UpdatePaymentPlanRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  UploadAttachmentRequest,
  ReportParameters,
  AssignDesignsToBlockRequest,
  AssignBlocksToTowerRequest,
  CreateUnitsBulkRequest,
} from '../types/api';

// Base URL Configuration
const BASE_URL =  'https://localhost:50938/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==============================================================================
// AUTHENTICATION APIs
// ==============================================================================

export const authAPI = {
  // Login
  login: (credentials: LoginRequest, lang = 'en') =>
    api.post(`/Authentication/login?lang=${lang}`, credentials),

  // Sign Up
  signUp: (userData: SignUpRequest, lang = 'en') =>
    api.post(`/Authentication/signup?lang=${lang}`, userData),

  // Sign Up from Admin Dashboard
  signUpFromAdmin: (userData: SignUpRequest, lang = 'en') =>
    api.post(`/Authentication/signup-from-admin?lang=${lang}`, userData),

  // Forget Password
  forgetPassword: (email: string, lang = 'en') =>
    api.post(`/Authentication/forget-password?lang=${lang}`, { email }),

  // Verify Account
  verifyAccount: (verificationData: { email: string; code: string }, lang = 'en') =>
    api.post(`/Authentication/verify-account?lang=${lang}`, verificationData),

  // Check Confirmation Code for Forgotten Password
  checkConfirmationCodeForForgottenPassword: (data: { email: string; code: string }, lang = 'en') =>
    api.post(`/Authentication/check-confirmation-forgotten-password?lang=${lang}`, data),

  // Check Confirmation Code for Sign Up
  checkConfirmationCodeForSignUp: (data: { email: string; code: string }, lang = 'en') =>
    api.post(`/Authentication/check-confirmation-signup?lang=${lang}`, data),

  // Update FCM Token
  updateFCMToken: (fcmData: { userId: number; token: string }, lang = 'en') =>
    api.post(`/Authentication/update-fcm-token?lang=${lang}`, fcmData),

  // Show as Subscriber
  showAsSubscriber: (lang = 'en') =>
    api.get(`/Authentication/show-as-subscriber?lang=${lang}`),

  // Logout
  logout: (lang = 'en') =>
    api.post(`/Authentication/logout?lang=${lang}`),
};

// ==============================================================================
// MASTER DATA APIs
// ==============================================================================

// COUNTRIES
export const countryAPI = {
  // Get all countries
  getAll: (onlyActive = true, lang = 'en') =>
    api.get(`/Country?onlyActive=${onlyActive}&lang=${lang}`),

  // Get country by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Country/${id}?lang=${lang}`),

  // Get countries with cities
  getWithCities: (onlyActive = true, lang = 'en') =>
    api.get(`/Country/with-cities?onlyActive=${onlyActive}&lang=${lang}`),

  // Create country
  create: (countryData: CreateCountryRequest, lang = 'en') =>
    api.post(`/Country?lang=${lang}`, countryData),

  // Update country
  update: (id: number, countryData: UpdateCountryRequest, lang = 'en') =>
    api.put(`/Country/${id}?lang=${lang}`, countryData),

  // Delete country
  delete: (id: number, lang = 'en') =>
    api.delete(`/Country/${id}?lang=${lang}`),
};

// CITIES
export const cityAPI = {
  // Get all cities
  getAll: (onlyActive = true, countryId: number | null = null, lang = 'en') => {
    let url = `/City?onlyActive=${onlyActive}&lang=${lang}`;
    if (countryId) url += `&countryId=${countryId}`;
    return api.get(url);
  },

  // Get city by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/City/${id}?lang=${lang}`),

  // Get cities with areas
  getWithAreas: (countryId: number | null = null, onlyActive = true, lang = 'en') => {
    let url = `/City/with-areas?onlyActive=${onlyActive}&lang=${lang}`;
    if (countryId) url += `&countryId=${countryId}`;
    return api.get(url);
  },

  // Create city
  create: (cityData: CreateCityRequest, lang = 'en') =>
    api.post(`/City?lang=${lang}`, cityData),

  // Update city
  update: (id: number, cityData: UpdateCityRequest, lang = 'en') =>
    api.put(`/City/${id}?lang=${lang}`, cityData),

  // Delete city
  delete: (id: number, lang = 'en') =>
    api.delete(`/City/${id}?lang=${lang}`),
};

// AREAS
export const areaAPI = {
  // Get all areas
  getAll: (onlyActive = true, cityId: number | null = null, lang = 'en') => {
    let url = `/Area?onlyActive=${onlyActive}&lang=${lang}`;
    if (cityId) url += `&cityId=${cityId}`;
    return api.get(url);
  },

  // Get area by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Area/${id}?lang=${lang}`),

  // Create area
  create: (areaData: CreateAreaRequest, lang = 'en') =>
    api.post(`/Area?lang=${lang}`, areaData),

  // Update area
  update: (id: number, areaData: UpdateAreaRequest, lang = 'en') =>
    api.put(`/Area/${id}?lang=${lang}`, areaData),

  // Delete area
  delete: (id: number, lang = 'en') =>
    api.delete(`/Area/${id}?lang=${lang}`),
};

// TOWER FEATURES
export const towerFeatureAPI = {
  // Get all tower features
  getAll: (onlyActive = true, lang = 'en') =>
    api.get(`/TowerFeature?onlyActive=${onlyActive}&lang=${lang}`),

  // Get tower feature by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/TowerFeature/${id}?lang=${lang}`),

  // Create tower feature
  create: (featureData: CreateTowerFeatureRequest, lang = 'en') =>
    api.post(`/TowerFeature?lang=${lang}`, featureData),

  // Update tower feature
  update: (id: number, featureData: UpdateTowerFeatureRequest, lang = 'en') =>
    api.put(`/TowerFeature/${id}?lang=${lang}`, featureData),

  // Delete tower feature
  delete: (id: number, lang = 'en') =>
    api.delete(`/TowerFeature/${id}?lang=${lang}`),
};

// BLOCKS
export const blockAPI = {
  // Get all blocks
  getAll: (onlyActive = true, lang = 'en') =>
    api.get(`/Block?onlyActive=${onlyActive}&lang=${lang}`),

  // Get block by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Block/${id}?lang=${lang}`),

  // Create block
  create: (blockData: CreateBlockRequest, lang = 'en') =>
    api.post(`/Block?lang=${lang}`, blockData),

  // Update block
  update: (id: number, blockData: UpdateBlockRequest, lang = 'en') =>
    api.put(`/Block/${id}?lang=${lang}`, blockData),

  // Delete block
  delete: (id: number, lang = 'en') =>
    api.delete(`/Block/${id}?lang=${lang}`),

  // Assign designs to block (NEW)
  assignDesigns: (id: number, assignmentData: AssignDesignsToBlockRequest, lang = 'en') =>
    api.post(`/Block/${id}/assign-designs?lang=${lang}`, assignmentData),

  // Get block designs (NEW)
  getDesigns: (id: number, lang = 'en') =>
    api.get(`/Block/${id}/designs?lang=${lang}`),
};

// APPLIANCES
export const applianceAPI = {
  // Get all appliances
  getAll: (onlyActive = true, lang = 'en') =>
    api.get(`/Appliance?onlyActive=${onlyActive}&lang=${lang}`),

  // Get appliance by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Appliance/${id}?lang=${lang}`),

  // Create appliance
  create: (applianceData: CreateApplianceRequest, lang = 'en') =>
    api.post(`/Appliance?lang=${lang}`, applianceData),

  // Update appliance
  update: (id: number, applianceData: UpdateApplianceRequest, lang = 'en') =>
    api.put(`/Appliance/${id}?lang=${lang}`, applianceData),

  // Delete appliance
  delete: (id: number, lang = 'en') =>
    api.delete(`/Appliance/${id}?lang=${lang}`),
};

// ==============================================================================
// TOWER MANAGEMENT APIs
// ==============================================================================

export const towerAPI = {
  // Get all towers
  getAll: (onlyActive = true, countryId: number | null = null, cityId: number | null = null, areaId: number | null = null, towerType: number | null = null, lang = 'en') => {
    let url = `/Tower?onlyActive=${onlyActive}&lang=${lang}`;
    if (countryId) url += `&countryId=${countryId}`;
    if (cityId) url += `&cityId=${cityId}`;
    if (areaId) url += `&areaId=${areaId}`;
    if (towerType) url += `&towerType=${towerType}`;
    return api.get(url);
  },

  // Get tower by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Tower/${id}?lang=${lang}`),

  // Create tower
  create: (towerData: CreateTowerRequest, lang = 'en') =>
    api.post(`/Tower?lang=${lang}`, towerData),

  // Update tower
  update: (id: number, towerData: UpdateTowerRequest, lang = 'en') =>
    api.put(`/Tower/${id}?lang=${lang}`, towerData),

  // Delete tower
  delete: (id: number, lang = 'en') =>
    api.delete(`/Tower/${id}?lang=${lang}`),

  // Get tower blocks (NEW)
  getBlocks: (id: number, lang = 'en') =>
    api.get(`/Tower/${id}/blocks?lang=${lang}`),

  // Assign blocks to tower (NEW)
  assignBlocks: (id: number, blockData: AssignBlocksToTowerRequest, lang = 'en') =>
    api.post(`/Tower/${id}/assign-blocks?lang=${lang}`, blockData),
};
// ==============================================================================
// UNIT MANAGEMENT APIs
// ==============================================================================

export const unitAPI = {
  // Get all units
  getAll: (onlyActive = true, towerId: number | null = null, blockId: number | null = null, status: string | null = null, designId: number | null = null, lang = 'en') => {
    let url = `/Unit?onlyActive=${onlyActive}&lang=${lang}`;
    if (towerId) url += `&towerId=${towerId}`;
    if (blockId) url += `&blockId=${blockId}`;
    if (status) url += `&status=${status}`;
    if (designId) url += `&designId=${designId}`;
    return api.get(url);
  },

  // Get unit by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Unit/${id}?lang=${lang}`),

  // Create single unit
  create: (unitData: CreateUnitRequest, lang = 'en') =>
    api.post(`/Unit?lang=${lang}`, unitData),

  // Create multiple units in bulk (NEW)
  createBulk: (bulkData: CreateUnitsBulkRequest, lang = 'en') =>
    api.post(`/Unit/bulk?lang=${lang}`, bulkData),

  // Update unit
  update: (id: number, unitData: UpdateUnitRequest, lang = 'en') =>
    api.put(`/Unit/${id}?lang=${lang}`, unitData),

  // Delete unit
  delete: (id: number, lang = 'en') =>
    api.delete(`/Unit/${id}?lang=${lang}`),

  // Get units for tower management
  getForTowerManagement: (towerId: number | null = null, floorNumber: number | null = null, includeUnassignedOnly = false, lang = 'en') => {
    let url = `/Unit/tower-management?lang=${lang}`;
    if (towerId) url += `&towerId=${towerId}`;
    if (floorNumber) url += `&floorNumber=${floorNumber}`;
    if (includeUnassignedOnly) url += `&includeUnassignedOnly=${includeUnassignedOnly}`;
    return api.get(url);
  },

  // Assign design to multiple units
  assignDesign: (assignmentData: AssignDesignToUnitsRequest, lang = 'en') =>
    api.post(`/Unit/assign-design?lang=${lang}`, assignmentData),

  // Get unit custom appliances (NEW)
  getCustomAppliances: (id: number, lang = 'en') =>
    api.get(`/Unit/${id}/custom-appliances?lang=${lang}`),

  // Get unit custom features (NEW)
  getCustomFeatures: (id: number, lang = 'en') =>
    api.get(`/Unit/${id}/custom-features?lang=${lang}`),
};

// ==============================================================================
// UNIT DESIGN APIs
// ==============================================================================

export const unitDesignAPI = {
  // Get all unit designs
  getAll: (onlyActive = true, category: number | null = null, targetMarket: number | null = null, minPrice: number | null = null, maxPrice: number | null = null, minArea: number | null = null, maxArea: number | null = null, searchTerm: string | null = null, lang = 'en') => {
    let url = `/UnitDesign?onlyActive=${onlyActive}&lang=${lang}`;
    if (category) url += `&category=${category}`;
    if (targetMarket) url += `&targetMarket=${targetMarket}`;
    if (minPrice) url += `&minPrice=${minPrice}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;
    if (minArea) url += `&minArea=${minArea}`;
    if (maxArea) url += `&maxArea=${maxArea}`;
    if (searchTerm) url += `&searchTerm=${searchTerm}`;
    return api.get(url);
  },

  // Get unit design by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/UnitDesign/${id}?lang=${lang}`),

  // Create basic unit design (without media)
  create: (designData: CreateUnitDesignRequest, lang = 'en') =>
    api.post(`/UnitDesign?lang=${lang}`, designData),

  // Create comprehensive unit design with media files
  createWithMedia: (formData: FormData, lang = 'en') =>
    api.post(`/UnitDesign/with-media?lang=${lang}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Update unit design
  update: (id: number, designData: UpdateUnitDesignRequest, lang = 'en') =>
    api.put(`/UnitDesign/${id}?lang=${lang}`, designData),

  // Delete unit design
  delete: (id: number, lang = 'en') =>
    api.delete(`/UnitDesign/${id}?lang=${lang}`),

  // Get design images
  getImages: (id: number, lang = 'en') =>
    api.get(`/UnitDesign/${id}/images?lang=${lang}`),

  // Get design videos
  getVideos: (id: number, lang = 'en') =>
    api.get(`/UnitDesign/${id}/videos?lang=${lang}`),

  // Get design features
  getFeatures: (id: number, lang = 'en') =>
    api.get(`/UnitDesign/${id}/features?lang=${lang}`),

  // Get design appliances
  getAppliances: (id: number, lang = 'en') =>
    api.get(`/UnitDesign/${id}/appliances?lang=${lang}`),
};

// ==============================================================================
// PAYMENT PLAN APIs
// ==============================================================================

export const paymentPlanAPI = {
  // Get all payment plans
  getAll: (onlyActive = true, unitDesignId: number | null = null, lang = 'en') => {
    let url = `/PaymentPlan?onlyActive=${onlyActive}&lang=${lang}`;
    if (unitDesignId) url += `&unitDesignId=${unitDesignId}`;
    return api.get(url);
  },

  // Get payment plan by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/PaymentPlan/${id}?lang=${lang}`),

  // Create payment plan
  create: (planData: CreatePaymentPlanRequest, lang = 'en') =>
    api.post(`/PaymentPlan?lang=${lang}`, planData),

  // Update payment plan
  update: (id: number, planData: UpdatePaymentPlanRequest, lang = 'en') =>
    api.put(`/PaymentPlan/${id}?lang=${lang}`, planData),

  // Delete payment plan
  delete: (id: number, lang = 'en') =>
    api.delete(`/PaymentPlan/${id}?lang=${lang}`),
};

// ==============================================================================
// USER MANAGEMENT APIs
// ==============================================================================

export const userAPI = {
  // Get all users
  getAll: (pageSize = 10, pageNumber = 1, searchKeyword = '', lang = 'en') =>
    api.get(`/User?pageSize=${pageSize}&pageNumber=${pageNumber}&searchKeyword=${searchKeyword}&lang=${lang}`),

  // Get user by ID
  getById: (id: string, lang = 'en') =>
    api.get(`/User/${id}?lang=${lang}`),

  // Update user
  update: (id: string, userData: UpdateUserRequest, lang = 'en') =>
    api.put(`/User/${id}?lang=${lang}`, userData),

  // Delete user
  delete: (id: string, lang = 'en') =>
    api.delete(`/User/${id}?lang=${lang}`),
};

// ==============================================================================
// ROLE MANAGEMENT APIs
// ==============================================================================

export const roleAPI = {
  // Get all roles
  getAll: (lang = 'en') =>
    api.get(`/Role?lang=${lang}`),

  // Get role by ID
  getById: (id: string, lang = 'en') =>
    api.get(`/Role/${id}?lang=${lang}`),

  // Create role
  create: (roleData: CreateRoleRequest, lang = 'en') =>
    api.post(`/Role?lang=${lang}`, roleData),

  // Update role
  update: (id: string, roleData: UpdateRoleRequest, lang = 'en') =>
    api.put(`/Role/${id}?lang=${lang}`, roleData),

  // Delete role
  delete: (id: string, lang = 'en') =>
    api.delete(`/Role/${id}?lang=${lang}`),
};

// ==============================================================================
// ATTACHMENTS & FILE MANAGEMENT APIs
// ==============================================================================

export const attachmentAPI = {
  // Get all attachments
  getAll: (lang = 'en') =>
    api.get(`/Attachments?lang=${lang}`),

  // Get attachment by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Attachments/${id}?lang=${lang}`),

  // Upload attachment
  upload: (fileData: UploadAttachmentRequest, lang = 'en') => {
    const formData = new FormData();
    formData.append('file', fileData.file);
    if (fileData.description) formData.append('description', fileData.description);
    if (fileData.category) formData.append('category', fileData.category);
    return api.post(`/Attachments/upload?lang=${lang}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// FILES MANAGEMENT
export const fileAPI = {
  // Get file properties
  getProperties: (filePath: string, lang = 'en') =>
    api.get(`/FilesManagement/properties?filePath=${encodeURIComponent(filePath)}&lang=${lang}`),

  // Download file
  download: (filePath: string) =>
    api.get(`/FilesManagement/download?filePath=${encodeURIComponent(filePath)}`, {
      responseType: 'blob',
    }),
};

// ==============================================================================
// NOTIFICATION APIs
// ==============================================================================

export const notificationAPI = {
  // Get all notifications
  getAll: (pageSize = 10, pageNumber = 1, lang = 'en') =>
    api.get(`/Notification?pageSize=${pageSize}&pageNumber=${pageNumber}&lang=${lang}`),

  // Get notification by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Notification/${id}?lang=${lang}`),

  // Create notification
  create: (notificationData: CreateNotificationRequest, lang = 'en') =>
    api.post(`/Notification?lang=${lang}`, notificationData),

  // Update notification
  update: (id: number, notificationData: UpdateNotificationRequest, lang = 'en') =>
    api.put(`/Notification/${id}?lang=${lang}`, notificationData),

  // Delete notification
  delete: (id: number, lang = 'en') =>
    api.delete(`/Notification/${id}?lang=${lang}`),

  // Mark as read
  markAsRead: (id: number, lang = 'en') =>
    api.put(`/Notification/${id}/mark-read?lang=${lang}`),
};

// ==============================================================================
// NOTIFICATION TEMPLATE APIs
// ==============================================================================

export const notificationTemplateAPI = {
  // Get all templates
  getAll: (lang = 'en') =>
    api.get(`/NotificationTemplate?lang=${lang}`),

  // Get template by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/NotificationTemplate/${id}?lang=${lang}`),

  // Create template
  create: (templateData: CreateNotificationTemplateRequest, lang = 'en') =>
    api.post(`/NotificationTemplate?lang=${lang}`, templateData),

  // Update template
  update: (id: number, templateData: UpdateNotificationTemplateRequest, lang = 'en') =>
    api.put(`/NotificationTemplate/${id}?lang=${lang}`, templateData),

  // Delete template
  delete: (id: number, lang = 'en') =>
    api.delete(`/NotificationTemplate/${id}?lang=${lang}`),
};

// ==============================================================================
// SETTINGS APIs
// ==============================================================================

export const settingsAPI = {
  // Get all settings
  getAll: (lang = 'en') =>
    api.get(`/Settings?lang=${lang}`),

  // Get setting by key
  getByKey: (key: string, lang = 'en') =>
    api.get(`/Settings/${key}?lang=${lang}`),

  // Update setting
  update: (key: string, value: string | number | boolean, lang = 'en') =>
    api.put(`/Settings/${key}?lang=${lang}`, { value }),
};

// ==============================================================================
// PERMISSIONS APIs
// ==============================================================================

export const permissionAPI = {
  // Get all permissions
  getAll: (lang = 'en') =>
    api.get(`/Permission?lang=${lang}`),

  // Get user permissions
  getUserPermissions: (userId: string, lang = 'en') =>
    api.get(`/Permission/user/${userId}?lang=${lang}`),

  // Get role permissions
  getRolePermissions: (roleId: string, lang = 'en') =>
    api.get(`/Permission/role/${roleId}?lang=${lang}`),
};

// ==============================================================================
// REPORTS APIs
// ==============================================================================

export const reportAPI = {
  // Get advance reports
  getAdvanceReports: (reportParams: ReportParameters, lang = 'en') =>
    api.post(`/AdvanceReports?lang=${lang}`, reportParams),

  // Get property names for reports
  getPropertyNames: (entityType: string, lang = 'en') =>
    api.get(`/AdvanceReports/property-names?entityType=${entityType}&lang=${lang}`),
};

// ==============================================================================
// LOGGER APIs
// ==============================================================================

export const loggerAPI = {
  // Get all logs
  getAll: (pageSize = 10, pageNumber = 1, level: string | null = null, lang = 'en') => {
    let url = `/Logger?pageSize=${pageSize}&pageNumber=${pageNumber}&lang=${lang}`;
    if (level) url += `&level=${level}`;
    return api.get(url);
  },

  // Get log by ID
  getById: (id: number, lang = 'en') =>
    api.get(`/Logger/${id}?lang=${lang}`),
};

// ==============================================================================
// EXPORT ALL APIs
// ==============================================================================

export {
  api as default,
  BASE_URL,
};

// Centralized API object for easy import
export const RealEstateAPI = {
  auth: authAPI,
  country: countryAPI,
  city: cityAPI,
  area: areaAPI,
  towerFeature: towerFeatureAPI,
  block: blockAPI,
  appliance: applianceAPI,
  tower: towerAPI,
  unit: unitAPI,
  unitDesign: unitDesignAPI,
  paymentPlan: paymentPlanAPI,
  user: userAPI,
  role: roleAPI,
  attachment: attachmentAPI,
  file: fileAPI,
  notification: notificationAPI,
  notificationTemplate: notificationTemplateAPI,
  settings: settingsAPI,
  permission: permissionAPI,
  report: reportAPI,
  logger: loggerAPI,
};