import { CollectibleItem, GateObject, KarnakMazeData, TrapObject } from '../types/game';

/**
 * Procedural Karnak Temple Egyptian Maze Generator
 * Generates an authentic ancient Egyptian temple labyrinth with
 * hypostyle halls, key alcoves, traps, and the inner Pharaoh's Sanctum.
 */

export function generateKarnakMaze(): KarnakMazeData {
  const width = 23;
  const height = 23;

  // 0: Path, 1: Wall, 2: Column/Pillar, 3: Gate, 4: Sanctum
  const grid: number[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(1));

  // Depth-first search / Prim's algorithm modified with Egyptian temple halls
  function carveMaze(cx: number, cz: number) {
    grid[cz][cx] = 0;
    const dirs = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dz] of dirs) {
      const nx = cx + dx;
      const nz = cz + dz;
      if (nx > 1 && nx < width - 2 && nz > 1 && nz < height - 2 && grid[nz][nx] === 1) {
        grid[cz + dz / 2][cx + dx / 2] = 0;
        grid[nz][nx] = 0;
        carveMaze(nx, nz);
      }
    }
  }

  // Carve labyrinth base
  carveMaze(3, 3);

  // 1. Entrance Courtyard (South)
  const startX = 11;
  const startZ = 21;
  for (let z = 19; z <= 21; z++) {
    for (let x = 9; x <= 13; x++) {
      grid[z][x] = 0;
    }
  }

  // 2. Inner Sanctum - The Pharaoh's Golden Treasure Chamber (North center)
  const sanctumX = 11;
  const sanctumZ = 3;
  for (let z = 1; z <= 5; z++) {
    for (let x = 8; x <= 14; x++) {
      grid[z][x] = 4; // Sanctum floor
    }
  }

  // Sanctum Gate doorway
  grid[6][11] = 3; // Gate cell
  grid[7][11] = 0; // Approach corridor

  // 3. Hypostyle Hall Plaza in Center (Open room with massive columns)
  for (let z = 9; z <= 13; z++) {
    for (let x = 9; x <= 13; x++) {
      grid[z][x] = 0;
    }
  }
  // Place 4 grand columns in hypostyle plaza
  grid[10][10] = 2;
  grid[10][12] = 2;
  grid[12][10] = 2;
  grid[12][12] = 2;

  // 4. Connect corridors to Plaza and Sanctum
  for (let z = 6; z <= 9; z++) grid[z][11] = 0;
  for (let z = 13; z <= 19; z++) grid[z][11] = 0;

  // 5. Four Relic Chambers (Northwest, Northeast, Southwest, Southeast)
  const relicRooms = [
    { x: 3, z: 3, keyIndex: 0, name: 'Eye of Horus Seal' },
    { x: 19, z: 3, keyIndex: 1, name: 'Ankh of Eternal Life' },
    { x: 3, z: 17, keyIndex: 2, name: 'Golden Scarab of Karnak' },
    { x: 19, z: 17, keyIndex: 3, name: 'Golden Uraeus Cobra' },
  ];

  relicRooms.forEach((r) => {
    for (let z = r.z - 1; z <= r.z + 1; z++) {
      for (let x = r.x - 1; x <= r.x + 1; x++) {
        if (x >= 0 && x < width && z >= 0 && z < height) {
          grid[z][x] = 0;
        }
      }
    }
  });

  // Ensure connectivity to relic rooms
  grid[3][4] = 0;
  grid[3][5] = 0;
  grid[3][17] = 0;
  grid[3][18] = 0;
  grid[17][4] = 0;
  grid[17][5] = 0;
  grid[17][17] = 0;
  grid[17][18] = 0;

  // Collectibles list
  const collectibles: CollectibleItem[] = [];

  // Add the 4 Relic Keys
  relicRooms.forEach((r) => {
    collectibles.push({
      id: `key-${r.keyIndex}`,
      type: 'scarab_key',
      x: r.x * 4,
      y: 1.1,
      z: r.z * 4,
      collected: false,
      rotationSpeed: 2.2,
      keyIndex: r.keyIndex,
      name: r.name,
    });
  });

  // Add the Grand Pharaoh's Treasure Sarcophagus
  collectibles.push({
    id: 'pharaoh-treasure',
    type: 'pharaoh_treasure',
    x: sanctumX * 4,
    y: 1.2,
    z: sanctumZ * 4,
    collected: false,
    rotationSpeed: 0.6,
    name: "Pharaoh Ramses' Golden Sarcophagus",
  });

  // Scatter golden coins and gemstones along the open paths
  let coinId = 0;
  for (let z = 2; z < height - 2; z++) {
    for (let x = 2; x < width - 2; x++) {
      if (grid[z][x] === 0) {
        const isNearStart = Math.abs(x - startX) <= 2 && Math.abs(z - startZ) <= 2;
        const isNearRelic = relicRooms.some((r) => r.x === x && r.z === z);

        if (!isNearStart && !isNearRelic) {
          const rand = Math.random();
          if (rand < 0.28) {
            collectibles.push({
              id: `coin-${coinId++}`,
              type: 'coin',
              x: x * 4,
              y: 0.7,
              z: z * 4,
              collected: false,
              rotationSpeed: 3.5,
              name: 'Ancient Golden Drachma',
            });
          } else if (rand < 0.38) {
            collectibles.push({
              id: `gem-${coinId++}`,
              type: 'gem',
              x: x * 4,
              y: 0.7,
              z: z * 4,
              collected: false,
              rotationSpeed: 2.8,
              name: 'Lapis Lazuli Gem',
            });
          }
        }
      }
    }
  }

  // Traps: Spikes, Swinging Blades, and Rolling Boulders
  const traps: TrapObject[] = [
    // Floor Spikes along main paths
    { id: 'spike-1', type: 'spikes', x: 11 * 4, z: 15 * 4, active: true, timer: 0, period: 3.0 },
    { id: 'spike-2', type: 'spikes', x: 7 * 4, z: 11 * 4, active: true, timer: 1.5, period: 3.0 },
    { id: 'spike-3', type: 'spikes', x: 15 * 4, z: 11 * 4, active: true, timer: 0.8, period: 3.0 },
    { id: 'spike-4', type: 'spikes', x: 11 * 4, z: 8 * 4, active: true, timer: 2.1, period: 3.0 },
    { id: 'spike-5', type: 'spikes', x: 5 * 4, z: 7 * 4, active: true, timer: 1.0, period: 2.8 },
    { id: 'spike-6', type: 'spikes', x: 17 * 4, z: 7 * 4, active: true, timer: 1.9, period: 2.8 },

    // Swinging Pendulum Blades in narrow hallways
    { id: 'blade-1', type: 'swinging_blade', x: 11 * 4, z: 17 * 4, active: true, timer: 0, period: 2.2, direction: 1 },
    { id: 'blade-2', type: 'swinging_blade', x: 9 * 4, z: 7 * 4, active: true, timer: 1.1, period: 2.2, direction: -1 },
    { id: 'blade-3', type: 'swinging_blade', x: 13 * 4, z: 7 * 4, active: true, timer: 0.5, period: 2.2, direction: 1 },

    // Rolling Boulder trap in approach corridor
    {
      id: 'boulder-1',
      type: 'boulder',
      x: 11 * 4,
      z: 7.5 * 4,
      active: true,
      timer: 0,
      period: 7.0,
      boulderState: {
        startY: 1.3,
        currentZ: 6 * 4,
        speed: 9.0,
        active: false,
      },
    },
  ];

  // The Grand Sealed Pylon Gate to the Sanctum
  const gates: GateObject[] = [
    {
      id: 'gate-sanctum',
      x: 11 * 4,
      z: 6 * 4,
      requiredKeys: 4,
      isOpen: false,
      openProgress: 0,
      label: "Pharaoh's Sanctum Gate (Requires 4 Sacred Relics)",
    },
  ];

  // AI-Driven Mummy Guards with designated patrol waypoints
  const mummies: import('../types/game').MummyGuardData[] = [
    // 1. Hypostyle Central Plaza Guard
    {
      id: 'mummy-plaza',
      name: 'High Priest Mummy',
      x: 10 * 4,
      y: 0,
      z: 11 * 4,
      angle: 0,
      state: 'patrol',
      patrolPoints: [
        { x: 10 * 4, z: 10 * 4 },
        { x: 12 * 4, z: 10 * 4 },
        { x: 12 * 4, z: 12 * 4 },
        { x: 10 * 4, z: 12 * 4 },
      ],
      currentPointIndex: 0,
      speed: 2.2,
      detectionRadius: 8.5,
      searchTimer: 0,
      attackCooldown: 0,
    },
    // 2. Western Corridors Guard (Guards Horus & Scarab chambers)
    {
      id: 'mummy-west',
      name: 'Anubis Tomb Guard',
      x: 5 * 4,
      y: 0,
      z: 11 * 4,
      angle: Math.PI / 2,
      state: 'patrol',
      patrolPoints: [
        { x: 3 * 4, z: 5 * 4 },
        { x: 5 * 4, z: 11 * 4 },
        { x: 3 * 4, z: 15 * 4 },
        { x: 5 * 4, z: 11 * 4 },
      ],
      currentPointIndex: 0,
      speed: 1.9,
      detectionRadius: 8.0,
      searchTimer: 0,
      attackCooldown: 0,
    },
    // 3. Eastern Corridors Guard (Guards Ankh & Cobra chambers)
    {
      id: 'mummy-east',
      name: 'Royal Sentinel Mummy',
      x: 17 * 4,
      y: 0,
      z: 11 * 4,
      angle: -Math.PI / 2,
      state: 'patrol',
      patrolPoints: [
        { x: 19 * 4, z: 5 * 4 },
        { x: 17 * 4, z: 11 * 4 },
        { x: 19 * 4, z: 15 * 4 },
        { x: 17 * 4, z: 11 * 4 },
      ],
      currentPointIndex: 0,
      speed: 1.9,
      detectionRadius: 8.0,
      searchTimer: 0,
      attackCooldown: 0,
    },
    // 4. Sanctum Gateway Sentinel
    {
      id: 'mummy-sanctum',
      name: 'Pharaoh Ramses Guard',
      x: 11 * 4,
      y: 0,
      z: 8 * 4,
      angle: Math.PI,
      state: 'patrol',
      patrolPoints: [
        { x: 9 * 4, z: 8 * 4 },
        { x: 13 * 4, z: 8 * 4 },
      ],
      currentPointIndex: 0,
      speed: 2.0,
      detectionRadius: 9.0,
      searchTimer: 0,
      attackCooldown: 0,
    },
  ];

  return {
    width,
    height,
    grid,
    startX: startX * 4,
    startZ: startZ * 4,
    sanctumX: sanctumX * 4,
    sanctumZ: sanctumZ * 4,
    collectibles,
    traps,
    gates,
    mummies,
  };
}
