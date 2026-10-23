import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Flame,
  HelpCircle,
  RotateCcw,
  Zap,
  Glasses,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Footprints,
  BookOpen,
} from 'lucide-react';
import { CameraMode, GlassesMode } from '../game/GameEngine';
import { WallCarving } from '../game/riddles';

interface ControlsOverlayProps {
  cameraMode: CameraMode;
  glassesMode?: GlassesMode;
  onSetCameraMode: (mode: CameraMode) => void;
  onSetGlassesMode?: (mode: GlassesMode) => void;
  onToggleTorch: () => void;
  torchLit: boolean;
  onJump: () => void;
  onRoll: () => void;
  onInteract: () => void;
  onSprintToggle: (sprinting: boolean) => void;
  onVirtualMove: (vx: number, vy: number) => void;
  onReset: () => void;
  nearbyCarving?: WallCarving | null;
  onOpenHelpAndTutorial: (tab?: 'tutorial' | 'controls' | 'riddles' | 'glasses') => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = React.memo(({
  cameraMode,
  glassesMode = 'off',
  onSetCameraMode,
  onSetGlassesMode,
  onToggleTorch,
  torchLit,
  onJump,
  onRoll,
  onInteract,
  onSprintToggle,
  onVirtualMove,
  onReset,
  nearbyCarving,
  onOpenHelpAndTutorial,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [mobileInputType, setMobileInputType] = useState<'dpad' | 'joystick' | 'both'>('dpad');

  // Virtual Joystick state for mobile
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // D-Pad active interval loop
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeDirectionRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyH') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    };
  }, []);

  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsJoystickActive(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartPos.current = { x: clientX, y: clientY };
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isJoystickActive) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - touchStartPos.current.x;
    const dy = clientY - touchStartPos.current.y;
    const maxRadius = 45;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
    }

