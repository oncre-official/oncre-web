import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface OnboardingState extends UtmParams {
  merchantId: string | null;
  email: string | null;
  setUtm: (utm: UtmParams) => void;
  setRegistration: (merchantId: string, email: string) => void;
  reset: () => void;
}

/**
 * Persisted to sessionStorage so a refresh mid-onboarding (PRD 2.2: "Payment
 * fails at activation — merchant retries without losing registration data")
 * doesn't drop the wizard's progress, and so UTM params captured on the
 * landing page (1.4.1) survive the hop to `/signup`.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      merchantId: null,
      email: null,
      utm_source: undefined,
      utm_medium: undefined,
      utm_campaign: undefined,
      setUtm: (utm) => set(utm),
      setRegistration: (merchantId, email) => set({ merchantId, email }),
      reset: () => set({ merchantId: null, email: null }),
    }),
    {
      name: "oncre-onboarding",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
