"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGlowSystem } from '@/contexts/GlowContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export function NESTKingHero() {
  const glowValues = useGlowSystem();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-nest-void via-nest-forest to-nest-void overflow-hidden">
      {/* Background animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(212,175,55,.05)_25%,rgba(212,175,55,.05)_26%,transparent_27%,transparent_74%,rgba(212,175,55,.05)_75%,rgba(212,175,55,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(212,175,55,.05)_25%,rgba(212,175,55,.05)_26%,transparent_27%,transparent_74%,rgba(212,175,55,.05)_75%,rgba(212,175,55,.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
      </div>

      {/* Radial glow background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-nest-gold/20 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Top section: Title and tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-7xl md:text-8xl font-display text-nest-gold-hi mb-4">
            NEST
          </h1>
          <p className="text-lg md:text-2xl font-ui text-nest-sage mb-2">
            Institutional Command Platform
          </p>
          <p className="text-sm md:text-base font-mono text-nest-cream/60">
            Route • Score • Govern
          </p>
        </motion.div>

        {/* Center: NEST King Chess Piece / Tree Logo */}
        <motion.div
          className="relative mb-12"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          animate={{ y: isHovered ? -20 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Outer glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: '320px',
              height: '320px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              boxShadow: glowValues.gold,
            }}
          />

          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1.2, 1.4, 1.2] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              width: '400px',
              height: '400px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              border: '1px solid rgba(212, 175, 55, 0.1)',
            }}
          />

          {/* King Chess Piece / Tree Image Container */}
          <motion.div
            className="relative w-64 h-64 flex items-center justify-center"
            animate={{ rotateY: isHovered ? 360 : 0 }}
            transition={{ duration: 1.5 }}
          >
            {/* Placeholder for NEST King logo - would be replaced with actual image */}
            <div
              className="w-full h-full rounded-2xl border-2 flex items-center justify-center text-center p-4"
              style={{
                background: 'rgba(26, 47, 31, 0.4)',
                borderColor: glowValues.border,
                boxShadow: glowValues.shadow,
              }}
            >
              <div>
                <Sparkles className="w-24 h-24 text-nest-gold mx-auto mb-4" />
                <p className="text-sm font-mono text-nest-sage">NEST KING</p>
                <p className="text-xs font-mono text-nest-cream/50 mt-2">Central Authority</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom section: Call to action and modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center max-w-2xl"
        >
          <p className="text-nest-cream mb-8 leading-relaxed">
            The institutional command platform for bond finance, M&A intelligence, and governed operations. 
            Powered by Bernard AI and the Payload architecture.
          </p>

          {/* Module grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Bond Desk', icon: '📊' },
              { label: 'Rating Room', icon: '⭐' },
              { label: 'Surety', icon: '🛡️' },
              { label: 'M&A', icon: '🎯' },
              { label: 'Roots', icon: '🌳' },
              { label: 'Covenant', icon: '📋' },
              { label: 'KYC', icon: '👤' },
              { label: 'Approvals', icon: '✓' },
            ].map((module, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="p-3 rounded-lg border"
                style={{
                  background: 'rgba(26, 47, 31, 0.3)',
                  borderColor: glowValues.border,
                }}
              >
                <div className="text-2xl mb-1">{module.icon}</div>
                <p className="text-xs font-mono text-nest-sage">{module.label}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-mono text-sm font-semibold transition-all duration-300"
            style={{
              background: 'rgba(212, 175, 55, 0.2)',
              border: glowValues.border,
              color: '#e8c547',
              boxShadow: glowValues.shadow,
            }}
          >
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>

      {/* Floating particles effect */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-nest-gold/30"
          animate={{
            x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
            y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
