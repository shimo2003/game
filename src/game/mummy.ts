import * as THREE from 'three';
import { MummyAIState, MummyGuardData } from '../types/game';

/**
 * 3D Mummy Guard Model and Procedural AI System
 * Ancient cursed pharaoh guardians patrolling the Karnak Temple maze.
 */

export interface MummyRig {
  data: MummyGuardData;
  root: THREE.Group;
  head: THREE.Group;
  eyesMesh: THREE.Mesh;
  eyeLight: THREE.PointLight;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  visionConeMesh: THREE.Mesh;
  update: (
    delta: number,
    playerPos: THREE.Vector3,
    isPlayerSprinting: boolean,
    isTorchLit: boolean,
    isRolling: boolean,
    checkWallCollision: (from: THREE.Vector3, to: THREE.Vector3) => boolean,
    isCloaked?: boolean
  ) => {
    state: MummyAIState;
    didSpotted: boolean;
    didAttack: boolean;
    threatDistance: number;
  };
  stun: (seconds: number) => void;
  knockback: (dir: THREE.Vector3, distance: number) => void;
}

export function createMummyGuard(initData: MummyGuardData): MummyRig {
  const root = new THREE.Group();
  root.name = `MummyGuard_${initData.id}`;
  root.position.set(initData.x, 0, initData.z);
  root.rotation.y = initData.angle;

  // Weathered Linen Bandages Material
  const bandageMat = new THREE.MeshStandardMaterial({
    color: 0xcdba9e,
    roughness: 0.85,
    metalness: 0.05,
  });

  const rotGoldMat = new THREE.MeshStandardMaterial({
    color: 0x8f7832,
    metalness: 0.7,
    roughness: 0.45,
  });

  // Glowing Cursed Crimson Eyes Material
  const cursedEyeMat = new THREE.MeshBasicMaterial({
    color: 0xff1e1e,
  });

  // 1. Torso
  const torso = new THREE.Group();
  torso.position.y = 0.95;
  root.add(torso);

  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.52, 12), bandageMat);
  chest.castShadow = true;
  chest.receiveShadow = true;
  torso.add(chest);

  // Bandage overlapping rings on chest
  for (let y = -0.2; y <= 0.2; y += 0.1) {
    const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 6, 16), bandageMat);
    wrap.rotateX(Math.PI / 2 + 0.1);
    wrap.position.y = y;
    torso.add(wrap);
  }

  // Weathered Egyptian Royal Collar (Tarnished Gold)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.27, 0.1, 14, 1, true), rotGoldMat);
  collar.position.y = 0.22;
  torso.add(collar);

  // 2. Head with Wrapped Bandages & Glowing Eyes
  const head = new THREE.Group();
  head.position.y = 0.42;
  torso.add(head);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), bandageMat);
  headMesh.scale.set(0.9, 1.1, 0.95);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Hanging loose unraveled bandage strip
  const stripGeo = new THREE.BoxGeometry(0.05, 0.32, 0.015);
  const looseStrip = new THREE.Mesh(stripGeo, bandageMat);
  looseStrip.position.set(0.12, -0.15, -0.06);
  looseStrip.rotation.z = -0.2;
  head.add(looseStrip);

  // Glowing Cursed Eyes
  const eyesGroup = new THREE.Group();
  eyesGroup.position.set(0, 0.04, 0.165);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), cursedEyeMat);
  leftEye.position.x = -0.065;
  eyesGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), cursedEyeMat);
  rightEye.position.x = 0.065;
  eyesGroup.add(rightEye);

  head.add(eyesGroup);

  // Eye point light that illuminates the floor and walls in front of mummy
  const eyeLight = new THREE.PointLight(0xff2200, 1.5, 6, 2);
  eyeLight.position.set(0, 0.05, 0.25);
  head.add(eyeLight);

  // 3. Extended Shambling Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.32, 0.18, 0);
  torso.add(leftArm);

  const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.48, 8), bandageMat);
  leftArmMesh.position.set(0, 0, 0.22);
  leftArmMesh.rotation.x = Math.PI / 2 - 0.2;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  // Claw-like hand
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.09), rotGoldMat);
  leftHand.position.set(0, -0.04, 0.44);
  leftArm.add(leftHand);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.32, 0.18, 0);
  torso.add(rightArm);

  const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.48, 8), bandageMat);
  rightArmMesh.position.set(0, 0, 0.22);
  rightArmMesh.rotation.x = Math.PI / 2 - 0.25;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.09), rotGoldMat);
  rightHand.position.set(0, -0.04, 0.44);
  rightArm.add(rightHand);

  // 4. Bandaged Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.14, 0, 0);
  torso.add(leftLeg);

  const leftLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.92, 8), bandageMat);
  leftLegMesh.position.y = -0.46;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.14, 0, 0);
  torso.add(rightLeg);

  const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.92, 8), bandageMat);
  rightLegMesh.position.y = -0.46;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  // 5. Contact Shadow
  const shadowGeo = new THREE.CircleGeometry(0.55, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMesh = new THREE.Mesh(
    shadowGeo,
    new THREE.MeshBasicMaterial({ color: 0x0a0502, transparent: true, opacity: 0.5, depthWrite: false })
  );
  shadowMesh.position.y = 0.02;
  root.add(shadowMesh);

  // 6. Projected Vision Threat Arc on the floor
  // Shows player the mummy's line-of-sight cone!
  const coneGeo = new THREE.RingGeometry(0.4, 7.0, 16, 1, -Math.PI / 6, Math.PI / 3);
  coneGeo.rotateX(-Math.PI / 2);
  coneGeo.rotateY(Math.PI / 2);
  const visionConeMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const visionConeMesh = new THREE.Mesh(coneGeo, visionConeMat);
  visionConeMesh.position.y = 0.04;
  root.add(visionConeMesh);

  // Internal AI State variables
  const data = { ...initData };
  let animTime = Math.random() * 10;
  let hasAlerted = false;

  let stunTimer = 0;

  function stun(seconds: number) {
    stunTimer = seconds;
    data.state = 'search';
  }

  function knockback(dir: THREE.Vector3, distance: number) {
    data.x += dir.x * distance;
    data.z += dir.z * distance;
    root.position.set(data.x, 0, data.z);
    stun(3.5);
  }

  function update(
    delta: number,
    playerPos: THREE.Vector3,
    isPlayerSprinting: boolean,
    isTorchLit: boolean,
    isRolling: boolean,
    hasLineOfSight: (from: THREE.Vector3, to: THREE.Vector3) => boolean,
    isCloaked: boolean = false
  ) {
    if (stunTimer > 0) {
      stunTimer -= delta;
      head.rotation.y = Math.sin(animTime * 6) * 0.4;
      return {
        state: 'search' as MummyAIState,
        didSpotted: false,
        didAttack: false,
        threatDistance: 99,
      };
    }

    animTime += delta * (data.state === 'chase' ? 8.5 : 4.0);

    const mummyPos = new THREE.Vector3(data.x, 0, data.z);
    const toPlayer = new THREE.Vector3().subVectors(playerPos, mummyPos);
    const distToPlayer = toPlayer.length();

    // Check angle between mummy facing vector and player
    const facing = new THREE.Vector3(Math.sin(data.angle), 0, Math.cos(data.angle));
    toPlayer.y = 0;
    toPlayer.normalize();
    const dot = facing.dot(toPlayer); // 1 = directly ahead, 0 = 90 deg, -1 = behind

    // Effective vision range based on stealth & torch
    // If player is cloaked: invisible to mummies!
    let effectiveVisionRange = isTorchLit ? 8.5 : 4.5;
    if (isCloaked) effectiveVisionRange = 0;

    const inVisionCone = dot > 0.45 && distToPlayer < effectiveVisionRange && !isCloaked;

    // Sound detection: sprinting sounds alert mummies even if behind!
    const hearsSprint = isPlayerSprinting && !isRolling && !isCloaked && distToPlayer < (isTorchLit ? 10.5 : 7.0);

    let didSpotted = false;
    let didAttack = false;

    // Line of sight check against maze walls
    const canSeePlayer = !isCloaked && (inVisionCone || (hearsSprint && distToPlayer < 4.0)) && hasLineOfSight(mummyPos, playerPos);

    // AI State Machine Transitions
    if (canSeePlayer) {
      if (data.state !== 'chase') {
        data.state = 'chase';
        didSpotted = !hasAlerted;
        hasAlerted = true;
      }
      data.searchTimer = 4.0;
    } else if (data.state === 'chase') {
      data.searchTimer -= delta;
      if (data.searchTimer <= 0) {
        data.state = 'search';
        data.searchTimer = 3.5;
        hasAlerted = false;
      }
    } else if (data.state === 'search') {
      data.searchTimer -= delta;
      if (data.searchTimer <= 0) {
        data.state = 'patrol';
      }
    }

    // State Behaviors & Movement
    let targetX = data.x;
    let targetZ = data.z;
    let moveSpeed = 0;

    if (data.state === 'chase') {
      targetX = playerPos.x;
      targetZ = playerPos.z;
      moveSpeed = 3.6; // Chasing sprint
      visionConeMat.color.setHex(0xff1100);
      visionConeMat.opacity = 0.28;
      eyeLight.intensity = 2.8;
      (eyesGroup.children[0] as THREE.Mesh).scale.set(1.4, 1.4, 1.4);
      (eyesGroup.children[1] as THREE.Mesh).scale.set(1.4, 1.4, 1.4);

      // Attack if close enough
      data.attackCooldown = Math.max(0, data.attackCooldown - delta);
      if (distToPlayer < 1.45 && data.attackCooldown <= 0) {
        didAttack = true;
        data.attackCooldown = 1.6;
      }
    } else if (data.state === 'search') {
      // Rotate head left and right suspiciously
      head.rotation.y = Math.sin(animTime * 2) * 0.7;
      visionConeMat.color.setHex(0xff9900);
      visionConeMat.opacity = 0.18;
      eyeLight.intensity = 1.6;
      moveSpeed = 1.0;
    } else {
      // Normal Patrol along waypoints
      visionConeMat.color.setHex(0xffaa00);
      visionConeMat.opacity = 0.1;
      eyeLight.intensity = 1.2;
      (eyesGroup.children[0] as THREE.Mesh).scale.set(1.0, 1.0, 1.0);
      (eyesGroup.children[1] as THREE.Mesh).scale.set(1.0, 1.0, 1.0);
      head.rotation.y = Math.sin(animTime * 0.8) * 0.25;

      if (data.patrolPoints && data.patrolPoints.length > 0) {
        const wp = data.patrolPoints[data.currentPointIndex];
        targetX = wp.x;
        targetZ = wp.z;
        const distToWp = Math.hypot(wp.x - data.x, wp.z - data.z);
        if (distToWp < 1.0) {
          data.currentPointIndex = (data.currentPointIndex + 1) % data.patrolPoints.length;
        }
        moveSpeed = 2.0;
      }
    }

    // Move towards target
    const dx = targetX - data.x;
    const dz = targetZ - data.z;
    const targetDist = Math.hypot(dx, dz);

    if (targetDist > 0.3 && moveSpeed > 0) {
      const targetAngle = Math.atan2(dx, dz);
      // Smooth turning
      let diff = targetAngle - data.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      data.angle += diff * Math.min(1, delta * (data.state === 'chase' ? 8 : 4));

      data.x += Math.sin(data.angle) * moveSpeed * delta;
      data.z += Math.cos(data.angle) * moveSpeed * delta;
    }

    root.position.set(data.x, 0, data.z);
    root.rotation.y = data.angle;

    // Shambling Mummy Walk Kinematics
    const walkAmp = data.state === 'chase' ? 0.7 : 0.45;
    leftLeg.rotation.x = Math.sin(animTime) * walkAmp;
    rightLeg.rotation.x = -Math.sin(animTime) * walkAmp;

    // Asymmetric limp & torso lurch
    torso.position.y = 0.95 + Math.abs(Math.sin(animTime)) * 0.04;
    torso.rotation.x = data.state === 'chase' ? 0.22 : 0.12;
    torso.rotation.z = Math.sin(animTime * 0.5) * 0.08;

    // Reaching / swiping arms
    if (data.attackCooldown > 1.0) {
      // Swiping claw lunge
      leftArm.rotation.x = -0.6;
      rightArm.rotation.x = 0.3;
    } else {
      leftArm.rotation.x = Math.sin(animTime) * 0.2;
      rightArm.rotation.x = -Math.sin(animTime) * 0.2;
    }

    return {
      state: data.state,
      didSpotted,
      didAttack,
      threatDistance: distToPlayer,
    };
  }

  return {
    data,
    root,
    head,
    eyesMesh: eyesGroup as unknown as THREE.Mesh,
    eyeLight,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    visionConeMesh,
    update,
    stun,
    knockback,
  };
}
