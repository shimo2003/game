import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect.js';
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect.js';
import confetti from 'canvas-confetti';
import { sound } from '../audio/soundSystem';
import { CollectibleItem, GameState, KarnakMazeData, PlayerStats } from '../types/game';
import { PlayerInventory } from '../types/store';
import { loadSavedInventory, saveInventory } from './storeData';
import { CharacterRig, createQueenAvatara } from './character';
import { generateKarnakMaze } from './mazeGenerator';
import { buildKarnakTemple, TempleSceneElements } from './templeBuilder';
import { WallCarving, markCarvingDiscovered } from './riddles';
import { buildWallCarvings, WallCarvingRig } from './carvingBuilder';

export type CameraMode = 'follow' | 'cinematic' | 'portrait' | 'overhead';
export type GlassesMode = 'off' | 'anaglyph' | 'vr_sbs';

export interface GameEngineCallbacks {
  onStatsChange: (stats: PlayerStats) => void;
  onGameStateChange: (state: GameState) => void;
  onMessage: (msg: string | null) => void;
  onInventoryChange?: (inv: PlayerInventory) => void;
  onGlassesModeChange?: (mode: GlassesMode) => void;
  onOpenStore?: (tab?: string) => void;
  onToggleMiniMap?: () => void;
  onNearbyCarvingChange?: (carving: WallCarving | null) => void;
  onInspectCarving?: (carving: WallCarving) => void;
  onOpenHelpAndTutorial?: (initialTab?: 'tutorial' | 'controls' | 'riddles' | 'glasses') => void;
  onTimersChange?: (cloakSeconds: number, magnetSeconds: number) => void;
}

export class KarnakGameEngine {
  private container: HTMLDivElement;
  private callbacks: GameEngineCallbacks;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  private lastReportedCloakSec = -1;
  private lastReportedMagnetSec = -1;

  private mazeData: KarnakMazeData;
  private templeElements: TempleSceneElements;
  private character: CharacterRig;
  private carvingRigs: WallCarvingRig[] = [];
  private nearbyCarving: WallCarving | null = null;

  // Player State
  private playerPos = new THREE.Vector3();
  private playerVel = new THREE.Vector3();
  private playerAngle = Math.PI; // Face north initially
  private targetAngle = Math.PI;
  private isGrounded = true;
  private isSprinting = false;
  private isRolling = false;
  private rollTimer = 0;
  private jumpVelY = 0;
  private invulnerableTimer = 0;

