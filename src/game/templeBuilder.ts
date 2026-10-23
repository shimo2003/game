import * as THREE from 'three';
import { GateObject, KarnakMazeData, TrapObject } from '../types/game';
import {
  createColumnTexture,
  createHieroglyphicWallTexture,
  createPharaohGoldTexture,
  createSandstoneFloorTexture,
} from './textures';

import { createMummyGuard, MummyRig } from './mummy';

export interface TempleSceneElements {
  templeGroup: THREE.Group;
  wallMeshes: THREE.Mesh[];
  wallBoxes: THREE.Box3[];
  trapMeshes: {
    spikes: { group: THREE.Group; trap: TrapObject; spikesMesh: THREE.Mesh }[];
    blades: { group: THREE.Group; trap: TrapObject; bladeArm: THREE.Group }[];
    boulders: { mesh: THREE.Mesh; trap: TrapObject }[];
  };
  collectibleMeshes: Map<string, THREE.Group>;
  gateMeshes: { gate: GateObject; leftDoor: THREE.Mesh; rightDoor: THREE.Mesh; lockGems: THREE.Mesh[] }[];
  torchLights: THREE.PointLight[];
  torchSparks: THREE.Points;
  sarcophagusMesh: THREE.Group;
  mummyRigs: MummyRig[];
}

