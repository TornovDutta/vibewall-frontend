import { api } from './client';
import type { CreatePollRequest, PollResponse, VoteRequest } from '../types';

export const pollsApi = {
  async getPolls(): Promise<PollResponse[]> {
    const res = await api.get<PollResponse[]>('/polls');
    return res.data;
  },

  async getPoll(id: string): Promise<PollResponse> {
    const res = await api.get<PollResponse>(`/polls/${id}`);
    return res.data;
  },

  async createPoll(payload: CreatePollRequest): Promise<PollResponse> {
    const res = await api.post<PollResponse>('/polls', payload);
    return res.data;
  },

  async vote(pollId: string, optionId: number): Promise<PollResponse> {
    const res = await api.post<PollResponse>(`/polls/${pollId}/vote`, { optionId } as VoteRequest);
    return res.data;
  },

  async deletePoll(pollId: string): Promise<void> {
    await api.delete(`/polls/${pollId}`);
  },
};
