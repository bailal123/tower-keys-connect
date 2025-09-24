import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealEstateAPI } from '../services/api';

import type { 
  BaseResponse, 
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
  UploadAttachmentRequest,
  ReportParameters,
  // UserData,
  LoginResponse
} from '../types/api';
// import type { User } from './authContext';

// ==============================================================================
// GENERIC API HOOK
// ==============================================================================

export function useApiQuery<T>(
  queryKey: (string | number | boolean | undefined)[],
  queryFn: () => Promise<{ data: BaseResponse<T> }>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      return response.data.data;
    },
    ...options,
  });
}




export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<{ data: BaseResponse<TData> }>,
  options?: {
    onSuccess?: (data: BaseResponse<TData>) => void;
    onError?: (error: unknown) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables);
      return response.data; // إرجاع كامل البيانات بدلاً من data.data فقط
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      options?.invalidateQueries?.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
    onError: options?.onError,
  });
}

// ==============================================================================
// AUTHENTICATION HOOKS
// ==============================================================================

export function useLogin() {
  return useApiMutation(
    ({ credentials, lang = 'en' }: { credentials: LoginRequest; lang?: string }) =>
      RealEstateAPI.auth.login(credentials, lang),
    {
      onSuccess: (data: BaseResponse<LoginResponse>) => {
        const loginData = data as BaseResponse<LoginResponse>;
        const token = loginData.data.key || loginData.data.token || '';
        const userData = loginData.data || {};

        if (token) {
          localStorage.setItem('token', token);
        }
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
      },
    }
  );
}


export function useSignUp() {
  return useApiMutation(
    ({ userData, lang = 'en' }: { userData: SignUpRequest; lang?: string }) =>
      RealEstateAPI.auth.signUp(userData, lang)
  );
}

export function useLogout() {
  return useApiMutation(
    ({ lang = 'en' }: { lang?: string }) => RealEstateAPI.auth.logout(lang),
    {
      onSuccess: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      },
    }
  );
}

// ==============================================================================
// MASTER DATA HOOKS
// ==============================================================================

// Countries
export function useCountries(params?: { onlyActive?: boolean; lang?: string }) {
  return useApiQuery(
    ['countries', params?.onlyActive, params?.lang],
    () => RealEstateAPI.country.getAll(params?.onlyActive, params?.lang)
  );
}

export function useCountry(id: number, lang?: string) {
  return useApiQuery(
    ['country', id, lang],
    () => RealEstateAPI.country.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCountriesWithCities(params?: { onlyActive?: boolean; lang?: string }) {
  return useApiQuery(
    ['countries-with-cities', params?.onlyActive, params?.lang],
    () => RealEstateAPI.country.getWithCities(params?.onlyActive, params?.lang)
  );
}

export function useCreateCountry() {
  return useApiMutation(
    ({ countryData, lang = 'en' }: { countryData: CreateCountryRequest; lang?: string }) =>
      RealEstateAPI.country.create(countryData, lang),
    {
      invalidateQueries: [['countries'], ['countries-with-cities']],
    }
  );
}

export function useUpdateCountry() {
  return useApiMutation(
    ({ id, countryData, lang = 'en' }: { id: number; countryData: UpdateCountryRequest; lang?: string }) =>
      RealEstateAPI.country.update(id, countryData, lang),
    {
      invalidateQueries: [['countries'], ['countries-with-cities']],
    }
  );
}

export function useDeleteCountry() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.country.delete(id, lang),
    {
      invalidateQueries: [['countries'], ['countries-with-cities']],
    }
  );
}

// Cities
export function useCities(params?: { onlyActive?: boolean; countryId?: number; lang?: string }) {
  return useApiQuery(
    ['cities', params?.onlyActive, params?.countryId, params?.lang],
    () => RealEstateAPI.city.getAll(params?.onlyActive, params?.countryId, params?.lang)
  );
}

