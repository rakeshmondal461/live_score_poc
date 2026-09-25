import type { Match, AuthResponse, User } from './types';

const BASE_URL = 'http://localhost:5000/api';

const getToken = (): string | null => localStorage.getItem('token');

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const data = (await res.json()) as T & { message?: string };
  if (!res.ok) {
    throw new Error(data.message ?? 'Request failed');
  }
  return data;
};

export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string }): Promise<AuthResponse> =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    login: (body: { email: string; password: string }): Promise<AuthResponse> =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    me: (): Promise<{ user: User }> =>
      request<{ user: User }>('/auth/me'),
  },

  matches: {
    list: (): Promise<Match[]> =>
      request<Match[]>('/matches'),

    get: (id: string): Promise<Match> =>
      request<Match>(`/matches/${id}`),

    create: (body: { name: string; sport: string; teamA: string; teamB: string }): Promise<Match> =>
      request<Match>('/matches', { method: 'POST', body: JSON.stringify(body) }),

    updateStatus: (id: string, status: Match['status']): Promise<Match> =>
      request<Match>(`/matches/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

    updateScore: (id: string, team: 'teamA' | 'teamB', delta: 1 | -1): Promise<Match> =>
      request<Match>(`/matches/${id}/score`, { method: 'PATCH', body: JSON.stringify({ team, delta }) }),

    delete: (id: string): Promise<{ message: string }> =>
      request<{ message: string }>(`/matches/${id}`, { method: 'DELETE' }),
  },
};
