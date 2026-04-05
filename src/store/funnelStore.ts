import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FunnelData {
  name: string;
  email: string;
  gender: string;
  experienceLevel: string;
  activityLevel: string;
  workoutLocation: string;
  workoutDays: string;
  selectedPackage: string | null;
}

interface FunnelState extends FunnelData {
  setDetails: (details: Partial<Omit<FunnelData, 'selectedPackage'>>) => void;
  setPackage: (pkg: string) => void;
  clearFunnel: () => void;
}

const initialState: FunnelData = {
  name: '',
  email: '',
  gender: '',
  experienceLevel: '',
  activityLevel: '',
  workoutLocation: '',
  workoutDays: '',
  selectedPackage: null,
};

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set) => ({
      ...initialState,
      setDetails: (details) => set((state) => ({ ...state, ...details })),
      setPackage: (pkg) => set({ selectedPackage: pkg }),
      clearFunnel: () => set(initialState),
    }),
    {
      name: 'alpha-lee-funnel-storage',
    }
  )
);
