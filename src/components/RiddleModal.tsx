import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  Eye,
  Key,
  Flame,
  CheckCircle2,
  X,
  Compass,
  Scroll,
} from 'lucide-react';
import { WallCarving, markCarvingDeciphered, getDecipheredCarvingIds } from '../game/riddles';
import { sound } from '../audio/soundSystem';

interface RiddleModalProps {
  carving: WallCarving;
  onClose: () => void;
  onOpenTutorial?: () => void;
}

export const RiddleModal: React.FC<RiddleModalProps> = React.memo(({ carving, onClose, onOpenTutorial }) => {
  const [isDeciphered, setIsDeciphered] = useState<boolean>(() => {
    return getDecipheredCarvingIds().includes(carving.id);
  });
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    sound.playRiddleInspect();
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onClose();
      }
      if (e.code === 'Enter' || e.code === 'KeyE') {
        if (!isDeciphered) {
          handleDecipher();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [carving.id, isDeciphered, onClose]);

  const handleDecipher = () => {
    sound.playRiddleSolve();
    markCarvingDeciphered(carving.id);
    setIsDeciphered(true);
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 2000);
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 p-6 shadow-[0_0_60px_rgba(212,175,55,0.35)] text-stone-100">
        {/* Decorative Egyptian Corner Accents */}
        <div className="pointer-events-none absolute top-0 left-0 h-16 w-16 border-t-4 border-l-4 border-amber-400/90 rounded-tl-3xl" />
        <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 border-t-4 border-r-4 border-amber-400/90 rounded-tr-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 border-b-4 border-l-4 border-amber-400/90 rounded-bl-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 border-b-4 border-r-4 border-amber-400/90 rounded-br-3xl" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/60 bg-amber-950/40 text-lg shadow-inner">
              {carving.glyphSymbol}
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80">
                Ancient Wall Carving • {carving.chamberName}
              </span>
              <h2 className="text-lg font-black tracking-wide text-amber-200">
                {carving.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Carving"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-800 bg-stone-900/80 text-stone-400 hover:border-amber-400 hover:text-amber-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Hieroglyphic Cartouche Plaque */}
        <div className="my-4 flex items-center justify-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/20 py-2.5 px-4 shadow-inner">
          <span className="text-2xl font-serif tracking-widest text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            {carving.hieroglyph}
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400/90">
            [ Inscribed by High Priests of Karnak ]
          </span>
        </div>

        {/* Cryptic Riddle Verses in Stone */}
        <div className="relative rounded-2xl border border-stone-800 bg-stone-900/70 p-4 shadow-md">
          <div className="absolute top-2 right-2 text-stone-700 font-serif text-3xl select-none opacity-40">
            𓉐
          </div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Scroll className="h-3.5 w-3.5" />
            <span>The Sacred Stanzas:</span>
          </h4>
          <div className="space-y-1 text-sm font-serif italic text-amber-100/90 leading-relaxed pl-3 border-l-2 border-amber-500/50">
            {carving.riddleVerses.map((verse, idx) => (
              <p key={idx} className="transition-all hover:text-amber-300">
                “{verse}”
              </p>
            ))}
          </div>
        </div>

        {/* Deciphered Puzzle Wisdom Box */}
        {isDeciphered ? (
          <div className="mt-4 rounded-2xl border-2 border-emerald-500/60 bg-emerald-950/25 p-4 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Priest’s Guidance Deciphered</span>
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                NEARBY PUZZLE HINT
              </span>
            </div>
            <p className="text-xs font-sans text-stone-200 leading-relaxed font-medium">
              {carving.puzzleHint}
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-500/40 bg-stone-900/40 p-3 text-center">
            <p className="text-xs text-stone-300">
              The high priest’s hieroglyphs contain a clear clue for solving the{' '}
              <strong className="text-amber-300">{carving.nearbyPuzzleName}</strong>.
            </p>
            <button
              onClick={handleDecipher}
              className="flex items-center gap-2 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-xs font-black text-stone-950 shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4 fill-stone-950" />
              <span>Decipher Hieroglyphs (Reveal Hint)</span>
            </button>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-stone-800">
          {onOpenTutorial && (
            <button
              onClick={() => {
                onClose();
                onOpenTutorial();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-amber-300 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Controls & Mechanics Guide</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-xl border border-amber-500/80 bg-stone-900 px-5 py-2 text-xs font-bold text-amber-300 hover:bg-stone-800 active:scale-95 transition-all"
          >
            Return to Karnak Maze (Esc)
          </button>
        </div>
      </div>
    </div>
  );
});
