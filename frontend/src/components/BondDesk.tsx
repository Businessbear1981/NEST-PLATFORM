import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlowSystem } from '@/contexts/GlowContext';
import { TrendingUp, TrendingDown, AlertCircle, Zap } from 'lucide-react';

interface Bond {
  isin: string;
  issuer: string;
  coupon: number;
  maturity: string;
  price: number;
  yield: number;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  volume: number;
  status: 'active' | 'watch' | 'alert';
}

interface OrderBook {
  level: number;
  bidSize: number;
  bidPrice: number;
  askPrice: number;
  askSize: number;
}

export function BondDesk() {
  const glowValues = useGlowSystem();
  const [bonds, setBonds] = useState<Bond[]>([
    {
      isin: 'US0378331005',
      issuer: 'Apple Inc.',
      coupon: 3.45,
      maturity: '2032-05-15',
      price: 102.34,
      yield: 2.89,
      bid: 102.32,
      ask: 102.36,
      spread: 4,
      change: 0.45,
      volume: 2450000,
      status: 'active',
    },
    {
      isin: 'US5949181045',
      issuer: 'Microsoft Corp.',
      coupon: 2.75,
      maturity: '2030-03-20',
      price: 101.12,
      yield: 2.34,
      bid: 101.10,
      ask: 101.14,
      spread: 4,
      change: -0.23,
      volume: 1890000,
      status: 'active',
    },
    {
      isin: 'US0311001004',
      issuer: 'Alphabet Inc.',
      coupon: 3.15,
      maturity: '2033-06-10',
      price: 100.89,
      yield: 3.12,
      bid: 100.87,
      ask: 100.91,
      spread: 4,
      change: 0.12,
      volume: 1650000,
      status: 'watch',
    },
  ]);

  const [selectedBond, setSelectedBond] = useState<Bond | null>(bonds[0]);
  const [orderBook, setOrderBook] = useState<OrderBook[]>([
    { level: 1, bidSize: 500000, bidPrice: 102.32, askPrice: 102.36, askSize: 450000 },
    { level: 2, bidSize: 750000, bidPrice: 102.28, askPrice: 102.40, askSize: 600000 },
    { level: 3, bidSize: 1000000, bidPrice: 102.24, askPrice: 102.44, askSize: 850000 },
    { level: 4, bidSize: 1250000, bidPrice: 102.20, askPrice: 102.48, askSize: 1100000 },
    { level: 5, bidSize: 1500000, bidPrice: 102.16, askPrice: 102.52, askSize: 1350000 },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBonds(prev =>
        prev.map(bond => ({
          ...bond,
          price: bond.price + (Math.random() - 0.5) * 0.5,
          bid: bond.bid + (Math.random() - 0.5) * 0.3,
          ask: bond.ask + (Math.random() - 0.5) * 0.3,
          yield: bond.yield + (Math.random() - 0.5) * 0.1,
          change: bond.change + (Math.random() - 0.5) * 0.2,
          volume: bond.volume + Math.floor((Math.random() - 0.5) * 100000),
        }))
      );

      setOrderBook(prev =>
        prev.map(level => ({
          ...level,
          bidSize: level.bidSize + Math.floor((Math.random() - 0.5) * 50000),
          askSize: level.askSize + Math.floor((Math.random() - 0.5) * 50000),
        }))
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => price.toFixed(2);
  const formatYield = (y: number) => y.toFixed(2);
  const formatVolume = (vol: number) => (vol / 1000000).toFixed(1) + 'M';

  return (
    <div className="w-full h-full bg-gradient-to-b from-nest-void to-nest-forest rounded-2xl overflow-hidden border" style={{ borderColor: glowValues.border }}>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: glowValues.border }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-display text-nest-gold-hi">Bond Desk</h2>
          <div className="flex items-center gap-2 text-xs font-mono text-nest-green">
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-nest-green"
            />
            LIVE MARKET DATA
          </div>
        </div>
        <p className="text-sm font-mono text-nest-sage">Real-time pricing, order book, and market intelligence</p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 h-[calc(100%-100px)] overflow-hidden">
        {/* Left: Bond list */}
        <div className="lg:col-span-2 overflow-y-auto">
          <div className="space-y-2">
            {bonds.map((bond) => (
              <motion.div
                key={bond.isin}
                onClick={() => setSelectedBond(bond)}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg border cursor-pointer transition-all duration-200"
                style={{
                  background: selectedBond?.isin === bond.isin ? 'rgba(212, 175, 55, 0.15)' : 'rgba(26, 47, 31, 0.4)',
                  borderColor: selectedBond?.isin === bond.isin ? glowValues.border : 'rgba(212, 175, 55, 0.1)',
                  boxShadow: selectedBond?.isin === bond.isin ? glowValues.shadow : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-mono font-semibold text-nest-cream">{bond.issuer}</p>
                    <p className="text-xs font-mono text-nest-sage">{bond.isin}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg text-nest-gold-hi">{formatPrice(bond.price)}</p>
                    <motion.p
                      animate={{ color: bond.change > 0 ? '#00ff88' : '#ff4444' }}
                      className="text-xs font-mono"
                    >
                      {bond.change > 0 ? '+' : ''}{bond.change.toFixed(2)}
                    </motion.p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <p className="text-nest-sage">Coupon</p>
                    <p className="text-nest-cream">{bond.coupon.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-nest-sage">Yield</p>
                    <p className="text-nest-cream">{formatYield(bond.yield)}%</p>
                  </div>
                  <div>
                    <p className="text-nest-sage">Spread</p>
                    <p className="text-nest-cream">{bond.spread}bp</p>
                  </div>
                  <div>
                    <p className="text-nest-sage">Volume</p>
                    <p className="text-nest-cream">{formatVolume(bond.volume)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Order book and details */}
        <div className="flex flex-col gap-4">
          {/* Order book */}
          <div className="border rounded-lg p-4" style={{ borderColor: glowValues.border }}>
            <p className="text-sm font-mono text-nest-sage mb-3">ORDER BOOK</p>
            <div className="space-y-1 text-xs font-mono">
              {orderBook.map((level) => (
                <motion.div
                  key={level.level}
                  className="flex items-center justify-between"
                  animate={{ opacity: [0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="flex-1">
                    <span className="text-nest-red">{level.bidSize.toLocaleString()}</span>
                    <span className="mx-2 text-nest-sage">@</span>
                    <span className="text-nest-red">{level.bidPrice.toFixed(2)}</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-nest-red/50 to-transparent rounded" />
                  <div className="flex-1 text-right">
                    <div className="w-8 h-1 bg-gradient-to-l from-nest-green/50 to-transparent rounded mb-1" />
                    <span className="text-nest-green">{level.askPrice.toFixed(2)}</span>
                    <span className="mx-2 text-nest-sage">@</span>
                    <span className="text-nest-green">{level.askSize.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bond details */}
          {selectedBond && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 flex-1 overflow-y-auto"
              style={{ borderColor: glowValues.border }}
            >
              <p className="text-sm font-mono text-nest-sage mb-3">SELECTED BOND</p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-nest-sage">Issuer:</span>
                  <span className="text-nest-cream">{selectedBond.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nest-sage">Maturity:</span>
                  <span className="text-nest-cream">{selectedBond.maturity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nest-sage">Bid/Ask:</span>
                  <span className="text-nest-cream">{formatPrice(selectedBond.bid)} / {formatPrice(selectedBond.ask)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nest-sage">Spread:</span>
                  <span className="text-nest-cream">{selectedBond.spread}bp</span>
                </div>
                <div className="h-px bg-nest-gold/20 my-2" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-3 py-2 rounded border font-mono text-xs font-semibold transition-all"
                  style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    borderColor: 'rgba(0, 255, 136, 0.3)',
                    color: '#00ff88',
                  }}
                >
                  BUY
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
