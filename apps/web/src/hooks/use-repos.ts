import { create } from 'zustand';
import { ApiClient } from '../lib/api';

interface ReposState {
  repos: any[];
  activeRepo: any | null;
  graph: { nodes: any[]; edges: any[]; services: any[] } | null;
  loading: boolean;
  error: string | null;
  fetchRepos: () => Promise<void>;
  fetchRepo: (id: number) => Promise<void>;
  fetchGraph: (id: number) => Promise<void>;
  addRepo: (data: any) => Promise<void>;
  removeRepo: (id: number) => Promise<void>;
  indexRepo: (id: number) => Promise<void>;
}

export const useRepos = create<ReposState>((set, get) => ({
  repos: [],
  activeRepo: null,
  graph: null,
  loading: false,
  error: null,

  fetchRepos: async () => {
    set({ loading: true, error: null });
    try {
      const repos = await ApiClient.getRepos();
      set({ repos, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchRepo: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const activeRepo = await ApiClient.getRepo(id);
      set({ activeRepo, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchGraph: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const graph = await ApiClient.getRepoGraph(id);
      set({ graph, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addRepo: async (data: any) => {
    set({ loading: true, error: null });
    try {
      await ApiClient.addRepo(data);
      await get().fetchRepos();
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  removeRepo: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await ApiClient.removeRepo(id);
      await get().fetchRepos();
      if (get().activeRepo?.id === id) {
        set({ activeRepo: null, graph: null });
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  indexRepo: async (id: number) => {
    set({ error: null });
    try {
      await ApiClient.indexRepo(id);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
