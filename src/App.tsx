import { useGameLogic } from './hooks/useGameLogic';
import { Board } from './components/Game/Board';
import { HUD } from './components/Game/HUD';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Clock, RotateCcw, Trophy, Home, Sparkles, Star } from 'lucide-react';
import { Confetti } from './components/Game/Confetti';

export default function App() {
  const {
    gameState,
    score,
    blocks,
    selectedIds,
    target,
    timeLeft,
    mode,
    level,
    overshoot,
    startGame,
    toggleBlock,
    setGameState,
  } = useGameLogic();

  const currentSum = blocks
    .filter(b => selectedIds.includes(b.id))
    .reduce((acc, b) => acc + b.value, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden">

      <AnimatePresence mode="wait">

        {/* ── MENU ── */}
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="max-w-sm w-full space-y-8 text-center"
          >
            {/* Brand block */}
            <div className="space-y-1 select-none">
              {/* SOPHI'S badge */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pink-500/40" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span className="text-xs font-black tracking-[0.25em] bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent uppercase">
                    SOPHI'S
                  </span>
                  <Sparkles className="w-3 h-3 text-violet-400" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-500/40" />
              </div>

              {/* Title */}
              <h1 className="text-7xl font-black tracking-tighter leading-none pb-1">
                <span className="bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
                  SUM
                </span>
                <br />
                <span className="bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-700 bg-clip-text text-transparent">
                  GRID
                </span>
              </h1>
              <p className="text-zinc-500 text-sm mt-2">
                Select blocks that sum to the target. Don't let them reach the top.
              </p>
            </div>

            {/* Mode cards */}
            <div className="grid gap-3">
              <button
                onClick={() => startGame('classic')}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 text-left transition-all duration-200 active:scale-[0.97] hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black">Classic</h3>
                    <p className="text-zinc-500 text-xs mt-0.5 leading-snug">
                      Each clear adds a new row. Survive as long as you can.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => startGame('time')}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-left transition-all duration-200 active:scale-[0.97] hover:border-violet-500/40 hover:bg-zinc-800/60"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-violet-500/20 border border-violet-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Time Attack</h3>
                    <p className="text-zinc-500 text-xs mt-0.5 leading-snug">
                      Beat the clock. Fail a target and a new row drops.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-zinc-700 text-[11px] tracking-wide">
              Tap blocks to select · Match the target to clear them
            </p>
          </motion.div>
        )}

        {/* ── PLAYING ── */}
        {gameState === 'playing' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md flex flex-col items-center"
          >
            <HUD
              score={score}
              target={target}
              timeLeft={timeLeft}
              mode={mode}
              currentSum={currentSum}
              level={level}
              overshoot={overshoot}
            />

            <Board
              blocks={blocks}
              selectedIds={selectedIds}
              onToggle={toggleBlock}
              cols={6}
              maxRows={9}
              overshoot={overshoot}
            />

            <div className="mt-3 flex items-center justify-between w-full max-w-[400px] px-0.5">
              <p className="text-zinc-700 text-[11px]">
                {overshoot ? '✗ Over target — cleared' : 'Select blocks to match the target'}
              </p>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setGameState('menu')}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-red-950/60 hover:border-red-600/50 active:bg-red-950/80 transition-all duration-150"
              >
                <Home className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 transition-colors duration-150" />
                <span className="text-zinc-500 group-hover:text-red-300 text-[11px] font-bold tracking-widest uppercase transition-colors duration-150">
                  Menu
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── YOU WIN overlay ── */}
      {gameState === 'win' && <Confetti />}
      <AnimatePresence>
        {gameState === 'win' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              {/* Stars */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.08 + i * 0.1 }}
                  >
                    <Star className="w-8 h-8 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]" />
                  </motion.div>
                ))}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <motion.h2
                  initial={{ letterSpacing: '0.02em', opacity: 0 }}
                  animate={{ letterSpacing: '0.1em', opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-5xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #fff 0%, #e879f9 40%, #a855f7 70%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 16px rgba(168,85,247,0.7))',
                  }}
                >
                  YOU WIN!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-zinc-400 text-sm"
                >
                  All blocks cleared!
                </motion.p>
              </div>

              {/* Score card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-zinc-800/60 rounded-2xl p-5 flex flex-col items-center gap-1.5 border border-zinc-700/50"
              >
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Score</span>
                <span className="text-4xl font-mono font-black text-white tabular-nums">{score}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-xs capitalize">{mode} mode</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-zinc-600 text-xs">Level {level}</span>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="grid grid-cols-2 gap-3"
              >
                <button
                  onClick={() => startGame(mode)}
                  className="bg-white text-black py-4 rounded-2xl font-black hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="bg-zinc-800 border border-zinc-700 text-white py-4 rounded-2xl font-black hover:bg-zinc-700 transition-colors text-sm"
                >
                  Menu
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GAME OVER overlay ── */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.05 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="text-xs tracking-[0.3em] uppercase font-bold text-zinc-600 mb-2">SOPHI'S SUM GRID</div>
                <motion.h2
                  animate={{ x: [0, -5, 5, -3, 3, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl font-black text-white"
                >
                  GAME OVER
                </motion.h2>
                <p className="text-zinc-500 text-sm">The grid overflowed!</p>
              </div>

              {/* Score card */}
              <div className="bg-zinc-800/60 rounded-2xl p-6 flex flex-col items-center gap-1.5 border border-zinc-700/50">
                <Trophy className="w-7 h-7 text-yellow-400 mb-1" />
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Final Score</span>
                <span className="text-5xl font-mono font-black text-white tabular-nums">{score}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-zinc-600 text-xs capitalize">{mode} mode</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-zinc-600 text-xs">Level {level}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startGame(mode)}
                  className="bg-white text-black py-4 rounded-2xl font-black hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="bg-zinc-800 border border-zinc-700 text-white py-4 rounded-2xl font-black hover:bg-zinc-700 transition-colors text-sm"
                >
                  Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
