"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useGlowSystem } from '@/contexts/GlowContext';

/**
 * Loading skeleton component for production use
 */
export function LoadingSkeleton() {
  const glowValues = useGlowSystem();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-gradient-to-b from-nest-void to-nest-forest rounded-2xl p-6"
      style={{ borderColor: glowValues.border }}
    >
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="h-16 bg-nest-forest/50 rounded-lg border"
            style={{ borderColor: glowValues.border }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Production error state component
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  details?: string;
}

export function ErrorState({ 
  title = 'Error', 
  message = 'Something went wrong', 
  onRetry,
  details 
}: ErrorStateProps) {
  const glowValues = useGlowSystem();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex items-center justify-center bg-gradient-to-b from-nest-void to-nest-forest rounded-2xl p-6"
    >
      <div className="max-w-md w-full p-6 rounded-lg border-2" style={{ 
        borderColor: 'rgba(255, 68, 68, 0.5)',
        background: 'rgba(10, 14, 39, 0.8)',
      }}>
        <div className="flex items-center justify-center mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="w-12 h-12 text-nest-red" />
          </motion.div>
        </div>

        <h3 className="text-lg font-display text-nest-cream text-center mb-2">{title}</h3>
        <p className="text-sm font-mono text-nest-sage text-center mb-4">{message}</p>

        {details && (
          <div className="mb-4 p-3 bg-nest-red/10 border border-nest-red/30 rounded text-xs font-mono text-nest-red/80 overflow-auto max-h-24">
            {details}
          </div>
        )}

        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="w-full py-2 px-4 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: 'rgba(212, 175, 55, 0.2)',
              border: glowValues.border,
              color: '#e8c547',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Empty state component for production use
 */
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ 
  title = 'No Data', 
  message = 'Nothing to display',
  icon,
  action 
}: EmptyStateProps) {
  const glowValues = useGlowSystem();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex items-center justify-center bg-gradient-to-b from-nest-void to-nest-forest rounded-2xl p-6"
    >
      <div className="text-center max-w-md">
        {icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 flex justify-center"
          >
            {icon}
          </motion.div>
        )}
        <h3 className="text-lg font-display text-nest-cream mb-2">{title}</h3>
        <p className="text-sm font-mono text-nest-sage mb-4">{message}</p>

        {action && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="px-6 py-2 rounded-lg font-mono text-sm font-semibold transition-all"
            style={{
              background: 'rgba(212, 175, 55, 0.2)',
              border: glowValues.border,
              color: '#e8c547',
            }}
          >
            {action.label}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Loading spinner component
 */
interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  const glowValues = useGlowSystem();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex items-center justify-center bg-gradient-to-b from-nest-void to-nest-forest rounded-2xl"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mb-4 flex justify-center"
        >
          <Loader2 className="w-12 h-12 text-nest-gold-hi" style={{ filter: glowValues.gold }} />
        </motion.div>
        <p className="font-mono text-sm text-nest-sage">{message}</p>
      </div>
    </motion.div>
  );
}

/**
 * Inline loading indicator
 */
export function InlineLoader() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className="inline-block"
    >
      <Loader2 className="w-4 h-4 text-nest-gold-hi" />
    </motion.div>
  );
}

/**
 * Data loading state wrapper
 */
interface DataLoadingProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  errorTitle?: string;
}

export function DataLoading({
  isLoading,
  isError,
  error,
  isEmpty,
  children,
  onRetry,
  loadingMessage,
  emptyMessage,
  errorTitle,
}: DataLoadingProps) {
  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={errorTitle}
        message={error?.message || 'Failed to load data'}
        onRetry={onRetry}
        details={process.env.NODE_ENV === 'development' ? error?.stack : undefined}
      />
    );
  }

  if (isEmpty) {
    return <EmptyState message={emptyMessage} />;
  }

  return <>{children}</>;
}
