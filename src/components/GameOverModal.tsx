import React from 'react';
import { Skull, RotateCcw, Shield, Sparkles, Coins, Lock } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { PlayerInventory } from '../types/store';

interface GameOverModalProps {
  stats: PlayerStats;
  inventory: PlayerInventory;
  onUseReviveCharm: () => void;
  onQuickBuyReviveUSD: () => void;
  onReviveWithGold: () => void;
  onRespawn: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = React.memo(({
  stats,
  inventory,
  onUseReviveCharm,
  onQuickBuyReviveUSD,
  onReviveWithGold,
  onRespawn,
}) => {
  const hasReviveCharm = inventory.reviveCharms > 0;
  const canAffordGoldRevive = stats.coins >= 300;

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-red-500/70 bg-stone-950 p-6 text-center shadow-[0_0_60px_rgba(239,68,68,0.3)]">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/40 bg-red-950/40 text-red-400">
          <Skull className="h-8 w-8 animate-pulse" />
        </div>

        <h2 className="mb-1 text-2xl font-black uppercase tracking-wider text-red-400">
          Queen Avatara Has Fallen!
        </h2>

        <p className="mb-4 text-xs text-stone-300">
          Ancient temple traps or mummy guardians overcame you. Defy the curse and continue your expedition!
        </p>

        {/* Expedition Stats */}
        <div className="mb-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-3.5 text-xs text-stone-300 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-stone-400">Relics Recovered:</span>
            <span className="font-bold text-amber-300">{stats.keysCollected} / 4 Relics</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Coins Collected:</span>
            <span className="font-bold text-yellow-300">{stats.coins} Gold</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Expedition Score:</span>
            <span className="font-bold text-amber-200">{stats.score}</span>
          </div>
        </div>

        {/* Resurrection Options */}
        <div className="space-y-2 mb-4">
          {hasReviveCharm ? (
            <button
              onClick={onUseReviveCharm}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-black text-stone-950 shadow-xl hover:brightness-110 transition-transform active:scale-95"
            >
              <Shield className="h-4 w-4" />
              <span>Use Ankh Revive ({inventory.reviveCharms} Left)</span>
            </button>
          ) : (
            <>
              {/* Quick In-App Purchase Instant Revive */}
              <button
                onClick={onQuickBuyReviveUSD}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 py-3 text-sm font-black text-stone-950 shadow-xl hover:brightness-110 transition-transform active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Instant Revive on the Spot ($0.99 IAP)</span>
              </button>

              {/* Revive with in-game gold */}
              <button
                onClick={onReviveWithGold}
                disabled={!canAffordGoldRevive}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  canAffordGoldRevive
                    ? 'border-yellow-500/60 bg-yellow-950/60 text-yellow-300 hover:bg-yellow-900/60'
                    : 'border-stone-800 bg-stone-900/40 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Coins className="h-4 w-4 text-yellow-400" />
                <span>
                  {canAffordGoldRevive
                    ? 'Resurrect with 300 Gold Coins'
                    : `Need 300 Gold to Revive (You have ${stats.coins})`}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Respawn at Gate */}
        <button
          onClick={onRespawn}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900/90 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restart from Temple Entrance (Free)</span>
        </button>
      </div>
    </div>
  );
});
