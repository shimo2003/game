import * as THREE from 'three';

/**
 * High-Resolution Textures for Realistic Queen Avatara
 * Combines procedural artistry with authentic extraction from the user's provided asset:
 * /assets/aistudio/thread-375535741-16347651166823343429_da0400fe.png
 */

/**
 * Creates a detailed, realistic Egyptian Queen face texture.
 * Paints lifelike facial features: kohl eyeliner, almond eyes with hazel/dark pupils,
 * delicate eyebrows, sculpted nose shading, blushed cheekbones, and soft rose lips.
 * Also asynchronously loads and overlays the authentic face from the user's uploaded portrait!
 */
export function createRealisticFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Base realistic skin tone gradient (warm Egyptian olive/bronze complexion)
  const baseGrad = ctx.createRadialGradient(512, 512, 100, 512, 512, 512);
  baseGrad.addColorStop(0, '#e8be92');
  baseGrad.addColorStop(0.6, '#deb082');
  baseGrad.addColorStop(1, '#c59567');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Micro skin pores and subtle warmth
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 12;
    d[i] = Math.min(255, Math.max(0, d[i] + n + 4)); // red warmth
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  // Helper for drawing realistic face features
  function drawProceduralFacialFeatures() {
    // Cheekbone soft rose blush
    const drawBlush = (x: number, y: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, 120);
      g.addColorStop(0, 'rgba(215, 115, 95, 0.35)');
      g.addColorStop(1, 'rgba(215, 115, 95, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 120, 0, Math.PI * 2);
      ctx.fill();
    };
    drawBlush(340, 560);
    drawBlush(684, 560);

    // Sculpted Nose bridge highlight & contour
    ctx.fillStyle = 'rgba(255, 235, 215, 0.45)';
    ctx.beginPath();
    ctx.moveTo(502, 380);
    ctx.lineTo(522, 380);
    ctx.lineTo(528, 600);
    ctx.lineTo(496, 600);
    ctx.fill();

    // Nose tip & nostrils
    ctx.fillStyle = 'rgba(160, 95, 60, 0.5)';
    ctx.beginPath();
    ctx.arc(470, 615, 14, 0, Math.PI * 2);
    ctx.arc(554, 615, 14, 0, Math.PI * 2);
    ctx.fill();

    // Realistic Egyptian Almond Eyes with Kohl Eyeliner
    const drawEye = (cx: number, cy: number, isRight: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);
      if (isRight) ctx.scale(-1, 1);

      // Sclera (eye white with soft gradient)
      ctx.fillStyle = '#f4f0ec';
      ctx.beginPath();
      ctx.moveTo(-90, 0);
      ctx.quadraticCurveTo(0, -42, 90, 0);
      ctx.quadraticCurveTo(0, 42, -90, 0);
      ctx.fill();

      // Iris (Hazel / Dark brown with golden flecks)
      const irisGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 36);
      irisGrad.addColorStop(0, '#1c100a');
      irisGrad.addColorStop(0.5, '#4a2c14');
      irisGrad.addColorStop(0.85, '#6a431f');
      irisGrad.addColorStop(1, '#1b1008');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0a0604';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Specular Eye Highlights (lifelike gloss)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(8, -8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(-7, 9, 3, 0, Math.PI * 2);
      ctx.fill();

      // Bold Egyptian Kohl Eyeliner with wing
      ctx.strokeStyle = '#120b07';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(-95, 0);
      ctx.quadraticCurveTo(0, -48, 90, 0);
      // Outer dramatic wing
      ctx.quadraticCurveTo(120, -12, 140, -18);
      ctx.stroke();

      // Lower lash line
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-90, 0);
      ctx.quadraticCurveTo(0, 44, 90, 0);
      ctx.stroke();

      ctx.restore();
    };

    drawEye(345, 460, false);
    drawEye(679, 460, true);

    // Natural Arched Eyebrows
    const drawEyebrow = (cx: number, cy: number, isRight: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);
      if (isRight) ctx.scale(-1, 1);
      ctx.strokeStyle = '#22140c';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-90, 10);
      ctx.quadraticCurveTo(-20, -22, 60, -12);
      ctx.quadraticCurveTo(95, -2, 110, 18);
      ctx.stroke();
      ctx.restore();
    };

    drawEyebrow(345, 395, false);
    drawEyebrow(679, 395, true);

    // Realistic Sculpted Lips (Natural Rose / Terracotta hue with 3D volume)
    const lipGrad = ctx.createLinearGradient(0, 680, 0, 770);
    lipGrad.addColorStop(0, '#b85a4f');
    lipGrad.addColorStop(0.5, '#c86b5e');
    lipGrad.addColorStop(1, '#9a4238');
    ctx.fillStyle = lipGrad;

    // Upper Lip (Cupid's bow)
    ctx.beginPath();
    ctx.moveTo(420, 715);
    ctx.quadraticCurveTo(475, 685, 512, 700);
    ctx.quadraticCurveTo(549, 685, 604, 715);
    ctx.quadraticCurveTo(512, 735, 420, 715);
    ctx.fill();

    // Lower Lip
    ctx.beginPath();
    ctx.moveTo(425, 720);
    ctx.quadraticCurveTo(512, 730, 599, 720);
    ctx.quadraticCurveTo(512, 785, 425, 720);
    ctx.fill();

    // Lip highlight
    ctx.fillStyle = 'rgba(255, 230, 220, 0.4)';
    ctx.beginPath();
    ctx.ellipse(512, 746, 32, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawProceduralFacialFeatures();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;

  // Asynchronously load user's actual image and blend the real face on top
  const img = new Image();
  img.crossOrigin = 'anonymous';
  // Check user uploaded model sheet
  img.src = '/assets/aistudio/Gemini_Generated_Image_hiwssghiwssghiws_439cbc0e.jpg';
  img.onerror = () => {
    // Secondary fallback
    img.src = '/public/assets/aistudio/Gemini_Generated_Image_hiwssghiwssghiws_439cbc0e.jpg';
  };
  img.onload = () => {
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1024;
      tempCanvas.height = 1024;
      const tCtx = tempCanvas.getContext('2d')!;

      // Crop face from the main standing Queen Avatara figure:
      // The character's face in the model sheet is at x ~ 28%-44%, y ~ 12%-24%
      const sx = img.width * 0.28;
      const sy = img.height * 0.12;
      const sw = img.width * 0.16;
      const sh = img.height * 0.13;

      tCtx.drawImage(img, sx, sy, sw, sh, 100, 100, 824, 824);

      // Draw onto main face canvas with sharp blending
      ctx.globalAlpha = 0.94;
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.globalAlpha = 1.0;

      texture.needsUpdate = true;
    } catch {
      // Procedural face is already drawn and pristine
    }
  };

  return texture;
}

