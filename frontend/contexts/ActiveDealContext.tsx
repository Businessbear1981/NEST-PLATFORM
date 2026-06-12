"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

interface ActiveDealContextType {
  dealId: string | null;
  setDealId: (id: string | null) => void;
}

const ActiveDealContext = createContext<ActiveDealContextType>({
  dealId: null,
  setDealId: () => {},
});

export function ActiveDealProvider({ children }: { children: ReactNode }) {
  const [dealId, setDealId] = useState<string | null>(null);
  return (
    <ActiveDealContext.Provider value={{ dealId, setDealId }}>
      {children}
    </ActiveDealContext.Provider>
  );
}

export function useActiveDeal() {
  return useContext(ActiveDealContext);
}
