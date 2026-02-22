import { GameMode } from '../../hooks/useGameLogic';

interface HUDProps {
  score: number;
  target: number;
  timeLeft: number;
  mode: GameMode;
  currentSum: number;
}

export function HUD({ score, target, timeLeft, mode, currentSum }: HUDProps) {
  return (
    <div className="w-full max-w-[400px] mb-4 flex flex-col gap-4">
      {/* Top Bar: Score & Mode */}
      <div className="flex justify-between items-center text-zinc-400 font-mono text-sm">
        <span>SCORE: {score.toString().padStart(6, '0')}</span>
        <span className="uppercase">{mode} MODE</span>
      </div>

      {/* Main Display: Target */}
      <div className="flex gap-4">
        <div className="flex-1 bg-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center border border-zinc-700 relative overflow-hidden">
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">Target</span>
          <span className="text-5xl font-mono font-bold text-white tracking-tighter relative z-10">
            {target}
          </span>
          {/* Progress Bar for Time Mode */}
          {mode === 'time' && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          )}
        </div>

        {/* Current Sum Display */}
        <div className={`flex-1 rounded-xl p-4 flex flex-col items-center justify-center border transition-colors duration-200
          ${currentSum > target ? 'bg-red-900/20 border-red-500/50' : 
            currentSum === target ? 'bg-emerald-900/20 border-emerald-500/50' : 
            'bg-zinc-800 border-zinc-700'}
        `}>
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">Sum</span>
          <span className={`text-4xl font-mono font-bold tracking-tighter
            ${currentSum > target ? 'text-red-400' : 
              currentSum === target ? 'text-emerald-400' : 
              'text-zinc-300'}
          `}>
            {currentSum}
          </span>
        </div>
      </div>
    </div>
  );
}