    const normX = knobX / maxRadius;
    const normY = knobY / maxRadius;
    onVirtualMove(normX, normY);
  };

  const handleJoystickEnd = () => {
    setIsJoystickActive(false);
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = 'translate(0px, 0px)';
    }
    onVirtualMove(0, 0);
  };

  // Tactile D-Pad Move Button Handler (continuous while pressed)
  const startDirectionalMove = (vx: number, vy: number) => {
    activeDirectionRef.current = { vx, vy };
    onVirtualMove(vx, vy);

    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    moveIntervalRef.current = setInterval(() => {
      onVirtualMove(activeDirectionRef.current.vx, activeDirectionRef.current.vy);
    }, 40);
  };

  const stopDirectionalMove = () => {
    activeDirectionRef.current = { vx: 0, vy: 0 };
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    onVirtualMove(0, 0);
  };

  const toggleSprint = () => {
    const next = !isSprinting;
    setIsSprinting(next);
    onSprintToggle(next);
  };

  return (
    <>
      {/* Mobile On-Screen Controls: Tactile Move Buttons & Action Pad */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex items-end justify-between px-3 md:hidden">
        {/* Left: Mobile Movement Controls (D-Pad or Joystick) */}
        <div className="pointer-events-auto flex flex-col items-center gap-1.5">
          {/* Mode Switcher Pill */}
          <div className="flex rounded-full border border-amber-500/30 bg-stone-950/80 p-0.5 text-[9px] backdrop-blur-md">
            <button
              onClick={() => setMobileInputType('dpad')}
              className={`rounded-full px-2 py-0.5 font-bold transition-colors ${
                mobileInputType === 'dpad' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
              }`}
            >
              D-Pad
            </button>
            <button
              onClick={() => setMobileInputType('joystick')}
              className={`rounded-full px-2 py-0.5 font-bold transition-colors ${
                mobileInputType === 'joystick' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
              }`}
            >
              Joystick
            </button>
          </div>

          {/* 1. Tactile Directional D-Pad Move Buttons */}
          {(mobileInputType === 'dpad' || mobileInputType === 'both') && (
            <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl border-2 border-amber-500/40 bg-stone-950/85 p-2 shadow-2xl backdrop-blur-md">
              {/* Up / Forward Button */}
              <button
                onTouchStart={() => startDirectionalMove(0, -1)}
                onTouchEnd={stopDirectionalMove}
                onMouseDown={() => startDirectionalMove(0, -1)}
                onMouseUp={stopDirectionalMove}
                aria-label="Move Forward"
                className="absolute top-1.5 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/60 bg-gradient-to-b from-amber-500/40 to-stone-900 text-amber-300 shadow-md active:bg-amber-500 active:text-stone-950 select-none touch-none"
              >
                <ArrowUp className="h-6 w-6 stroke-[3]" />
              </button>

              {/* Down / Backward Button */}
              <button
                onTouchStart={() => startDirectionalMove(0, 1)}
                onTouchEnd={stopDirectionalMove}
                onMouseDown={() => startDirectionalMove(0, 1)}
                onMouseUp={stopDirectionalMove}
                aria-label="Move Backward"
                className="absolute bottom-1.5 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/60 bg-gradient-to-t from-amber-500/40 to-stone-900 text-amber-300 shadow-md active:bg-amber-500 active:text-stone-950 select-none touch-none"
              >
                <ArrowDown className="h-6 w-6 stroke-[3]" />
              </button>

              {/* Left / Turn Left Button */}
              <button
                onTouchStart={() => startDirectionalMove(-1, 0)}
                onTouchEnd={stopDirectionalMove}
                onMouseDown={() => startDirectionalMove(-1, 0)}
                onMouseUp={stopDirectionalMove}
                aria-label="Turn Left"
                className="absolute left-1.5 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-500/40 to-stone-900 text-amber-300 shadow-md active:bg-amber-500 active:text-stone-950 select-none touch-none"
              >
                <ArrowLeft className="h-6 w-6 stroke-[3]" />
              </button>

              {/* Right / Turn Right Button */}
              <button
                onTouchStart={() => startDirectionalMove(1, 0)}
                onTouchEnd={stopDirectionalMove}
                onMouseDown={() => startDirectionalMove(1, 0)}
                onMouseUp={stopDirectionalMove}
                aria-label="Turn Right"
                className="absolute right-1.5 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/60 bg-gradient-to-l from-amber-500/40 to-stone-900 text-amber-300 shadow-md active:bg-amber-500 active:text-stone-950 select-none touch-none"
              >
                <ArrowRight className="h-6 w-6 stroke-[3]" />
              </button>

              {/* Center RUN / MOVE Button */}
              <div
                onTouchStart={() => startDirectionalMove(0, -1)}
                onTouchEnd={stopDirectionalMove}
                onMouseDown={() => startDirectionalMove(0, -1)}
                onMouseUp={stopDirectionalMove}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400 bg-amber-500/30 text-amber-200 text-[10px] font-black tracking-tighter shadow-inner active:scale-90 select-none touch-none"
              >
                MOVE
              </div>
            </div>
          )}

          {/* 2. Analog Floating Joystick */}
          {mobileInputType === 'joystick' && (
            <div
              ref={joystickBaseRef}
              onTouchStart={handleJoystickStart}
              onTouchMove={handleJoystickMove}
              onTouchEnd={handleJoystickEnd}
              onMouseDown={handleJoystickStart}
              onMouseMove={handleJoystickMove}
              onMouseUp={handleJoystickEnd}
              className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-amber-500/40 bg-stone-950/80 shadow-2xl backdrop-blur-sm touch-none"
            >
              <div
                ref={joystickKnobRef}
                className="h-14 w-14 rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg transition-transform duration-75 flex items-center justify-center text-stone-950 font-black text-xs"
              >
                ✦
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={onInteract}
              className="flex h-12 w-14 items-center justify-center rounded-xl border border-amber-500/70 bg-stone-950/90 text-xs font-black text-amber-300 shadow-xl active:bg-amber-500 active:text-stone-950"
            >
              ACTION
            </button>
            <button
              onClick={onJump}
              className="flex h-12 w-14 items-center justify-center rounded-xl border border-amber-500/70 bg-stone-950/90 text-xs font-black text-amber-300 shadow-xl active:bg-amber-500 active:text-stone-950"
            >
              JUMP
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRoll}
              className="flex h-12 w-14 items-center justify-center rounded-xl border border-amber-500/70 bg-stone-950/90 text-xs font-black text-amber-300 shadow-xl active:bg-amber-500 active:text-stone-950"
            >
              ROLL
            </button>
            <button
              onClick={toggleSprint}
              className={`flex h-12 w-14 items-center justify-center rounded-xl border text-xs font-black shadow-xl ${
                isSprinting
                  ? 'border-amber-400 bg-amber-500 text-stone-950'
                  : 'border-stone-700 bg-stone-950/90 text-amber-300 active:bg-amber-500/40'
              }`}
            >
              <Zap className="h-4 w-4 mr-0.5" />
              RUN
            </button>
          </div>
        </div>
      </div>

      {/* Unified Bottom Control Dock (PC & Desktop controls + Glasses mode) */}
      <div
        className={`fixed bottom-2.5 left-1/2 z-30 -translate-x-1/2 transition-all duration-300 ${
          isCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
        style={{ width: 'min(980px, 96vw)' }}
      >
        {/* Floating Nearby Wall Carving Prompt (Actionable on PC & Mobile) */}
        {nearbyCarving && (
          <div className="pointer-events-auto mb-2 flex justify-center animate-bounce">
            <button
              onClick={onInteract}
              className="flex items-center gap-2 rounded-2xl border-2 border-amber-400 bg-stone-950/95 px-4 py-2 text-xs font-bold text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.6)] backdrop-blur-md hover:bg-amber-500/25 active:scale-95 transition-all"
            >
              <span className="text-lg">{nearbyCarving.glyphSymbol}</span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-amber-400/60 bg-amber-500/30 px-1.5 py-0.5 font-mono text-[10px] font-black text-amber-300">
                  E
                </kbd>
                <span>Inspect Carving:</span>
              </span>
              <span className="font-extrabold text-amber-300 underline decoration-amber-500/60 underline-offset-2">
                {nearbyCarving.title}
              </span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse ml-0.5" />
            </button>
          </div>
        )}

        {/* Collapse/Expand Toggle Tab */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 rounded-t-xl border-t border-x border-amber-500/40 bg-stone-950/90 px-4 py-1 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-md hover:bg-stone-900"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Show View & 3D Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container - Cleaned of direct command list */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-stone-950/90 p-2.5 shadow-2xl backdrop-blur-md md:px-4 md:py-2.5">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-stone-800 bg-stone-900/80 p-1">
            <Camera className="ml-1 h-3.5 w-3.5 text-amber-400" />
            <button
              onClick={() => onSetCameraMode('follow')}
              className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                cameraMode === 'follow'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Follow
            </button>
            <button
              onClick={() => onSetCameraMode('portrait')}
              className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                cameraMode === 'portrait'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Inspect
            </button>
            <button
              onClick={() => onSetCameraMode('cinematic')}
              className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                cameraMode === 'cinematic'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Orbit
            </button>
            <button
              onClick={() => onSetCameraMode('overhead')}
              className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                cameraMode === 'overhead'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Top-Down
            </button>
          </div>

          {/* Stereoscopic Glasses & VR Mode Switcher */}
          {onSetGlassesMode && (
            <div className="flex items-center gap-1 rounded-xl border border-stone-800 bg-stone-900/80 p-1">
              <Glasses className="ml-1 h-3.5 w-3.5 text-cyan-400" />
              <button
                onClick={() => onSetGlassesMode('off')}
                className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                  glassesMode === 'off'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                2D PC
              </button>
              <button
                onClick={() => onSetGlassesMode('anaglyph')}
                title="Play with Red-Cyan 3D Glasses on any PC screen"
                className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors flex items-center gap-1 ${
                  glassesMode === 'anaglyph'
                    ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                    : 'text-stone-400 hover:text-red-300'
                }`}
              >
                <span>3D Glasses</span>
                <span className="text-[9px] font-mono text-cyan-300">(V)</span>
              </button>
              <button
                onClick={() => onSetGlassesMode('vr_sbs')}
                title="Play with VR Headset / Cardboard / SBS 3D Glasses"
                className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors flex items-center gap-1 ${
                  glassesMode === 'vr_sbs'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                    : 'text-stone-400 hover:text-cyan-300'
                }`}
              >
                <span>VR Headset</span>
              </button>
            </div>
          )}

          {/* Utility buttons: Torch, Accessible Help & Tutorial, Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTorch}
              className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold transition-colors ${
                torchLit
                  ? 'border-amber-400 bg-amber-500/30 text-amber-300'
                  : 'border-stone-700 bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>Torch (T)</span>
            </button>

            {/* Prominent Accessible Help & Interactive Tutorial Button */}
            <button
              onClick={() => onOpenHelpAndTutorial('tutorial')}
              aria-label="Open Guide & Tutorial (H)"
              title="Open Guide & Tutorial (H or ?)"
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 px-3 py-1 text-xs font-bold text-amber-300 shadow-md hover:border-amber-400 hover:bg-amber-500/40 active:scale-95 transition-all"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>Help & Tutorial</span>
              <kbd className="hidden sm:inline-block rounded bg-stone-800 px-1 py-0.2 text-[9px] font-mono text-amber-300 border border-stone-700">
                H
              </kbd>
            </button>

            <button
              onClick={onReset}
              aria-label="Restart Maze"
              className="flex items-center gap-1 rounded-xl border border-stone-700 bg-stone-900 px-2.5 py-1 text-xs font-medium text-stone-300 hover:border-amber-500/60 hover:text-amber-300"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
});
