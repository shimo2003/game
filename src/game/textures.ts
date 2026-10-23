import * as THREE from 'three';

/**
 * Procedural Egyptian Textures for Karnak Temple
 * Crafted via HTML5 2D Canvas to ensure 0% external asset 404s.
 */

// Draw an authentic Egyptian Ankh symbol
function drawAnkh(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Loop top
  ctx.ellipse(0, -18, 9, 14, 0, 0, Math.PI * 2);
  // Crossbar
  ctx.moveTo(-14, -4);
  ctx.lineTo(14, -4);
  // Vertical stem
  ctx.moveTo(0, -4);
  ctx.lineTo(0, 22);
  ctx.stroke();
  ctx.restore();
}

// Draw Eye of Horus (Wedjat)
function drawEyeOfHorus(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Upper eyelid arch
  ctx.moveTo(-20, 0);
  ctx.quadraticCurveTo(0, -14, 20, 0);
  // Lower eyelid
  ctx.quadraticCurveTo(0, 10, -20, 0);
  // Iris
  ctx.arc(0, -2, 5, 0, Math.PI * 2);
  // Tear line drop
  ctx.moveTo(2, 6);
  ctx.lineTo(2, 18);
  // Spiral curl
  ctx.moveTo(10, 5);
  ctx.quadraticCurveTo(18, 14, 12, 22);
  ctx.stroke();
  ctx.restore();
}

// Draw Scarab Beetle glyph
function drawScarabGlyph(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Body
  ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
  // Center line
  ctx.moveTo(0, -14);
  ctx.lineTo(0, 14);
  // Head & sun disk
  ctx.moveTo(-4, -14);
  ctx.arc(0, -18, 4, 0, Math.PI * 2);
  // Legs
  ctx.moveTo(-9, -6);
  ctx.lineTo(-17, -10);
  ctx.moveTo(-10, 2);
  ctx.lineTo(-18, 2);
  ctx.moveTo(-8, 10);
  ctx.lineTo(-16, 16);

  ctx.moveTo(9, -6);
  ctx.lineTo(17, -10);
  ctx.moveTo(10, 2);
  ctx.lineTo(18, 2);
  ctx.moveTo(8, 10);
  ctx.lineTo(16, 16);
  ctx.stroke();
  ctx.restore();
}

// Draw Falcon / Horus glyph
function drawHorusFalcon(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Head and beak
  ctx.moveTo(-6, -16);
  ctx.lineTo(8, -16);
  ctx.lineTo(14, -12);
  ctx.lineTo(6, -10);
  // Body curved back
  ctx.quadraticCurveTo(12, 10, 4, 20);
  ctx.lineTo(-8, 20);
  ctx.lineTo(-6, -16);
  // Wing sweep
  ctx.moveTo(-2, -6);
  ctx.quadraticCurveTo(10, 0, 2, 16);
  ctx.stroke();
  ctx.restore();
}

/**
 * Create procedural Karnak sandstone wall texture with relief hieroglyphs
 */
