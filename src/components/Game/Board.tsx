import { motion, AnimatePresence } from 'motion/react';
import { Block } from '../../hooks/useGameLogic';

interface BoardProps {
  blocks: Block[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  cols: number;
  maxRows: number;
}

export function Board({ blocks, selectedIds, onToggle, cols, maxRows }: BoardProps) {
  // Calculate cell size based on viewport? 
  // For simplicity, we'll use a grid layout with fixed aspect ratio or responsive sizing.
  
  return (
    <div 
      className="relative bg-zinc-900 rounded-lg overflow-hidden border-2 border-zinc-700 shadow-inner"
      style={{
        width: '100%',
        maxWidth: '400px',
        aspectRatio: `${cols} / ${maxRows}`, // Keep aspect ratio consistent
      }}
    >
      {/* Grid Background (Optional) */}
      <div 
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${maxRows}, 1fr)`,
        }}
      >
        {Array.from({ length: cols * maxRows }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-zinc-800/50" />
        ))}
      </div>

      {/* Blocks */}
      <AnimatePresence>
        {blocks.map((block) => {
          const isSelected = selectedIds.includes(block.id);
          
          // Calculate position
          // row 0 is bottom. In CSS grid, row 1 is top.
          // So CSS row = (maxRows - 1 - block.row) + 1? 
          // Actually, let's use absolute positioning for smooth animation.
          // percentage based on grid size.
          
          const bottom = (block.row / maxRows) * 100;
          const left = (block.col / cols) * 100;
          const width = 100 / cols;
          const height = 100 / maxRows;

          return (
            <motion.button
              key={block.id}
              layout
              initial={{ opacity: 0, scale: 0, y: -50 }}
              animate={{ 
                opacity: 1, 
                scale: isSelected ? 0.9 : 1,
                x: `${block.col * 100}%`, // We use x/y transform relative to container? No, absolute is easier.
                bottom: `${bottom}%`,
                left: `${left}%`,
                width: `${width}%`,
                height: `${height}%`
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`absolute p-1 focus:outline-none touch-manipulation`}
              style={{
                // Override animate for left/bottom to avoid conflict if needed, 
                // but motion handles it well if we use standard props.
                // Actually, let's use style for positioning to be safe with motion.
                // Wait, motion animate prop is better for transitions.
              }}
              onClick={() => onToggle(block.id)}
            >
              <div 
                className={`w-full h-full rounded-md flex items-center justify-center text-xl font-bold font-mono shadow-sm transition-colors duration-200
                  ${block.color} 
                  ${isSelected ? 'brightness-125 ring-4 ring-white z-10' : 'text-white'}
                  ${block.row >= maxRows - 2 ? 'animate-pulse' : ''} 
                `}
              >
                {block.value}
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
      
      {/* Danger Zone Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-[11%] bg-red-500/10 border-b border-red-500/30 pointer-events-none flex items-center justify-center"
      >
        <span className="text-red-500/50 text-xs font-mono uppercase tracking-widest">Danger Zone</span>
      </div>
    </div>
  );
}
