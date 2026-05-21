import { motion } from 'framer-motion';
import { getToggleClasses, type AccentColor } from '@/lib/toggleUtils';

interface ToggleItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  accent: AccentColor;
  onClick?: () => void;
  badge?: string;
  badgeColor?: 'red' | 'amber' | 'green';
}

export function ToggleItem({
  id,
  label,
  icon,
  isActive,
  accent,
  onClick,
  badge,
  badgeColor = 'green',
}: ToggleItemProps) {
  const classes = getToggleClasses(isActive, accent);

  return (
    <motion.button
      key={id}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer ${classes.container}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      {icon && (
        <div className={`flex-shrink-0 ${classes.icon}`}>
          {icon}
        </div>
      )}
      
      <div className="flex-1 text-left">
        <div className={`text-sm font-medium ${classes.text}`}>
          {label}
        </div>
      </div>

      {badge && (
        <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
          badgeColor === 'red' ? 'bg-red-500/20 text-red-300' :
          badgeColor === 'amber' ? 'bg-amber-500/20 text-amber-300' :
          'bg-emerald-500/20 text-emerald-300'
        }`}>
          {badge}
        </div>
      )}

      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            boxShadow: `inset 0 0 10px rgba(196, 160, 72, 0.1)`,
          }}
        />
      )}
    </motion.button>
  );
}
