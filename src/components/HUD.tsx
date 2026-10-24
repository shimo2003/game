import React from 'react';
import {
  Volume2,
  VolumeX,
  Shield,
  Flame,
  Key,
  Coins,
  Trophy,
  ShoppingBag,
  Sun,
  Sparkles,
  Magnet,
  Plus,
  Compass,
  Crown,
  Glasses,
  BookOpen,
  Download,
} from 'lucide-react';
import { PlayerStats } from '../types/game';
import { PlayerInventory } from '../types/store';
import { GlassesMode } from '../game/GameEngine';

interface HUDProps {
  stats: PlayerStats;
  inventory: PlayerInventory;
  glassesMode?: GlassesMode;
  shadowCloakSeconds: number;
  magnetSeconds: number;
  message: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleTorch: () => void;
  onToggleMap: () => void;
  onCycleGlasses?: () => void;
  onOpenStore: (initialTab?: 'all' | 'currency' | 'perk' | 'skin' | 'bundle' | 'subscription' | 'receipts') => void;
  onActivateCloak: () => void;
  onActivateSolar: () => void;
  onActivateMagnet: () => void;
  onOpenHelpAndTutorial?: (tab?: 'tutorial' | 'controls' | 'riddles' | 'glasses' | 'files') => void;
  showMap: boolean;
}

