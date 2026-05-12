'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface HintsContextType {
  hintsEnabled: boolean;
  setHintsEnabled: (v: boolean) => void;
}

const HintsContext = createContext<HintsContextType>({
  hintsEnabled: false,
  setHintsEnabled: () => {},
});

export function HintsProvider({ children }: { children: ReactNode }) {
  const [hintsEnabled, setHintsState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('crm_hints');
      if (saved === 'true') setHintsState(true);
    } catch {}
  }, []);

  const setHintsEnabled = useCallback((v: boolean) => {
    setHintsState(v);
    try { localStorage.setItem('crm_hints', String(v)); } catch {}
  }, []);

  return (
    <HintsContext.Provider value={{ hintsEnabled: mounted ? hintsEnabled : false, setHintsEnabled }}>
      {children}
    </HintsContext.Provider>
  );
}

export function useHints() {
  return useContext(HintsContext);
}