export function useCity(id: number, lang?: string) {
  return useApiQuery(
    ['city', id, lang],
    () => RealEstateAPI.city.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCitiesWithAreas(params?: { countryId?: number; onlyActive?: boolean; lang?: string }) {
  return useApiQuery(
    ['cities-with-areas', params?.countryId, params?.onlyActive, params?.lang],
    () => RealEstateAPI.city.getWithAreas(params?.countryId, params?.onlyActive, params?.lang)
  );
}

export function useCreateCity() {
  return useApiMutation(
    ({ cityData, lang = 'en' }: { cityData: CreateCityRequest; lang?: string }) =>
      RealEstateAPI.city.create(cityData, lang),
    {
      invalidateQueries: [['cities'], ['cities-with-areas']],
    }
  );
}

export function useUpdateCity() {
  return useApiMutation(
    ({ id, cityData, lang = 'en' }: { id: number; cityData: UpdateCityRequest; lang?: string }) =>
      RealEstateAPI.city.update(id, cityData, lang),
    {
      invalidateQueries: [['cities'], ['cities-with-areas']],
    }
  );
}

export function useDeleteCity() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.city.delete(id, lang),
    {
      invalidateQueries: [['cities'], ['cities-with-areas']],
    }
  );
}

// Areas
export function useAreas(params?: { onlyActive?: boolean; cityId?: number; lang?: string }) {
  return useApiQuery(
    ['areas', params?.onlyActive, params?.cityId, params?.lang],
    () => RealEstateAPI.area.getAll(params?.onlyActive, params?.cityId, params?.lang)
  );
}

export function useArea(id: number, lang?: string) {
  return useApiQuery(
    ['area', id, lang],
    () => RealEstateAPI.area.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCreateArea() {
  return useApiMutation(
    ({ areaData, lang = 'en' }: { areaData: CreateAreaRequest; lang?: string }) =>
      RealEstateAPI.area.create(areaData, lang),
    {
      invalidateQueries: [['areas']],
    }
  );
}

export function useUpdateArea() {
  return useApiMutation(
    ({ id, areaData, lang = 'en' }: { id: number; areaData: UpdateAreaRequest; lang?: string }) =>
      RealEstateAPI.area.update(id, areaData, lang),
    {
      invalidateQueries: [['areas']],
    }
  );
}

export function useDeleteArea() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.area.delete(id, lang),
    {
      invalidateQueries: [['areas']],
    }
  );
}

// ==============================================================================
// TOWER FEATURES HOOKS
// ==============================================================================

// Tower Features
export function useTowerFeatures(params?: { onlyActive?: boolean; lang?: string }) {
  return useApiQuery(
    ['tower-features', params?.onlyActive, params?.lang],
    () => RealEstateAPI.towerFeature.getAll(params?.onlyActive, params?.lang)
  );
}

export function useTowerFeature(id: number, lang?: string) {
  return useApiQuery(
    ['tower-feature', id, lang],
    () => RealEstateAPI.towerFeature.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCreateTowerFeature() {
  return useApiMutation(
    ({ featureData, lang = 'en' }: { featureData: CreateTowerFeatureRequest; lang?: string }) =>
      RealEstateAPI.towerFeature.create(featureData, lang),
    {
      invalidateQueries: [['tower-features']],
    }
  );
}

export function useUpdateTowerFeature() {
  return useApiMutation(
    ({ id, featureData, lang = 'en' }: { id: number; featureData: UpdateTowerFeatureRequest; lang?: string }) =>
      RealEstateAPI.towerFeature.update(id, featureData, lang),
    {
      invalidateQueries: [['tower-features']],
    }
  );
}

export function useDeleteTowerFeature() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.towerFeature.delete(id, lang),
    {
      invalidateQueries: [['tower-features']],
    }
  );
}

// ==============================================================================
// BLOCKS HOOKS
// ==============================================================================

export function useBlocks(params?: { onlyActive?: boolean; lang?: string }) {
  return useApiQuery(
    ['blocks', params?.onlyActive, params?.lang],
    () => RealEstateAPI.block.getAll(params?.onlyActive, params?.lang)
  );
}

