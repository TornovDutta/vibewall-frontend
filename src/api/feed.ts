import { api } from './client';
import type { ConfessionResponse } from '../types';

export const feedApi = {
  getFeed: () =>
    api.get<ConfessionResponse[]>('/feed/').then((r) => r.data),
};
