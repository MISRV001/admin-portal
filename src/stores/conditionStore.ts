import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Condition = {
  id: string;
  name: string;
  type: string;
  value: any;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

interface ConditionStore {
  conditions: Condition[];
  loading: boolean;
  error: string | null;
  fetchConditions: () => Promise<void>;
  addCondition: (condition: Omit<Condition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCondition: (id: string, updates: Partial<Condition>) => Promise<void>;
  deleteCondition: (id: string) => Promise<void>;
  toggleCondition: (id: string) => void;
}

export const useConditionStore = create<ConditionStore>()(
  persist(
    (set, get) => ({
      conditions: [],
      loading: false,
      error: null,
      fetchConditions: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/mock/responses/conditions.json');
          const data = await res.json();
          set({ conditions: data, loading: false });
        } catch (e: any) {
          set({ error: e.message, loading: false });
        }
      },
      addCondition: async (condition) => {
        const now = new Date().toISOString();
        const newCondition: Condition = {
          ...condition,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: now,
          updatedAt: now,
        };
        set({ conditions: [newCondition, ...get().conditions] });
      },
      updateCondition: async (id, updates) => {
        set({
          conditions: get().conditions.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        });
      },
      deleteCondition: async (id) => {
        set({ conditions: get().conditions.filter((c) => c.id !== id) });
      },
      toggleCondition: (id) => {
        set({
          conditions: get().conditions.map((c) =>
            c.id === id ? { ...c, enabled: !c.enabled, updatedAt: new Date().toISOString() } : c
          ),
        });
      },
    }),
    { name: 'condition-store' }
  )
);