export function useBlock(id: number, lang?: string) {
  return useApiQuery(
    ['block', id, lang],
    () => RealEstateAPI.block.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCreateBlock() {
  return useApiMutation(
    ({ blockData, lang = 'en' }: { blockData: CreateBlockRequest; lang?: string }) =>
      RealEstateAPI.block.create(blockData, lang),
    {
      invalidateQueries: [['blocks']],
    }
  );
}

export function useUpdateBlock() {
  return useApiMutation(
    ({ id, blockData, lang = 'en' }: { id: number; blockData: UpdateBlockRequest; lang?: string }) =>
      RealEstateAPI.block.update(id, blockData, lang),
    {
      invalidateQueries: [['blocks']],
    }
  );
}

export function useDeleteBlock() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.block.delete(id, lang),
    {
      invalidateQueries: [['blocks']],
    }
  );
}

// ==============================================================================
// APPLIANCES HOOKS
// ==============================================================================

export function useAppliances(params?: { onlyActive?: boolean; lang?: string }) {
  return useApiQuery(
    ['appliances', params?.onlyActive, params?.lang],
    () => RealEstateAPI.appliance.getAll(params?.onlyActive, params?.lang)
  );
}

export function useAppliance(id: number, lang?: string) {
  return useApiQuery(
    ['appliance', id, lang],
    () => RealEstateAPI.appliance.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCreateAppliance() {
  return useApiMutation(
    ({ applianceData, lang = 'en' }: { applianceData: CreateApplianceRequest; lang?: string }) =>
      RealEstateAPI.appliance.create(applianceData, lang),
    {
      invalidateQueries: [['appliances']],
    }
  );
}

export function useUpdateAppliance() {
  return useApiMutation(
    ({ id, applianceData, lang = 'en' }: { id: number; applianceData: UpdateApplianceRequest; lang?: string }) =>
      RealEstateAPI.appliance.update(id, applianceData, lang),
    {
      invalidateQueries: [['appliances']],
    }
  );
}

export function useDeleteAppliance() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.appliance.delete(id, lang),
    {
      invalidateQueries: [['appliances']],
    }
  );
}

// ==============================================================================
// TOWERS HOOKS  
// ==============================================================================

// export function useTowers(params?: { onlyActive?: boolean; countryId?: number; cityId?: number; areaId?: number; lang?: string }) {
//   return useApiQuery(
//     ['towers', params?.onlyActive, params?.countryId, params?.cityId, params?.areaId, params?.lang],
//     () => RealEstateAPI.tower.getAll(params?.onlyActive, params?.countryId, params?.cityId, params?.areaId, params?.lang)
//   );
// }

export function useTower(id: number, lang?: string) {
  return useApiQuery(
    ['tower', id, lang],
    () => RealEstateAPI.tower.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCreateTower() {
  return useApiMutation(
    ({ towerData, lang = 'en' }: { towerData: CreateTowerRequest; lang?: string }) =>
      RealEstateAPI.tower.create(towerData, lang),
    {
      invalidateQueries: [['towers']],
    }
  );
}

export function useUpdateTower() {
  return useApiMutation(
    ({ id, towerData, lang = 'en' }: { id: number; towerData: UpdateTowerRequest; lang?: string }) =>
      RealEstateAPI.tower.update(id, towerData, lang),
    {
      invalidateQueries: [['towers']],
    }
  );
}

export function useDeleteTower() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.tower.delete(id, lang),
    {
      invalidateQueries: [['towers']],
    }
  );
}

// ==============================================================================
// UNITS HOOKS
// ==============================================================================

// export function useUnits(params?: { onlyActive?: boolean; towerId?: number; status?: string; lang?: string }) {
//   return useApiQuery(
//     ['units', params?.onlyActive, params?.towerId, params?.status, params?.lang],
//     () => RealEstateAPI.unit.getAll(params?.onlyActive, params?.towerId, params?.status, params?.lang)
//   );
// }

