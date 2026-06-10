/**
 * Bond Desk Demo Data
 * Live trading desk with MTM pricing, call/put mechanics, and investor book
 */

export type BondStatus = 'active' | 'called' | 'put' | 'matured' | 'defaulted';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'rejected';

export interface Bond {
  id: string;
  cusip: string;
  issuer: string;
  coupon: number; // percentage
  maturity: Date;
  faceValue: number; // millions
  outstandingAmount: number; // millions
  status: BondStatus;
  rating: string; // e.g., "Baa1"
  sector: string;
  callSchedule?: CallScheduleEntry[];
  putSchedule?: PutScheduleEntry[];
}

export interface CallScheduleEntry {
  date: Date;
  price: number; // as % of par
  optionality: 'hard' | 'soft';
}

export interface PutScheduleEntry {
  date: Date;
  price: number; // as % of par
}

export interface MTMPrice {
  bondId: string;
  timestamp: Date;
  cleanPrice: number; // as % of par
  dirtyPrice: number; // clean + accrued
  ytm: number; // percentage
  spreadTreasuryBps: number; // basis points
  duration: number; // years
  modifiedDuration: number;
  convexity: number;
  dv01: number; // dollar value of 1bp move
}

export interface BondOrder {
  id: string;
  bondId: string;
  side: OrderSide;
  quantity: number; // millions
  price: number; // as % of par
  status: OrderStatus;
  createdAt: Date;
  filledAt?: Date;
  investor?: string;
}

export interface InvestorBook {
  bondId: string;
  investors: Array<{
    name: string;
    allocation: number; // millions
    percentage: number; // of total
    status: 'indicated' | 'confirmed' | 'allocated';
  }>;
  totalAllocated: number; // millions
  totalIndicated: number; // millions
}

// DEMO DATA

export const DEMO_BONDS: Bond[] = [
  {
    id: 'bond-001',
    cusip: 'NEST001AA0',
    issuer: 'NEST Mixed-Use Portfolio',
    coupon: 4.25,
    maturity: new Date('2034-06-15'),
    faceValue: 250,
    outstandingAmount: 248.5,
    status: 'active',
    rating: 'Baa1',
    sector: 'Mixed-Use',
    callSchedule: [
      { date: new Date('2029-06-15'), price: 101.5, optionality: 'hard' },
      { date: new Date('2031-06-15'), price: 100.75, optionality: 'soft' },
    ],
  },
  {
    id: 'bond-002',
    cusip: 'NEST002AA0',
    issuer: 'NEST Hospitality Portfolio',
    coupon: 4.75,
    maturity: new Date('2032-12-01'),
    faceValue: 175,
    outstandingAmount: 172.3,
    status: 'active',
    rating: 'Ba2',
    sector: 'Hospitality',
    callSchedule: [
      { date: new Date('2028-12-01'), price: 102.0, optionality: 'hard' },
    ],
  },
  {
    id: 'bond-003',
    cusip: 'NEST003AA0',
    issuer: 'NEST Construction Loan',
    coupon: 5.0,
    maturity: new Date('2031-03-15'),
    faceValue: 125,
    outstandingAmount: 125.0,
    status: 'active',
    rating: 'Ba1',
    sector: 'Construction',
  },
  {
    id: 'bond-004',
    cusip: 'NEST004AA0',
    issuer: 'NEST CCRC Portfolio',
    coupon: 3.875,
    maturity: new Date('2035-09-30'),
    faceValue: 300,
    outstandingAmount: 298.2,
    status: 'active',
    rating: 'Baa2',
    sector: 'CCRC',
    putSchedule: [
      { date: new Date('2030-09-30'), price: 100.0 },
    ],
  },
];

export const DEMO_MTM_PRICES: Record<string, MTMPrice> = {
  'bond-001': {
    bondId: 'bond-001',
    timestamp: new Date(),
    cleanPrice: 101.42,
    dirtyPrice: 101.89,
    ytm: 3.98,
    spreadTreasuryBps: 185,
    duration: 8.2,
    modifiedDuration: 7.9,
    convexity: 72.5,
    dv01: 0.205,
  },
  'bond-002': {
    bondId: 'bond-002',
    timestamp: new Date(),
    cleanPrice: 99.75,
    dirtyPrice: 100.18,
    ytm: 4.82,
    spreadTreasuryBps: 245,
    duration: 7.8,
    modifiedDuration: 7.5,
    convexity: 68.3,
    dv01: 0.129,
  },
  'bond-003': {
    bondId: 'bond-003',
    timestamp: new Date(),
    cleanPrice: 98.50,
    dirtyPrice: 98.92,
    ytm: 5.25,
    spreadTreasuryBps: 310,
    duration: 6.9,
    modifiedDuration: 6.6,
    convexity: 61.2,
    dv01: 0.083,
  },
  'bond-004': {
    bondId: 'bond-004',
    timestamp: new Date(),
    cleanPrice: 102.15,
    dirtyPrice: 102.58,
    ytm: 3.62,
    spreadTreasuryBps: 155,
    duration: 9.1,
    modifiedDuration: 8.8,
    convexity: 78.9,
    dv01: 0.267,
  },
};

