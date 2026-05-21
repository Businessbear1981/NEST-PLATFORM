import React, { createContext, useContext, useState, useEffect } from 'react';
import { designTokens } from '@/styles/designSystem';

interface GlowContextType {
  isGlowOn: boolean;
  toggleGlow: () => void;
  glowIntensity: number;
  setGlowIntensity: (intensity: number) => void;
}

const GlowContext = createContext<GlowContextType | undefined>(undefined);

export function GlowProvider({ children }: { children: React.ReactNode }) {
  const [isGlowOn, setIsGlowOn] = useState(true);
  const [glowIntensity, setGlowIntensity] = useState(1);

  // Persist glow state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nest-glow-on');
    if (saved !== null) {
      setIsGlowOn(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nest-glow-on', JSON.stringify(isGlowOn));
  }, [isGlowOn]);

  // Apply glow CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    const glowState = isGlowOn ? 'on' : 'off';

    // Set CSS custom properties for glow system
    root.style.setProperty('--glow-state', glowState);
    root.style.setProperty('--glow-intensity', glowIntensity.toString());

    // Apply glow filters to body
    if (isGlowOn) {
      document.body.style.filter = `brightness(1.05) contrast(1.1)`;
    } else {
      document.body.style.filter = 'brightness(1) contrast(1)';
    }
  }, [isGlowOn, glowIntensity]);

  const toggleGlow = () => {
    setIsGlowOn(prev => !prev);
  };

  return (
    <GlowContext.Provider value={{ isGlowOn, toggleGlow, glowIntensity, setGlowIntensity }}>
      {children}
    </GlowContext.Provider>
  );
}

export function useGlow() {
  const context = useContext(GlowContext);
  if (context === undefined) {
    throw new Error('useGlow must be used within GlowProvider');
  }
  return context;
}

/**
 * Hook to get glow system values based on current state
 */
export function useGlowSystem() {
  const { isGlowOn } = useGlow();
  const glowState = isGlowOn ? 'on' : 'off';

  return {
    glowState,
    gold: designTokens.glowSystem[glowState].gold,
    cyan: designTokens.glowSystem[glowState].cyan,
    fuchsia: designTokens.glowSystem[glowState].fuchsia,
    text: designTokens.glowSystem[glowState].text,
    shadow: designTokens.glowSystem[glowState === 'on' ? 'shadowOn' : 'shadowOff'],
    border: designTokens.glowSystem[glowState === 'on' ? 'borderOn' : 'borderOff'],
  };
}
