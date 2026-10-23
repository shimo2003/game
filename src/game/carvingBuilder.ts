import * as THREE from 'three';
import { WallCarving, WALL_CARVINGS } from './riddles';

/**
 * Creates a procedural high-resolution texture for an ancient Egyptian wall carving stela.
 */
function createCarvingStelaTexture(carving: WallCarving): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Weathered Sandstone background
  const grad = ctx.createLinearGradient(0, 0, 512, 1024);
  grad.addColorStop(0, '#593e25');
  grad.addColorStop(0.3, '#755232');
  grad.addColorStop(0.7, '#6b492b');
  grad.addColorStop(1, '#47311d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Stone grain noise
  const imgData = ctx.getImageData(0, 0, 512, 1024);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 40;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n * 0.85));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * 0.6));
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. Ornate Gilded Inscribed Cartouche Border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 14;
  ctx.strokeRect(24, 24, 464, 976);

  ctx.strokeStyle = '#2d1c0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 448, 960);

  // 3. Winged Sun Disk / Golden Header Emblem
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(256, 120, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#f3ba2f';
  ctx.lineWidth = 8;
  // Wings
  ctx.beginPath();
  ctx.moveTo(256 - 54, 120);
  ctx.quadraticCurveTo(100, 80, 50, 140);
  ctx.quadraticCurveTo(140, 160, 256 - 48, 140);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(256 + 54, 120);
  ctx.quadraticCurveTo(412, 80, 462, 140);
  ctx.quadraticCurveTo(372, 160, 256 + 48, 140);
  ctx.stroke();

  // 4. Carved Sacred Hieroglyph Line
  ctx.fillStyle = '#ffeaa7';
  ctx.font = 'bold 54px serif';
  ctx.textAlign = 'center';
  ctx.fillText(carving.hieroglyph, 256, 240);

  // 5. Inscribed Title & Chamber Cartouche
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 26px serif';
  ctx.fillText(carving.title.toUpperCase(), 256, 310);

  ctx.fillStyle = '#a68a56';
  ctx.font = 'italic 20px serif';
  ctx.fillText(`[ ${carving.chamberName} ]`, 256, 350);

  // Horizontal divider
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(80, 380);
  ctx.lineTo(432, 380);
  ctx.stroke();

  // 6. Cryptic Inscribed Verse Stanzas
  ctx.fillStyle = '#fffae6';
  ctx.font = '22px serif';
  ctx.textAlign = 'center';
  let yPos = 430;
  carving.riddleVerses.slice(0, 6).forEach((verse) => {
    ctx.fillText(`“ ${verse} ”`, 256, yPos);
    yPos += 54;
  });

  // 7. Bottom Symbol & Seal
  ctx.font = 'bold 44px serif';
  ctx.fillStyle = '#e5b83b';
  ctx.fillText('𓋹  𓊹  𓏤  𓆣', 256, 880);

  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#ffcf40';
  ctx.fillText('PRESS [E] OR ACTION TO DECIPHER', 256, 940);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface WallCarvingRig {
  carving: WallCarving;
  meshGroup: THREE.Group;
  light: THREE.PointLight;
  glowMesh: THREE.Mesh;
}

/**
 * Builds all 3D Wall Carvings and attaches them into the temple scene.
 */
export function buildWallCarvings(): {
  carvingsGroup: THREE.Group;
  carvingRigs: WallCarvingRig[];
} {
  const carvingsGroup = new THREE.Group();
  carvingsGroup.name = 'AncientWallCarvings';
  const carvingRigs: WallCarvingRig[] = [];

  // Memory Optimization: Share static geometries and materials across all stelae
  const slabGeo = new THREE.BoxGeometry(1.6, 2.6, 0.18);
  const archGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.18, 24, 1, false, 0, Math.PI);
  archGeo.rotateZ(Math.PI / 2);
  archGeo.rotateX(Math.PI / 2);
  const frameGeo = new THREE.BoxGeometry(1.7, 2.7, 0.08);
  const glowGeo = new THREE.RingGeometry(0.2, 0.35, 16);

  const sideMat = new THREE.MeshStandardMaterial({
    color: 0x543b24,
    roughness: 0.85,
    metalness: 0.1,
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xc99700,
    metalness: 0.8,
    roughness: 0.3,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffb703,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  });

  WALL_CARVINGS.forEach((carving) => {
    const group = new THREE.Group();
    group.position.set(carving.x, 2.3, carving.z);

    // Compute rotation facing out from the wall
    const angle = Math.atan2(carving.wallNormalX, carving.wallNormalZ);
    group.rotation.y = angle;

    // Front has unique procedural hieroglyph texture
    const texture = createCarvingStelaTexture(carving);
    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.65,
      metalness: 0.25,
      bumpScale: 0.05,
    });

    const materials = [
      sideMat, // right
      sideMat, // left
      sideMat, // top
      sideMat, // bottom
      frontMat, // front (facing player)
      sideMat, // back (embedded in wall)
    ];

    const slabMesh = new THREE.Mesh(slabGeo, materials);
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    group.add(slabMesh);

    // 2. Arched Top Cap
    const archMesh = new THREE.Mesh(archGeo, sideMat);
    archMesh.position.set(0, 1.3, 0);
    group.add(archMesh);

    // 3. Bronze Gilded Framing
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 0, -0.06);
    group.add(frameMesh);

    // 4. Subtle mystical floating glyph
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(0, 0.2, 0.12);
    group.add(glowMesh);

    // 5. Dedicated ambient golden point light
    const light = new THREE.PointLight(0xffaa22, 1.4, 6.5, 2);
    light.position.set(0, 0, 0.6);
    group.add(light);

    carvingsGroup.add(group);

    carvingRigs.push({
      carving,
      meshGroup: group,
      light,
      glowMesh,
    });
  });

  return {
    carvingsGroup,
    carvingRigs,
  };
}