export function useUnit(id: number, lang?: string) {
  return useApiQuery(
    ['unit', id, lang],
    () => RealEstateAPI.unit.getById(id, lang),
    { enabled: !!id }
  );
}

export function useUnitsForTowerManagement(params?: { towerId?: number; floorNumber?: number; includeUnassignedOnly?: boolean; lang?: string }) {
  return useApiQuery(
    ['units-tower-management', params?.towerId, params?.floorNumber, params?.includeUnassignedOnly, params?.lang],
    () => RealEstateAPI.unit.getForTowerManagement(params?.towerId, params?.floorNumber, params?.includeUnassignedOnly, params?.lang)
  );
}

export function useCreateUnit() {
  return useApiMutation(
    ({ unitData, lang = 'en' }: { unitData: CreateUnitRequest; lang?: string }) =>
      RealEstateAPI.unit.create(unitData, lang),
    {
      invalidateQueries: [['units'], ['units-tower-management']],
    }
  );
}

export function useUpdateUnit() {
  return useApiMutation(
    ({ id, unitData, lang = 'en' }: { id: number; unitData: UpdateUnitRequest; lang?: string }) =>
      RealEstateAPI.unit.update(id, unitData, lang),
    {
      invalidateQueries: [['units'], ['units-tower-management']],
    }
  );
}

export function useDeleteUnit() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.unit.delete(id, lang),
    {
      invalidateQueries: [['units'], ['units-tower-management']],
    }
  );
}

export function useAssignDesignToUnits() {
  return useApiMutation(
    ({ assignmentData, lang = 'en' }: { assignmentData: AssignDesignToUnitsRequest; lang?: string }) =>
      RealEstateAPI.unit.assignDesign(assignmentData, lang),
    {
      invalidateQueries: [['units'], ['units-tower-management']],
    }
  );
}

// ==============================================================================
// UNIT DESIGNS HOOKS
// ==============================================================================

// export function useUnitDesigns(params?: { onlyActive?: boolean; lang?: string }) {
//   return useApiQuery(
//     ['unit-designs', params?.onlyActive, params?.lang],
//     () => RealEstateAPI.unitDesign.getAll(params?.onlyActive, params?.lang)
//   );
// }

export function useUnitDesign(id: number, lang?: string) {
  return useApiQuery(
    ['unit-design', id, lang],
    () => RealEstateAPI.unitDesign.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCreateUnitDesign() {
  return useApiMutation(
    ({ designData, lang = 'en' }: { designData: CreateUnitDesignRequest; lang?: string }) =>
      RealEstateAPI.unitDesign.create(designData, lang),
    {
      invalidateQueries: [['unit-designs']],
    }
  );
}

export function useUpdateUnitDesign() {
  return useApiMutation(
    ({ id, designData, lang = 'en' }: { id: number; designData: UpdateUnitDesignRequest; lang?: string }) =>
      RealEstateAPI.unitDesign.update(id, designData, lang),
    {
      invalidateQueries: [['unit-designs']],
    }
  );
}

export function useDeleteUnitDesign() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.unitDesign.delete(id, lang),
    {
      invalidateQueries: [['unit-designs']],
    }
  );
}

// ==============================================================================
// PAYMENT PLANS HOOKS
// ==============================================================================

export function usePaymentPlans(params?: { onlyActive?: boolean; unitDesignId?: number; lang?: string }) {
  return useApiQuery(
    ['payment-plans', params?.onlyActive, params?.unitDesignId, params?.lang],
    () => RealEstateAPI.paymentPlan.getAll(params?.onlyActive, params?.unitDesignId, params?.lang)
  );
}

export function usePaymentPlan(id: number, lang?: string) {
  return useApiQuery(
    ['payment-plan', id, lang],
    () => RealEstateAPI.paymentPlan.getById(id, lang),
    { enabled: !!id }
  );
}

