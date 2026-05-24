import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FunnelData {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goalWeight: string;
  experienceLevel: string;
  workoutLocation: string;
  workoutDays: string;
  dietPreference: string;
  primaryGoal: string;
  allergies: string;
  injuries: string;
  notes: string;
  paymentMethod: 'bank' | null;
  paymentReference: string;
  paymentSlipName: string;
  selectedPackage: string | null;
  replyGuaranteeAddon: boolean;
}

interface FunnelState extends FunnelData {
  setDetails: (details: Partial<Omit<FunnelData, 'selectedPackage' | 'replyGuaranteeAddon'>>) => void;
  setPackage: (pkg: string) => void;
  setReplyGuaranteeAddon: (enabled: boolean) => void;
  createPaymentReference: () => string;
  clearFunnel: () => void;
}

const initialState: FunnelData = {
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  goalWeight: '',
  experienceLevel: '',
  workoutLocation: '',
  workoutDays: '',
  dietPreference: '',
  primaryGoal: '',
  allergies: '',
  injuries: '',
  notes: '',
  paymentMethod: null,
  paymentReference: '',
  paymentSlipName: '',
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
      createPaymentReference: () => {
        const reference = `ALF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        set({ paymentReference: reference });
        return reference;
      },
      clearFunnel: () => set(initialState),
    }),
    {
      name: 'alpha-lee-funnel-storage',
    }
  )
);
