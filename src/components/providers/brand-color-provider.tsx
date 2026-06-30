'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ORGANIZATION_THEME_COLORS, DEFAULT_THEME_COLOR_ID, ThemeColorId } from '@/constants/colors';

interface BrandColorContextType {
  themeColorId: ThemeColorId;
  updateBrandColor: (id: ThemeColorId) => void;
}

const BrandColorContext = createContext<BrandColorContextType | undefined>(undefined);

const STORAGE_KEY = 'organization-theme-color';

export function BrandColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColorId, setThemeColorId] = useState<ThemeColorId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeColorId;
      if (saved && ORGANIZATION_THEME_COLORS.some(c => c.id === saved)) {
        return saved;
      }
    }
    return DEFAULT_THEME_COLOR_ID;
  });

  const applyColor = useCallback((id: ThemeColorId) => {
    const colorEntry = ORGANIZATION_THEME_COLORS.find(c => c.id === id);
    if (colorEntry) {
      document.documentElement.style.setProperty('--primary', colorEntry.value);
    }
  }, []);

  useEffect(() => {
    applyColor(themeColorId);
  }, [applyColor, themeColorId]);

  const updateBrandColor = useCallback((id: ThemeColorId) => {
    setThemeColorId(id);
    localStorage.setItem(STORAGE_KEY, id);
    applyColor(id);
  }, [applyColor]);

  return (
    <BrandColorContext.Provider value={{ themeColorId, updateBrandColor }}>
      {children}
    </BrandColorContext.Provider>
  );
}

export function useBrandColor() {
  const context = useContext(BrandColorContext);
  if (context === undefined) {
    throw new Error('useBrandColor must be used within a BrandColorProvider');
  }
  return context;
}