export const HUD: React.FC<HUDProps> = React.memo(({
  stats,
  inventory,
  glassesMode = 'off',
  shadowCloakSeconds,
  magnetSeconds,
  message,
  isMuted,
  onToggleMute,
  onToggleTorch,
  onToggleMap,
  onCycleGlasses,
  onOpenStore,
  onActivateCloak,
  onActivateSolar,
  onActivateMagnet,
  onOpenHelpAndTutorial,
  showMap,
}) => {
  const healthPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));

  const getSkinLabel = () => {
    if (inventory.equippedSkin === 'ra_sun') return 'Ra Sun Armor';
    if (inventory.equippedSkin === 'lapis_priestess') return 'Lapis Priestess';
    return 'Royal Linen';
  };

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="flex w-full items-start justify-between p-2.5 md:p-5">
        {/* Left: Queen Avatara Character Card & Vitals */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-stone-950/85 p-2.5 shadow-2xl backdrop-blur-md">
          {/* Game Icon & Character Portrait */}
          <div className="relative flex items-center">
            {/* Authentic Character Avatar Portrait from latest reference sheet */}
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-amber-400 bg-stone-900 shadow-md">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_hiwssghiwssghiws_439cbc0e.jpg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/public/assets/aistudio/Gemini_Generated_Image_hiwssghiwssghiws_439cbc0e.jpg';
                }}
                alt="Queen Avatara"
                className="h-full w-full object-cover object-[35%_16%]"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 to-transparent py-0.5 text-center text-[9px] font-bold tracking-wider text-amber-300">
                {inventory.reviveCharms > 0 ? `+${inventory.reviveCharms} LIVES` : 'MORTAL'}
              </div>
            </div>

            {/* Official Game Icon Laurel / Cartouche Badge */}
            <div
              title="Queen Avatara: Tomb of Karnak"
              className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full border border-amber-400 bg-stone-950 p-0.5 shadow-md"
            >
              <img src="/favicon.svg" alt="Game Icon" className="h-full w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wide text-amber-300 drop-shadow-sm md:text-base">
                Queen Avatara
              </span>
              <span
                onClick={() => onOpenStore('skin')}
                className="cursor-pointer rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
              >
                {getSkinLabel()}
              </span>
              {inventory.isSubscribed && (
                <span
                  onClick={() => onOpenStore('subscription')}
                  className="cursor-pointer flex items-center gap-1 rounded bg-gradient-to-r from-amber-500/30 to-yellow-600/30 px-1.5 py-0.5 text-[10px] font-black text-amber-300 border border-amber-400/50"
                >
                  <Crown className="h-2.5 w-2.5 text-amber-300" />
                  <span>VIP</span>
                </span>
              )}
            </div>

            {/* Health Bar */}
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-red-400" />
              <div className="relative h-2.5 w-24 md:w-36 overflow-hidden rounded-full border border-stone-700 bg-stone-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-stone-300">
                {Math.round(stats.health)}
              </span>
            </div>

            {/* Relic Keys, Coins & Threat Row */}
            <div className="flex items-center gap-2 text-xs">
              {/* Relic Keys */}
              <div className="flex items-center gap-1 text-amber-300">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold">
                  {stats.keysCollected}/{stats.totalKeys}
                </span>
              </div>

              {/* Coins + Quick Buy Button */}
              <div className="flex items-center gap-1 text-yellow-300 bg-yellow-950/40 px-1.5 py-0.5 rounded-lg border border-yellow-500/30">
                <Coins className="h-3.5 w-3.5 text-yellow-400" />
                <span className="font-bold">{stats.coins}</span>
                <button
                  onClick={() => onOpenStore('currency')}
                  title="Buy Gold Packs via In-App Purchase"
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-stone-950 hover:bg-amber-400 transition-transform active:scale-90"
                >
                  <Plus className="h-2.5 w-2.5 stroke-[3]" />
                </button>
              </div>

              {/* Stealth / Threat State */}
              <div className="flex items-center">
                {stats.stealthThreat === 'spotted' ? (
                  <span className="rounded bg-red-600/30 px-1.5 py-0.5 text-[9px] font-black uppercase text-red-300 border border-red-500/60 shadow-sm animate-pulse">
                    SPOTTED!
                  </span>
                ) : stats.stealthThreat === 'caution' ? (
                  <span className="rounded bg-amber-600/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-300 border border-amber-500/50">
                    HUNTING
                  </span>
                ) : (
                  <span className="rounded bg-stone-800/80 px-1.5 py-0.5 text-[9px] font-medium text-stone-400 border border-stone-700">
                    {stats.torchLit ? 'Torch Lit' : 'Hidden'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Objective / Action Message Banner */}
        {message && (
          <div className="hidden max-w-md animate-fade-in items-center rounded-xl border border-amber-500/50 bg-stone-950/90 px-4 py-2 text-center text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md md:flex">
            <span className="text-amber-400 mr-2">✦</span>
            {message}
          </div>
        )}

        {/* Right: Score, Power-Ups & Bazaar Store Button */}
        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2">
          {/* Score Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-stone-950/85 px-3 py-2 text-amber-300 shadow-xl backdrop-blur-md">
            <Trophy className="h-4 w-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-amber-400/80">Score</span>
              <span className="font-mono text-sm font-black text-amber-200">{stats.score}</span>
            </div>
          </div>

          {/* 3D Glasses & VR Headset Toggle Button */}
          {onCycleGlasses && (
            <button
              onClick={onCycleGlasses}
              title="Toggle 3D Glasses Mode (Red-Cyan / VR Headset) - Key: V"
              className={`flex h-10 items-center gap-1.5 px-2.5 rounded-xl border transition-all duration-200 shadow-lg text-xs font-bold ${
                glassesMode === 'anaglyph'
                  ? 'border-red-500 bg-red-950/80 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : glassesMode === 'vr_sbs'
                  ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'border-stone-700 bg-stone-950/85 text-stone-300 hover:border-cyan-400 hover:text-cyan-300'
              }`}
            >
              <Glasses className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">
                {glassesMode === 'anaglyph' ? '3D Glasses' : glassesMode === 'vr_sbs' ? 'VR Glasses' : 'Glasses (V)'}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                  glassesMode === 'anaglyph'
                    ? 'bg-red-500 text-stone-950'
                    : glassesMode === 'vr_sbs'
                    ? 'bg-cyan-400 text-stone-950'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {glassesMode === 'anaglyph' ? '3D' : glassesMode === 'vr_sbs' ? 'VR' : '2D'}
              </span>
            </button>
          )}

          {/* Power-Up 1: Shadow Cloak Invisibility */}
          <button
            onClick={onActivateCloak}
            title="Eye of Horus Cloak (Invisibility from Mummies for 30s)"
            className={`flex h-10 items-center gap-1 px-2.5 rounded-xl border transition-all duration-200 shadow-lg text-xs font-bold ${
              shadowCloakSeconds > 0
                ? 'border-cyan-400 bg-cyan-500/40 text-cyan-200 animate-pulse'
                : inventory.shadowCloakCharges > 0
                ? 'border-amber-500/50 bg-stone-900/90 text-amber-300 hover:border-amber-400'
                : 'border-stone-800 bg-stone-950/70 text-stone-500 hover:text-stone-300'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            <span>
              {shadowCloakSeconds > 0 ? `${shadowCloakSeconds}s` : `Cloak (${inventory.shadowCloakCharges})`}
            </span>
          </button>

          {/* Power-Up 2: Solar Scepter Blast */}
          <button
            onClick={onActivateSolar}
            title="Solar Scepter Blast (Stun & Repel all nearby Mummies)"
            className={`flex h-10 items-center gap-1 px-2.5 rounded-xl border transition-all duration-200 shadow-lg text-xs font-bold ${
              inventory.solarBlastCharges > 0
                ? 'border-yellow-500/50 bg-stone-900/90 text-yellow-300 hover:border-yellow-400'
                : 'border-stone-800 bg-stone-950/70 text-stone-500 hover:text-stone-300'
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-yellow-400" />
            <span>Blast ({inventory.solarBlastCharges})</span>
          </button>

          {/* Power-Up 3: Hathor's Coin Magnet */}
          <button
            onClick={onActivateMagnet}
            title="Hathor's Coin Magnet (Draws all coins within 16m for 30s)"
            className={`flex h-10 items-center gap-1 px-2.5 rounded-xl border transition-all duration-200 shadow-lg text-xs font-bold ${
              magnetSeconds > 0
                ? 'border-red-400 bg-red-500/40 text-red-200 animate-pulse'
                : inventory.magnetCharges > 0
                ? 'border-red-500/50 bg-stone-900/90 text-red-300 hover:border-red-400'
                : 'border-stone-800 bg-stone-950/70 text-stone-500 hover:text-stone-300'
            }`}
          >
            <Magnet className="h-3.5 w-3.5 text-red-400" />
            <span>{magnetSeconds > 0 ? `${magnetSeconds}s` : `Magnet (${inventory.magnetCharges})`}</span>
          </button>

          {/* Royal Karnak Bazaar Store Button */}
          <button
            onClick={() => onOpenStore()}
            aria-label="Open Karnak Bazaar In-App Store"
            className="flex h-10 items-center gap-1.5 px-3 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 hover:brightness-110 font-black text-xs shadow-xl transition-all active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bazaar</span>
            <span className="rounded-full bg-stone-950/80 px-1.5 py-0.2 text-[9px] text-amber-300">
              STORE
            </span>
          </button>

          {/* Torch Button */}
          <button
            onClick={onToggleTorch}
            aria-label="Toggle Torch"
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 shadow-lg ${
              stats.torchLit
                ? 'border-amber-400 bg-amber-500/30 text-amber-300'
                : 'border-stone-700 bg-stone-950/85 text-stone-500 hover:text-amber-200'
            }`}
          >
            <Flame className="h-4 w-4" />
          </button>

          {/* Minimap Toggle */}
          <button
            onClick={onToggleMap}
            aria-label="Toggle Minimap"
            className={`flex h-10 px-2.5 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-200 shadow-lg ${
              showMap
                ? 'border-amber-400 bg-amber-500/30 text-amber-300'
                : 'border-stone-700 bg-stone-950/85 text-stone-400 hover:text-amber-200'
            }`}
          >
            Map
          </button>

          {/* Guide & Interactive Tutorial Button */}
          {onOpenHelpAndTutorial && (
            <button
              onClick={() => onOpenHelpAndTutorial('tutorial')}
              aria-label="Open Guide & Tutorial"
              title="Open Guide & Interactive Tutorial (Key: H or ?)"
              className="flex h-10 px-2.5 items-center gap-1 justify-center rounded-xl border border-stone-700 bg-stone-950/85 text-xs font-bold text-amber-300 transition-all duration-200 hover:border-amber-400 hover:bg-stone-900 shadow-lg"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span className="hidden md:inline">Guide</span>
            </button>
          )}

          {/* Quick ZIP Download Link */}
          <a
            href="/queen-avatara-tomb-of-karnak.zip"
            download="queen-avatara-tomb-of-karnak.zip"
            aria-label="Download Project ZIP"
            title="Download Complete Project ZIP (7.4 MB)"
            className="flex h-10 px-2.5 items-center gap-1.5 justify-center rounded-xl border border-emerald-500/60 bg-emerald-950/70 text-xs font-bold text-emerald-300 hover:bg-emerald-900/80 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span className="hidden lg:inline">ZIP</span>
          </a>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            aria-label="Toggle Sound"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-700 bg-stone-950/85 text-stone-300 transition-all duration-200 hover:border-amber-500/60 hover:text-amber-300 shadow-lg"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Center Message Toast */}
      {message && (
        <div className="flex w-full justify-center px-4 md:hidden">
          <div className="rounded-xl border border-amber-500/40 bg-stone-950/90 px-3 py-1.5 text-center text-[11px] font-medium text-amber-200 shadow-lg backdrop-blur-md">
            {message}
          </div>
        </div>
      )}

      {/* Threat Vignette Overlay (when spotted by a mummy guard) */}
      {stats.stealthThreat === 'spotted' && (
        <div className="pointer-events-none absolute inset-0 border-4 border-red-600/60 shadow-[inset_0_0_80px_rgba(220,38,38,0.45)] transition-opacity duration-300" />
      )}
    </div>
  );
});
