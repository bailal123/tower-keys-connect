// hooks/useLogin.ts
import { useApiMutation } from './useApi';
import type { LoginRequest } from '../types/api';
import { RealEstateAPI } from '../services/api';

export function useLogin() {
  return useApiMutation(
    ({ credentials, lang = 'en' }: { credentials: LoginRequest; lang?: string }) =>
      RealEstateAPI.auth.login(credentials, lang)
  );
}
