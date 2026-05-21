import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

// ── Types ───────────────────────────────────────────────────────

export interface Tranche {
  id: string;
  series: "A" | "B" | "C" | "SUB";
  label: string;
  size_usd: number;
  coupon_pct: number;
  spread_bps: number;
  maturity_yrs: number;
  ltc_pct: number;
  call_schedule?: Array<{ date: string; price: number; type: string }>;
  put_schedule?: Array<{ date: string; trigger: string }>;
}

export interface Deal {
  id: string;
  name: string;
  sponsor: string;
  total_project_cost_usd: number;
  stabilized_noi_usd: number;
  appraised_value_usd: number;
  use_of_proceeds: string;
  sector: string;
  phase: "sourcing" | "structuring" | "placement" | "closing";
}

export interface MarketSnapshot {
  treasury_10yr: number;
  treasury_5yr: number;
  sofr: number;
  ig_spread_bps: number;
  vix: number;
  updated_at: string;
  prev_treasury_10yr: number;
}

export interface StackMetrics {
  total_debt_usd: number;
  total_debt_service_usd: number;
  blended_coupon_pct: number;
  blended_spread_bps: number;
  cltv_pct: number;
  ltc_pct: number;
  dscr: number;
  icr: number;
  obligor_grade: string;
  deal_score: number;
  deal_score_grade: string;
  ltv_alert: boolean;
}

export interface StressResult {
  [scenario: string]: {
    description: string;
    dscr: number;
    status: string;
    outcome: string;
  };
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  token_id?: string;
}

export interface PoolDeal {
  deal: Deal;
  tranches: Tranche[];
  metrics: StackMetrics;
}

export interface IssuanceWindow {
  status: "open" | "narrowing" | "closed";
  hours_remaining: number;
  confidence: number;
  summary: string;
}

// ── State Shape ─────────────────────────────────────────────────

interface DealState {
  activeDeal: Deal | null;
  tranches: Tranche[];
  metrics: StackMetrics | null;
  stress: StressResult | null;
  marketSnapshot: MarketSnapshot;
  cmbsPool: PoolDeal[];
  issuanceWindow: IssuanceWindow;
  auditLog: AuditEntry[];
  dealOptimizerOn: boolean;
}

const DEFAULT_MARKET: MarketSnapshot = {
  treasury_10yr: 4.28,
  treasury_5yr: 4.05,
  sofr: 5.33,
  ig_spread_bps: 112,
  vix: 18.5,
  updated_at: new Date().toISOString(),
  prev_treasury_10yr: 4.25,
};

const INITIAL_STATE: DealState = {
  activeDeal: null,
  tranches: [],
  metrics: null,
  stress: null,
  marketSnapshot: DEFAULT_MARKET,
  cmbsPool: [],
  issuanceWindow: { status: "open", hours_remaining: 72, confidence: 0.78, summary: "Favorable conditions — price this week." },
  auditLog: [],
  dealOptimizerOn: true,
};

// ── Actions ─────────────────────────────────────────────────────

type Action =
  | { type: "SET_DEAL"; deal: Deal }
  | { type: "ADD_TRANCHE"; tranche: Tranche }
  | { type: "UPDATE_TRANCHE"; id: string; updates: Partial<Tranche> }
  | { type: "REMOVE_TRANCHE"; id: string }
  | { type: "SET_METRICS"; metrics: StackMetrics; stress: StressResult }
  | { type: "SET_MARKET"; snapshot: MarketSnapshot }
  | { type: "ADD_TO_POOL"; poolDeal: PoolDeal }
  | { type: "REMOVE_FROM_POOL"; dealId: string }
  | { type: "SET_ISSUANCE_WINDOW"; window: IssuanceWindow }
  | { type: "LOG"; entry: Omit<AuditEntry, "id" | "timestamp"> }
  | { type: "TOGGLE_OPTIMIZER" }
  | { type: "RESET" };

function reducer(state: DealState, action: Action): DealState {
  switch (action.type) {
    case "SET_DEAL":
      return { ...state, activeDeal: action.deal, tranches: [], metrics: null, stress: null };
    case "ADD_TRANCHE":
      return { ...state, tranches: [...state.tranches, action.tranche] };
    case "UPDATE_TRANCHE":
      return {
        ...state,
        tranches: state.tranches.map((t) =>
          t.id === action.id ? { ...t, ...action.updates } : t
        ),
      };
    case "REMOVE_TRANCHE":
      return { ...state, tranches: state.tranches.filter((t) => t.id !== action.id) };
    case "SET_METRICS":
      return { ...state, metrics: action.metrics, stress: action.stress };
    case "SET_MARKET":
      return { ...state, marketSnapshot: action.snapshot };
    case "ADD_TO_POOL":
      return { ...state, cmbsPool: [...state.cmbsPool, action.poolDeal] };
    case "REMOVE_FROM_POOL":
      return { ...state, cmbsPool: state.cmbsPool.filter((p) => p.deal.id !== action.dealId) };
    case "SET_ISSUANCE_WINDOW":
      return { ...state, issuanceWindow: action.window };
    case "LOG":
      return {
        ...state,
        auditLog: [
          ...state.auditLog,
          { ...action.entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
        ],
      };
    case "TOGGLE_OPTIMIZER":
      return { ...state, dealOptimizerOn: !state.dealOptimizerOn };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────

interface DealStateContextType {
  state: DealState;
  dispatch: React.Dispatch<Action>;
  setDeal: (deal: Deal) => void;
  addTranche: (tranche: Tranche) => void;
  updateTranche: (id: string, updates: Partial<Tranche>) => void;
  removeTranche: (id: string) => void;
  setMetrics: (metrics: StackMetrics, stress: StressResult) => void;
  setMarket: (snapshot: MarketSnapshot) => void;
  addToPool: (poolDeal: PoolDeal) => void;
  removeFromPool: (dealId: string) => void;
  log: (actor: string, action: string, detail: string) => void;
}

const DealStateContext = createContext<DealStateContextType | null>(null);

export function DealStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const setDeal = useCallback((deal: Deal) => dispatch({ type: "SET_DEAL", deal }), []);
  const addTranche = useCallback((tranche: Tranche) => dispatch({ type: "ADD_TRANCHE", tranche }), []);
  const updateTranche = useCallback((id: string, updates: Partial<Tranche>) => dispatch({ type: "UPDATE_TRANCHE", id, updates }), []);
  const removeTranche = useCallback((id: string) => dispatch({ type: "REMOVE_TRANCHE", id }), []);
  const setMetrics = useCallback((metrics: StackMetrics, stress: StressResult) => dispatch({ type: "SET_METRICS", metrics, stress }), []);
  const setMarket = useCallback((snapshot: MarketSnapshot) => dispatch({ type: "SET_MARKET", snapshot }), []);
  const addToPool = useCallback((poolDeal: PoolDeal) => dispatch({ type: "ADD_TO_POOL", poolDeal }), []);
  const removeFromPool = useCallback((dealId: string) => dispatch({ type: "REMOVE_FROM_POOL", dealId }), []);
  const log = useCallback((actor: string, action: string, detail: string) =>
    dispatch({ type: "LOG", entry: { actor, action, detail } }), []);

  return (
    <DealStateContext.Provider value={{
      state, dispatch, setDeal, addTranche, updateTranche, removeTranche,
      setMetrics, setMarket, addToPool, removeFromPool, log,
    }}>
      {children}
    </DealStateContext.Provider>
  );
}

export function useDealState() {
  const ctx = useContext(DealStateContext);
  if (!ctx) throw new Error("useDealState must be used within DealStateProvider");
  return ctx;
}
