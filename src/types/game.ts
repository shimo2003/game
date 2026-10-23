export type GameState = 'playing' | 'paused' | 'victory' | 'gameover';

export type StealthThreat = 'hidden' | 'caution' | 'spotted';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  coins: number;
  keysCollected: number;
  totalKeys: number;
  score: number;
  torchLit: boolean;
  hasPharaohTreasure: boolean;
  stealthThreat: StealthThreat;
}

export type MummyAIState = 'patrol' | 'suspicious' | 'chase' | 'search';

export interface MummyGuardData {
  id: string;
  x: number;
  y: number;
  z: number;
  angle: number;
  state: MummyAIState;
  patrolPoints: { x: number; z: number }[];
  currentPointIndex: number;
  speed: number;
  detectionRadius: number;
  searchTimer: number;
  attackCooldown: number;
  name: string;
}

export type TrapType = 'spikes' | 'boulder' | 'swinging_blade' | 'dart_wall';

export interface TrapObject {
  id: string;
  type: TrapType;
  x: number;
  z: number;
  meshIndex?: number;
  active: boolean;
  timer: number;
  period: number;
  direction?: number;
  boulderState?: {
    startY: number;
    currentZ: number;
    speed: number;
    active: boolean;
  };
}

export interface CollectibleItem {
  id: string;
  type: 'coin' | 'gem' | 'scarab_key' | 'pharaoh_treasure';
  x: number;
  y: number;
  z: number;
  collected: boolean;
  rotationSpeed: number;
  keyIndex?: number;
  name: string;
}

export interface GateObject {
  id: string;
  x: number;
  z: number;
  requiredKeys: number;
  isOpen: boolean;
  openProgress: number; // 0 to 1
  label: string;
}

export interface MazeCell {
  x: number;
  z: number;
  isWall: boolean;
  isFloor: boolean;
  hasPillar?: boolean;
  hasObelisk?: boolean;
  hasTorch?: boolean;
  isSanctum?: boolean;
  isStart?: boolean;
}

export interface KarnakMazeData {
  width: number;
  height: number;
  grid: number[][]; // 0: path, 1: wall, 2: pillar, 3: gate, 4: sanctum
  startX: number;
  startZ: number;
  sanctumX: number;
  sanctumZ: number;
  collectibles: CollectibleItem[];
  traps: TrapObject[];
  gates: GateObject[];
  mummies: MummyGuardData[];
}
