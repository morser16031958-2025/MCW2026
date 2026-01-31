
export type ModelProvider = 'google' | 'openai' | 'Xiaomi';

export type ModelType = string;

export interface User {
  login: string;
  fullName: string;
  password?: string;
  apiKey: string;
  balance: number; // Оставшиеся средства в USD
  lastLoginDate: number;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio';
  mimeType: string;
  data: string; // Base64
  url: string; // Preview URL
}

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  modelId: ModelType;
  messages: Message[];
  createdAt: number;
  spent: number;
}

export interface AppState {
  chats: ChatSession[];
  activeChatId: string | null;
}
