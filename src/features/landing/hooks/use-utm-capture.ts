"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useOnboardingStore } from "@/lib/stores/onboarding-store";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const STORAGE_KEY = "oncre_utm";

/** PRD 1.4.1 — "UTM parameters captured from URL into sessionStorage on page load for attribution." */
export function useUtmCapture() {
  const searchParams = useSearchParams();
  const setUtm = useOnboardingStore((s) => s.setUtm);

  useEffect(() => {
    const fromUrl = Object.fromEntries(UTM_KEYS.map((key) => [key, searchParams.get(key) ?? undefined]));
    const hasUtmInUrl = Object.values(fromUrl).some(Boolean);

    if (hasUtmInUrl) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
      setUtm(fromUrl);
      return;
    }

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setUtm(JSON.parse(stored));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