export function useCreatePaymentPlan() {
  return useApiMutation(
    ({ planData, lang = 'en' }: { planData: CreatePaymentPlanRequest; lang?: string }) =>
      RealEstateAPI.paymentPlan.create(planData, lang),
    {
      invalidateQueries: [['payment-plans']],
    }
  );
}

export function useUpdatePaymentPlan() {
  return useApiMutation(
    ({ id, planData, lang = 'en' }: { id: number; planData: UpdatePaymentPlanRequest; lang?: string }) =>
      RealEstateAPI.paymentPlan.update(id, planData, lang),
    {
      invalidateQueries: [['payment-plans']],
    }
  );
}

export function useDeletePaymentPlan() {
  return useApiMutation(
    ({ id, lang = 'en' }: { id: number; lang?: string }) =>
      RealEstateAPI.paymentPlan.delete(id, lang),
    {
      invalidateQueries: [['payment-plans']],
    }
  );
}

// ==============================================================================
// USERS & ROLES HOOKS
// ==============================================================================

export function useUsers(params?: { pageSize?: number; pageNumber?: number; searchKeyword?: string; lang?: string }) {
  return useApiQuery(
    ['users', params?.pageSize, params?.pageNumber, params?.searchKeyword, params?.lang],
    () => RealEstateAPI.user.getAll(params?.pageSize, params?.pageNumber, params?.searchKeyword, params?.lang)
  );
}

export function useUser(id: string, lang?: string) {
  return useApiQuery(
    ['user', id, lang],
    () => RealEstateAPI.user.getById(id, lang),
    { enabled: !!id }
  );
}

export function useUpdateUser() {
  return useApiMutation(
    ({ id, userData, lang = 'en' }: { id: string; userData: UpdateUserRequest; lang?: string }) =>
      RealEstateAPI.user.update(id, userData, lang),
    {
      invalidateQueries: [['users']],
    }
  );
}

export function useRoles(lang?: string) {
  return useApiQuery(
    ['roles', lang],
    () => RealEstateAPI.role.getAll(lang)
  );
}

export function useCreateRole() {
  return useApiMutation(
    ({ roleData, lang = 'en' }: { roleData: CreateRoleRequest; lang?: string }) =>
      RealEstateAPI.role.create(roleData, lang),
    {
      invalidateQueries: [['roles']],
    }
  );
}

export function useUpdateRole() {
  return useApiMutation(
    ({ id, roleData, lang = 'en' }: { id: string; roleData: UpdateRoleRequest; lang?: string }) =>
      RealEstateAPI.role.update(id, roleData, lang),
    {
      invalidateQueries: [['roles']],
    }
  );
}

// ==============================================================================
// OTHER USEFUL HOOKS
// ==============================================================================

export function useNotifications(params?: { pageSize?: number; pageNumber?: number; lang?: string }) {
  return useApiQuery(
    ['notifications', params?.pageSize, params?.pageNumber, params?.lang],
    () => RealEstateAPI.notification.getAll(params?.pageSize, params?.pageNumber, params?.lang)
  );
}

export function useUploadAttachment() {
  return useApiMutation(
    ({ fileData, lang = 'en' }: { fileData: UploadAttachmentRequest; lang?: string }) =>
      RealEstateAPI.attachment.upload(fileData, lang),
    {
      invalidateQueries: [['attachments']],
    }
  );
}

export function useAdvanceReports() {
  return useApiMutation(
    ({ reportParams, lang = 'en' }: { reportParams: ReportParameters; lang?: string }) =>
      RealEstateAPI.report.getAdvanceReports(reportParams, lang)
  );
}

// ==============================================================================
// UTILITY HOOKS
// ==============================================================================

export function useLanguage() {
  const [language, setLanguage] = useState<'en' | 'ar'>(
    (localStorage.getItem('language') as 'en' | 'ar') || 'en'
  );

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return { language, toggleLanguage, setLanguage };
}

export function useAuth() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const isAuthenticated = !!token && !!user;

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    logout,
    setUser,
    setToken,
  };
}