export function buildKarnakTemple(maze: KarnakMazeData): TempleSceneElements {
  const templeGroup = new THREE.Group();
  templeGroup.name = 'KarnakTemple';

  // Textures
  const wallTex = createHieroglyphicWallTexture();
  const floorTex = createSandstoneFloorTexture();
  const colTex = createColumnTexture();
  const goldTex = createPharaohGoldTexture();

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.75,
    metalness: 0.1,
  });

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.85,
    metalness: 0.05,
  });

  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0x221a12,
    roughness: 0.95,
  });

  const columnMat = new THREE.MeshStandardMaterial({
    map: colTex,
    roughness: 0.65,
    metalness: 0.2,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    map: goldTex,
    color: 0xffe066,
    metalness: 0.9,
    roughness: 0.2,
  });

  const pureGoldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.95,
    roughness: 0.18,
  });

  const lapisMat = new THREE.MeshStandardMaterial({
    color: 0x1848a0,
    metalness: 0.3,
    roughness: 0.25,
  });

  const bronzeTrapMat = new THREE.MeshStandardMaterial({
    color: 0x8c6239,
    metalness: 0.8,
    roughness: 0.35,
  });

  const wallMeshes: THREE.Mesh[] = [];
  const wallBoxes: THREE.Box3[] = [];
  const torchLights: THREE.PointLight[] = [];

  const wallHeight = 5.0;
  const cellSize = 4.0;
  const halfCell = cellSize / 2;

  // 1. Temple Floor (Grand Sandstone Ground)
  const floorGeo = new THREE.PlaneGeometry(maze.width * cellSize + 20, maze.height * cellSize + 20);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.set((maze.width * cellSize) / 2, 0, (maze.height * cellSize) / 2);
  floorMesh.receiveShadow = true;
  templeGroup.add(floorMesh);

  // Ceiling over temple corridors
  const ceilingGeo = new THREE.PlaneGeometry(maze.width * cellSize, maze.height * cellSize);
  ceilingGeo.rotateX(Math.PI / 2);
  const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceilingMesh.position.set((maze.width * cellSize) / 2, wallHeight, (maze.height * cellSize) / 2);
  templeGroup.add(ceilingMesh);

  // 2. Build Walls, Columns, and Sconces
  const wallBoxGeo = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);

  for (let z = 0; z < maze.height; z++) {
    for (let x = 0; x < maze.width; x++) {
      const type = maze.grid[z][x];
      const wx = x * cellSize;
      const wz = z * cellSize;

      if (type === 1) {
        // Sandstone Megalith Wall Block
        const wallMesh = new THREE.Mesh(wallBoxGeo, wallMat);
        wallMesh.position.set(wx, wallHeight / 2, wz);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        templeGroup.add(wallMesh);
        wallMeshes.push(wallMesh);

        // Bounding box for character collision
        const box = new THREE.Box3(
          new THREE.Vector3(wx - halfCell, 0, wz - halfCell),
          new THREE.Vector3(wx + halfCell, wallHeight, wz + halfCell)
        );
        wallBoxes.push(box);

        // Add torch sconce on some corridor facing walls
        if ((x + z) % 5 === 0 && x > 2 && x < maze.width - 2 && z > 2 && z < maze.height - 2) {
          const sconce = createTorchSconce(wx, 2.4, wz, goldMat);
          templeGroup.add(sconce.mesh);
          torchLights.push(sconce.light);
        }
      } else if (type === 2) {
        // Hypostyle Papyrus Lotus Column
        const column = createHypostyleColumn(wx, wz, columnMat, goldMat);
        templeGroup.add(column.mesh);

        // Column collision box
        const colBox = new THREE.Box3(
          new THREE.Vector3(wx - 1.0, 0, wz - 1.0),
          new THREE.Vector3(wx + 1.0, wallHeight, wz + 1.0)
        );
        wallBoxes.push(colBox);
      }
    }
  }

  // 3. Entrance Obelisks and Karnak Pylon Monument
  createEntranceMonuments(templeGroup, maze.startX, maze.startZ, wallMat, pureGoldMat);

  // 4. Sealed Sanctum Pylon Gate
  const gateMeshes: TempleSceneElements['gateMeshes'] = [];
  maze.gates.forEach((gate) => {
    const doorWidth = cellSize * 0.95;
    const doorHeight = wallHeight * 0.95;

    const doorGroup = new THREE.Group();
    doorGroup.position.set(gate.x, 0, gate.z);

    const doorGeo = new THREE.BoxGeometry(doorWidth / 2, doorHeight, 0.4);
    const leftDoor = new THREE.Mesh(doorGeo, wallMat);
    leftDoor.position.set(-doorWidth / 4, doorHeight / 2, 0);
    leftDoor.castShadow = true;

    const rightDoor = new THREE.Mesh(doorGeo, wallMat);
    rightDoor.position.set(doorWidth / 4, doorHeight / 2, 0);
    rightDoor.castShadow = true;

    doorGroup.add(leftDoor);
    doorGroup.add(rightDoor);

    // 4 Key Inlay Sockets (glow turquoise when key is found)
    const lockGems: THREE.Mesh[] = [];
    const gemGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const lockedMat = new THREE.MeshStandardMaterial({
      color: 0x221100,
      metalness: 0.5,
      roughness: 0.8,
    });

    [-0.6, -0.2, 0.2, 0.6].forEach((xOff) => {
      const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12), goldMat);
      socket.rotation.x = Math.PI / 2;
      socket.position.set(xOff, 2.2, 0.22);
      doorGroup.add(socket);

      const gem = new THREE.Mesh(gemGeo, lockedMat.clone());
      gem.position.set(xOff, 2.2, 0.26);
      doorGroup.add(gem);
      lockGems.push(gem);
    });

    templeGroup.add(doorGroup);
    gateMeshes.push({ gate, leftDoor, rightDoor, lockGems });
  });

  // 5. Build Traps
  const trapMeshes: TempleSceneElements['trapMeshes'] = {
    spikes: [],
    blades: [],
    boulders: [],
  };

  maze.traps.forEach((trap) => {
    if (trap.type === 'spikes') {
      const trapGroup = new THREE.Group();
      trapGroup.position.set(trap.x, 0.02, trap.z);

      // Floor bronze grate
      const grateGeo = new THREE.BoxGeometry(2.4, 0.05, 2.4);
      const grateMesh = new THREE.Mesh(grateGeo, bronzeTrapMat);
      grateMesh.receiveShadow = true;
      trapGroup.add(grateMesh);

      // Spikes Group
      const spikesGroup = new THREE.Group();
      const spikeConeGeo = new THREE.ConeGeometry(0.08, 0.8, 6);
      spikeConeGeo.translate(0, 0.4, 0);

      // Grid of 4x4 sharp spikes
      for (let sx = -0.9; sx <= 0.9; sx += 0.6) {
        for (let sz = -0.9; sz <= 0.9; sz += 0.6) {
          const spikeMesh = new THREE.Mesh(spikeConeGeo, bronzeTrapMat);
          spikeMesh.position.set(sx, 0, sz);
          spikesGroup.add(spikeMesh);
        }
      }
      spikesGroup.position.y = -0.6; // initially retracted
      trapGroup.add(spikesGroup);

      templeGroup.add(trapGroup);
      trapMeshes.spikes.push({ group: trapGroup, trap, spikesMesh: spikesGroup as unknown as THREE.Mesh });
    } else if (trap.type === 'swinging_blade') {
      const bladeGroup = new THREE.Group();
      bladeGroup.position.set(trap.x, wallHeight - 0.2, trap.z);

      // Pivot Arm
      const bladeArm = new THREE.Group();
      const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, wallHeight - 1.2, 8);
      rodGeo.translate(0, -(wallHeight - 1.2) / 2, 0);
      const rod = new THREE.Mesh(rodGeo, bronzeTrapMat);
      bladeArm.add(rod);

      // Sharp Crescent Scythe Blade at bottom
      const bladeGeo = new THREE.TorusGeometry(0.8, 0.08, 6, 24, Math.PI);
      bladeGeo.rotateZ(Math.PI / 2);
      const blade = new THREE.Mesh(bladeGeo, pureGoldMat);
      blade.position.y = -(wallHeight - 1.2);
      bladeArm.add(blade);

      bladeGroup.add(bladeArm);
      templeGroup.add(bladeGroup);
      trapMeshes.blades.push({ group: bladeGroup, trap, bladeArm });
    } else if (trap.type === 'boulder') {
      // Massive Carved Stone Boulder
      const boulderGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const boulderMesh = new THREE.Mesh(boulderGeo, wallMat);
      boulderMesh.position.set(trap.x, 1.2, trap.z);
      boulderMesh.castShadow = true;
      templeGroup.add(boulderMesh);
      trapMeshes.boulders.push({ mesh: boulderMesh, trap });
    }
  });

  // 6. The Grand Pharaoh's Golden Treasure Chamber (Sanctum)
  const sarcophagusMesh = createPharaohSarcophagus(maze.sanctumX, maze.sanctumZ, goldMat, pureGoldMat, lapisMat);
  templeGroup.add(sarcophagusMesh);

  // Treasure chamber glowing beacon light
  const sanctumLight = new THREE.PointLight(0xffd700, 3.5, 20, 1.2);
  sanctumLight.position.set(maze.sanctumX, 3.5, maze.sanctumZ);
  templeGroup.add(sanctumLight);

  // 7. Collectible 3D Meshes
  const collectibleMeshes = new Map<string, THREE.Group>();
  maze.collectibles.forEach((item) => {
    let meshGroup: THREE.Group;

    if (item.type === 'coin') {
      meshGroup = createCoinMesh(pureGoldMat);
    } else if (item.type === 'gem') {
      meshGroup = createGemMesh(lapisMat);
    } else if (item.type === 'scarab_key') {
      meshGroup = createRelicKeyMesh(item.keyIndex ?? 0, pureGoldMat, lapisMat);
    } else {
      // Pharaoh Treasure marker/sparkle group
      meshGroup = new THREE.Group();
    }

    meshGroup.position.set(item.x, item.y, item.z);
    templeGroup.add(meshGroup);
    collectibleMeshes.set(item.id, meshGroup);
  });

  // 8. Ambient Dust & Spark Particles
  const sparkGeo = new THREE.BufferGeometry();
  const sparkCount = 120;
  const sparkPos = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount * 3; i += 3) {
    sparkPos[i] = Math.random() * (maze.width * cellSize);
    sparkPos[i + 1] = 0.5 + Math.random() * 4.0;
    sparkPos[i + 2] = Math.random() * (maze.height * cellSize);
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0xffd97d,
    size: 0.06,
    transparent: true,
    opacity: 0.5,
  });
  const torchSparks = new THREE.Points(sparkGeo, sparkMat);
  templeGroup.add(torchSparks);

  // 9. AI-Driven Mummy Guards
  const mummyRigs: MummyRig[] = [];
  if (maze.mummies) {
    maze.mummies.forEach((mummyData) => {
      const mummyRig = createMummyGuard(mummyData);
      templeGroup.add(mummyRig.root);
      mummyRigs.push(mummyRig);
    });
  }

  return {
    templeGroup,
    wallMeshes,
    wallBoxes,
    trapMeshes,
    collectibleMeshes,
    gateMeshes,
    torchLights,
    torchSparks,
    sarcophagusMesh,
    mummyRigs,
  };
}