export const DEMO_ORDERS: BondOrder[] = [
  {
    id: 'order-001',
    bondId: 'bond-001',
    side: 'buy',
    quantity: 25,
    price: 101.40,
    status: 'filled',
    createdAt: new Date(Date.now() - 3600000),
    filledAt: new Date(Date.now() - 3540000),
    investor: 'Apex Capital',
  },
  {
    id: 'order-002',
    bondId: 'bond-002',
    side: 'sell',
    quantity: 15,
    price: 99.80,
    status: 'filled',
    createdAt: new Date(Date.now() - 1800000),
    filledAt: new Date(Date.now() - 1740000),
    investor: 'Horizon Funds',
  },
  {
    id: 'order-003',
    bondId: 'bond-001',
    side: 'buy',
    quantity: 30,
    price: 101.45,
    status: 'pending',
    createdAt: new Date(Date.now() - 600000),
    investor: 'Sterling Advisors',
  },
  {
    id: 'order-004',
    bondId: 'bond-004',
    side: 'sell',
    quantity: 20,
    price: 102.10,
    status: 'pending',
    createdAt: new Date(Date.now() - 300000),
    investor: 'Merlin Capital',
  },
];

export const DEMO_INVESTOR_BOOKS: Record<string, InvestorBook> = {
  'bond-001': {
    bondId: 'bond-001',
    investors: [
      { name: 'Apex Capital', allocation: 25, percentage: 20, status: 'allocated' },
      { name: 'Horizon Funds', allocation: 35, percentage: 28, status: 'allocated' },
      { name: 'Sterling Advisors', allocation: 30, percentage: 24, status: 'indicated' },
      { name: 'Merlin Capital', allocation: 20, percentage: 16, status: 'indicated' },
      { name: 'Vector Partners', allocation: 15, percentage: 12, status: 'indicated' },
    ],
    totalAllocated: 60,
    totalIndicated: 65,
  },
  'bond-002': {
    bondId: 'bond-002',
    investors: [
      { name: 'Apex Capital', allocation: 20, percentage: 40, status: 'allocated' },
      { name: 'Horizon Funds', allocation: 15, percentage: 30, status: 'allocated' },
      { name: 'Sterling Advisors', allocation: 15, percentage: 30, status: 'indicated' },
    ],
    totalAllocated: 35,
    totalIndicated: 15,
  },
};

export const DEMO_MARKET_TAPE = [
  ['NEST-A', '101.42', '+0.35', '4.25%', 'Baa1', 'Mixed-Use', 'Active'],
  ['NEST-B', '99.75', '-0.50', '4.75%', 'Ba2', 'Hospitality', 'Active'],
  ['NEST-C', '98.50', '-0.25', '5.00%', 'Ba1', 'Construction', 'Active'],
  ['NEST-D', '102.15', '+0.60', '3.88%', 'Baa2', 'CCRC', 'Active'],
];

export function getBond(bondId: string): Bond | undefined {
  return DEMO_BONDS.find((b) => b.id === bondId);
}

export function getMTMPrice(bondId: string): MTMPrice | undefined {
  return DEMO_MTM_PRICES[bondId];
}

export function getBondOrders(bondId: string): BondOrder[] {
  return DEMO_ORDERS.filter((o) => o.bondId === bondId);
}

export function getInvestorBook(bondId: string): InvestorBook | undefined {
  return DEMO_INVESTOR_BOOKS[bondId];
}

export function getAllBonds(): Bond[] {
  return DEMO_BONDS;
}

export function getActiveBonds(): Bond[] {
  return DEMO_BONDS.filter((b) => b.status === 'active');
}

export function getPortfolioMetrics() {
  const totalFaceValue = DEMO_BONDS.reduce((sum, b) => sum + b.faceValue, 0);
  const totalOutstanding = DEMO_BONDS.reduce((sum, b) => sum + b.outstandingAmount, 0);
  const avgCoupon =
    DEMO_BONDS.reduce((sum, b) => sum + b.coupon, 0) / DEMO_BONDS.length;
  const avgDuration =
    Object.values(DEMO_MTM_PRICES).reduce((sum, p) => sum + p.duration, 0) /
    DEMO_BONDS.length;

  return {
    totalBonds: DEMO_BONDS.length,
    totalFaceValue,
    totalOutstanding,
    avgCoupon,
    avgDuration,
    avgSpreadBps:
      Object.values(DEMO_MTM_PRICES).reduce((sum, p) => sum + p.spreadTreasuryBps, 0) /
      DEMO_BONDS.length,
  };
}

export function simulateMTMUpdate(bondId: string): MTMPrice {
  const current = DEMO_MTM_PRICES[bondId];
  if (!current) return null as any;

  // Simulate small random price movement
  const priceChange = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25
  const spreadChange = (Math.random() - 0.5) * 10; // -5 to +5 bps

  return {
    ...current,
    timestamp: new Date(),
    cleanPrice: current.cleanPrice + priceChange,
    dirtyPrice: current.dirtyPrice + priceChange,
    ytm: current.ytm - (priceChange * 0.1), // inverse relationship
    spreadTreasuryBps: current.spreadTreasuryBps + spreadChange,
  };
}
