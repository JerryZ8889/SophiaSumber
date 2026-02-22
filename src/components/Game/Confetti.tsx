import { motion } from 'motion/react';
import { useMemo } from 'react';

const COLORS = [
  '#f43f5e', '#a855f7', '#3b82f6', '#10b981',
  '#f59e0b', '#06b6d4', '#ec4899', '#84cc16',
];

interface Particle {
  id: number;
  x: number;
  color: string;
  w: number;
  h: number;
  delay: number;
  duration: number;
  rotate: number;
  drift: number;
  isCircle: boolean;
}

export function Confetti({ count = 90 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 7 + 5,
      h: Math.random() * 10 + 6,
      delay: Math.random() * 1.0,
      duration: Math.random() * 1.6 + 2.2,
      rotate: Math.random() * 800 - 400,
      drift: (Math.random() - 0.5) * 120,
      isCircle: Math.random() > 0.6,
    })),
  [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 80 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -30, x: 0, opacity: 1, rotate: 0, scaleY: 1 }}
          animate={{
            y: '110vh',
            x: p.drift,
            opacity: [1, 1, 1, 0.8, 0],
            rotate: p.rotate,
            scaleY: [1, 0.6, 1, 0.7, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { times: [0, 0.5, 0.7, 0.85, 1] },
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.x}%`,
            width: p.w,
            height: p.isCircle ? p.w : p.h,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            boxShadow: `0 0 4px ${p.color}80`,
          }}
        />
      ))}
    </div>
  );
}