// Hypostyle Lotus Column Helper
function createHypostyleColumn(
  x: number,
  z: number,
  colMat: THREE.Material,
  goldMat: THREE.Material
): { mesh: THREE.Group } {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Base plinth
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.5, 16), colMat);
  plinth.position.y = 0.25;
  plinth.castShadow = true;
  group.add(plinth);

  // Column shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 4.0, 16), colMat);
  shaft.position.y = 2.5;
  shaft.castShadow = true;
  group.add(shaft);

  // Gold neck collar rings
  const goldBand = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 20), goldMat);
  goldBand.rotateX(Math.PI / 2);
  goldBand.position.y = 4.0;
  group.add(goldBand);

  // Flaring Papyrus / Lotus Capital
  const capital = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 0.85, 0.8, 16), colMat);
  capital.position.y = 4.6;
  capital.castShadow = true;
  group.add(capital);

  return { mesh: group };
}

// Wall Torch Sconce Helper
function createTorchSconce(
  x: number,
  y: number,
  z: number,
  goldMat: THREE.Material
): { mesh: THREE.Group; light: THREE.PointLight } {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  // Bronze wall mount bracket
  const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), goldMat);
  bracket.rotation.z = 0.5;
  group.add(bracket);

  // Torch bowl
  const bowl = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 8), goldMat);
  bowl.position.set(0.15, 0.12, 0);
  bowl.rotation.z = Math.PI;
  group.add(bowl);

  // Flame
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.24, 8),
    new THREE.MeshBasicMaterial({ color: 0xffaa11, transparent: true, opacity: 0.95 })
  );
  flame.position.set(0.15, 0.24, 0);
  group.add(flame);

  // Light
  const light = new THREE.PointLight(0xff9922, 1.8, 10, 1.4);
  light.position.set(0.15, 0.3, 0);
  group.add(light);

  return { mesh: group, light };
}

