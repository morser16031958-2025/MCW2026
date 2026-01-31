
import { ModelType, ModelProvider } from './types';

export interface ModelConfig {
  id: string; // OpenRouter model ID or Google Model ID
  name: string;
  description: string;
  category: 'Google' | 'OpenAI' | 'Premium' | 'Other';
  provider: ModelProvider;
}

export const MODELS: ModelConfig[] = [
  // Google Category
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    description: 'Ultra-fast multimodal model via Google.',
    category: 'Google',
    provider: 'google'
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro preview',
    description: 'Top-tier reasoning and multimodal understanding.',
    category: 'Premium',
    provider: 'google'
  },
  // OpenAI & X-AI Category
  {
    id: 'openai/gpt-4o-2024-08-06',
    name: 'GPT-4o',
    description: 'Omni model, versatile and intelligent.',
    category: 'OpenAI',
    provider: 'openai'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o mini',
    description: 'Fast and smart companion model.',
    category: 'OpenAI',
    provider: 'openai'
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Blazing fast and compact model from Anthropic.',
    category: 'Premium',
    provider: 'openai'
  },
  {
    id: 'x-ai/grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    description: 'High-speed intelligence from xAI via OpenRouter.',
    category: 'Other',
    provider: 'openai'
  },
  // Xiaomi
  {
    id: 'xiaomi/mimo-v2-flash:free', 
    name: 'Xiaomi: MiMo-V2-Flash',
    description: 'Efficient Xiaomi model (free)',
    category: 'Other',
    provider: 'Xiaomi'
  }
];

export const DEFAULT_MODEL = 'gemini-3-flash-preview';
