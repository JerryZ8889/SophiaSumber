import { useGameLogic } from './hooks/useGameLogic';
import { Board } from './components/Game/Board';
import { HUD } from './components/Game/HUD';
import { motion } from 'motion/react';
import { Play, Clock, RotateCcw, Trophy } from 'lucide-react';

export default function App() {
  const {
    gameState,
    score,
    blocks,
    selectedIds,
    target,
    timeLeft,
    mode,
    startGame,
    toggleBlock,
  } = useGameLogic();

  const currentSum = blocks
    .filter(b => selectedIds.includes(b.id))
    .reduce((acc, b) => acc + b.value, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 font-sans select-none">
      
      {gameState === 'menu' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
              SUM<br/>GRID
            </h1>
            <p className="text-zinc-400 text-lg">Clear blocks. Don't reach the top.</p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => startGame('classic')}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 text-left transition-transform active:scale-95 hover:bg-zinc-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-black flex items-center gap-2">
                    <Play className="w-6 h-6 fill-black" />
                    Classic
                  </h3>
                  <p className="text-zinc-500 mt-1">Add rows on success. Survive.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => startGame('time')}
              className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-left transition-transform active:scale-95 hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Time Attack
                  </h3>
                  <p className="text-zinc-500 mt-1">Race against the clock.</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-md flex flex-col items-center">
          <HUD 
            score={score} 
            target={target} 
            timeLeft={timeLeft} 
            mode={mode}
            currentSum={currentSum}
          />
          
          <Board 
            blocks={blocks} 
            selectedIds={selectedIds} 
            onToggle={toggleBlock}
            cols={6}
            maxRows={9}
          />
          
          <div className="mt-6 text-center space-y-1">
            <p className="text-zinc-500 text-sm">Select blocks to match the target sum.</p>
            <p className="text-zinc-600 text-xs">Don't let blocks reach the top!</p>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white">GAME OVER</h2>
              <p className="text-zinc-400">The grid is full!</p>
            </div>

            <div className="bg-zinc-800/50 rounded-2xl p-6 flex flex-col items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
              <span className="text-zinc-500 text-sm uppercase font-bold tracking-wider">Final Score</span>
              <span className="text-5xl font-mono font-bold">{score}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => startGame('classic')}
                className="bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-zinc-800 text-white py-4 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
              >
                Menu
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
