'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { usePlan } from '@/shared/lib/plan-context';

interface BrandSettings {
  brandName: string | null;
  brandLogo: string | null;
  primaryColor: string | null;
  themeMode: string | null;
  sidebarGlass: boolean | null;
  sidebarOpacity: number | null;
  gradientBg: boolean | null;
}

interface BrandContextType {
  brand: BrandSettings;
  refreshBrand: () => void;
  displayName: string;
}

const DEFAULT_BRAND: BrandSettings = {
  brandName: null,
  brandLogo: null,
  primaryColor: null,
  themeMode: 'light',
  sidebarGlass: false,
  sidebarOpacity: 1,
  gradientBg: false,
};

const BrandContext = createContext<BrandContextType>({
  brand: DEFAULT_BRAND,
  refreshBrand: () => {},
  displayName: 'FREEMO R',
});

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() || {};
  const { hasFeature } = usePlan();
  const { setTheme } = useTheme();
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);

  const fetchBrand = useCallback(() => {
    if (status !== 'authenticated') return;
    fetch('/api/settings/brand')
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) setBrand(d);
      })
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  // Apply theme mode
  useEffect(() => {
    if (!hasFeature('branding')) {
      setTheme('light');
      return;
    }
    const mode = brand.themeMode || 'light';
    setTheme(mode);
  }, [brand.themeMode, hasFeature, setTheme]);

  // Apply glass & gradient CSS classes on body
  useEffect(() => {
    const hasBranding = hasFeature('branding');
    document.body.classList.toggle('brand-glass', !!(hasBranding && brand.sidebarGlass));
    document.body.classList.toggle('brand-gradient', !!(hasBranding && brand.gradientBg));
    if (hasBranding && brand.sidebarGlass && brand.sidebarOpacity != null) {
      document.documentElement.style.setProperty('--sidebar-opacity', String(brand.sidebarOpacity));
    } else {
      document.documentElement.style.removeProperty('--sidebar-opacity');
    }
    return () => {
      document.body.classList.remove('brand-glass', 'brand-gradient');
      document.documentElement.style.removeProperty('--sidebar-opacity');
    };
  }, [brand.sidebarGlass, brand.sidebarOpacity, brand.gradientBg, hasFeature]);

  const displayName = (hasFeature('branding') && brand.brandName) ? brand.brandName : 'FREEMO R';

  return (
    <BrandContext.Provider value={{ brand, refreshBrand: fetchBrand, displayName }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
