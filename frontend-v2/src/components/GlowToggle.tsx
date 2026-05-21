import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ZapOff } from 'lucide-react';
import { useGlow, useGlowSystem } from '@/contexts/GlowContext';

export function GlowToggle() {
  const { isGlowOn, toggleGlow, glowIntensity, setGlowIntensity } = useGlow();
  const glowValues = useGlowSystem();

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
      {/* Glow Intensity Slider */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg"
        style={{
          background: 'rgba(26, 47, 31, 0.6)',
          border: glowValues.border,
          boxShadow: glowValues.shadow,
        }}
      >
        <span className="text-xs font-mono text-nest-sage">INTENSITY</span>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={glowIntensity}
          onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
          className="w-24 h-1 bg-nest-forest rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.4) ${(glowIntensity - 0.5) * 50}%, rgba(212, 175, 55, 0.2) ${(glowIntensity - 0.5) * 50}%, rgba(212, 175, 55, 0.2) 100%)`,
          }}
        />
        <span className="text-xs font-mono text-nest-gold w-8 text-right">{glowIntensity.toFixed(1)}x</span>
      </motion.div>

      {/* Glow Toggle Button */}
      <motion.button
        onClick={toggleGlow}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all duration-300 flex items-center gap-2"
        style={{
          background: isGlowOn ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.1)',
          border: glowValues.border,
          color: isGlowOn ? '#e8c547' : '#d4af37',
          boxShadow: glowValues.shadow,
          filter: glowValues.gold,
        }}
      >
        <motion.div
          animate={{ rotate: isGlowOn ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {isGlowOn ? (
            <Zap className="w-4 h-4" />
          ) : (
            <ZapOff className="w-4 h-4" />
          )}
        </motion.div>
        <span>{isGlowOn ? 'GLOW ON' : 'GLOW OFF'}</span>

        {/* Pulse effect when ON */}
        {isGlowOn && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{ opacity: [0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              boxShadow: 'inset 0 0 20px rgba(212, 175, 55, 0.3)',
            }}
          />
        )}
      </motion.button>

      {/* Status Indicator */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono"
        style={{
          background: 'rgba(26, 47, 31, 0.4)',
          border: glowValues.border,
          color: isGlowOn ? '#00ff88' : '#7a9b8e',
        }}
      >
        <motion.div
          animate={{ opacity: isGlowOn ? [1, 0.5] : 1 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 rounded-full"
          style={{
            background: isGlowOn ? '#00ff88' : '#7a9b8e',
            boxShadow: isGlowOn ? '0 0 8px rgba(0, 255, 136, 0.6)' : 'none',
          }}
        />
        <span>{isGlowOn ? 'ACTIVE' : 'DORMANT'}</span>
      </motion.div>
    </div>
  );
}
