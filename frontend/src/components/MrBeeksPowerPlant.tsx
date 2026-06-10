import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGlowSystem } from '@/contexts/GlowContext';

interface PowerNode {
  id: string;
  label: string;
  x: number;
  y: number;
  power: number;
  status: 'active' | 'idle' | 'warning' | 'critical';
}

interface PowerFlow {
  from: string;
  to: string;
  intensity: number;
}

export function MrBeeksPowerPlant() {
  const glowValues = useGlowSystem();
  const [powerNodes, setPowerNodes] = useState<PowerNode[]>([
    // Layer 1: AI Brain nodes
    { id: 'claude', label: 'Claude', x: 20, y: 30, power: 0.85, status: 'active' },
    { id: 'grok', label: 'Grok', x: 50, y: 20, power: 0.92, status: 'active' },
    { id: 'bloomberg', label: 'Bloomberg', x: 80, y: 30, power: 0.78, status: 'active' },

    // Layer 2: Module nodes
    { id: 'bond-desk', label: 'Bond Desk', x: 15, y: 60, power: 0.88, status: 'active' },
    { id: 'rating', label: 'Rating', x: 35, y: 65, power: 0.75, status: 'idle' },
    { id: 'surety', label: 'Surety', x: 55, y: 60, power: 0.82, status: 'active' },
    { id: 'm&a', label: 'M&A', x: 75, y: 65, power: 0.68, status: 'idle' },

    // Layer 3: Orchestration node
    { id: 'bernard', label: 'Bernard', x: 50, y: 85, power: 0.95, status: 'active' },
  ]);

  const [powerFlows, setPowerFlows] = useState<PowerFlow[]>([
    // AI to Modules
    { from: 'claude', to: 'bond-desk', intensity: 0.7 },
    { from: 'grok', to: 'bond-desk', intensity: 0.8 },
    { from: 'grok', to: 'm&a', intensity: 0.6 },
    { from: 'bloomberg', to: 'rating', intensity: 0.7 },
    { from: 'claude', to: 'surety', intensity: 0.75 },

    // Modules to Bernard
    { from: 'bond-desk', to: 'bernard', intensity: 0.85 },
    { from: 'rating', to: 'bernard', intensity: 0.6 },
    { from: 'surety', to: 'bernard', intensity: 0.75 },
    { from: 'm&a', to: 'bernard', intensity: 0.5 },
  ]);

  // Simulate power fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerNodes(prev =>
        prev.map(node => ({
          ...node,
          power: Math.max(0.5, Math.min(1, node.power + (Math.random() - 0.5) * 0.15)),
        }))
      );

      setPowerFlows(prev =>
        prev.map(flow => ({
          ...flow,
          intensity: Math.max(0.3, Math.min(1, flow.intensity + (Math.random() - 0.5) * 0.2)),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#00ff88';
      case 'idle':
        return '#7a9b8e';
      case 'warning':
        return '#ffaa00';
      case 'critical':
        return '#ff4444';
      default:
        return '#d4af37';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'active':
        return 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.6))';
      case 'idle':
        return 'drop-shadow(0 0 8px rgba(122, 155, 142, 0.3))';
      case 'warning':
        return 'drop-shadow(0 0 12px rgba(255, 170, 0, 0.5))';
      case 'critical':
        return 'drop-shadow(0 0 12px rgba(255, 68, 68, 0.6))';
      default:
        return glowValues.gold;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-nest-void to-nest-forest rounded-2xl overflow-hidden">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-display text-nest-gold-hi mb-2">Mr. Beeks Power Plant</h2>
        <p className="text-sm font-mono text-nest-sage">Central Power Orchestration System</p>
      </div>

      {/* SVG Canvas for Power Flows */}
      <svg
        viewBox="0 0 100 100"
        className="w-full max-w-2xl h-96 mb-8"
        style={{ background: 'rgba(10, 14, 39, 0.3)' }}
      >
        {/* Power flow lines */}
        {powerFlows.map((flow, idx) => {
          const fromNode = powerNodes.find(n => n.id === flow.from);
          const toNode = powerNodes.find(n => n.id === flow.to);

          if (!fromNode || !toNode) return null;

          return (
            <motion.line
              key={`flow-${idx}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#d4af37"
              strokeWidth={flow.intensity * 0.8}
              opacity={flow.intensity * 0.6}
              animate={{ opacity: [flow.intensity * 0.4, flow.intensity * 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          );
        })}

        {/* Power nodes */}
        {powerNodes.map((node) => (
          <g key={node.id}>
            {/* Outer glow circle */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={3 + node.power * 2}
              fill="none"
              stroke={getStatusColor(node.status)}
              strokeWidth={0.5}
              opacity={0.3}
              animate={{ r: [3 + node.power * 2, 4 + node.power * 2.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Main node circle */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={2}
              fill={getStatusColor(node.status)}
              animate={{ r: [2, 2.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ filter: getStatusGlow(node.status) }}
            />

            {/* Power level indicator */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={1.5}
              fill="none"
              stroke={getStatusColor(node.status)}
              strokeWidth={node.power * 0.3}
              opacity={node.power}
            />
          </g>
        ))}
      </svg>

      {/* Power Nodes Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {powerNodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg border"
            style={{
              background: 'rgba(26, 47, 31, 0.4)',
              borderColor: getStatusColor(node.status),
              boxShadow: `0 0 8px ${getStatusColor(node.status)}40`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-nest-cream font-semibold">{node.label}</span>
              <motion.div
                className="w-2 h-2 rounded-full"
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ background: getStatusColor(node.status) }}
              />
            </div>

            {/* Power bar */}
            <div className="w-full h-1 bg-nest-void rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${node.power * 100}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  background: `linear-gradient(90deg, ${getStatusColor(node.status)}, ${getStatusColor(node.status)}80)`,
                }}
              />
            </div>

            {/* Power percentage */}
            <div className="text-xs font-mono text-nest-sage mt-1">
              {Math.round(node.power * 100)}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Status Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 w-full p-4 rounded-lg border border-nest-gold/30 bg-nest-void/50"
      >
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-nest-sage">SYSTEM STATUS</span>
          <motion.span
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-nest-green"
          >
            ● OPERATIONAL
          </motion.span>
        </div>
        <div className="mt-2 text-xs text-nest-cream">
          <p>Active Nodes: {powerNodes.filter(n => n.status === 'active').length}/{powerNodes.length}</p>
          <p>Average Power: {Math.round((powerNodes.reduce((sum, n) => sum + n.power, 0) / powerNodes.length) * 100)}%</p>
          <p>Data Flows: {powerFlows.length} active connections</p>
        </div>
      </motion.div>
    </div>
  );
}