/**
 * Royal Egyptian Pectoral Collar (Usekh) Texture
 * Multi-tiered bands of pure gold, lapis lazuli, turquoise, and carnelian beads
 * with the central winged scarab medallion from the image.
 */
export function createPectoralCollarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Pure burnished gold background
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  bgGrad.addColorStop(0, '#d4af37');
  bgGrad.addColorStop(0.3, '#ffd700');
  bgGrad.addColorStop(0.5, '#fff0a0');
  bgGrad.addColorStop(0.7, '#ffd700');
  bgGrad.addColorStop(1, '#c29a28');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Concentric tiered rows of Egyptian precious stone beads
  const rows = [
    { y: 30, h: 28, color: '#143477', name: 'lapis' },
    { y: 70, h: 22, color: '#00c4b4', name: 'turquoise' },
    { y: 104, h: 20, color: '#b23a22', name: 'carnelian' },
    { y: 136, h: 32, color: '#d4af37', name: 'gold_beads' },
    { y: 180, h: 26, color: '#143477', name: 'lapis' },
    { y: 220, h: 24, color: '#00c4b4', name: 'turquoise' },
    { y: 256, h: 35, color: '#ffcc00', name: 'lotus_drops' },
  ];

  rows.forEach((r) => {
    ctx.fillStyle = r.color;
    ctx.fillRect(0, r.y, 1024, r.h);

    // Bead separators
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 1024; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, r.y);
      ctx.lineTo(x, r.y + r.h);
      ctx.stroke();
    }
  });

  // Central Winged Golden Sun Disk & Scarab Medallion
  ctx.save();
  ctx.translate(512, 360);
  // Gold disk
  const sunGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 75);
  sunGrad.addColorStop(0, '#fff4b8');
  sunGrad.addColorStop(0.7, '#ffd700');
  sunGrad.addColorStop(1, '#b8860b');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.fill();

  // Oval Turquoise cabochon gem in center
  ctx.fillStyle = '#00e5d0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 32, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gem bevel highlight
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(-5, -6, 22, 32, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Royal Linen Fabric Texture with Woven Weave Bump & Gold Embroidery
 */
export function createRoyalLinenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Silky off-white Egyptian linen base
  ctx.fillStyle = '#faf8f2';
  ctx.fillRect(0, 0, 512, 512);

  // Fine woven cloth fiber texture
  ctx.fillStyle = 'rgba(210, 200, 185, 0.3)';
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 512, 1.5);
  }
  for (let x = 0; x < 512; x += 4) {
    ctx.fillRect(x, 0, 1.5, 512);
  }

  // Golden Royal Embroidered Borders (chevron meander)
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(0, 460, 512, 52);

  ctx.strokeStyle = '#fff0a0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x < 512; x += 32) {
    ctx.moveTo(x, 470);
    ctx.lineTo(x + 16, 495);
    ctx.lineTo(x + 32, 470);
  }
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Hair Strands Specular & Color Map
 */
export function createHairTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep Espresso / Brunette black base
  ctx.fillStyle = '#1c120c';
  ctx.fillRect(0, 0, 512, 512);

  // Individual hair strands with warm amber & chocolate specular streaks
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const alpha = 0.15 + Math.random() * 0.35;
    const shade = Math.random() > 0.4 ? 'rgba(78, 50, 32, ' : 'rgba(110, 74, 48, ';
    ctx.strokeStyle = shade + alpha + ')';
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 30, 256, x + (Math.random() - 0.5) * 40, 512);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
