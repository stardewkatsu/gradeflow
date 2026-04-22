import { createContext, useContext, ReactNode } from 'react';
import { useGWASets, GWASet } from '@/hooks/useGWASets';

interface GWASetContextValue {
  sets: GWASet[];
  activeSetId: string | null;
  setActiveSetId: (id: string) => void;
  addSet: (name: string) => Promise<GWASet | null>;
  renameSet: (id: string, name: string) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  loading: boolean;
}

const GWASetContext = createContext<GWASetContextValue | null>(null);

export function GWASetProvider({ children }: { children: ReactNode }) {
  const value = useGWASets();
  return <GWASetContext.Provider value={value}>{children}</GWASetContext.Provider>;
}

export function useGWASetContext() {
  const ctx = useContext(GWASetContext);
  if (!ctx) throw new Error('useGWASetContext must be used within GWASetProvider');
  return ctx;
}
