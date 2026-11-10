import { api } from './client';

export interface Helpline {
  name: string;
  contact: string;
  availability: string;
  description: string;
  region: string;
  website: string;
}

export const supportApi = {
  getHelplines: () => api.get<Helpline[]>('/support/helplines').then((r) => r.data),
};
