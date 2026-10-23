import * as THREE from 'three';
import {
  createRealisticFaceTexture,
  createPectoralCollarTexture,
  createRoyalLinenTexture,
  createHairTexture,
} from './characterTextures';

/**
 * Realistic 3D Queen Avatara Character Model
 * Faithfully designed after the user's authentic character portrait:
 * - Lifelike facial features, kohl eyeliner, almond eyes, and drop earrings
 * - Volumetric flowing dark locks with realistic sheen
 * - Royal Egyptian crown with golden lotus rays & turquoise sapphire jewel
 * - Multi-tiered Usekh pectoral collar with central winged scarab medallion
 * - Pleated royal white Egyptian linen robes with embroidered gold sashes
 * - Golden armlets, wrist bracers, and explorer torch
 */

export interface CharacterRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  hairGroup: THREE.Group;
  crown: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftCalf: THREE.Group;
  rightCalf: THREE.Group;
  torchLight: THREE.PointLight;
  torchFlameMesh: THREE.Group;
  torchSparks: THREE.Points;
  torchHolder: THREE.Group;
  updateAnimation: (
    delta: number,
    isMoving: boolean,
    isSprinting: boolean,
    isJumping: boolean,
    isRolling: boolean,
    torchLit: boolean
  ) => void;
  applySkin: (skinId: 'default' | 'ra_sun' | 'lapis_priestess') => void;
}

