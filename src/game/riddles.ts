export interface WallCarving {
  id: string;
  title: string;
  chamberName: string;
  hieroglyph: string;
  glyphSymbol: string;
  category: 'gate' | 'scarab' | 'stealth' | 'blades' | 'boulder' | 'ankh';
  x: number;
  z: number;
  wallNormalX: number;
  wallNormalZ: number;
  riddleVerses: string[];
  puzzleHint: string;
  nearbyPuzzleName: string;
}

export const WALL_CARVINGS: WallCarving[] = [
  {
    id: 'carving-entrance-gate',
    title: 'Stela of the Four Divine Seals',
    chamberName: 'Entrance Pylon Promenade',
    hieroglyph: '𓉐 𓋹 𓆣 𓆃',
    glyphSymbol: '🏛️',
    category: 'gate',
    x: 11 * 4,
    z: 18.5 * 4,
    wallNormalX: 0,
    wallNormalZ: 1, // Facing south toward player entering
    riddleVerses: [
      'Four cardinal wings hold four sacred keys,',
      'Forged in celestial gold by the scribes of Re.',
      'Seek the Eye in the West, the Ankh in the East,',
      'The Scarab in the deep, and the Cobra unleashed.',
      'When all four gems burn azure upon the Northern Gate,',
      'The Pharaoh’s Golden Sanctum shall yield to thy fate.',
    ],
    puzzleHint:
      'Search the four corner chambers of the temple to claim 4 Sacred Relics (Eye of Horus, Ankh of Life, Golden Scarab, and Uraeus Cobra). Once gathered, the northern gate to Pharaoh Ramses’s treasure chamber will open automatically.',
    nearbyPuzzleName: 'The Sanctum Gate & 4 Sacred Relic Keys',
  },
  {
    id: 'carving-mummy-stealth',
    title: 'Relief of the Embalmed Watchers',
    chamberName: 'Hypostyle Column Hall (Plaza Entrance)',
    hieroglyph: '𓁢 𓊹 𓈖 𓏏',
    glyphSymbol: '👁️',
    category: 'stealth',
    x: 10 * 4 - 1.8,
    z: 13 * 4,
    wallNormalX: 1,
    wallNormalZ: 0, // Facing east into corridor
    riddleVerses: [
      'The linen-wrapped sentinels sleep not by day nor night,',
      'Their hollow sockets are drawn solely to the torch’s golden light.',
      'Smother thy flame (T) in their shadowed halls,',
      'Walk silent as sand when their hollow step falls.',
      'Or drape Horus’s Cloak of Shadows across thy chest,',
      'To walk unseen while their cursed gazes rest.',
    ],
    puzzleHint:
      'Mummies cannot see you in the pitch dark! Press [T] or tap the Torch button to extinguish your light and enter stealth mode. If a mummy approaches, activate the Shadow Cloak for 30s of total invisibility, or use the Solar Scepter to stun and repel them.',
    nearbyPuzzleName: 'Mummy Guard Patrol & Stealth Mechanics',
  },
  {
    id: 'carving-blade-pendulum',
    title: 'The Balance of Ma’at’s Crescent',
    chamberName: 'Narrow Corridor of Blades',
    hieroglyph: '𓆃 𓌳 𓂝 𓏏',
    glyphSymbol: '⚔️',
    category: 'blades',
    x: 11 * 4 + 1.8,
    z: 17 * 4,
    wallNormalX: -1,
    wallNormalZ: 0, // Facing west into corridor
    riddleVerses: [
      'The bronze blade pendulums swing high and swing low,',
      'He who charges upright meets a sorrowful blow.',
      'Watch the crescent pause at the heights of its arc,',
      'Then roll forward (C / Roll) beneath the razor in the dark.',
      'Keep thy rhythm steady; the stone floor grants passage to the swift.',
    ],
    puzzleHint:
      'Rolling (C key on PC or ROLL button on Mobile) gives Queen Avatara invulnerability frames. Wait until the swinging bronze pendulum reaches its highest sideways peak, then roll straight through the center gap without taking damage.',
    nearbyPuzzleName: 'Swinging Blade Corridor',
  },
  {
    id: 'carving-scarab-spikes',
    title: 'Tablet of the Khepri Dawn & Bronze Fangs',
    chamberName: 'Southwestern Scarab Niche',
    hieroglyph: '𓆣 𓇳 𓊪 𓂋',
    glyphSymbol: '🪲',
    category: 'scarab',
    x: 4 * 4,
    z: 15 * 4 + 1.8,
    wallNormalX: 0,
    wallNormalZ: -1, // Facing north
    riddleVerses: [
      'Beneath the flagstones of the Southwestern Tomb,',
      'Bronze fangs rise to seal an intruder’s doom.',
      'Count three heartbeats as the sharp points sink below,',
      'Leap with grace (Space / Jump) before the cruel spikes grow.',
      'Beyond the second pit lies the Sacred Golden Scarab,',
      'Blessed with the renewal of eternal dawn.',
    ],
    puzzleHint:
      'The floor spikes follow a repeating 3-second cycle. Watch for the spikes to fully retract into the floor, then jump (Space) or roll across. The Golden Scarab of Karnak rests in the sanctum immediately ahead.',
    nearbyPuzzleName: 'Floor Spikes & The Scarab Relic Chamber',
  },
  {
    id: 'carving-boulder-descent',
    title: 'Stela of the Solar Titan (Rolling Granite)',
    chamberName: 'Northern Approach to the Sanctum',
    hieroglyph: '𓇳 𓈖 𓎛 𓎛',
    glyphSymbol: '☄️',
    category: 'boulder',
    x: 11 * 4 - 1.8,
    z: 8 * 4,
    wallNormalX: 1,
    wallNormalZ: 0, // Facing east
    riddleVerses: [
      'Beware the long straight passage to the Pharaoh’s door,',
      'A boulder of black granite will rumble across the floor.',
      'Heed the rumbling tremor before it gains its speed!',
      'Sprint (Shift / Run) into the eastern niche to pay it heed.',
      'Let the rolling titan thunder harmlessly past thy side,',
      'Before proceeding to the gate where sacred spirits abide.',
    ],
    puzzleHint:
      'Walking into this long corridor triggers a heavy rolling boulder! As soon as you hear the grinding sound, hold Shift or tap the RUN button and duck into the side alcove on the right. Once the boulder rolls by, the path to the Sanctum is clear.',
    nearbyPuzzleName: 'Rolling Boulder Trap & Safe Alcove',
  },
  {
    id: 'carving-ankh-secrets',
    title: 'Carving of the Breath of Life (Ankh)',
    chamberName: 'Northeastern Relic Crypt',
    hieroglyph: '𓋹 𓏤 𓊹 𓌢',
    glyphSymbol: '✨',
    category: 'ankh',
    x: 18 * 4 + 1.8,
    z: 6 * 4,
    wallNormalX: -1,
    wallNormalZ: 0, // Facing west
    riddleVerses: [
      'The breath of life is preserved in lapis and in gold,',
      'Blue gems restore the vigor of bodies frail and old.',
      'In the easternmost recess the Ankh of Life remains,',
      'Guarded by shadows and forgotten royal chains.',
      'Use Hathor’s Magnet (G) to draw the coins through air,',
      'And claim the third sacred seal with rightful care.',
    ],
    puzzleHint:
      'Blue Lapis Lazuli gems restore +20 Health upon pickup. Press [G] or tap Hathor’s Magnet to magnetically pull all golden coins within 16 meters directly to you. The Ankh of Eternal Life is resting upon the golden pedestal at the end of this hallway.',
    nearbyPuzzleName: 'Health Restoration & Ankh Relic Key',
  },
];

const DISCOVERED_CARVINGS_KEY = 'karnak_discovered_carvings_v1';
const DECIPHERED_CARVINGS_KEY = 'karnak_deciphered_carvings_v1';

export function getDiscoveredCarvingIds(): string[] {
  try {
    const raw = localStorage.getItem(DISCOVERED_CARVINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markCarvingDiscovered(id: string): string[] {
  const current = getDiscoveredCarvingIds();
  if (!current.includes(id)) {
    const next = [...current, id];
    try {
      localStorage.setItem(DISCOVERED_CARVINGS_KEY, JSON.stringify(next));
    } catch {
      // storage quota or private mode
    }
    return next;
  }
  return current;
}

export function getDecipheredCarvingIds(): string[] {
  try {
    const raw = localStorage.getItem(DECIPHERED_CARVINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markCarvingDeciphered(id: string): string[] {
  const current = getDecipheredCarvingIds();
  if (!current.includes(id)) {
    const next = [...current, id];
    try {
      localStorage.setItem(DECIPHERED_CARVINGS_KEY, JSON.stringify(next));
    } catch {
      // storage quota
    }
    return next;
  }
  return current;
}
