import { motion, AnimatePresence } from 'motion/react';
import { GameMode } from '../../hooks/useGameLogic';
import { Clock, Zap } from 'lucide-react';

interface HUDProps {
  score: number;
  target: number;
  timeLeft: number;
  mode: GameMode;
  currentSum: number;
  level: number;
  overshoot: boolean;
}

export function HUD({ score, target, timeLeft, mode, currentSum, level, overshoot }: HUDProps) {
  const isMatch = currentSum > 0 && currentSum === target;
  const timePercent = (timeLeft / 10) * 100;
  const timeIsLow = timeLeft <= 3;

  return (
    <div className="w-full max-w-[400px] mb-3 flex flex-col gap-2.5">

      {/* Top row: score, level, mode */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] font-bold">Score</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={score}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl font-mono font-black text-white leading-none tabular-nums"
            >
              {score.toString().padStart(6, '0')}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold font-mono">LV.{level}</span>
          </div>

          <div className={`
            text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border
            ${mode === 'classic'
              ? 'bg-white/8 text-zinc-300 border-zinc-700'
              : 'bg-violet-500/15 text-violet-300 border-violet-500/30'
            }
          `}>
            {mode}
          </div>
        </div>
      </div>

      {/* Target + Sum panels */}
      <div className="flex gap-2.5">

        {/* Target */}
        <div className="flex-1 bg-zinc-900 rounded-2xl p-3.5 flex flex-col items-center border border-zinc-800 relative overflow-hidden">
          <span className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] font-bold mb-1">Target</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={target}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-mono font-black text-white leading-none tabular-nums"
            >
              {target}
            </motion.span>
          </AnimatePresence>

          {/* Time progress bar */}
          {mode === 'time' && (
            <motion.div
              className={`absolute bottom-0 left-0 h-[3px] ${timeIsLow ? 'bg-red-500' : 'bg-violet-500'}`}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          )}
        </div>

        {/* Current Sum */}
        <div className={`
          flex-1 rounded-2xl p-3.5 flex flex-col items-center border transition-all duration-200 relative overflow-hidden
          ${overshoot
            ? 'bg-red-950/60 border-red-500/60'
            : isMatch
              ? 'bg-emerald-950/60 border-emerald-500/50'
              : 'bg-zinc-900 border-zinc-800'
          }
        `}>
          <span className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] font-bold mb-1">Sum</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={currentSum}
              initial={{ scale: 1.25, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className={`
                text-4xl font-mono font-black leading-none tabular-nums
                ${overshoot ? 'text-red-400' : isMatch ? 'text-emerald-400' : 'text-zinc-200'}
              `}
            >
              {currentSum}
            </motion.span>
          </AnimatePresence>

          {isMatch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-emerald-400/5 pointer-events-none"
            />
          )}
        </div>

        {/* Time display for time mode */}
        {mode === 'time' && (
          <div className={`
            w-16 rounded-2xl p-3 flex flex-col items-center justify-center border transition-all duration-300
            ${timeIsLow
              ? 'bg-red-950/60 border-red-500/50'
              : 'bg-zinc-900 border-zinc-800'
            }
          `}>
            <Clock className={`w-3.5 h-3.5 mb-1 ${timeIsLow ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`} />
            <span className={`text-xl font-mono font-black leading-none ${timeIsLow ? 'text-red-400' : 'text-zinc-300'}`}>
              {timeLeft}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
