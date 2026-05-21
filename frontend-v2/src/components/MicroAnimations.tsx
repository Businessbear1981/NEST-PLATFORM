import React from 'react';
import { motion } from 'framer-motion';

/**
 * Fade-in animation for content
 */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

/**
 * Slide-in animation from left
 */
export const slideInLeftVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

/**
 * Slide-in animation from right
 */
export const slideInRightVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

/**
 * Scale-up animation
 */
export const scaleUpVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

/**
 * Stagger container for animating multiple children
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Pulse animation for attention
 */
export const pulseVariants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

/**
 * Bounce animation for interactive elements
 */
export const bounceVariants = {
  hover: {
    y: -4,
    transition: { duration: 0.2 },
  },
  tap: {
    y: 0,
    transition: { duration: 0.1 },
  },
};

/**
 * Glow pulse animation
 */
export const glowPulseVariants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(212, 175, 55, 0.6)',
      '0 0 40px rgba(212, 175, 55, 0.9)',
      '0 0 20px rgba(212, 175, 55, 0.6)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

/**
 * Shimmer loading effect
 */
interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className = '' }: ShimmerProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-nest-forest via-nest-pine to-nest-forest bg-[length:200%_100%] ${className}`}
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

/**
 * Animated counter for numbers
 */
interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function AnimatedCounter({ 
  from, 
  to, 
  duration = 1, 
  className = '',
  suffix = '' 
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const steps = 60;
    const stepDuration = (duration * 1000) / steps;
    const increment = (to - from) / steps;

    let current = from;
    const interval = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= to) || (increment < 0 && current <= to)) {
        setCount(to);
        clearInterval(interval);
      } else {
        setCount(Math.round(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [from, to, duration]);

  return <span className={className}>{count}{suffix}</span>;
}

/**
 * Tooltip with animation
 */
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`absolute ${positionClasses[position]} z-50 px-3 py-2 bg-nest-void border border-nest-gold/30 rounded text-xs font-mono text-nest-cream whitespace-nowrap`}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Animated list item
 */
interface AnimatedListItemProps {
  children: React.ReactNode;
  index?: number;
}

export function AnimatedListItem({ children, index = 0 }: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Page transition wrapper
 */
interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hover scale effect
 */
interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
}

export function HoverScale({ children, scale = 1.05 }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Success checkmark animation
 */
export function SuccessCheckmark() {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="text-nest-green"
    >
      <motion.polyline
        points="20 6 9 17 4 12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
    </motion.svg>
  );
}

/**
 * Error X animation
 */
export function ErrorX() {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ scale: 0, rotate: 45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="text-nest-red"
    >
      <motion.line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      <motion.line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </motion.svg>
  );
}
