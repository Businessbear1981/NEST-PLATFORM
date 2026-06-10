import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type BernardMode = "expert" | "standard" | "educational";

export interface BernardEvent {
  id: string;
  timestamp: string;
  type: string;
  depths: {
    expert: string;
    standard: string;
    educational: string;
  };
  data?: Record<string, unknown>;
  isOptimizer?: boolean;
}

interface BernardContextType {
  mode: BernardMode;
  setMode: (mode: BernardMode) => void;
  optimizerOn: boolean;
  toggleOptimizer: () => void;
  events: BernardEvent[];
  push: (event: Omit<BernardEvent, "id" | "timestamp">) => void;
  clear: () => void;
}

const BernardContext = createContext<BernardContextType | null>(null);

export function BernardProvider({ children, defaultMode = "standard" }: { children: ReactNode; defaultMode?: BernardMode }) {
  const [mode, setMode] = useState<BernardMode>(defaultMode);
  const [optimizerOn, setOptimizerOn] = useState(true);
  const [events, setEvents] = useState<BernardEvent[]>([]);

  const push = useCallback((event: Omit<BernardEvent, "id" | "timestamp">) => {
    setEvents((prev) => [
      { ...event, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      ...prev,
    ].slice(0, 50));
  }, []);

  const clear = useCallback(() => setEvents([]), []);
  const toggleOptimizer = useCallback(() => setOptimizerOn((v) => !v), []);

  return (
    <BernardContext.Provider value={{ mode, setMode, optimizerOn, toggleOptimizer, events, push, clear }}>
      {children}
    </BernardContext.Provider>
  );
}

export function useBernard() {
  const ctx = useContext(BernardContext);
  if (!ctx) throw new Error("useBernard must be used within BernardProvider");
  return ctx;
}
