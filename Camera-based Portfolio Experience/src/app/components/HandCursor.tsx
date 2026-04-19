import { motion } from 'motion/react';

interface HandCursorProps {
  x: number;
  y: number;
  isPinching: boolean;
  isFocused: boolean;
  dwellProgress: number;
}

export function HandCursor({ x, y, isPinching, isFocused, dwellProgress }: HandCursorProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (dwellProgress * circumference);

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: x,
        top: y,
        x: '-50%',
        y: '-50%',
      }}
      animate={{
        scale: isPinching ? 0.85 : 1,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full border-3 bg-white/10 backdrop-blur-sm"
          animate={{
            borderColor: isFocused ? 'rgba(99, 102, 241, 0.9)' : 'rgba(255, 255, 255, 0.7)',
            backgroundColor: isFocused ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            scale: isPinching ? 0.9 : 1,
          }}
          style={{
            borderWidth: '3px',
          }}
          transition={{ duration: 0.15 }}
        />

        {isFocused && dwellProgress > 0 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="rgba(99, 102, 241, 0.9)"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
        )}

        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{
            scale: 1.4,
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="w-3 h-3 rounded-full"
            animate={{
              backgroundColor: isFocused ? 'rgba(99, 102, 241, 1)' : 'rgba(255, 255, 255, 0.9)',
              scale: isPinching ? 1.3 : 1,
            }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
