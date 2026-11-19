import { api } from './client';
import type { EnhanceRequest, EnhanceResponse } from '../types';

export const aiApi = {
  enhance: (request: EnhanceRequest): Promise<EnhanceResponse> =>
    api.post<EnhanceResponse>('/ai/enhance', request).then((r) => r.data),
};