// Obelisks at Entrance
function createEntranceMonuments(
  parent: THREE.Group,
  startX: number,
  startZ: number,
  stoneMat: THREE.Material,
  goldMat: THREE.Material
) {
  [-3.5, 3.5].forEach((xOff) => {
    const obeliskGroup = new THREE.Group();
    obeliskGroup.position.set(startX + xOff, 0, startZ - 2.5);

    // Stepped pedestal
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), stoneMat);
    base1.position.y = 0.2;
    obeliskGroup.add(base1);

    const base2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), stoneMat);
    base2.position.y = 0.6;
    obeliskGroup.add(base2);

    // Tall tapered shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 5.5, 4), stoneMat);
    shaft.position.y = 3.55;
    shaft.rotation.y = Math.PI / 4;
    shaft.castShadow = true;
    obeliskGroup.add(shaft);

    // Gilded Golden Pyramidion tip (reflective gold point)
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 4), goldMat);
    tip.position.y = 6.75;
    tip.rotation.y = Math.PI / 4;
    tip.castShadow = true;
    obeliskGroup.add(tip);

    parent.add(obeliskGroup);
  });
}

// Grand Pharaoh Sarcophagus in the Inner Sanctum
function createPharaohSarcophagus(
  x: number,
  z: number,
  goldTexMat: THREE.Material,
  pureGoldMat: THREE.Material,
  lapisMat: THREE.Material
): THREE.Group {
  const sarcGroup = new THREE.Group();
  sarcGroup.position.set(x, 0, z);

  // Altar Stone Pedestal
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 2.4), goldTexMat);
  pedestal.position.y = 0.3;
  pedestal.receiveShadow = true;
  sarcGroup.add(pedestal);

  // Sarcophagus Coffin Body (Anthropoid Egyptian Coffin)
  const coffin = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.55, 2.6, 12), pureGoldMat);
  coffin.rotation.x = Math.PI / 2;
  coffin.position.y = 0.95;
  coffin.castShadow = true;
  sarcGroup.add(coffin);

  // Pharaoh Headdress (Nemes) with lapis stripes
  const headdress = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.45, 0.8), goldTexMat);
  headdress.position.set(0, 1.15, -0.75);
  headdress.castShadow = true;
  sarcGroup.add(headdress);

  // Golden Royal Beard (Osiride beard)
  const beard = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.45, 6), pureGoldMat);
  beard.position.set(0, 0.9, -0.3);
  beard.rotation.x = -0.3;
  sarcGroup.add(beard);

  // Crossed Crook and Flail (Royal Egyptian insignia)
  const crook = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), pureGoldMat);
  crook.position.set(-0.15, 1.1, 0.1);
  crook.rotation.set(0, 0, 0.6);
  sarcGroup.add(crook);

  const flail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), pureGoldMat);
  flail.position.set(0.15, 1.1, 0.1);
  flail.rotation.set(0, 0, -0.6);
  sarcGroup.add(flail);

  // Surrounding mounds of Golden Treasures
  const potGeo = new THREE.SphereGeometry(0.3, 10, 10);
  [-1.2, 1.2].forEach((px) => {
    [-0.8, 0.8].forEach((pz) => {
      const urn = new THREE.Mesh(potGeo, lapisMat);
      urn.position.set(px, 0.6 + 0.3, pz);
      urn.castShadow = true;
      sarcGroup.add(urn);

      // Gold goblets & chests
      const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.4), pureGoldMat);
      chest.position.set(px * 1.2, 0.6 + 0.18, pz * 1.1);
      sarcGroup.add(chest);
    });
  });

  return sarcGroup;
}