export function createHieroglyphicWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base sandstone color gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#c79d63');
  grad.addColorStop(0.5, '#b88a50');
  grad.addColorStop(1, '#a3773e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Sand noise and stone porosity
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 38;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.7));
  }
  ctx.putImageData(imgData, 0, 0);

  // Large megalithic sandstone block mortar lines
  const rows = 4;
  const rowHeight = 1024 / rows;
  ctx.strokeStyle = '#5c401f';
  ctx.lineWidth = 6;

  for (let r = 0; r <= rows; r++) {
    const y = r * rowHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();

    // Subtle stone highlight bevel on bottom edge
    ctx.strokeStyle = 'rgba(255, 230, 180, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y + 4);
    ctx.lineTo(1024, y + 4);
    ctx.stroke();
    ctx.strokeStyle = '#5c401f';
    ctx.lineWidth = 6;
  }

  // Vertical block joints staggered
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 256;
    for (let c = 0; c < 4; c++) {
      const x = ((c * 340 + offset) % 1024);
      ctx.beginPath();
      ctx.moveTo(x, r * rowHeight);
      ctx.lineTo(x, (r + 1) * rowHeight);
      ctx.stroke();
    }
  }

  // Carved Hieroglyphs inside blocks
  ctx.strokeStyle = 'rgba(64, 40, 16, 0.75)';
  ctx.fillStyle = 'rgba(45, 28, 10, 0.15)';

  for (let r = 0; r < rows; r++) {
    const cy = r * rowHeight + rowHeight * 0.5;
    for (let c = 0; c < 4; c++) {
      const cx = (c * 256 + 128 + ((r * 60) % 90)) % 1024;
      const symbolType = (r * 4 + c) % 4;
      if (symbolType === 0) drawAnkh(ctx, cx, cy, 1.3);
      else if (symbolType === 1) drawEyeOfHorus(ctx, cx, cy, 1.2);
      else if (symbolType === 2) drawScarabGlyph(ctx, cx, cy, 1.3);
      else drawHorusFalcon(ctx, cx, cy, 1.2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Sandstone Floor Pavement Texture
 */
export function createSandstoneFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base slab color
  ctx.fillStyle = '#b38a53';
  ctx.fillRect(0, 0, 512, 512);

  // Grain
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 32;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 0.75));
  }
  ctx.putImageData(imgData, 0, 0);

  // Large stone tile grids (2x2 slabs)
  ctx.strokeStyle = '#4e3415';
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, 248, 248);
  ctx.strokeRect(260, 4, 248, 248);
  ctx.strokeRect(4, 260, 248, 248);
  ctx.strokeRect(260, 260, 248, 248);

  // Weathering edge cracks
  ctx.strokeStyle = 'rgba(78, 52, 21, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 20);
  ctx.lineTo(135, 38);
  ctx.lineTo(130, 55);

  ctx.moveTo(380, 270);
  ctx.lineTo(395, 290);
  ctx.lineTo(410, 295);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Papyrus Capital Column Fluting & Gold Ring Texture
 */
export function createColumnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base stone
  ctx.fillStyle = '#b88f55';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical fluted reeds
  const stripes = 16;
  const w = 512 / stripes;
  for (let i = 0; i < stripes; i++) {
    const x = i * w;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#8c6837');
    g.addColorStop(0.5, '#cfa369');
    g.addColorStop(1, '#78562a');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, w, 512);
  }

  // Horizontal Royal Egyptian Bands (Gold & Lapis Blue)
  ctx.fillStyle = '#d4af37'; // Royal Gold
  ctx.fillRect(0, 40, 512, 24);
  ctx.fillRect(0, 440, 512, 24);

  ctx.fillStyle = '#1e3f8a'; // Lapis Lazuli
  ctx.fillRect(0, 70, 512, 14);
  ctx.fillRect(0, 420, 512, 14);

  // Lotus blossom triangles at top
  ctx.fillStyle = '#2d6a4f'; // Nile green
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 32, 120);
    ctx.lineTo(i * 32 + 16, 90);
    ctx.lineTo(i * 32 + 32, 120);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Royal Gold Sarcophagus / Relic Texture
 */
export function createPharaohGoldTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, '#ffd700');
  g.addColorStop(0.3, '#ffae19');
  g.addColorStop(0.6, '#ffd700');
  g.addColorStop(1, '#c5941c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  // Lapis lazuli chevron inlays (Tutankhamun headdress nemes pattern)
  ctx.fillStyle = '#143477';
  for (let y = 0; y < 512; y += 40) {
    ctx.fillRect(0, y, 512, 16);
  }

  // Turquoise accent lines
  ctx.strokeStyle = '#2ac8c8';
  ctx.lineWidth = 3;
  for (let y = 0; y < 512; y += 40) {
    ctx.strokeRect(0, y - 2, 512, 20);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Flame / Spark particle sprite
 */
export function createFireParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  g.addColorStop(0, 'rgba(255, 255, 240, 1)');
  g.addColorStop(0.2, 'rgba(255, 200, 50, 0.9)');
  g.addColorStop(0.6, 'rgba(255, 80, 10, 0.5)');
  g.addColorStop(1, 'rgba(200, 20, 0, 0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
