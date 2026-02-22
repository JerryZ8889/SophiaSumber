import { useState, useEffect, useCallback, useRef } from 'react';

export type GameMode = 'classic' | 'time';
export type GameState = 'menu' | 'playing' | 'gameover' | 'win';

export interface Block {
  id: string;
  value: number;
  col: number;
  row: number;
  color: string;
}

const COLS = 6;
const MAX_ROWS = 9;
const INITIAL_ROWS = 4;
const TIME_LIMIT = 10;

const BLOCK_COLORS = [
  'bg-cyan-400',
  'bg-pink-500',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-violet-500',
  'bg-orange-400',
];

function getRandomValue() { return Math.floor(Math.random() * 9) + 1; }
function getRandomColor() { return BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)]; }

export function useGameLogic() {
  const [mode, setMode] = useState<GameMode>('classic');
  const [gameState, setGameState] = useState<GameState>('menu');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const [level, setLevel] = useState<number>(1);
  const [successCount, setSuccessCount] = useState(0);
  const [overshoot, setOvershoot] = useState(false);

  // Use refs to avoid stale closures in callbacks
  const levelRef = useRef(level);
  const blocksRef = useRef(blocks);
  const targetRef = useRef(target);
  const modeRef = useRef(mode);
  // Holds the addRow timer so React's effect cleanup can't cancel it prematurely
  const addRowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { targetRef.current = target; }, [target]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // When leaving 'playing' (menu, gameover, win), cancel any pending addRow timer
  useEffect(() => {
    if (gameState !== 'playing' && addRowTimerRef.current) {
      clearTimeout(addRowTimerRef.current);
      addRowTimerRef.current = null;
    }
  }, [gameState]);

  const generateTarget = useCallback((currentBlocks: Block[]) => {
    if (currentBlocks.length === 0) return;
    const count = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...currentBlocks].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    const sum = selected.reduce((acc, b) => acc + b.value, 0);
    setTarget(sum);
  }, []);

  const addRow = useCallback(() => {
    const currentLevel = levelRef.current;
    setBlocks(prev => {
      const density = Math.min(0.45 + currentLevel * 0.05, 0.85);

      // Decide which columns receive a new block this round
      const newRowBlocks: Block[] = [];
      const colsReceiving = new Set<number>();
      for (let c = 0; c < COLS; c++) {
        if (Math.random() < density) {
          colsReceiving.add(c);
          newRowBlocks.push({
            id: Math.random().toString(36).substr(2, 9),
            value: getRandomValue(),
            col: c,
            row: 0,
            color: getRandomColor(),
          });
        }
      }

      // Only shift blocks in columns that are receiving a new block.
      // Columns without a new block stay put, so there are never floating gaps.
      const shifted = prev.map(b => ({
        ...b,
        row: colsReceiving.has(b.col) ? b.row + 1 : b.row,
      }));

      if (shifted.some(b => b.row >= MAX_ROWS)) {
        setGameState('gameover');
        return prev;
      }

      return [...shifted, ...newRowBlocks];
    });
  }, []);

  const startGame = useCallback((selectedMode: GameMode) => {
    if (addRowTimerRef.current) {
      clearTimeout(addRowTimerRef.current);
      addRowTimerRef.current = null;
    }
    setMode(selectedMode);
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setSuccessCount(0);
    setTimeLeft(TIME_LIMIT);
    setSelectedIds([]);
    setOvershoot(false);

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
  }, [generateTarget]);

  const toggleBlock = useCallback((id: string) => {
    if (gameState !== 'playing') return;
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, [gameState]);

  // React to selection changes
  useEffect(() => {
    if (gameState !== 'playing' || targetRef.current === 0 || selectedIds.length === 0) return;

    const currentBlocks = blocksRef.current;
    const currentTarget = targetRef.current;
    const currentLevel = levelRef.current;

    const sum = currentBlocks
      .filter(b => selectedIds.includes(b.id))
      .reduce((acc, b) => acc + b.value, 0);

    if (sum === currentTarget) {
      // Match! Apply success
      const matchedIds = [...selectedIds];
      const remainingBlocks = currentBlocks.filter(b => !matchedIds.includes(b.id));

      // Apply gravity per column — produce new objects so Framer Motion
      // detects the row change and animates the fall.
      const rowMap = new Map<string, number>();
      for (let c = 0; c < COLS; c++) {
        const colBlocks = remainingBlocks
          .filter(b => b.col === c)
          .sort((a, b) => a.row - b.row);
        colBlocks.forEach((b, index) => rowMap.set(b.id, index));
      }
      const newBlocks = remainingBlocks.map(b => ({
        ...b,
        row: rowMap.get(b.id) ?? b.row,
      }));

      setBlocks(newBlocks);
      setSelectedIds([]);
      setOvershoot(false);
      setScore(s => s + matchedIds.length * 10 * currentLevel);

      // Level up every 3 successes
      setSuccessCount(prev => {
        const next = prev + 1;
        if (next % 3 === 0) setLevel(l => l + 1);
        return next;
      });

      if (newBlocks.length > 0) {
        generateTarget(newBlocks);
        if (modeRef.current === 'classic') {
          // Use a ref-managed timer so React's effect cleanup doesn't cancel it
          if (addRowTimerRef.current) clearTimeout(addRowTimerRef.current);
          addRowTimerRef.current = setTimeout(() => {
            addRowTimerRef.current = null;
            addRow();
          }, 300);
        } else {
          setTimeLeft(TIME_LIMIT);
        }
      } else {
        // Board fully cleared — YOU WIN
        setTarget(0);
        setGameState('win');
      }
    } else if (sum > currentTarget) {
      // Overshoot — flash and auto-clear
      setOvershoot(true);
      const t = setTimeout(() => {
        setSelectedIds([]);
        setOvershoot(false);
      }, 500);
      return () => clearTimeout(t);
    } else {
      // Sum back under target (e.g. user deselected during overshoot) — clear styling
      setOvershoot(false);
    }
  // Only run when selectedIds changes; other deps accessed via refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  // Ensure a target always exists when there are blocks
  useEffect(() => {
    if (gameState === 'playing' && target === 0 && blocks.length > 0) {
      generateTarget(blocks);
    }
  }, [blocks, target, gameState, generateTarget]);

  // Countdown timer for time mode (stops automatically when gameState leaves 'playing')
  useEffect(() => {
    if (mode !== 'time' || gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          addRow();
          setTarget(0);
          return TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, gameState, addRow]);

  return {
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
  };
}
