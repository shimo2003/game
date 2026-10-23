import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { KarnakMazeData, PlayerStats } from '../types/game';

import { MummyRig } from '../game/mummy';

interface MiniMapProps {
  mazeData: KarnakMazeData | null;
  getPlayerPos: () => THREE.Vector3;
  getPlayerAngle: () => number;
  getMummies?: () => MummyRig[];
  stats: PlayerStats;
  onClose: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = React.memo(({
  mazeData,
  getPlayerPos,
  getPlayerAngle,
  getMummies,
  stats,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticCacheRef = useRef<HTMLCanvasElement | null>(null);

  // Pre-render static 23x23 maze walls, pillars, and floors once to avoid 529 draw calls per frame
  useEffect(() => {
    if (!mazeData) return;
    const staticCanvas = document.createElement('canvas');
    staticCanvas.width = 480;
    staticCanvas.height = 480;
    const sCtx = staticCanvas.getContext('2d');
    if (!sCtx) return;

    const size = 480;
    sCtx.fillStyle = '#1c150e';
    sCtx.fillRect(0, 0, size, size);

    const cellW = size / mazeData.width;
    const cellH = size / mazeData.height;

    for (let z = 0; z < mazeData.height; z++) {
      for (let x = 0; x < mazeData.width; x++) {
        const type = mazeData.grid[z][x];
        if (type === 1) {
          sCtx.fillStyle = '#3a2b1c';
          sCtx.fillRect(x * cellW, z * cellH, cellW + 0.5, cellH + 0.5);
        } else if (type === 2) {
          sCtx.fillStyle = '#8c6837';
          sCtx.beginPath();
          sCtx.arc((x + 0.5) * cellW, (z + 0.5) * cellH, cellW * 0.4, 0, Math.PI * 2);
          sCtx.fill();
        } else if (type === 4) {
          sCtx.fillStyle = '#4a3b1a';
          sCtx.fillRect(x * cellW, z * cellH, cellW, cellH);
        } else {
          sCtx.fillStyle = '#221a11';
          sCtx.fillRect(x * cellW, z * cellH, cellW, cellH);
        }
      }
    }

    staticCacheRef.current = staticCanvas;
  }, [mazeData]);

  useEffect(() => {
    let animId: number;

    const renderMap = () => {
      const canvas = canvasRef.current;
      if (!canvas || !mazeData) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      ctx.clearRect(0, 0, size, size);

      // Render pre-cached static background with a single blit
      if (staticCacheRef.current) {
        ctx.drawImage(staticCacheRef.current, 0, 0, size, size);
      } else {
        ctx.fillStyle = '#1c150e';
        ctx.fillRect(0, 0, size, size);
      }

      const cellW = size / mazeData.width;
      const cellH = size / mazeData.height;

      // Draw Gate
      mazeData.gates.forEach((gate) => {
        const gx = (gate.x / 4) * cellW;
        const gz = (gate.z / 4) * cellH;
        ctx.fillStyle = gate.isOpen ? '#00e5ff' : '#d4af37';
        ctx.fillRect(gx - cellW * 0.6, gz - cellH * 0.2, cellW * 1.2, cellH * 0.4);
      });

      // Draw Traps
      mazeData.traps.forEach((trap) => {
        const tx = (trap.x / 4 + 0.5) * cellW;
        const tz = (trap.z / 4 + 0.5) * cellH;
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(tx, tz, cellW * 0.25, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Relic Keys
      mazeData.collectibles
        .filter((c) => c.type === 'scarab_key' && !c.collected)
        .forEach((key) => {
          const kx = (key.x / 4 + 0.5) * cellW;
          const kz = (key.z / 4 + 0.5) * cellH;
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(kx, kz, cellW * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#00c4b4';
          ctx.beginPath();
          ctx.arc(kx, kz, cellW * 0.2, 0, Math.PI * 2);
          ctx.fill();
        });

      // Draw Pharaoh's Treasure Sarcophagus
      const sx = (mazeData.sanctumX / 4 + 0.5) * cellW;
      const sz = (mazeData.sanctumZ / 4 + 0.5) * cellH;
      ctx.fillStyle = '#ffbb00';
      ctx.fillRect(sx - cellW * 0.6, sz - cellH * 0.4, cellW * 1.2, cellH * 0.8);

      // Draw AI Mummy Guards & Vision Cones
      if (getMummies) {
        const mummies = getMummies();
        mummies.forEach((mummy) => {
          const mx = (mummy.data.x / 4 + 0.5) * cellW;
          const mz = (mummy.data.z / 4 + 0.5) * cellH;

          ctx.save();
          ctx.translate(mx, mz);
          ctx.rotate(mummy.data.angle);

          // Vision cone projection on map
          ctx.fillStyle = mummy.data.state === 'chase'
            ? 'rgba(255, 30, 30, 0.35)'
            : mummy.data.state === 'search'
            ? 'rgba(255, 160, 0, 0.25)'
            : 'rgba(255, 200, 0, 0.15)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, cellW * 2.2, -Math.PI / 6 + Math.PI / 2, Math.PI / 6 + Math.PI / 2);
          ctx.closePath();
          ctx.fill();

          // Mummy marker body
          ctx.fillStyle = mummy.data.state === 'chase' ? '#ff0033' : '#e65c00';
          ctx.beginPath();
          ctx.arc(0, 0, cellW * 0.35, 0, Math.PI * 2);
          ctx.fill();

          // Direction pointer
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(0, cellW * 0.45);
          ctx.lineTo(-cellW * 0.15, cellW * 0.1);
          ctx.lineTo(cellW * 0.15, cellW * 0.1);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        });
      }

      // Draw Queen Avatara Player Position & Facing Arrow
      const playerPos = getPlayerPos();
      const playerAngle = getPlayerAngle();
      const px = (playerPos.x / 4 + 0.5) * cellW;
      const pz = (playerPos.z / 4 + 0.5) * cellH;

      ctx.save();
      ctx.translate(px, pz);
      ctx.rotate(playerAngle);

      // Player directional pointer
      ctx.fillStyle = '#00f5d4';
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(-5, -6);
      ctx.lineTo(5, -6);
      ctx.closePath();
      ctx.fill();

      // Halo ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(renderMap);
    };

    renderMap();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mazeData, getPlayerPos, getPlayerAngle]);

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex flex-col items-center rounded-2xl border-2 border-amber-500/60 bg-stone-950 p-4 shadow-2xl md:p-6">
        <div className="mb-3 flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-amber-300 md:text-lg">
              Karnak Temple Map & Sanctuaries
            </span>
            <span className="text-xs text-amber-500/80">
              ({stats.keysCollected}/{stats.totalKeys} Relics Found)
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-700 bg-stone-900 text-stone-300 hover:text-amber-300"
          >
            ✕
          </button>
        </div>

        {/* Canvas Minimap */}
        <div className="relative overflow-hidden rounded-xl border border-amber-600/40 shadow-inner">
          <canvas ref={canvasRef} width={380} height={380} className="max-h-[60vh] max-w-[80vw]" />
        </div>

        {/* Map Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-300">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#00f5d4]" />
            <span>Queen Avatara</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ffd700]" />
            <span>Sacred Relic Keys</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-[#ffbb00]" />
            <span>Pharaoh's Sanctum</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#e63946]" />
            <span>Ancient Traps</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff0033]" />
            <span>Mummy Guards</span>
          </div>
        </div>
      </div>
    </div>
  );
});