  private stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    coins: 0,
    keysCollected: 0,
    totalKeys: 4,
    score: 0,
    torchLit: true,
    hasPharaohTreasure: false,
    stealthThreat: 'hidden',
  };

  private inventory: PlayerInventory = loadSavedInventory();
  private shadowCloakTimer = 0;
  private magnetTimer = 0;

  private gameState: GameState = 'playing';
  private cameraMode: CameraMode = 'follow';

  // Stereoscopic Glasses & VR Headset Support
  private glassesMode: GlassesMode = 'off';
  private eyeSeparation = 0.064; // Interpupillary distance in meters
  private cameraZoom = 4.8;
  private anaglyphEffect: AnaglyphEffect | null = null;
  private stereoEffect: StereoEffect | null = null;

  // Camera Orbit Offsets
  private cameraYaw = 0;
  private cameraPitch = 0.25;
  private isDragging = false;
  private prevPointerX = 0;
  private prevPointerY = 0;

  // Input states
  private keysPressed: Record<string, boolean> = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ShiftLeft: false,
    ShiftRight: false,
    Space: false,
    KeyC: false,
    ControlLeft: false,
    KeyT: false,
    KeyE: false,
  };

  private virtualMove = { x: 0, y: 0 };
  private reqAnimFrameId: number | null = null;
  private footstepTimer = 0;

  constructor(container: HTMLDivElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Environment
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x161009, 0.022);

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 150);

    // 3. Renderer with PBR standards
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    this.renderer = new THREE.WebGLRenderer({ antialias: !isHeadless, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Stereoscopic 3D & VR Effects Setup
    try {
      this.anaglyphEffect = new AnaglyphEffect(this.renderer);
      this.anaglyphEffect.setSize(width, height);
      this.stereoEffect = new StereoEffect(this.renderer);
      this.stereoEffect.setSize(width, height);
      this.stereoEffect.setEyeSeparation(this.eyeSeparation);
    } catch {
      // Monoscopic fallback
    }

    // Studio Environment reflection for metals (RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Maze & Temple Construction
    this.mazeData = generateKarnakMaze();
    this.templeElements = buildKarnakTemple(this.mazeData);
    this.scene.add(this.templeElements.templeGroup);

    // 5b. Ancient Wall Carvings & Cryptic Stelae
    const carvingsBuild = buildWallCarvings();
    this.carvingRigs = carvingsBuild.carvingRigs;
    this.scene.add(carvingsBuild.carvingsGroup);

    // 6. Character
    this.character = createQueenAvatara();
    if (this.inventory.equippedSkin) {
      this.character.applySkin(this.inventory.equippedSkin);
    }
    this.playerPos.set(this.mazeData.startX, 0, this.mazeData.startZ);
    this.character.root.position.copy(this.playerPos);
    this.scene.add(this.character.root);

    this.clock = new THREE.Clock();

    // Event Listeners
    this.bindEvents();
    this.callbacks.onStatsChange({ ...this.stats });
    this.callbacks.onMessage("Explore the Karnak Temple maze! Find 4 Sacred Relics to open Pharaoh's Sanctum.");

    // Start Loop
    this.tick = this.tick.bind(this);
    this.reqAnimFrameId = requestAnimationFrame(this.tick);
  }

  private setupLighting() {
    // Warm key sunlight shaft
    const keyLight = new THREE.DirectionalLight(0xffecc4, 2.2);
    keyLight.position.set(40, 60, 30);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 140;
    const d = 45;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Cool Lapis Blue Hemisphere Bounce Light
    const hemiLight = new THREE.HemisphereLight(0x406085, 0x1d150d, 0.7);
    this.scene.add(hemiLight);

    // Warm Rim Backlight to highlight Queen Avatara's crown, hair, and jewelry
    const rimLight = new THREE.DirectionalLight(0xffdf99, 1.4);
    rimLight.position.set(-20, 25, -20);
    this.scene.add(rimLight);

    // Soft ambient fill
    const ambLight = new THREE.AmbientLight(0x2d1d0c, 0.45);
    this.scene.add(ambLight);
  }

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private unbindEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.cameraZoom = Math.max(2.2, Math.min(10.0, this.cameraZoom + e.deltaY * 0.005));
  };

  private onKeyDown = (e: KeyboardEvent) => {
    sound.ensureContext();
    if (e.code in this.keysPressed) {
      this.keysPressed[e.code] = true;
    }
    if (e.code === 'KeyT') {
      this.toggleTorch();
    }
    if (e.code === 'KeyC') {
      this.triggerRoll();
    }
    if (e.code === 'Space') {
      this.triggerJump();
    }
    if (e.code === 'KeyE' || e.code === 'KeyF') {
      this.triggerInteract();
    }
    if (e.code === 'KeyV') {
      const nextMode = this.cycleGlassesMode();
      this.callbacks.onMessage(
        nextMode === 'off'
          ? 'Glasses Mode: Standard 2D'
          : nextMode === 'anaglyph'
          ? 'Glasses Mode: Red-Cyan 3D Glasses (Anaglyph)'
          : 'Glasses Mode: VR Headset / SBS Dual-Screen'
      );
    }
    if (e.code === 'KeyG') {
      this.activateMagnet();
    }
    if (e.code === 'KeyM') {
      this.callbacks.onToggleMiniMap?.();
    }
    if (e.code === 'KeyB' || e.code === 'KeyP') {
      this.callbacks.onOpenStore?.('all');
    }
    if (e.code === 'KeyH' || e.key === '?') {
      this.callbacks.onOpenHelpAndTutorial?.('tutorial');
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code in this.keysPressed) {
      this.keysPressed[e.code] = false;
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    sound.ensureContext();
    this.isDragging = true;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDragging) return;
    const dx = e.clientX - this.prevPointerX;
    const dy = e.clientY - this.prevPointerY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    this.cameraYaw -= dx * 0.006;
    this.cameraPitch = Math.max(0.05, Math.min(Math.PI / 2.3, this.cameraPitch + dy * 0.005));
  };

  private onPointerUp = () => {
    this.isDragging = false;
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.anaglyphEffect) this.anaglyphEffect.setSize(width, height);
    if (this.stereoEffect) this.stereoEffect.setSize(width, height);
  };

  public setVirtualMovement(vx: number, vy: number) {
    this.virtualMove.x = vx;
    this.virtualMove.y = vy;
  }

  public setSprinting(sprinting: boolean) {
    this.isSprinting = sprinting;
  }

  public toggleTorch() {
    this.stats.torchLit = !this.stats.torchLit;
    sound.playTorchToggle();
    this.callbacks.onStatsChange({ ...this.stats });
    this.callbacks.onMessage(this.stats.torchLit ? 'Torch lit! Corridors illuminated.' : 'Torch extinguished.');
  }

  public triggerJump() {
    if (this.isGrounded && !this.isRolling && this.gameState === 'playing') {
      this.isGrounded = false;
      this.jumpVelY = 8.5;
      sound.playJump();
    }
  }

  public triggerRoll() {
    if (this.isGrounded && !this.isRolling && this.gameState === 'playing') {
      this.isRolling = true;
      this.rollTimer = 0.55;
      sound.playRoll();
    }
  }

  public triggerInteract() {
    // 1. Check if near an ancient hieroglyphic wall carving
    if (this.nearbyCarving) {
      markCarvingDiscovered(this.nearbyCarving.id);
      this.callbacks.onInspectCarving?.(this.nearbyCarving);
      return;
    }

    // 2. Check if near gate or sanctum
    const player2D = new THREE.Vector2(this.playerPos.x, this.playerPos.z);
    this.mazeData.gates.forEach((gate) => {
      const gateDist = player2D.distanceTo(new THREE.Vector2(gate.x, gate.z));
      if (gateDist < 4.0 && !gate.isOpen) {
        if (this.stats.keysCollected >= gate.requiredKeys) {
          gate.isOpen = true;
          sound.playGateOpen();
          this.callbacks.onMessage("The Sacred Gate swings open! The Pharaoh's Sanctum awaits!");
        } else {
          this.callbacks.onMessage(`Gate is sealed! Need ${gate.requiredKeys - this.stats.keysCollected} more Sacred Relics.`);
        }
      }
    });

    // Check near Pharaoh Treasure Sarcophagus
    const sanctumDist = player2D.distanceTo(new THREE.Vector2(this.mazeData.sanctumX, this.mazeData.sanctumZ));
    if (sanctumDist < 3.5 && !this.stats.hasPharaohTreasure && this.gameState === 'playing') {
      this.claimPharaohTreasure();
    }
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
  }

  public resetGame() {
    this.stats = {
      health: 100,
      maxHealth: 100,
      coins: 0,
      keysCollected: 0,
      totalKeys: 4,
      score: 0,
      torchLit: true,
      hasPharaohTreasure: false,
      stealthThreat: 'hidden',
    };
    this.gameState = 'playing';
    this.playerPos.set(this.mazeData.startX, 0, this.mazeData.startZ);
    this.playerVel.set(0, 0, 0);
    this.isRolling = false;
    this.isGrounded = true;

    // Reset mummies
    if (this.templeElements.mummyRigs && this.mazeData.mummies) {
      this.templeElements.mummyRigs.forEach((rig, idx) => {
        const orig = this.mazeData.mummies[idx];
        if (orig) {
          rig.data.x = orig.x;
          rig.data.z = orig.z;
          rig.data.angle = orig.angle;
          rig.data.state = 'patrol';
          rig.data.currentPointIndex = 0;
          rig.data.searchTimer = 0;
          rig.root.position.set(orig.x, 0, orig.z);
          rig.root.rotation.y = orig.angle;
        }
      });
    }

    // Reset collectibles
    this.mazeData.collectibles.forEach((c) => {
      c.collected = false;
      const mesh = this.templeElements.collectibleMeshes.get(c.id);
      if (mesh) mesh.visible = true;
    });

    // Reset gates
    this.mazeData.gates.forEach((g) => {
      g.isOpen = false;
      g.openProgress = 0;
    });

    this.templeElements.gateMeshes.forEach((gm) => {
      gm.leftDoor.position.x = -1.9;
      gm.rightDoor.position.x = 1.9;
      gm.lockGems.forEach((gem) => {
        (gem.material as THREE.MeshStandardMaterial).color.setHex(0x221100);
      });
    });

    this.callbacks.onStatsChange({ ...this.stats });
    this.callbacks.onGameStateChange('playing');
    this.callbacks.onMessage("Explore the Karnak Temple maze! Find 4 Sacred Relics to open Pharaoh's Sanctum.");
  }

  private claimPharaohTreasure() {
    this.stats.hasPharaohTreasure = true;
    this.stats.score += 5000;
    this.gameState = 'victory';
    sound.playVictoryFanfare();

    // Gold confetti explosion
    try {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ffae19', '#00c4b4', '#143477', '#ffffff'],
      });
    } catch {
      // Ignore confetti errors
    }

    this.callbacks.onStatsChange({ ...this.stats });
    this.callbacks.onGameStateChange('victory');
    this.callbacks.onMessage("MAJESTIC VICTORY! You claimed Pharaoh's Golden Treasure!");
  }

  private takeDamage(amount: number) {
    if (this.invulnerableTimer > 0 || this.gameState !== 'playing') return;
    this.stats.health = Math.max(0, this.stats.health - amount);
    this.invulnerableTimer = 1.2;
    sound.playDamage();
    this.callbacks.onStatsChange({ ...this.stats });

    if (this.stats.health <= 0) {
      // Check for Ankh of Resurrection Revive Charm
      if (this.inventory.reviveCharms > 0) {
        this.inventory.reviveCharms -= 1;
        saveInventory(this.inventory);
        this.stats.health = this.stats.maxHealth;
        this.invulnerableTimer = 3.0;
        sound.playPurchaseSuccess();
        this.callbacks.onStatsChange({ ...this.stats });
        this.callbacks.onInventoryChange?.({ ...this.inventory });
        this.callbacks.onMessage('✨ ANKH OF RESURRECTION SAVED YOU! Restored to 100% Health!');
        return;
      }

      this.gameState = 'gameover';
      this.callbacks.onGameStateChange('gameover');
      this.callbacks.onMessage('Queen Avatara fell to the ancient traps of Karnak!');
    } else {
      this.callbacks.onMessage('Trapped! Took damage!');
    }
  }

  private tick() {
    if (!this.renderer || !this.scene || !this.camera) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Update shadow cloak timer
    if (this.shadowCloakTimer > 0) {
      this.shadowCloakTimer -= delta;
      if (this.shadowCloakTimer <= 0) {
        this.shadowCloakTimer = 0;
        this.callbacks.onMessage('Cloak of Shadows expired! Visible to mummies again.');
      }
    }

    // Update coin magnet timer
    if (this.magnetTimer > 0) {
      this.magnetTimer -= delta;
      if (this.magnetTimer <= 0) {
        this.magnetTimer = 0;
        this.callbacks.onMessage('Hathor’s Coin Magnet expired!');
      }
    }

    // Performance Optimization: emit timer change ONLY when rounded seconds change
    const curCloakSec = Math.ceil(this.shadowCloakTimer);
    const curMagnetSec = Math.ceil(this.magnetTimer);
    if (curCloakSec !== this.lastReportedCloakSec || curMagnetSec !== this.lastReportedMagnetSec) {
      this.lastReportedCloakSec = curCloakSec;
      this.lastReportedMagnetSec = curMagnetSec;
      this.callbacks.onTimersChange?.(curCloakSec, curMagnetSec);
    }

    if (this.gameState === 'playing' || this.gameState === 'victory') {
      this.updatePlayerMovement(delta);
      this.updateTraps(delta);
      this.updateMummies(delta);
      this.updateCollectibles(delta);
      this.updateGates(delta);
      this.updateWallCarvings(delta);
      this.updateCamera(delta);
    }

    // Spark particles motion
    if (this.templeElements.torchSparks) {
      this.templeElements.torchSparks.rotation.y += delta * 0.05;
    }

    if (this.glassesMode === 'anaglyph' && this.anaglyphEffect) {
      this.anaglyphEffect.render(this.scene, this.camera);
    } else if (this.glassesMode === 'vr_sbs' && this.stereoEffect) {
      this.stereoEffect.render(this.scene, this.camera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    this.reqAnimFrameId = requestAnimationFrame(this.tick);
  }

  private updatePlayerMovement(delta: number) {
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
    }

    // Rolling timer
    if (this.isRolling) {
      this.rollTimer -= delta;
      if (this.rollTimer <= 0) {
        this.isRolling = false;
      }
    }

    // Determine movement direction vector from keys / virtual joystick
    let inputX = this.virtualMove.x;
    let inputZ = this.virtualMove.y;

    if (this.keysPressed.KeyW || this.keysPressed.ArrowUp) inputZ -= 1;
    if (this.keysPressed.KeyS || this.keysPressed.ArrowDown) inputZ += 1;
    if (this.keysPressed.KeyA || this.keysPressed.ArrowLeft) inputX -= 1;
    if (this.keysPressed.KeyD || this.keysPressed.ArrowRight) inputX += 1;

    const isMoving = Math.abs(inputX) > 0.1 || Math.abs(inputZ) > 0.1;
    const isSprintKey = this.keysPressed.ShiftLeft || this.keysPressed.ShiftRight || this.isSprinting;

    let moveSpeed = 4.8;
    if (isSprintKey) moveSpeed = this.inventory.hasSpeedBoost ? 11.5 : 8.2;
    if (this.isRolling) moveSpeed = 10.5;

    // Movement relative to camera angle
    if (isMoving && !this.isRolling) {
      const moveVec = new THREE.Vector2(inputX, inputZ).normalize();
      const camYaw = this.cameraYaw;
      const worldDirX = moveVec.x * Math.cos(camYaw) - moveVec.y * Math.sin(camYaw);
      const worldDirZ = moveVec.x * Math.sin(camYaw) + moveVec.y * Math.cos(camYaw);

      this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, worldDirX * moveSpeed, 12, delta);
      this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, worldDirZ * moveSpeed, 12, delta);

      // Face direction of motion
      this.targetAngle = Math.atan2(worldDirX, worldDirZ);
    } else if (!this.isRolling) {
      this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, 0, 14, delta);
      this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, 0, 14, delta);
    }

    // Smooth character rotation
    let angleDiff = this.targetAngle - this.playerAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.playerAngle += angleDiff * Math.min(1, delta * 14);
    this.character.root.rotation.y = this.playerAngle;

    // Jump Physics (Gravity)
    if (!this.isGrounded) {
      this.jumpVelY -= 22 * delta; // Gravity
      this.playerPos.y += this.jumpVelY * delta;
      if (this.playerPos.y <= 0) {
        this.playerPos.y = 0;
        this.isGrounded = true;
        this.jumpVelY = 0;
      }
    }

    // Footstep sound generator
    if (isMoving && this.isGrounded) {
      this.footstepTimer += delta * (isSprintKey ? 15 : 10);
      if (this.footstepTimer > 3.14) {
        sound.playFootstep();
        this.footstepTimer = 0;
      }
    }

    // Wall Collision Resolution with Sliding
    const newPosX = this.playerPos.x + this.playerVel.x * delta;
    const newPosZ = this.playerPos.z + this.playerVel.z * delta;
    const playerRadius = 0.45;

    // Test X motion
    if (!this.checkWallCollision(newPosX, this.playerPos.z, playerRadius)) {
      this.playerPos.x = newPosX;
    } else {
      this.playerVel.x = 0;
    }

    // Test Z motion
    if (!this.checkWallCollision(this.playerPos.x, newPosZ, playerRadius)) {
      this.playerPos.z = newPosZ;
    } else {
      this.playerVel.z = 0;
    }

    this.character.root.position.copy(this.playerPos);

    // Update Queen Avatara Animation Rig
    this.character.updateAnimation(
      delta,
      isMoving,
      isSprintKey,
      !this.isGrounded,
      this.isRolling,
      this.stats.torchLit
    );
  }

  private checkWallCollision(x: number, z: number, radius: number): boolean {
    const pBox = new THREE.Box3(
      new THREE.Vector3(x - radius, 0.1, z - radius),
      new THREE.Vector3(x + radius, 2.0, z + radius)
    );

    // Check maze walls & columns
    for (const box of this.templeElements.wallBoxes) {
      if (pBox.intersectsBox(box)) return true;
    }

    // Check closed gates
    for (const gate of this.mazeData.gates) {
      if (!gate.isOpen) {
        const gateBox = new THREE.Box3(
          new THREE.Vector3(gate.x - 2.0, 0, gate.z - 0.4),
          new THREE.Vector3(gate.x + 2.0, 4.5, gate.z + 0.4)
        );
        if (pBox.intersectsBox(gateBox)) return true;
      }
    }

    return false;
  }

  private updateTraps(delta: number) {
    const player2D = new THREE.Vector2(this.playerPos.x, this.playerPos.z);

    // 1. Spikes Traps
    this.templeElements.trapMeshes.spikes.forEach(({ spikesMesh, trap }) => {
      trap.timer += delta;
      const cycle = trap.timer % trap.period;
      // Cycle: 0 -> 1.8 down, 1.8 -> 2.4 emerge, 2.4 -> 3.0 up
      const isUp = cycle > 1.8;
      const targetY = isUp ? 0.35 : -0.6;
      spikesMesh.position.y = THREE.MathUtils.damp(spikesMesh.position.y, targetY, 16, delta);

      if (isUp && spikesMesh.position.y > 0.1) {
        const dist = player2D.distanceTo(new THREE.Vector2(trap.x, trap.z));
        if (dist < 1.3 && this.playerPos.y < 0.5 && !this.isRolling) {
          this.takeDamage(25);
        }
      }
    });

    // 2. Swinging Blades
    this.templeElements.trapMeshes.blades.forEach(({ bladeArm, trap }) => {
      trap.timer += delta;
      const angle = Math.sin((trap.timer * Math.PI * 2) / trap.period) * 1.1 * (trap.direction ?? 1);
      bladeArm.rotation.z = angle;

      // When blade passes near center (low height), check proximity
      if (Math.abs(angle) < 0.3) {
        const dist = player2D.distanceTo(new THREE.Vector2(trap.x, trap.z));
        if (dist < 1.5 && !this.isRolling && this.playerPos.y < 1.6) {
          this.takeDamage(35);
        }
      }
    });

    // 3. Rolling Boulder
    this.templeElements.trapMeshes.boulders.forEach(({ mesh, trap }) => {
      if (!trap.boulderState) return;
      const bs = trap.boulderState;

      // Trigger boulder when player gets near
      const dist = player2D.distanceTo(new THREE.Vector2(trap.x, bs.currentZ));
      if (dist < 10.0 && !bs.active) {
        bs.active = true;
        sound.playTrapTrigger();
        this.callbacks.onMessage('BOULDER TRIGGERED! RUN OR ROLL!');
      }

      if (bs.active) {
        bs.currentZ += bs.speed * delta;
        mesh.position.z = bs.currentZ;
        mesh.rotation.x += bs.speed * delta * 0.8;

        // Check boulder hit
        const bDist = player2D.distanceTo(new THREE.Vector2(trap.x, bs.currentZ));
        if (bDist < 1.5 && this.playerPos.y < 1.6) {
          this.takeDamage(50);
          this.playerVel.z += 8.0; // knockback
        }

        // Reset boulder if rolled past
        if (bs.currentZ > 18 * 4) {
          bs.currentZ = 6 * 4;
          bs.active = false;
        }
      }
    });
  }

  private updateCollectibles(delta: number) {
    const player2D = new THREE.Vector2(this.playerPos.x, this.playerPos.z);

    this.mazeData.collectibles.forEach((item) => {
      if (item.collected) return;
      const mesh = this.templeElements.collectibleMeshes.get(item.id);
      if (!mesh) return;

      // Magnet pull towards player
      if (this.magnetTimer > 0 && item.type === 'coin') {
        const itemVec = new THREE.Vector2(item.x, item.z);
        const distToPlayer = player2D.distanceTo(itemVec);
        if (distToPlayer < 16.0) {
          const dir = new THREE.Vector2().subVectors(player2D, itemVec).normalize();
          const speed = Math.max(9.0, 20.0 - distToPlayer) * delta;
          item.x += dir.x * speed;
          item.z += dir.y * speed;
          mesh.position.x = item.x;
          mesh.position.z = item.z;
        }
      }

      // Floating bob & spin
      mesh.rotation.y += delta * item.rotationSpeed;
      mesh.position.y = item.y + Math.sin(this.clock.getElapsedTime() * 3 + item.x) * 0.08;

      const dist = player2D.distanceTo(new THREE.Vector2(item.x, item.z));

      // Collect item
      if (dist < 1.4) {
        item.collected = true;
        mesh.visible = false;

        if (item.type === 'coin') {
          this.stats.coins += 1;
          this.stats.score += 50;
          sound.playCoin();
          this.callbacks.onStatsChange({ ...this.stats });
        } else if (item.type === 'gem') {
          this.stats.score += 250;
          this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + 20);
          sound.playGem();
          this.callbacks.onStatsChange({ ...this.stats });
          this.callbacks.onMessage(`Found ${item.name}! Health restored!`);
        } else if (item.type === 'scarab_key') {
          this.stats.keysCollected += 1;
          this.stats.score += 1000;
          sound.playKeyPickup();

          // Light up socket on Sanctum Gate
          const keyIdx = item.keyIndex ?? 0;
          this.templeElements.gateMeshes.forEach((gm) => {
            if (gm.lockGems[keyIdx]) {
              (gm.lockGems[keyIdx].material as THREE.MeshStandardMaterial).color.setHex(0x00e5ff);
            }
          });

          this.callbacks.onStatsChange({ ...this.stats });
          this.callbacks.onMessage(`Claimed ${item.name}! (${this.stats.keysCollected}/4 Relics)`);

          if (this.stats.keysCollected >= 4) {
            this.callbacks.onMessage("All 4 Sacred Relics collected! Head to Pharaoh's Sanctum!");
          }
        }
      }
    });
  }

  private updateGates(delta: number) {
    this.mazeData.gates.forEach((gate) => {
      // Auto open if player has 4 keys and gets close
      const player2D = new THREE.Vector2(this.playerPos.x, this.playerPos.z);
      const dist = player2D.distanceTo(new THREE.Vector2(gate.x, gate.z));
      if (dist < 5.0 && this.stats.keysCollected >= gate.requiredKeys && !gate.isOpen) {
        gate.isOpen = true;
        sound.playGateOpen();
        this.callbacks.onMessage("The Sacred Gate grinds open! Enter Pharaoh's Sanctum!");
      }

      if (gate.isOpen && gate.openProgress < 1.0) {
        gate.openProgress = Math.min(1.0, gate.openProgress + delta * 0.8);
        this.templeElements.gateMeshes.forEach((gm) => {
          if (gm.gate.id === gate.id) {
            // Slide doors outward
            const offset = gate.openProgress * 1.8;
            gm.leftDoor.position.x = -1.9 - offset;
            gm.rightDoor.position.x = 1.9 + offset;
          }
        });
      }
    });
  }

  private updateWallCarvings(delta: number) {
    if (!this.carvingRigs.length) return;

    let closestCarving: WallCarving | null = null;
    let minCarvingDist = 3.2;
    const pPos = this.playerPos;
    const t = this.clock.getElapsedTime();

    for (const rig of this.carvingRigs) {
      // Gentle mystical animation of glyph & flame light
      rig.glowMesh.rotation.z += delta * 0.4;
      rig.light.intensity = 1.3 + Math.sin(t * 2.5 + rig.carving.x) * 0.35;

      const dist = Math.hypot(pPos.x - rig.carving.x, pPos.z - rig.carving.z);
      if (dist < minCarvingDist) {
        closestCarving = rig.carving;
        minCarvingDist = dist;
      }
    }

    if (this.nearbyCarving?.id !== closestCarving?.id) {
      this.nearbyCarving = closestCarving;
      this.callbacks.onNearbyCarvingChange?.(closestCarving);
    }
  }

  public inspectNearbyCarving(): boolean {
    if (this.nearbyCarving) {
      markCarvingDiscovered(this.nearbyCarving.id);
      this.callbacks.onInspectCarving?.(this.nearbyCarving);
      return true;
    }
    return false;
  }

  public getNearbyCarving(): WallCarving | null {
    return this.nearbyCarving;
  }

  private updateCamera(delta: number) {
    if (this.cameraMode === 'overhead') {
      // Top down tactical view
      const targetCamPos = new THREE.Vector3(this.playerPos.x, 32, this.playerPos.z + 0.1);
      this.camera.position.lerp(targetCamPos, delta * 5);
      this.camera.lookAt(this.playerPos.x, 0, this.playerPos.z);
    } else if (this.cameraMode === 'portrait') {
      // Up-close Hero Inspection View: admire Queen Avatara's lifelike face, crown, jewelry, and robes
      const t = this.clock.getElapsedTime() * 0.35;
      const camDist = 2.1;
      const targetCamPos = new THREE.Vector3(
        this.playerPos.x + Math.sin(t) * camDist,
        this.playerPos.y + 1.5,
        this.playerPos.z + Math.cos(t) * camDist
      );
      this.camera.position.lerp(targetCamPos, delta * 6);
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.45, this.playerPos.z);
    } else if (this.cameraMode === 'cinematic' || this.gameState === 'victory') {
      // Cinematic slow orbit around Queen Avatara
      const t = this.clock.getElapsedTime() * 0.45;
      const camDist = 5.5;
      const targetCamPos = new THREE.Vector3(
        this.playerPos.x + Math.sin(t) * camDist,
        this.playerPos.y + 2.5,
        this.playerPos.z + Math.cos(t) * camDist
      );
      this.camera.position.lerp(targetCamPos, delta * 6);
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
    } else {
      // Third-Person Over-the-Shoulder follow
      const camDist = this.cameraZoom;
      const targetCamX = this.playerPos.x + Math.sin(this.cameraYaw) * camDist * Math.cos(this.cameraPitch);
      const targetCamY = this.playerPos.y + 1.6 + Math.sin(this.cameraPitch) * camDist;
      const targetCamZ = this.playerPos.z + Math.cos(this.cameraYaw) * camDist * Math.cos(this.cameraPitch);

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 10, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 10, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 10, delta);

      const lookTarget = new THREE.Vector3(
        this.playerPos.x,
        this.playerPos.y + 1.4,
        this.playerPos.z
      );
      this.camera.lookAt(lookTarget);
    }
  }

  private hasLineOfSight(from: THREE.Vector3, to: THREE.Vector3): boolean {
    const rayDir = new THREE.Vector3().subVectors(to, from);
    const dist = rayDir.length();
    if (dist <= 0.001) return true;
    rayDir.normalize();

    // Line of sight ray elevated at eye level (y = 1.3)
    const eyeFrom = new THREE.Vector3(from.x, 1.3, from.z);
    const ray = new THREE.Ray(eyeFrom, rayDir);

    for (const box of this.templeElements.wallBoxes) {
      const intersect = ray.intersectBox(box, new THREE.Vector3());
      if (intersect) {
        const hitDist = eyeFrom.distanceTo(intersect);
        if (hitDist < dist - 0.4) {
          return false; // Obstacle blocks line of sight
        }
      }
    }
    return true;
  }

  private updateMummies(delta: number) {
    if (!this.templeElements.mummyRigs) return;

    let highestThreat: 'hidden' | 'caution' | 'spotted' = 'hidden';
    const isPlayerSprinting = this.keysPressed.ShiftLeft || this.keysPressed.ShiftRight || this.isSprinting;
    const isCloaked = this.shadowCloakTimer > 0;

    this.templeElements.mummyRigs.forEach((mummy) => {
      const result = mummy.update(
        delta,
        this.playerPos,
        isPlayerSprinting,
        this.stats.torchLit,
        this.isRolling,
        (from, to) => this.hasLineOfSight(from, to),
        isCloaked
      );

      if (result.didSpotted) {
        sound.playMummyAlert();
        sound.playMummyGroan();
        this.callbacks.onMessage("⚠️ SPOTTED BY MUMMY GUARD! RUN OR EXTINGUISH TORCH!");
      }

      if (result.didAttack) {
        sound.playMummyAttack();
        this.takeDamage(32);
        // Knockback player away from mummy
        const knock = new THREE.Vector3().subVectors(this.playerPos, mummy.root.position).normalize();
        this.playerVel.x += knock.x * 7.5;
        this.playerVel.z += knock.z * 7.5;
      }

      if (result.state === 'chase' && result.threatDistance < 12) {
        highestThreat = 'spotted';
      } else if (highestThreat !== 'spotted' && (result.state === 'search' || result.threatDistance < 7.5)) {
        highestThreat = 'caution';
      }
    });

    if (this.stats.stealthThreat !== highestThreat) {
      this.stats.stealthThreat = highestThreat;
      this.callbacks.onStatsChange({ ...this.stats });
    }
  }

  public activateShadowCloak(): boolean {
    if (this.inventory.shadowCloakCharges <= 0) {
      this.callbacks.onMessage('No Cloak of Shadows remaining! Visit the Bazaar.');
      return false;
    }
    this.inventory.shadowCloakCharges -= 1;
    this.shadowCloakTimer = 30;
    this.lastReportedCloakSec = 30;
    this.callbacks.onTimersChange?.(30, Math.ceil(this.magnetTimer));
    saveInventory(this.inventory);
    sound.playPowerUpActivate();
    this.callbacks.onInventoryChange?.({ ...this.inventory });
    this.callbacks.onMessage('✨ EYE OF HORUS CLOAK ACTIVATED! Invisible to mummies for 30s!');
    return true;
  }

  public activateSolarBlast(): boolean {
    if (this.inventory.solarBlastCharges <= 0) {
      this.callbacks.onMessage('No Solar Blasts remaining! Visit the Bazaar.');
      return false;
    }
    this.inventory.solarBlastCharges -= 1;
    saveInventory(this.inventory);
    sound.playPowerUpActivate();

    let repelledCount = 0;
    if (this.templeElements.mummyRigs) {
      this.templeElements.mummyRigs.forEach((mummy) => {
        const mPos = new THREE.Vector3(mummy.data.x, 0, mummy.data.z);
        const dist = mPos.distanceTo(this.playerPos);
        if (dist < 15.0) {
          const blastDir = new THREE.Vector3().subVectors(mPos, this.playerPos).normalize();
          mummy.knockback(blastDir, 8.0);
          repelledCount++;
        }
      });
    }

    this.callbacks.onInventoryChange?.({ ...this.inventory });
    this.callbacks.onMessage(`☀️ SOLAR SCEPTER BLAST! Repelled and stunned ${repelledCount} mummies!`);
    return true;
  }

  public addCoins(amount: number) {
    this.stats.coins += amount;
    this.stats.score += amount * 10;
    this.callbacks.onStatsChange({ ...this.stats });
  }

  public deductCoins(amount: number): boolean {
    if (this.stats.coins < amount) return false;
    this.stats.coins -= amount;
    this.callbacks.onStatsChange({ ...this.stats });
    return true;
  }

  public resurrectOnTheSpot(): void {
    this.stats.health = this.stats.maxHealth;
    this.invulnerableTimer = 4.0;
    this.gameState = 'playing';
    sound.playPurchaseSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f0d8', '#ffd700', '#ffffff', '#ff9900'],
      });
    } catch {
      // Confetti fallback
    }
    this.callbacks.onStatsChange({ ...this.stats });
    this.callbacks.onGameStateChange('playing');
    this.callbacks.onMessage('✨ RESURRECTED! Queen Avatara defied death with 100% Health!');
  }

  public activateMagnet(): boolean {
    if (this.inventory.magnetCharges <= 0) {
      this.callbacks.onMessage('No Coin Magnets remaining! Visit the Bazaar.');
      return false;
    }
    this.inventory.magnetCharges -= 1;
    this.magnetTimer = 30;
    this.lastReportedMagnetSec = 30;
    this.callbacks.onTimersChange?.(Math.ceil(this.shadowCloakTimer), 30);
    saveInventory(this.inventory);
    sound.playPowerUpActivate();
    this.callbacks.onInventoryChange?.({ ...this.inventory });
    this.callbacks.onMessage('🧲 HATHOR’S COIN MAGNET ACTIVATED! Coins are drawn to you for 30s!');
    return true;
  }

  public getMagnetSeconds(): number {
    return Math.ceil(this.magnetTimer);
  }

  public setSkin(skinId: 'default' | 'ra_sun' | 'lapis_priestess'): void {
    this.character.applySkin(skinId);
  }

  public setInventory(inv: PlayerInventory) {
    this.inventory = { ...inv };
    if (inv.equippedSkin) {
      this.character.applySkin(inv.equippedSkin);
    }
    saveInventory(this.inventory);
    this.callbacks.onInventoryChange?.({ ...this.inventory });
  }

  public getInventory(): PlayerInventory {
    return this.inventory;
  }

  public getShadowCloakSeconds(): number {
    return Math.ceil(this.shadowCloakTimer);
  }

  public getMummies() {
    return this.templeElements.mummyRigs || [];
  }

  public getMazeData(): KarnakMazeData {
    return this.mazeData;
  }

  public getPlayerPosition(): THREE.Vector3 {
    return this.playerPos;
  }

  public getPlayerAngle(): number {
    return this.playerAngle;
  }

  public setGlassesMode(mode: GlassesMode) {
    this.glassesMode = mode;
    this.callbacks.onGlassesModeChange?.(mode);
  }

  public getGlassesMode(): GlassesMode {
    return this.glassesMode;
  }

  public cycleGlassesMode(): GlassesMode {
    const modes: GlassesMode[] = ['off', 'anaglyph', 'vr_sbs'];
    const nextIdx = (modes.indexOf(this.glassesMode) + 1) % modes.length;
    this.glassesMode = modes[nextIdx];
    this.callbacks.onGlassesModeChange?.(this.glassesMode);
    return this.glassesMode;
  }

  public setEyeSeparation(ipd: number) {
    this.eyeSeparation = ipd;
    if (this.stereoEffect) {
      this.stereoEffect.setEyeSeparation(ipd);
    }
  }

  public setCameraZoom(zoom: number) {
    this.cameraZoom = Math.max(2.2, Math.min(10.0, zoom));
  }

  public getCameraZoom(): number {
    return this.cameraZoom;
  }

  public dispose() {
    if (this.reqAnimFrameId !== null) {
      cancelAnimationFrame(this.reqAnimFrameId);
      this.reqAnimFrameId = null;
    }
    this.unbindEvents();

    // GPU Memory Management: traverse scene and release WebGL buffers and textures
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              const m = mat as any;
              if (m && m.map) m.map.dispose();
              mat.dispose();
            });
          } else {
            const m = mesh.material as any;
            if (m && m.map) m.map.dispose();
            mesh.material.dispose();
          }
        }
      }
    });

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
