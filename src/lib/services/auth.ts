import {api} from '@/lib/apiClient'






export const login = (body) =>
  api.post("/auth/login", body);
