"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface BondData {
  id: string;
  name: string;
  tranche: 'A' | 'B' | 'C';
  size: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  yield: number;
  dscr: number;
  status: 'watch' | 'buy' | 'sell' | 'hold';
}

interface YieldCurve {
  period: string;
  yield: number;
  change: number;
}

export function AnimatedBondDesk() {
  const [bonds, setBonds] = useState<BondData[]>([
    {
      id: 'bond-a',
      name: 'Senior Lane',
      tranche: 'A',
      size: '$118M',
      price: 101.42,
      bid: 101.40,
      ask: 101.45,
      spread: 94,
      yield: 3.91,
      dscr: 1.41,
      status: 'hold',
    },
    {
      id: 'bond-b',
      name: 'B Sleeve',
      tranche: 'B',
      size: '$31M',
      price: 99.87,
      bid: 99.85,
      ask: 99.90,
      spread: 156,
      yield: 4.78,
      dscr: 1.15,
      status: 'watch',
    },
  ]);

  const [yields, setYields] = useState<YieldCurve[]>([
    { period: '2Y', yield: 3.98, change: -0.12 },
    { period: '3Y', yield: 3.91, change: -0.08 },
    { period: '5Y', yield: 3.78, change: -0.05 },
  ]);

  const [refinanceSignal, setRefinanceSignal] = useState(false);
  const [reissueSignal, setReissueSignal] = useState(false);
  const [liveRates, setLiveRates] = useState<any>(null);
  const [rateSource, setRateSource] = useState("loading");

  // Fetch live FRED rates on mount and every 60s
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("/api/market/rates/live");
        const json = await res.json();
        if (json.success && json.data?.rates) {
          const r = json.data.rates;
          setLiveRates(r);
          setRateSource(json.data.source || "live");

          // Update yields from real FRED data
          setYields([
            { period: "2Y", yield: r.treasury_2yr || 4.07, change: 0 },
            { period: "5Y", yield: r.treasury_5yr || 4.05, change: 0 },
            { period: "10Y", yield: r.treasury_10yr || 4.61, change: 0 },
            { period: "30Y", yield: r.treasury_30yr || 4.52, change: 0 },
          ]);

          // Update bond pricing based on real rates
          const baseRate = r.treasury_10yr || 4.61;
          setBonds(prev => prev.map(bond => ({
            ...bond,
            yield: bond.tranche === "A" ? baseRate + 0.5 : baseRate + 1.5,
            spread: bond.tranche === "A" ? Math.round((r.ig_spread || 1.12) * 100) : Math.round((r.hy_spread || 3.45) * 100),
          })));

          // Real refinance signal — curve inverted or rates dropped
          if (r.curve_inverted) {
            setRefinanceSignal(true);
            setTimeout(() => setRefinanceSignal(false), 5000);
          }
        }
      } catch {
        setRateSource("offline");
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000);

    // Small price jitter between FRED polls (realistic market simulation)
    const jitter = setInterval(() => {
      setBonds(prev => prev.map(bond => ({
        ...bond,
        price: bond.price + (Math.random() - 0.5) * 0.15,
        bid: bond.bid + (Math.random() - 0.5) * 0.08,
        ask: bond.ask + (Math.random() - 0.5) * 0.08,
      })));
    }, 3000);

    return () => { clearInterval(interval); clearInterval(jitter); };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'buy':
        return 'text-emerald-400 border-emerald-400/30';
      case 'sell':
        return 'text-red-400 border-red-400/30';
      case 'hold':
        return 'text-amber-400 border-amber-400/30';
      case 'watch':
        return 'text-cyan-400 border-cyan-400/30';
      default:
        return 'text-gray-400 border-gray-400/30';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-black/40 rounded-lg border border-cyan-400/20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-cyan-300">BOND DESK</h2>
        <p className="text-sm text-cyan-200/60">Bloomberg Terminal · Real-time Market Grid</p>
      </div>

      {/* Alert Signals */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          animate={refinanceSignal ? { scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)' } : {}}
          className={`p-4 border rounded-lg ${refinanceSignal ? 'border-emerald-400 bg-emerald-400/10' : 'border-emerald-400/20 bg-emerald-400/5'}`}
        >
          <div className="flex items-center gap-2">
            {refinanceSignal ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <AlertCircle className="text-emerald-400" size={20} />
              </motion.div>
            ) : (
              <CheckCircle className="text-emerald-400/40" size={20} />
            )}
            <div>
              <p className="text-xs font-semibold text-emerald-300">REFINANCE SIGNAL</p>
              <p className="text-xs text-emerald-200/60">{refinanceSignal ? 'Optimal window detected' : 'Monitoring rates'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={reissueSignal ? { scale: 1.05, boxShadow: '0 0 20px rgba(251, 146, 60, 0.6)' } : {}}
          className={`p-4 border rounded-lg ${reissueSignal ? 'border-orange-400 bg-orange-400/10' : 'border-orange-400/20 bg-orange-400/5'}`}
        >
          <div className="flex items-center gap-2">
            {reissueSignal ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <AlertCircle className="text-orange-400" size={20} />
              </motion.div>
            ) : (
              <CheckCircle className="text-orange-400/40" size={20} />
            )}
            <div>
              <p className="text-xs font-semibold text-orange-300">REISSUE SIGNAL</p>
              <p className="text-xs text-orange-200/60">{reissueSignal ? 'Credit improvement detected' : 'Monitoring credit'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Yield Curve */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-cyan-300">YIELD CURVE</h3>
        <div className="grid grid-cols-3 gap-3">
          {yields.map((y, i) => (
            <motion.div
              key={y.period}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 bg-cyan-400/5 border border-cyan-400/20 rounded"
            >
              <p className="text-xs text-cyan-300 font-mono">{y.period}</p>
              <motion.p
                key={`${y.period}-${y.yield}`}
                animate={{ color: y.change > 0 ? '#22c55e' : '#ef4444' }}
                className="text-lg font-bold font-mono"
              >
                {y.yield.toFixed(2)}%
              </motion.p>
              <p className={`text-xs font-mono ${y.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {y.change > 0 ? '+' : ''}{y.change.toFixed(2)}%
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bond Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-cyan-300">ACTIVE BONDS</h3>
        <div className="space-y-2">
          {bonds.map((bond, i) => (
            <motion.div
              key={bond.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 bg-black/30 border rounded-lg ${getStatusColor(bond.status)}`}
            >
              <div className="grid grid-cols-6 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">TRANCHE</p>
                  <p className="font-bold text-cyan-300">{bond.tranche}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">SIZE</p>
                  <p className="font-bold text-cyan-300">{bond.size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">PRICE</p>
                  <motion.p
                    key={`price-${bond.price}`}
                    animate={{ color: bond.price > 101 ? '#22c55e' : '#ef4444' }}
                    className="font-bold font-mono"
                  >
                    {bond.price.toFixed(2)}
                  </motion.p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">BID/ASK</p>
                  <p className="font-mono text-xs">
                    <span className="text-emerald-400">{bond.bid.toFixed(2)}</span>
                    {' / '}
                    <span className="text-red-400">{bond.ask.toFixed(2)}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">YIELD</p>
                  <motion.p
                    key={`yield-${bond.yield}`}
                    animate={{ color: bond.yield > 3.8 ? '#ef4444' : '#22c55e' }}
                    className="font-bold font-mono"
                  >
                    {bond.yield.toFixed(2)}%
                  </motion.p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">DSCR</p>
                  <p className="font-bold font-mono">{bond.dscr.toFixed(2)}x</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spread Watch */}
      <div className="p-4 bg-black/30 border border-amber-400/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-300 font-semibold">SPREAD WATCH</p>
            <p className="text-sm text-amber-200">+94bp · Monitoring market conditions</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl font-bold text-amber-400"
          >
            94bp
          </motion.div>
        </div>
      </div>

      {/* DSCR Target */}
      <div className="p-4 bg-black/30 border border-emerald-400/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-300 font-semibold">DSCR TARGET</p>
            <p className="text-sm text-emerald-200">Debt Service Coverage Ratio</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl font-bold text-emerald-400"
          >
            1.41x
          </motion.div>
        </div>
      </div>
    </div>
  );
}
