import React from 'react';
import { Trophy, Coins, Key, Shield, Sparkles } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface VictoryModalProps {
  stats: PlayerStats;
  onRestart: () => void;
  onContinueExplore: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = React.memo(({
  stats,
  onRestart,
  onContinueExplore,
}) => {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-amber-400 bg-stone-950 p-6 text-center shadow-2xl md:p-8">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Character Portrait with Crown Frame */}
        <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-2xl border-4 border-amber-400 shadow-2xl">
          <img
            src="/assets/aistudio/Gemini_Generated_Image_hiwssghiwssghiws_439cbc0e.jpg"
            alt="Queen Avatara"
            className="h-full w-full object-cover object-[35%_16%]"
          />
        </div>

        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <h2 className="text-2xl font-black uppercase tracking-wider text-amber-300 md:text-3xl">
            Pharaoh's Treasure Claimed!
          </h2>
          <Sparkles className="h-5 w-5 text-amber-400" />
        </div>

        <p className="mb-6 text-xs text-amber-200/90 md:text-sm">
          Queen Avatara has overcome the ancient perils of Karnak Temple and unlocked the legendary
          Golden Sarcophagus of Pharaoh Ramses!
        </p>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-amber-500/30 bg-stone-900/80 p-3">
            <Trophy className="mx-auto mb-1 h-5 w-5 text-amber-400" />
            <div className="text-[10px] uppercase text-stone-400">Total Score</div>
            <div className="text-base font-mono font-black text-amber-300">{stats.score}</div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-stone-900/80 p-3">
            <Coins className="mx-auto mb-1 h-5 w-5 text-yellow-400" />
            <div className="text-[10px] uppercase text-stone-400">Coins Found</div>
            <div className="text-base font-mono font-black text-yellow-300">{stats.coins}</div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-stone-900/80 p-3">
            <Key className="mx-auto mb-1 h-5 w-5 text-cyan-400" />
            <div className="text-[10px] uppercase text-stone-400">Sacred Relics</div>
            <div className="text-base font-mono font-black text-cyan-300">4 / 4</div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-stone-900/80 p-3">
            <Shield className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
            <div className="text-[10px] uppercase text-stone-400">Health Left</div>
            <div className="text-base font-mono font-black text-emerald-300">
              {Math.round(stats.health)} HP
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onRestart}
            className="flex-1 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-sm font-black text-stone-950 shadow-lg hover:from-amber-400 hover:to-yellow-400 transition-transform active:scale-95"
          >
            Play Again
          </button>
          <button
            onClick={onContinueExplore}
            className="flex-1 rounded-xl border border-stone-700 bg-stone-900 py-3 text-sm font-bold text-stone-200 hover:border-amber-500 hover:text-amber-300 transition-colors"
          >
            Explore Temple
          </button>
        </div>
      </div>
    </div>
  );
});
