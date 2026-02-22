import { motion, AnimatePresence } from 'motion/react';
import { Block } from '../../hooks/useGameLogic';

interface BoardProps {
  blocks: Block[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  cols: number;
  maxRows: number;
  overshoot?: boolean;
}

export function Board({ blocks, selectedIds, onToggle, cols, maxRows, overshoot }: BoardProps) {
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl"
      animate={overshoot ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '100%',
        maxWidth: '400px',
        aspectRatio: `${cols} / ${maxRows}`,
        background: 'linear-gradient(180deg, #0f0f14 0%, #111118 100%)',
      }}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0 grid pointer-events-none"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${maxRows}, 1fr)`,
        }}
      >
        {Array.from({ length: cols * maxRows }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-white/[0.03]" />
        ))}
      </div>

      {/* Danger zone */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: `${(1 / maxRows) * 100}%` }}>
        <div className="absolute inset-0 bg-red-500/5 border-b border-red-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-500/30 text-[9px] font-mono uppercase tracking-[0.3em]">DANGER</span>
        </div>
      </div>

      {/* Blocks */}
      <AnimatePresence>
        {blocks.map((block) => {
          const isSelected = selectedIds.includes(block.id);
          const isDanger = block.row >= maxRows - 2;

          const bottomPct = (block.row / maxRows) * 100;
          const leftPct = (block.col / cols) * 100;
          const widthPct = 100 / cols;
          const heightPct = 100 / maxRows;

          return (
            <motion.button
              key={block.id}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: 1,
                scale: isSelected ? 0.82 : 1,
                bottom: `${bottomPct}%`,
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
              }}
              exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.12 } }}
              transition={{
                // position (falling) uses a softer spring so the drop feels weighted
                bottom: { type: 'spring', stiffness: 280, damping: 22 },
                left:   { type: 'spring', stiffness: 280, damping: 22 },
                // scale & opacity snap fast
                scale:   { type: 'spring', stiffness: 500, damping: 35 },
                opacity: { duration: 0.15 },
              }}
              className="absolute p-[3px] focus:outline-none touch-manipulation"
              style={{ zIndex: isSelected ? 10 : 1 }}
              onClick={() => onToggle(block.id)}
            >
              <div
                className={`
                  w-full h-full rounded-xl flex items-center justify-center font-black font-mono
                  shadow-lg transition-all duration-100 select-none
                  ${block.color}
                  ${isSelected
                    ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-transparent shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                    : 'opacity-90 hover:opacity-100'
                  }
                  ${isDanger ? 'animate-pulse' : ''}
                `}
                style={{ fontSize: 'clamp(9px, 2.8vw, 17px)' }}
              >
                <span className="text-white drop-shadow">{block.value}</span>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