// Collectible Helpers
function createCoinMesh(goldMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const coinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 16);
  coinGeo.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(coinGeo, goldMat);
  group.add(mesh);

  // Embossed Eye of Horus center dot
  const centerDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  centerDot.position.z = 0.03;
  group.add(centerDot);

  return group;
}

function createGemMesh(lapisMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const gemGeo = new THREE.OctahedronGeometry(0.28, 0);
  const mesh = new THREE.Mesh(gemGeo, lapisMat);
  group.add(mesh);
  return group;
}

function createRelicKeyMesh(keyIndex: number, goldMat: THREE.Material, lapisMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  // Floating pedestal base glow ring
  const ringGeo = new THREE.TorusGeometry(0.45, 0.04, 8, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, goldMat);
  ring.position.y = -0.4;
  group.add(ring);

  if (keyIndex === 0) {
    // Eye of Horus Seal
    const plaqueGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 20);
    plaqueGeo.rotateX(Math.PI / 2);
    const plaque = new THREE.Mesh(plaqueGeo, goldMat);
    group.add(plaque);

    const eyeGem = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), lapisMat);
    eyeGem.position.z = 0.05;
    group.add(eyeGem);
  } else if (keyIndex === 1) {
    // Ankh of Eternal Life
    const ankhLoop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 16), goldMat);
    ankhLoop.position.y = 0.25;
    group.add(ankhLoop);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.08), goldMat);
    bar.position.y = 0.05;
    group.add(bar);

    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.08), goldMat);
    stem.position.y = -0.15;
    group.add(stem);
  } else if (keyIndex === 2) {
    // Golden Scarab of Karnak
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), goldMat);
    body.scale.set(0.9, 0.6, 1.2);
    group.add(body);

    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), lapisMat);
    gem.position.set(0, 0.14, 0);
    group.add(gem);
  } else {
    // Golden Uraeus Cobra
    const cobra = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.5, 10), goldMat);
    cobra.position.y = 0;
    group.add(cobra);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.06), goldMat);
    hood.position.set(0, 0.2, 0.02);
    group.add(hood);
  }

  // Relic halo light
  const keyLight = new THREE.PointLight(0xffcc33, 1.8, 6, 2);
  group.add(keyLight);

  return group;
}
