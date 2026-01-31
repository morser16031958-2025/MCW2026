
import { User } from '../types';

// Безопасное получение конфига. Если переменные не заданы, используем заглушки для предотвращения падения.
const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key] as string;
    if ((window as any).process?.env?.[key]) return (window as any).process.env[key];
  } catch (e) {}
  return fallback;
};

const SUPABASE_URL = getEnv('SUPABASE_URL', 'https://your-project.supabase.co');
const SUPABASE_KEY = getEnv('SUPABASE_ANON_KEY', 'your-anon-key');

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export const db = {
  getUser: async (login: string): Promise<User | null> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users_winter?login=eq.${login}`, {
        method: 'GET',
        headers
      });
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (e) {
      console.error("DB Error (getUser):", e);
      return null;
    }
  },

  register: async (login: string, password: string): Promise<User> => {
    const existing = await db.getUser(login);
    if (existing) throw new Error("Пользователь уже существует");

    const newUser = {
      login,
      password,
      fullName: `User_${login}`,
      apiKey: '',
      balance: 0.05,
      lastLoginDate: Date.now()
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/users_winter`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newUser)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Ошибка регистрации' }));
      throw new Error(err.message || "Ошибка записи в базу данных");
    }
    
    const data = await response.json();
    return data[0];
  },

  login: async (login: string, password: string): Promise<User> => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users_winter?login=eq.${login}&password=eq.${password}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) throw new Error("Ошибка связи с сервером");

    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error("Неверный логин или пароль");

    const user = data[0];
    // Обновляем дату входа фоновым запросом
    fetch(`${SUPABASE_URL}/rest/v1/users_winter?login=eq.${login}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ lastLoginDate: Date.now() })
    }).catch(() => {});

    return user;
  },

  updateApiKey: async (login: string, apiKey: string): Promise<void> => {
    await fetch(`${SUPABASE_URL}/rest/v1/users_winter?login=eq.${login}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ apiKey })
    });
  },

  updateBalance: async (login: string, newBalance: number): Promise<number> => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users_winter?login=eq.${login}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ balance: newBalance })
    });
    
    if (!response.ok) throw new Error("Ошибка синхронизации баланса");
    const data = await response.json();
    return data[0].balance;
  }
};
