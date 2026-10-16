import { create } from 'zustand';
import { ApiClient } from '../lib/api';

interface AnalysisState {
  analyses: any[];
  activeAnalysis: any | null;
  loading: boolean;
  error: string | null;
  fetchAnalyses: () => Promise<void>;
  fetchAnalysis: (id: number) => Promise<void>;
}

export const useAnalysis = create<AnalysisState>((set) => ({
  analyses: [],
  activeAnalysis: null,
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
}));
