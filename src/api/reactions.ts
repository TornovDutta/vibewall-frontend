import { api } from './client';

export interface ReactionsMap {
  hug: number;
  heart: number;
  relate: number;
  strength: number;
  [key: string]: number;
}

export const reactionsApi = {
  get: (confessionId: string) =>
    api.get<ReactionsMap>(`/feed/reactions/${confessionId}`).then((r) => r.data),
  add: (confessionId: string, type: 'hug' | 'heart' | 'relate' | 'strength') =>
    api.post<ReactionsMap>(`/feed/reactions/${confessionId}/${type}`).then((r) => r.data),
};
