import { api } from './client';
import type { QuestionRequest, QuestionResponse, ReplyQuestionRequest } from '../types';

export const qaApi = {
  // Get all public feed questions across the platform
  async getFeedQuestions(): Promise<QuestionResponse[]> {
    const res = await api.get<QuestionResponse[]>('/qa');
    return res.data;
  },

  // Ask a community question (open to everyone)
  async askCommunityQuestion(payload: QuestionRequest): Promise<QuestionResponse> {
    const res = await api.post<QuestionResponse>('/qa/ask', payload);
    return res.data;
  },

  // Ask a question to a target wall owner (or community if target is 'community')
  async askQuestion(targetUserId: string, payload: QuestionRequest): Promise<QuestionResponse> {
    if (!targetUserId || targetUserId === 'community') {
      return this.askCommunityQuestion(payload);
    }
    const res = await api.post<QuestionResponse>(`/qa/ask/${targetUserId}`, payload);
    return res.data;
  },

  // Get all public answered questions on a user's wall
  async getPublicWall(targetUserId: string): Promise<QuestionResponse[]> {
    const res = await api.get<QuestionResponse[]>(`/qa/wall/${targetUserId}`);
    return res.data;
  },

  // Get current owner's inbox (all, pending, or answered)
  async getInbox(status?: string): Promise<QuestionResponse[]> {
    const params = status ? { status } : {};
    const res = await api.get<QuestionResponse[]>('/qa/inbox', { params });
    return res.data;
  },

  // Wall owner replies to a question (publicly or privately)
  async replyQuestion(questionId: string, payload: ReplyQuestionRequest): Promise<QuestionResponse> {
    const res = await api.post<QuestionResponse>(`/qa/${questionId}/reply`, payload);
    return res.data;
  },

  // Delete a question
  async deleteQuestion(questionId: string): Promise<void> {
    await api.delete(`/qa/${questionId}`);
  },

  // Get questions asked by the current user to others
  async getMyAsked(): Promise<QuestionResponse[]> {
    const res = await api.get<QuestionResponse[]>('/qa/my-asked');
    return res.data;
  },

  // Get count of pending unanswered questions in inbox
  async getPendingCount(): Promise<number> {
    const res = await api.get<{ pendingCount: number }>('/qa/pending-count');
    return res.data.pendingCount;
  },
};
