import { useState, useEffect, useCallback } from 'react';

export type GameMode = 'classic' | 'time';
export type GameState = 'menu' | 'playing' | 'gameover';

export interface Block {
  id: string;
  value: number;
  col: number;
  row: number; // 0 is bottom, increases upwards
  color: string;
}

const COLS = 6;
const MAX_ROWS = 9; // Game over if a block reaches this row index (0-8 is safe, 9 is death)
const INITIAL_ROWS = 4;
const TIME_LIMIT = 10; // Seconds for time mode

// Colors for blocks based on value ranges or just random variety
const BLOCK_COLORS = [
  'bg-cyan-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-orange-500',
];

export function useGameLogic() {
  const [mode, setMode] = useState<GameMode>('classic');
  const [gameState, setGameState] = useState<GameState>('menu');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const [level, setLevel] = useState<number>(1);

  // Generate a random block value
  const getRandomValue = () => Math.floor(Math.random() * 9) + 1;
  const getRandomColor = () => BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];

  // Initialize game
  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(TIME_LIMIT);
    setSelectedIds([]);
    
    // Create initial blocks
    const newBlocks: Block[] = [];
    for (let r = 0; r < INITIAL_ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        newBlocks.push({
          id: Math.random().toString(36).substr(2, 9),
          value: getRandomValue(),
          col: c,
          row: r,
          color: getRandomColor(),
        });
      }
    }
    setBlocks(newBlocks);
    generateTarget(newBlocks);
  };

  // Generate a valid target based on current blocks
  const generateTarget = useCallback((currentBlocks: Block[]) => {
    if (currentBlocks.length === 0) return;
    
    // Find a random combination of 2-4 blocks to ensure solvability
    // This is a simple heuristic; strictly ensuring solvability is harder but this works 99% of time
    const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 blocks
    const shuffled = [...currentBlocks].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    const sum = selected.reduce((acc, b) => acc + b.value, 0);
    setTarget(sum);
  }, []);

  // Add a new row at the bottom
  const addRow = useCallback(() => {
    setBlocks(prev => {
      // Shift everything up
      const shifted = prev.map(b => ({ ...b, row: b.row + 1 }));
      
      // Check for game over
      if (shifted.some(b => b.row >= MAX_ROWS)) {
        setGameState('gameover');
        return prev; // Return prev to show the state that caused death
      }

      // Add new row at row 0
      const newRow: Block[] = [];
      // Difficulty: Increase density with level. 
      // Level 1: ~3-4 blocks. Level 10: ~5-6 blocks.
      const density = Math.min(0.5 + (level * 0.05), 0.9); 
      
      for (let c = 0; c < COLS; c++) {
        if (Math.random() < density) {
          newRow.push({
            id: Math.random().toString(36).substr(2, 9),
            value: getRandomValue(),
            col: c,
            row: 0,
            color: getRandomColor(),
          });
        }
      }
      return [...shifted, ...newRow];
    });
  }, [level]); // Add level dependency

  // Handle block selection
  const toggleBlock = (id: string) => {
    if (gameState !== 'playing') return;
    
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        const newSelection = [...prev, id];
        checkSelection(newSelection);
        return newSelection;
      }
    });
  };

  // Check if selection matches target
  const checkSelection = (currentSelection: string[]) => {
    const selectedBlocks = blocks.filter(b => currentSelection.includes(b.id));
    const sum = selectedBlocks.reduce((acc, b) => acc + b.value, 0);

    if (sum === target) {
      // Success!
      handleSuccess(currentSelection);
    } else if (sum > target) {
      // Overshot - maybe visual feedback? For now just keep selected
    }
  };

  const handleSuccess = (matchedIds: string[]) => {
    // 1. Remove blocks
    const remainingBlocks = blocks.filter(b => !matchedIds.includes(b.id));
    
    // 2. Apply Gravity
    // For each column, sort blocks by row, then re-assign row indices starting from 0?
    // Wait, if we add rows from bottom, gravity should pull blocks DOWN to fill gaps?
    // Yes, standard puzzle logic: blocks fall into empty spaces.
    // But "Add Row" pushes UP.
    // So:
    // - Remove matched blocks.
    // - For each column, blocks above the removed ones fall down.
    
    const newBlocks = [...remainingBlocks];
    
    // Apply gravity per column
    for (let c = 0; c < COLS; c++) {
      const colBlocks = newBlocks.filter(b => b.col === c).sort((a, b) => a.row - b.row);
      // Re-index rows to be contiguous starting from where?
      // Actually, if row 0 is bottom, and we remove a block at row 0, row 1 falls to row 0.
      // So we just re-assign rows 0..N-1 for the N blocks in this column.
      colBlocks.forEach((b, index) => {
        b.row = index;
      });
    }

    setBlocks(newBlocks);
    setSelectedIds([]);
    setScore(s => s + matchedIds.length * 10 * level);
    
    // 3. Mode specific logic
    if (mode === 'classic') {
      // Classic: Add row on success
      setTimeout(() => {
        addRow();
        // If board was empty, we need to generate target AFTER addRow
        // We can't easily do it here because addRow is state update.
        // We'll rely on a useEffect to ensure target exists if blocks exist.
      }, 300);
    } else {
      // Time mode: Reset timer
      setTimeLeft(TIME_LIMIT);
    }

    // 4. New Target
    // If we have remaining blocks, generate immediately.
    // If not (cleared board), we wait for addRow (handled by useEffect).
    if (newBlocks.length > 0) {
      generateTarget(newBlocks);
    } else {
      setTarget(0); // Signal that we need a target
    }
  };

  // Ensure target exists if blocks exist and target is 0 (e.g. after board clear)
  useEffect(() => {
    if (gameState === 'playing' && target === 0 && blocks.length > 0) {
      generateTarget(blocks);
    }
  }, [blocks, target, gameState, generateTarget]);

  // Timer for Time Mode
  useEffect(() => {
    if (mode !== 'time' || gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time out!
          addRow();
          // Generate new target on timeout?
          // "Time running out forces a new row and no score for that round"
          // This implies the round (target) is skipped/failed.
          // We need to generate a new target based on the NEW blocks (which we don't have yet).
          // We can set target to 0 to trigger the useEffect?
          // But addRow is async state update.
          setTarget(0); 
          return TIME_LIMIT; // Reset timer
        }
        return prev - 1; // Decrement normally
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, gameState, addRow]);

  // Check Game Over externally if needed, but addRow handles it.
  
  return {
    gameState,
    score,
    highScore,
    blocks,
    selectedIds,
    target,
    timeLeft,
    mode,
    startGame,
    toggleBlock,
    setGameState
  };
}
