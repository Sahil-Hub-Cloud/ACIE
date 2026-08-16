import { create } from 'zustand';
import { ApiClient } from '../lib/api';

interface AnalysisState {
  analyses: any[];
  activeAnalysis: any | null;
  stats: any | null;
  loading: boolean;
  error: string | null;
  fetchAnalyses: () => Promise<void>;
  fetchAnalysis: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  previewAnalysis: (changedSymbols: any[]) => Promise<any>;
}

export const useAnalysis = create<AnalysisState>((set) => ({
  analyses: [],
  activeAnalysis: null,
  stats: null,
  loading: false,
  error: null,

  fetchAnalyses: async () => {
    set({ loading: true, error: null });
    try {
      const analyses = await ApiClient.getAnalyses();
      set({ analyses, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchAnalysis: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const activeAnalysis = await ApiClient.getAnalysis(id);
      set({ activeAnalysis, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await ApiClient.getAnalysisStats();
      set({ stats, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  previewAnalysis: async (changedSymbols: any[]) => {
    set({ loading: true, error: null });
    try {
      const result = await ApiClient.previewAnalysis(changedSymbols);
      set({ loading: false });
      return result;
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },
}));
