import { api } from './client';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export interface ChatResponse {
  reply: string;
  model: string;
  timestamp: number;
}

export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    api.post<ChatResponse>('/chat', { message, sessionId }).then((r) => r.data),
};
