import { PlayerInventory, StoreItem } from '../types/store';

export const STORE_ITEMS: StoreItem[] = [
  // --- GOOGLE PLAY VIP SUBSCRIPTION (COMPLIANT WITH GOOGLE POLICY) ---
  {
    id: 'sub_royal_vip',
    name: 'Pharaoh’s Royal VIP Membership',
    category: 'subscription',
    priceUSD: 4.99,
    billingPeriod: 'month',
    description:
      'Official Monthly VIP Subscription: 1,000 Bonus Gold every month, 5 Sacred Ankh Revives, Exclusive Ra Sun Armor, permanent 40% Sprint Boost, and Relic Compass. Cancel anytime with 1-click per Google Play Policy.',
    icon: 'crown_vip',
    badge: 'Google Play VIP',
    rewards: {
      coins: 1000,
      reviveCharms: 5,
      shadowCloakSeconds: 5,
      solarBlasts: 5,
      magnetCharges: 5,
      permanentSpeedBoost: true,
      hasRelicCompass: true,
      skinId: 'ra_sun',
      isSubscription: true,
    },
  },

  // --- REAL CURRENCY GOLD PACKS ---
  {
    id: 'coins_pouch',
    name: 'Pouch of 500 Gold Drachmas',
    category: 'currency',
    priceUSD: 0.99,
    description: 'A leather pouch filled with 500 ancient golden drachmas to spend on perks, revives, and gear.',
    icon: 'coins',
    badge: 'Starter',
    rewards: {
      coins: 500,
    },
  },
  {
    id: 'coins_chest',
    name: 'Royal Chest of 2,500 Gold + 1 Revive',
    category: 'currency',
    priceUSD: 2.99,
    description: 'A lavish chest containing 2,500 gold coins and a sacred Ankh Revive charm.',
    icon: 'treasure',
    badge: 'Most Popular',
    rewards: {
      coins: 2500,
      reviveCharms: 1,
    },
  },
  {
    id: 'pharaoh_vault',
    name: 'Vault of the Pharaoh (10,000 Gold)',
    category: 'currency',
    priceUSD: 7.99,
    description: 'An immense hoard of 10,000 gold coins, 3 Revive Charms, 3 Cloaks of Shadows, and 3 Coin Magnets.',
    icon: 'vault',
    badge: 'Best Value',
    rewards: {
      coins: 10000,
      reviveCharms: 3,
      shadowCloakSeconds: 3,
      magnetCharges: 3,
    },
  },
  {
    id: 'divine_hoard',
    name: 'Divine Hoard of Amun-Ra (50,000 Gold)',
    category: 'currency',
    priceUSD: 19.99,
    description: 'The supreme treasure: 50,000 gold coins, 10 Revives, 10 Cloaks, 10 Solar Blasts, and the Sun-Goddess Skin!',
    icon: 'crown',
    badge: 'Ultimate Pack',
    rewards: {
      coins: 50000,
      reviveCharms: 10,
      shadowCloakSeconds: 10,
      solarBlasts: 10,
      magnetCharges: 10,
      skinId: 'ra_sun',
    },
  },

  // --- POWER-UPS & TALISMANS (Can be bought with USD or In-Game Gold) ---
  {
    id: 'perk_revive_single',
    name: 'Instant Ankh of Life (1x Revive)',
    category: 'perk',
    priceUSD: 0.99,
    priceGold: 300,
    description: 'Sacred Egyptian talisman that resurrects Queen Avatara immediately on the spot with 100% Health.',
    icon: 'ankh',
    badge: 'Essential',
    rewards: {
      reviveCharms: 1,
    },
  },
  {
    id: 'perk_revive_pack',
    name: 'Trio of Ankhs (3x Resurrection)',
    category: 'perk',
    priceUSD: 1.49,
    priceGold: 700,
    description: 'Three sacred talismans to defy death against lethal spike traps, rolling boulders, and mummy ambushes.',
    icon: 'ankh',
    badge: 'Life Saver',
    rewards: {
      reviveCharms: 3,
    },
  },
  {
    id: 'perk_cloak',
    name: 'Eye of Horus Cloak of Shadows (3x)',
    category: 'perk',
    priceUSD: 1.99,
    priceGold: 450,
    description: 'Turn Queen Avatara 100% invisible to all Karnak mummy sentinels for 30 seconds per charge!',
    icon: 'cloak',
    badge: 'Stealth',
    rewards: {
      shadowCloakSeconds: 3,
    },
  },
  {
    id: 'perk_solar_scepter',
    name: 'Solar Scepter Blast (3x Repeller)',
    category: 'perk',
    priceUSD: 2.49,
    priceGold: 500,
    description: 'Unleash blinding Ra sunlight that stuns and blasts all nearby mummies back 15 meters!',
    icon: 'sun',
    badge: 'Combat',
    rewards: {
      solarBlasts: 3,
    },
  },
  {
    id: 'perk_magnet',
    name: 'Hathor’s Golden Coin Magnet (3x)',
    category: 'perk',
    priceUSD: 1.49,
    priceGold: 400,
    description: 'Draws all gold coins and treasures within 16 meters directly to Queen Avatara for 30 seconds!',
    icon: 'magnet',
    badge: 'Utility',
    rewards: {
      magnetCharges: 3,
    },
  },
  {
    id: 'perk_winged_sandals',
    name: 'Pharaoh’s Winged Sandals',
    category: 'perk',
    priceUSD: 1.99,
    priceGold: 1400,
    description: 'Gilded athletic sandals that permanently increase Queen Avatara’s sprint speed by 40% throughout the entire maze!',
    icon: 'sandals',
    badge: 'Permanent',
    rewards: {
      permanentSpeedBoost: true,
    },
  },
  {
    id: 'perk_compass',
    name: 'Sacred Eye Compass of Osiris',
    category: 'perk',
    priceUSD: 2.49,
    priceGold: 1800,
    description: 'Permanent ancient compass that draws a divine golden beacon directly pointing towards hidden relic chambers.',
    icon: 'compass',
    badge: 'Permanent',
    rewards: {
      hasRelicCompass: true,
    },
  },

  // --- EXCLUSIVE CHARACTER SKINS ---
  {
    id: 'skin_ra_sun',
    name: 'Radiant Sun-Goddess Ra Armor',
    category: 'skin',
    priceUSD: 3.99,
    priceGold: 2800,
    description: 'Gilded solid-gold armor with glowing solar engravings, radiant crown aura, and solar particle trail.',
    icon: 'skin_gold',
    badge: 'Legendary Skin',
    rewards: {
      skinId: 'ra_sun',
    },
  },
  {
    id: 'skin_lapis',
    name: 'Midnight Lapis Priestess Vestments',
    category: 'skin',
    priceUSD: 2.99,
    priceGold: 2200,
    description: 'Royal deep lapis-lazuli blue robes adorned with celestial silver stars, turquoise scarabs, and obsidian accents.',
    icon: 'skin_blue',
    badge: 'Epic Skin',
    rewards: {
      skinId: 'lapis_priestess',
    },
  },

  // --- VIP ALL-ACCESS BUNDLE ---
  {
    id: 'bundle_vip_master',
    name: 'Pharaoh’s VIP Master Pass (Lifetime)',
    category: 'bundle',
    priceUSD: 9.99,
    priceGold: 7500,
    description: 'The supreme explorer pass: All character skins unlocked, 15,000 Gold, 6 Revives, 6 Cloaks, 6 Solar Blasts, 6 Magnets, Winged Sandals, and Compass!',
    icon: 'vip',
    badge: 'Lifetime Pass',
    rewards: {
      coins: 15000,
      reviveCharms: 6,
      shadowCloakSeconds: 6,
      solarBlasts: 6,
      magnetCharges: 6,
      permanentSpeedBoost: true,
      hasRelicCompass: true,
      skinId: 'ra_sun',
    },
  },
];

