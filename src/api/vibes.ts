import { api } from './client';

export interface DailyVibe {
  quote: string;
  author: string;
  category: string;
  emoji: string;
}

export interface VibeCheckResult {
  vibe: string;
  emoji: string;
  sentiment: string;
  comfortingTip: string;
  tags: string[];
}

export interface PlatformStats {
  activeConfessions: number;
  totalFeedbacks: number;
  communityVibe: string;
  safetyScore: string;
  timestamp: number;
}

export const vibesApi = {
  getDaily: () => api.get<DailyVibe>('/vibes/daily').then((r) => r.data),
  getRandom: () => api.get<DailyVibe>('/vibes/random').then((r) => r.data),
  checkVibe: (content: string) =>
    api.post<VibeCheckResult>('/vibes/check', { content }).then((r) => r.data),
};

export const statsApi = {
  getSummary: () => api.get<PlatformStats>('/stats/summary').then((r) => r.data),
};
