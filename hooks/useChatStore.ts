
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, ChatSession, Message, ModelType } from '../types';
import { DEFAULT_MODEL } from '../constants';

export const useChatStore = (userId: string | undefined) => {
  const getStorageKey = useCallback(() => {
    return userId ? `multichat_winter_chats_${userId}` : null;
  }, [userId]);

  const [state, setState] = useState<AppState>(() => {
    // Initial load attempt
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(userId ? `multichat_winter_chats_${userId}` : 'multichat_winter_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse storage", e);
        }
      }
    }
    return { chats: [], activeChatId: null };
  });

  // Effect to handle user switching: reload chats when userId changes
  useEffect(() => {
    const key = getStorageKey();
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setState(JSON.parse(saved));
        } catch (e) {
          setState({ chats: [], activeChatId: null });
        }
      } else {
        setState({ chats: [], activeChatId: null });
      }
    }
  }, [userId, getStorageKey]);

  // Save to localStorage on every state change
  useEffect(() => {
    const key = getStorageKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [state, getStorageKey]);

  const createChat = useCallback((modelId?: ModelType): ChatSession => {
    const actualModelId = typeof modelId === 'string' ? modelId : DEFAULT_MODEL;

    const newChat: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      modelId: actualModelId,
      messages: [],
      createdAt: Date.now(),
      spent: 0,
    };
    setState(prev => ({
      ...prev,
      chats: [newChat, ...prev.chats],
      activeChatId: newChat.id,
    }));
    return newChat;
  }, []);

  const deleteChat = useCallback((id: string) => {
    setState(prev => {
      const newChats = prev.chats.filter(c => c.id !== id);
      return {
        ...prev,
        chats: newChats,
        activeChatId: prev.activeChatId === id ? (newChats[0]?.id || null) : prev.activeChatId,
      };
    });
  }, []);

  const updateChatModel = useCallback((chatId: string, modelId: ModelType) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.map(c => c.id === chatId ? { ...c, modelId } : c),
    }));
  }, []);

  const setActiveChat = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeChatId: id }));
  }, []);

  const addMessage = useCallback((chatId: string, message: Message, cost: number = 0) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.map(c => {
        if (c.id === chatId) {
          let title = c.title;
          if (c.messages.length === 0 && message.role === 'user') {
            const firstText = message.parts.find(p => p.text)?.text;
            if (firstText) {
              title = firstText.slice(0, 30) + (firstText.length > 30 ? '...' : '');
            }
          }
          return {
            ...c,
            title,
            messages: [...c.messages, message],
            spent: c.spent + cost,
          };
        }
        return c;
      }),
    }));
  }, []);

  const activeChat = state.chats.find(c => c.id === state.activeChatId) || null;

  return {
    chats: state.chats,
    activeChatId: state.activeChatId,
    activeChat,
    createChat,
    deleteChat,
    setActiveChat,
    addMessage,
    updateChatModel,
  };
};
