import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  company: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (cnpj, email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { cnpj, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, company: data.company, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.error || 'Erro ao fazer login' };
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, company: res.data.company, token: res.data.token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.error || 'Erro ao cadastrar' };
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, company: data.company });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, company: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, company: null, token: null });
  },
}));
