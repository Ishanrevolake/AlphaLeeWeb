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
  replyGuaranteeAddon: boolean;
}

interface FunnelState extends FunnelData {
  setDetails: (details: Partial<Omit<FunnelData, 'selectedPackage' | 'replyGuaranteeAddon'>>) => void;
  setPackage: (pkg: string) => void;
  setReplyGuaranteeAddon: (enabled: boolean) => void;
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
  replyGuaranteeAddon: false,
};

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set) => ({
      ...initialState,
      setDetails: (details) => set((state) => ({ ...state, ...details })),
      setPackage: (pkg) => set({ selectedPackage: pkg }),
      setReplyGuaranteeAddon: (enabled) => set({ replyGuaranteeAddon: enabled }),
      clearFunnel: () => set(initialState),
    }),
    {
      name: 'alpha-lee-funnel-storage',
    }
  )
);