export function createQueenAvatara(): CharacterRig {
  const root = new THREE.Group();
  root.name = 'QueenAvatara';

  // Textures
  const faceTexture = createRealisticFaceTexture();
  const collarTexture = createPectoralCollarTexture();
  const linenTexture = createRoyalLinenTexture();
  const hairTexture = createHairTexture();

  // Advanced PBR Materials (MeshPhysicalMaterial for lifelike skin, gold, and gems)
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0b288,
    roughness: 0.48,
    metalness: 0.02,
    clearcoat: 0.12,
    clearcoatRoughness: 0.35,
  });

  const faceMat = new THREE.MeshPhysicalMaterial({
    map: faceTexture,
    roughness: 0.45,
    metalness: 0.02,
    clearcoat: 0.18,
    clearcoatRoughness: 0.25,
  });

  const royalGoldMat = new THREE.MeshPhysicalMaterial({
    color: 0xffd95c,
    metalness: 0.95,
    roughness: 0.18,
    clearcoat: 0.4,
    clearcoatRoughness: 0.12,
  });

  const deepGoldMat = new THREE.MeshPhysicalMaterial({
    color: 0xc89828,
    metalness: 0.92,
    roughness: 0.25,
    clearcoat: 0.2,
  });

  const darkHairMat = new THREE.MeshPhysicalMaterial({
    map: hairTexture,
    color: 0x180f0a,
    roughness: 0.38,
    metalness: 0.15,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
  });

  const royalLinenMat = new THREE.MeshStandardMaterial({
    map: linenTexture,
    roughness: 0.65,
    metalness: 0.04,
  });

  const pureWhiteSilkMat = new THREE.MeshStandardMaterial({
    color: 0xfbf9f5,
    roughness: 0.5,
    metalness: 0.05,
  });

  const turquoiseGemMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0d8,
    roughness: 0.12,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    transmission: 0.25,
    ior: 1.6,
  });

  const lapisGemMat = new THREE.MeshPhysicalMaterial({
    color: 0x12429a,
    roughness: 0.18,
    metalness: 0.2,
    clearcoat: 0.8,
  });

  const bronzeTorchMat = new THREE.MeshStandardMaterial({
    color: 0x6e4928,
    roughness: 0.55,
    metalness: 0.65,
  });

  // 1. Hips / Pelvis Pivot
  const hips = new THREE.Group();
  hips.position.y = 0.96;
  root.add(hips);

  // Anatomical Pelvis & Hips
  const pelvisGeo = new THREE.CylinderGeometry(0.23, 0.21, 0.22, 16);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, pureWhiteSilkMat);
  pelvisMesh.castShadow = true;
  pelvisMesh.receiveShadow = true;
  hips.add(pelvisMesh);

  // Royal Golden Belt (Ornate Egyptian Cincture)
  const beltGeo = new THREE.CylinderGeometry(0.245, 0.245, 0.09, 20);
  const beltMesh = new THREE.Mesh(beltGeo, royalGoldMat);
  beltMesh.position.y = 0.06;
  beltMesh.castShadow = true;
  hips.add(beltMesh);

  // Carved Belt Buckle with Winged Sun Disk
  const buckleGroup = new THREE.Group();
  buckleGroup.position.set(0, 0.05, 0.25);

  const buckleBase = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.04), royalGoldMat);
  buckleGroup.add(buckleBase);

  const buckleGem = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), turquoiseGemMat);
  buckleGem.scale.set(1, 1.4, 0.6);
  buckleGem.position.z = 0.025;
  buckleGroup.add(buckleGem);
  hips.add(buckleGroup);

  // Royal Pleated Skirt Drapery / Sashes (front & back)
  const sashGroup = new THREE.Group();
  
  // Long Pleated Ceremonial Gown Skirt (Faithful to model reference sheet)
  const gownSkirtGeo = new THREE.CylinderGeometry(0.24, 0.38, 0.88, 20, 2, true);
  const gownSkirt = new THREE.Mesh(gownSkirtGeo, pureWhiteSilkMat);
  gownSkirt.position.set(0, -0.42, 0);
  gownSkirt.castShadow = true;
  sashGroup.add(gownSkirt);

  // Embroidered Golden Hem Band at bottom of gown
  const gownHemGeo = new THREE.CylinderGeometry(0.375, 0.385, 0.08, 20, 1, true);
  const gownHem = new THREE.Mesh(gownHemGeo, royalGoldMat);
  gownHem.position.set(0, -0.84, 0);
  gownHem.castShadow = true;
  sashGroup.add(gownHem);

  // Central Vertical Lotus Tabard / Embroidered Front Sash (matching reference)
  const tabardGeo = new THREE.BoxGeometry(0.18, 0.72, 0.025);
  const tabardMesh = new THREE.Mesh(tabardGeo, royalGoldMat);
  tabardMesh.position.set(0, -0.34, 0.24);
  tabardMesh.rotation.x = -0.05;
  tabardMesh.castShadow = true;
  sashGroup.add(tabardMesh);

  // Inner silk tabard panel
  const tabardInnerGeo = new THREE.BoxGeometry(0.13, 0.66, 0.015);
  const tabardInner = new THREE.Mesh(tabardInnerGeo, pureWhiteSilkMat);
  tabardInner.position.set(0, -0.34, 0.255);
  tabardInner.rotation.x = -0.05;
  sashGroup.add(tabardInner);

  const frontSashGeo = new THREE.BoxGeometry(0.2, 0.42, 0.03);
  const frontSash = new THREE.Mesh(frontSashGeo, royalLinenMat);
  frontSash.position.set(0, -0.18, 0.22);
  frontSash.rotation.x = -0.06;
  frontSash.castShadow = true;
  sashGroup.add(frontSash);

  // Golden Fringe at sash hem
  const fringeGeo = new THREE.BoxGeometry(0.2, 0.06, 0.04);
  const fringe = new THREE.Mesh(fringeGeo, royalGoldMat);
  fringe.position.set(0, -0.38, 0.235);
  sashGroup.add(fringe);

  // Side hip peplum draperies
  const peplumGeo = new THREE.CylinderGeometry(0.27, 0.32, 0.28, 16, 1, true, -Math.PI / 2, Math.PI);
  const peplum = new THREE.Mesh(peplumGeo, royalLinenMat);
  peplum.position.set(0, -0.08, 0);
  peplum.castShadow = true;
  sashGroup.add(peplum);

  hips.add(sashGroup);

  // 2. Torso & Chest
  const torso = new THREE.Group();
  torso.position.y = 0.16;
  hips.add(torso);

  // Sculpted Waist and Chest with natural feminine curvature
  const ribcageGeo = new THREE.CylinderGeometry(0.25, 0.21, 0.34, 16);
  const ribcageMesh = new THREE.Mesh(ribcageGeo, pureWhiteSilkMat);
  ribcageMesh.position.y = 0.17;
  ribcageMesh.castShadow = true;
  ribcageMesh.receiveShadow = true;
  torso.add(ribcageMesh);

  // Upper Chest / Décolletage skin
  const decolletageGeo = new THREE.CylinderGeometry(0.23, 0.24, 0.12, 16);
  const decolletageMesh = new THREE.Mesh(decolletageGeo, skinMat);
  decolletageMesh.position.y = 0.32;
  torso.add(decolletageMesh);

  // 3. Ornate Egyptian Usekh Pectoral Collar (Broad necklace with tiered gems)
  const collarGroup = new THREE.Group();
  collarGroup.position.set(0, 0.34, 0);

  const collarGeo = new THREE.CylinderGeometry(0.285, 0.265, 0.14, 24, 1, true);
  const collarMesh = new THREE.Mesh(
    collarGeo,
    new THREE.MeshPhysicalMaterial({
      map: collarTexture,
      metalness: 0.75,
      roughness: 0.25,
      clearcoat: 0.3,
    })
  );
  collarMesh.castShadow = true;
  collarGroup.add(collarMesh);

  // Gold beaded outer rim on collar
  const rimTorus = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.02, 8, 24), royalGoldMat);
  rimTorus.rotateX(Math.PI / 2);
  rimTorus.position.y = -0.07;
  collarGroup.add(rimTorus);

  // Central Royal Medallion (Winged Scarab & Turquoise Gem from portrait)
  const chestMedallionGroup = new THREE.Group();
  chestMedallionGroup.position.set(0, -0.02, 0.27);

  const medallionPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 16), royalGoldMat);
  medallionPlate.rotateX(Math.PI / 2);
  chestMedallionGroup.add(medallionPlate);

  const medallionGem = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), turquoiseGemMat);
  medallionGem.scale.set(1, 1.3, 0.5);
  medallionGem.position.z = 0.02;
  chestMedallionGroup.add(medallionGem);

  // Wing spread accents
  const wingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.015), royalGoldMat);
  wingLeft.position.set(-0.08, 0, 0.01);
  wingLeft.rotation.z = -0.2;
  chestMedallionGroup.add(wingLeft);

  const wingRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.015), royalGoldMat);
  wingRight.position.set(0.08, 0, 0.01);
  wingRight.rotation.z = 0.2;
  chestMedallionGroup.add(wingRight);

  collarGroup.add(chestMedallionGroup);
  torso.add(collarGroup);

  // 4. Neck and Realistic Head
  const neckGeo = new THREE.CylinderGeometry(0.088, 0.1, 0.12, 14);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.y = 0.43;
  torso.add(neckMesh);

  const head = new THREE.Group();
  head.position.y = 0.55;
  torso.add(head);

  // Cranium base mesh
  const craniumGeo = new THREE.SphereGeometry(0.165, 24, 24);
  craniumGeo.scale(0.88, 1.08, 0.95);
  const craniumMesh = new THREE.Mesh(craniumGeo, skinMat);
  craniumMesh.castShadow = true;
  head.add(craniumMesh);

  // Realistic Front Facial Plane with authentic painted features from portrait
  // A smoothly curved quad mesh centered on the front of the cranium for sharp, undistorted face rendering
  const facePlaneGeo = new THREE.PlaneGeometry(0.25, 0.28, 12, 12);
  const pos = facePlaneGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    // Gentle curvature wrapping around cranium cheeks
    const zOffset = -Math.pow(px / 0.125, 2) * 0.04 - Math.pow(py / 0.14, 2) * 0.012;
    pos.setZ(i, zOffset);
  }
  facePlaneGeo.computeVertexNormals();

  const facePlaneMesh = new THREE.Mesh(facePlaneGeo, faceMat);
  facePlaneMesh.position.set(0, -0.01, 0.148);
  facePlaneMesh.castShadow = true;
  head.add(facePlaneMesh);

  // Egyptian Chandelier Drop Earrings (Golden Discs with Filigree from image)
  [-0.15, 0.15].forEach((earX) => {
    const earringGroup = new THREE.Group();
    earringGroup.position.set(earX, -0.03, 0.02);

    const earStud = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), royalGoldMat);
    earringGroup.add(earStud);

    // Dangling golden disc with filigree
    const discGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.008, 16);
    discGeo.rotateX(Math.PI / 2);
    const dropDisc = new THREE.Mesh(discGeo, royalGoldMat);
    dropDisc.position.y = -0.045;
    earringGroup.add(dropDisc);

    // Inner turquoise bead
    const earGem = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), turquoiseGemMat);
    earGem.position.set(0, -0.045, 0.005);
    earringGroup.add(earGem);

    head.add(earringGroup);
  });

  // 5. Volumetric Flowing Hair
  const hairGroup = new THREE.Group();
  head.add(hairGroup);

  // Hair Crown Cap with middle part
  const hairCapGeo = new THREE.SphereGeometry(0.178, 20, 20);
  hairCapGeo.scale(0.92, 0.95, 1.05);
  const hairCap = new THREE.Mesh(hairCapGeo, darkHairMat);
  hairCap.position.set(0, 0.05, -0.035);
  hairCap.castShadow = true;
  hairGroup.add(hairCap);

  // Cascading Back Hair Locks flowing past shoulders
  const backHairGroup = new THREE.Group();
  backHairGroup.position.set(0, -0.08, -0.12);

  // Central thick flowing wave
  const wave1Geo = new THREE.CylinderGeometry(0.18, 0.24, 0.48, 14);
  wave1Geo.scale(1, 1, 0.48);
  const wave1 = new THREE.Mesh(wave1Geo, darkHairMat);
  wave1.position.set(0, -0.1, 0);
  wave1.castShadow = true;
  backHairGroup.add(wave1);

  // Lower hair curl ends
  const waveEndGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.22, 12);
  waveEndGeo.scale(1, 1, 0.4);
  const waveEnd = new THREE.Mesh(waveEndGeo, darkHairMat);
  waveEnd.position.set(0, -0.36, 0.02);
  waveEnd.castShadow = true;
  backHairGroup.add(waveEnd);
  hairGroup.add(backHairGroup);

  // Soft Front Hair Strands framing cheeks (as seen in portrait)
  [-0.14, 0.14].forEach((strandX, idx) => {
    const sideStrand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.02, 0.38, 8),
      darkHairMat
    );
    sideStrand.position.set(strandX, -0.09, 0.08);
    sideStrand.rotation.z = idx === 0 ? 0.08 : -0.08;
    sideStrand.rotation.x = -0.1;
    sideStrand.castShadow = true;
    hairGroup.add(sideStrand);
  });

  // 6. Queen's Royal Crown of Karnak
  // In the portrait: High arched golden back-throne rays + lotus tiara + glowing blue sapphire gem
  const crown = new THREE.Group();
  crown.position.set(0, 0.17, 0);
  head.add(crown);

  // Base circular diadem circlet
  const circletGeo = new THREE.TorusGeometry(0.175, 0.025, 10, 24);
  circletGeo.rotateX(Math.PI / 2);
  const circlet = new THREE.Mesh(circletGeo, royalGoldMat);
  circlet.castShadow = true;
  crown.add(circlet);

  // High Arched Lotus Backboard / Throne Rays (signature feature in portrait!)
  const backboardGroup = new THREE.Group();
  backboardGroup.position.set(0, 0.16, -0.12);
  backboardGroup.rotation.x = -0.18;

  // Main arch plate
  const archPlateGeo = new THREE.BoxGeometry(0.32, 0.3, 0.035);
  const archPlate = new THREE.Mesh(archPlateGeo, royalGoldMat);
  archPlate.castShadow = true;
  backboardGroup.add(archPlate);

  // Radiating lotus rays / petals on backboard
  for (let i = -3; i <= 3; i++) {
    const ray = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 6), deepGoldMat);
    ray.position.set(i * 0.045, 0.18, 0);
    ray.rotation.z = -i * 0.12;
    backboardGroup.add(ray);
  }
  crown.add(backboardGroup);

  // Front Pointed Lotus Tiara & Lotus Blossom Spire
  const frontTiaraGroup = new THREE.Group();
  frontTiaraGroup.position.set(0, 0.06, 0.16);

  // Front gold crown crest
  const crestGeo = new THREE.ConeGeometry(0.08, 0.18, 6);
  crestGeo.scale(1.2, 1, 0.4);
  const crest = new THREE.Mesh(crestGeo, royalGoldMat);
  crest.rotation.x = 0.22;
  frontTiaraGroup.add(crest);

  // Prominent Glowing Royal Blue Sapphire / Turquoise Jewel (from the portrait)
  const royalGemGeo = new THREE.SphereGeometry(0.048, 16, 16);
  royalGemGeo.scale(0.9, 1.3, 0.6);
  const royalGemMesh = new THREE.Mesh(royalGemGeo, turquoiseGemMat);
  royalGemMesh.position.set(0, 0.04, 0.05);
  frontTiaraGroup.add(royalGemMesh);

  // Ornate beaded gold bezel encircling gem
  const bezelTorus = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 8, 20), royalGoldMat);
  bezelTorus.scale.set(0.9, 1.3, 1);
  bezelTorus.position.set(0, 0.04, 0.04);
  frontTiaraGroup.add(bezelTorus);

  crown.add(frontTiaraGroup);

  // 7. Left Arm & Hand
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.31, 0.33, 0);
  torso.add(leftArm);

  // Golden Royal Shoulder Pauldron with turquoise cabochon
  const leftPauldronGroup = new THREE.Group();
  const leftPauldronMesh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), royalGoldMat);
  leftPauldronMesh.scale.set(1.2, 0.7, 1.2);
  leftPauldronGroup.add(leftPauldronMesh);

  const leftPauldronGem = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), turquoiseGemMat);
  leftPauldronGem.scale.set(0.8, 1.4, 0.5);
  leftPauldronGem.position.set(0, 0.045, 0.02);
  leftPauldronGroup.add(leftPauldronGem);
  leftArm.add(leftPauldronGroup);

  // Upper arm with skin
  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.044, 0.25, 10), skinMat);
  leftUpperArm.position.y = -0.125;
  leftUpperArm.castShadow = true;
  leftArm.add(leftUpperArm);

  // Wide Flowing Bell Sleeve (White silk draped sleeve with gold trim)
  const leftSleeveGeo = new THREE.CylinderGeometry(0.065, 0.16, 0.32, 16, 1, true);
  const leftSleeve = new THREE.Mesh(leftSleeveGeo, pureWhiteSilkMat);
  leftSleeve.position.set(0, -0.16, 0);
  leftSleeve.castShadow = true;
  leftArm.add(leftSleeve);

  // Gold Trim at cuff of bell sleeve
  const leftSleeveCuffGeo = new THREE.TorusGeometry(0.16, 0.012, 6, 16);
  leftSleeveCuffGeo.rotateX(Math.PI / 2);
  const leftSleeveCuff = new THREE.Mesh(leftSleeveCuffGeo, royalGoldMat);
  leftSleeveCuff.position.set(0, -0.32, 0);
  leftArm.add(leftSleeveCuff);

  // Golden Snake Armlet (coiled around upper bicep)
  const leftArmlet = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 8, 16), royalGoldMat);
  leftArmlet.rotateX(Math.PI / 2);
  leftArmlet.position.y = -0.09;
  leftArm.add(leftArmlet);

  const leftForearm = new THREE.Group();
  leftForearm.position.y = -0.25;
  leftArm.add(leftForearm);

  const leftForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.038, 0.23, 10), skinMat);
  leftForearmMesh.position.y = -0.115;
  leftForearmMesh.castShadow = true;
  leftForearm.add(leftForearmMesh);

  // Ornate Egyptian Gold Wrist Bracer with Turquoise Inlay
  const leftBracer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.09, 12), royalGoldMat);
  leftBracer.position.y = -0.11;
  leftForearm.add(leftBracer);

  const leftBracerGem = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), turquoiseGemMat);
  leftBracerGem.position.set(0, -0.11, 0.05);
  leftForearm.add(leftBracerGem);

  // Articulated Hand & Fingers
  const leftHandGroup = new THREE.Group();
  leftHandGroup.position.y = -0.24;

  const leftPalm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.075, 0.035), skinMat);
  leftHandGroup.add(leftPalm);

  // Fingers
  const leftFingers = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.06, 0.025), skinMat);
  leftFingers.position.set(0, -0.065, 0.005);
  leftHandGroup.add(leftFingers);

  // Golden finger ring
  const leftRing = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 6, 10), royalGoldMat);
  leftRing.position.set(0.015, -0.05, 0.01);
  leftHandGroup.add(leftRing);

  leftForearm.add(leftHandGroup);

  // 8. Right Arm & Hand with Ancient Explorer Torch
  const rightArm = new THREE.Group();
  rightArm.position.set(0.31, 0.33, 0);
  torso.add(rightArm);

  const rightPauldronGroup = new THREE.Group();
  const rightPauldronMesh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), royalGoldMat);
  rightPauldronMesh.scale.set(1.2, 0.7, 1.2);
  rightPauldronGroup.add(rightPauldronMesh);

  const rightPauldronGem = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), turquoiseGemMat);
  rightPauldronGem.scale.set(0.8, 1.4, 0.5);
  rightPauldronGem.position.set(0, 0.045, 0.02);
  rightPauldronGroup.add(rightPauldronGem);
  rightArm.add(rightPauldronGroup);

  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.044, 0.25, 10), skinMat);
  rightUpperArm.position.y = -0.125;
  rightUpperArm.castShadow = true;
  rightArm.add(rightUpperArm);

  // Wide Flowing Bell Sleeve (Right)
  const rightSleeveGeo = new THREE.CylinderGeometry(0.065, 0.16, 0.32, 16, 1, true);
  const rightSleeve = new THREE.Mesh(rightSleeveGeo, pureWhiteSilkMat);
  rightSleeve.position.set(0, -0.16, 0);
  rightSleeve.castShadow = true;
  rightArm.add(rightSleeve);

  const rightSleeveCuffGeo = new THREE.TorusGeometry(0.16, 0.012, 6, 16);
  rightSleeveCuffGeo.rotateX(Math.PI / 2);
  const rightSleeveCuff = new THREE.Mesh(rightSleeveCuffGeo, royalGoldMat);
  rightSleeveCuff.position.set(0, -0.32, 0);
  rightArm.add(rightSleeveCuff);

  const rightArmlet = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 8, 16), royalGoldMat);
  rightArmlet.rotateX(Math.PI / 2);
  rightArmlet.position.y = -0.09;
  rightArm.add(rightArmlet);

  const rightForearm = new THREE.Group();
  rightForearm.position.y = -0.25;
  rightArm.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.038, 0.23, 10), skinMat);
  rightForearmMesh.position.y = -0.115;
  rightForearmMesh.castShadow = true;
  rightForearm.add(rightForearmMesh);

  const rightBracer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.09, 12), royalGoldMat);
  rightBracer.position.y = -0.11;
  rightForearm.add(rightBracer);

  // Hand & Torch Holder
  const torchHolder = new THREE.Group();
  torchHolder.position.y = -0.24;
  rightForearm.add(torchHolder);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.075, 0.035), skinMat);
  torchHolder.add(rightHand);

  // 9. Ancient Karnak Temple Torch
  const torchGroup = new THREE.Group();
  torchGroup.position.set(0, 0.16, 0.08);
  torchGroup.rotation.x = 0.28;

  // Carved bronze shaft with lotus fluting
  const shaftGeo = new THREE.CylinderGeometry(0.02, 0.028, 0.58, 10);
  const shaft = new THREE.Mesh(shaftGeo, bronzeTorchMat);
  torchGroup.add(shaft);

  // Torch Sconce Cup with Egyptian gold collars
  const cupGeo = new THREE.CylinderGeometry(0.058, 0.025, 0.12, 10);
  const cup = new THREE.Mesh(cupGeo, royalGoldMat);
  cup.position.y = 0.3;
  torchGroup.add(cup);

  // Linen pitch head with dark charcoal/pitch wrap
  const pitchHeadGeo = new THREE.CylinderGeometry(0.052, 0.048, 0.1, 10);
  const pitchHead = new THREE.Mesh(
    pitchHeadGeo,
    new THREE.MeshStandardMaterial({ color: 0x24180e, roughness: 0.9 })
  );
  pitchHead.position.y = 0.37;
  torchGroup.add(pitchHead);

  // Realistic Multi-Layered Flame Mesh
  const torchFlameMesh = new THREE.Group();
  torchFlameMesh.position.y = 0.46;

  // Inner Hot White/Yellow Core Flame
  const innerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.045, 0.18, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
  );
  innerFlame.position.y = 0.09;
  torchFlameMesh.add(innerFlame);

  // Middle Golden Fire Envelope
  const midFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.072, 0.26, 10),
    new THREE.MeshBasicMaterial({ color: 0xffaa11, transparent: true, opacity: 0.85 })
  );
  midFlame.position.y = 0.13;
  torchFlameMesh.add(midFlame);

  // Outer Soft Amber Glow Teardrop
  const outerFlame = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.4 })
  );
  outerFlame.scale.set(0.8, 1.6, 0.8);
  outerFlame.position.y = 0.14;
  torchFlameMesh.add(outerFlame);

  torchGroup.add(torchFlameMesh);

  // Real-Time Torch Point Light
  const torchLight = new THREE.PointLight(0xff9922, 3.2, 16, 1.4);
  torchLight.position.set(0, 0.48, 0);
  torchLight.castShadow = true;
  torchLight.shadow.bias = -0.002;
  torchGroup.add(torchLight);

  // Fire Spark Embers
  const sparkGeo = new THREE.BufferGeometry();
  const sparkCount = 28;
  const sparkPositions = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount * 3; i += 3) {
    sparkPositions[i] = (Math.random() - 0.5) * 0.18;
    sparkPositions[i + 1] = 0.45 + Math.random() * 0.35;
    sparkPositions[i + 2] = (Math.random() - 0.5) * 0.18;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  const torchSparks = new THREE.Points(
    sparkGeo,
    new THREE.PointsMaterial({
      color: 0xffe066,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
    })
  );
  torchGroup.add(torchSparks);

  torchHolder.add(torchGroup);

  // 10. Legs & Royal Egyptian Sandals
  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.135, -0.06, 0);
  hips.add(leftLeg);

  // Thigh with white linen royal breeches
  const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.068, 0.42, 12), pureWhiteSilkMat);
  leftThighMesh.position.y = -0.21;
  leftThighMesh.castShadow = true;
  leftLeg.add(leftThighMesh);

  const leftCalf = new THREE.Group();
  leftCalf.position.y = -0.42;
  leftLeg.add(leftCalf);

  // Calf with realistic taper & skin
  const leftCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.05, 0.44, 12), skinMat);
  leftCalfMesh.position.y = -0.22;
  leftCalfMesh.castShadow = true;
  leftCalf.add(leftCalfMesh);

  // Royal Golden Anklet with Lapis stone
  const leftAnklet = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.045, 12), royalGoldMat);
  leftAnklet.position.y = -0.38;
  leftCalf.add(leftAnklet);

  // Egyptian Royal Sandal (Gilded Sole & Thong Straps)
  const leftSandal = new THREE.Group();
  leftSandal.position.set(0, -0.45, 0.04);

  const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 0.19), royalGoldMat);
  leftSandal.add(leftSole);

  // Thong straps
  const leftStrap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 6), royalGoldMat);
  leftStrap1.position.set(0, 0.03, 0.02);
  leftStrap1.rotation.x = -0.4;
  leftSandal.add(leftStrap1);

  leftCalf.add(leftSandal);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.135, -0.06, 0);
  hips.add(rightLeg);

  const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.068, 0.42, 12), pureWhiteSilkMat);
  rightThighMesh.position.y = -0.21;
  rightThighMesh.castShadow = true;
  rightLeg.add(rightThighMesh);

  const rightCalf = new THREE.Group();
  rightCalf.position.y = -0.42;
  rightLeg.add(rightCalf);

  const rightCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.05, 0.44, 12), skinMat);
  rightCalfMesh.position.y = -0.22;
  rightCalfMesh.castShadow = true;
  rightCalf.add(rightCalfMesh);

  const rightAnklet = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.045, 12), royalGoldMat);
  rightAnklet.position.y = -0.38;
  rightCalf.add(rightAnklet);

  const rightSandal = new THREE.Group();
  rightSandal.position.set(0, -0.45, 0.04);

  const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 0.19), royalGoldMat);
  rightSandal.add(rightSole);

  const rightStrap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 6), royalGoldMat);
  rightStrap1.position.set(0, 0.03, 0.02);
  rightStrap1.rotation.x = -0.4;
  rightSandal.add(rightStrap1);

  rightCalf.add(rightSandal);

  // Soft Radial Contact Shadow Grounding Disc
  const shadowGeo = new THREE.CircleGeometry(0.55, 20);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x110d06,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.position.y = 0.02;
  root.add(shadowDisc);

  // Animation cycle variables
  let animTime = 0;
  let rollProgress = 0;

  function updateAnimation(
    delta: number,
    isMoving: boolean,
    isSprinting: boolean,
    isJumping: boolean,
    isRolling: boolean,
    torchLit: boolean
  ) {
    animTime += delta * (isSprinting ? 14 : 9);

    // Torch Light & Multi-layer Flame flicker
    if (torchLit) {
      torchLight.intensity = 2.8 + Math.sin(animTime * 8) * 0.5 + Math.cos(animTime * 19) * 0.25;
      const fScaleX = 1 + Math.sin(animTime * 13) * 0.14;
      const fScaleY = 1 + Math.cos(animTime * 11) * 0.22;
      const fScaleZ = 1 + Math.sin(animTime * 15) * 0.14;
      torchFlameMesh.scale.set(fScaleX, fScaleY, fScaleZ);
      torchFlameMesh.visible = true;
      torchLight.visible = true;
      torchSparks.visible = true;
    } else {
      torchFlameMesh.visible = false;
      torchLight.visible = false;
      torchSparks.visible = false;
    }

    // Roll / Dive animation (Acrobatic somersault)
    if (isRolling) {
      rollProgress += delta * 7;
      hips.rotation.x = rollProgress * Math.PI * 2;
      hips.position.y = 0.55 + Math.sin(rollProgress * Math.PI) * 0.2;
      leftLeg.rotation.x = -1.25;
      rightLeg.rotation.x = -1.25;
      leftCalf.rotation.x = 1.45;
      rightCalf.rotation.x = 1.45;
      leftArm.rotation.x = -1.5;
      rightArm.rotation.x = -1.25;
      return;
    } else {
      rollProgress = 0;
      hips.rotation.x = 0;
    }

    // Jump Animation
    if (isJumping) {
      hips.position.y = 0.96;
      leftLeg.rotation.x = -0.65;
      rightLeg.rotation.x = 0.35;
      leftCalf.rotation.x = 0.95;
      rightCalf.rotation.x = 0.55;
      leftArm.rotation.x = -1.45;
      rightArm.rotation.x = -0.95;
      torso.rotation.x = 0.1;
      return;
    }

    // Moving vs Idle
    if (isMoving) {
      const legAmp = isSprinting ? 0.88 : 0.62;
      const armAmp = isSprinting ? 0.78 : 0.52;

      leftLeg.rotation.x = Math.sin(animTime) * legAmp;
      rightLeg.rotation.x = -Math.sin(animTime) * legAmp;

      leftCalf.rotation.x = Math.max(0, -Math.sin(animTime)) * 0.85;
      rightCalf.rotation.x = Math.max(0, Math.sin(animTime)) * 0.85;

      // Arm swing (Left arm swings naturally, right arm holds torch forward)
      leftArm.rotation.x = -Math.sin(animTime) * armAmp;
      leftArm.rotation.z = -0.15;
      leftForearm.rotation.x = -0.32;

      rightArm.rotation.x = -0.42 + Math.sin(animTime * 0.5) * 0.12;
      rightForearm.rotation.x = -0.65;

      // Hips bounce and forward momentum lean
      hips.position.y = 0.96 + Math.abs(Math.sin(animTime)) * 0.055;
      torso.rotation.x = isSprinting ? 0.24 : 0.12;
      torso.rotation.y = Math.sin(animTime) * 0.08;

      // Dynamic hair sway reacting to motion
      hairGroup.rotation.x = isSprinting ? -0.28 : -0.14;
      hairGroup.rotation.z = Math.sin(animTime) * 0.05;
    } else {
      // Idle breathing and gentle sway
      const idleTime = animTime * 0.18;
      hips.position.y = 0.96 + Math.sin(idleTime) * 0.016;
      torso.rotation.x = 0;
      torso.rotation.y = 0;
      torso.rotation.z = Math.sin(idleTime * 0.7) * 0.02;

      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftCalf.rotation.x = 0;
      rightCalf.rotation.x = 0;

      leftArm.rotation.x = Math.sin(idleTime) * 0.06;
      leftArm.rotation.z = -0.1;
      leftForearm.rotation.x = -0.15;

      // Torch held steady forward
      rightArm.rotation.x = -0.52 + Math.sin(idleTime) * 0.035;
      rightArm.rotation.z = 0.12;
      rightForearm.rotation.x = -0.52;

      hairGroup.rotation.x = Math.sin(idleTime) * 0.04;
      hairGroup.rotation.z = 0;
    }
  }

  function applySkin(skinId: 'default' | 'ra_sun' | 'lapis_priestess') {
    if (skinId === 'ra_sun') {
      royalLinenMat.color.setHex(0xffdf66);
      pureWhiteSilkMat.color.setHex(0xfff199);
      royalGoldMat.color.setHex(0xffea60);
      royalGoldMat.roughness = 0.1;
      turquoiseGemMat.color.setHex(0xff9900); // Solar amber gem
    } else if (skinId === 'lapis_priestess') {
      royalLinenMat.color.setHex(0x152960);
      pureWhiteSilkMat.color.setHex(0x1e3b88);
      royalGoldMat.color.setHex(0x00e5c8); // Celestial platinum turquoise
      royalGoldMat.roughness = 0.2;
      turquoiseGemMat.color.setHex(0x3388ff);
    } else {
      royalLinenMat.color.setHex(0xffffff);
      pureWhiteSilkMat.color.setHex(0xfbf9f5);
      royalGoldMat.color.setHex(0xffd95c);
      royalGoldMat.roughness = 0.18;
      turquoiseGemMat.color.setHex(0x00f0d8);
    }
  }

  return {
    root,
    hips,
    torso,
    head,
    hairGroup,
    crown,
    leftArm,
    rightArm,
    leftForearm,
    rightForearm,
    leftLeg,
    rightLeg,
    leftCalf,
    rightCalf,
    torchLight,
    torchFlameMesh,
    torchSparks,
    torchHolder,
    updateAnimation,
    applySkin,
  };
}