export const DEFAULT_INVENTORY: PlayerInventory = {
  reviveCharms: 2,
  shadowCloakCharges: 1,
  solarBlastCharges: 1,
  magnetCharges: 2,
  hasSpeedBoost: false,
  hasRelicCompass: false,
  equippedSkin: 'default',
  unlockedSkins: ['default'],
  purchasedBundleIds: [],
  orderHistory: [],
  isSubscribed: false,
  subscriptionTier: 'Pharaoh’s Royal VIP Membership',
  subscriptionPriceUSD: 4.99,
  subscriptionRenewalDate: '2026-11-20',
  subscriptionCancelled: false,
};

const INVENTORY_STORAGE_KEY = 'karnak_player_inventory_v3';

export function loadSavedInventory(): PlayerInventory {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_INVENTORY,
        ...parsed,
        unlockedSkins: Array.isArray(parsed.unlockedSkins)
          ? Array.from(new Set(['default', ...parsed.unlockedSkins]))
          : ['default'],
        orderHistory: Array.isArray(parsed.orderHistory) ? parsed.orderHistory : [],
      };
    }
  } catch {
    // LocalStorage blocked or error
  }
  return { ...DEFAULT_INVENTORY };
}

export function saveInventory(inv: PlayerInventory) {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inv));
  } catch {
    // LocalStorage error
  }
}
