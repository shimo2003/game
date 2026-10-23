import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CameraMode, GlassesMode, KarnakGameEngine } from './game/GameEngine';
import { GameState, KarnakMazeData, PlayerStats } from './types/game';
import { PlayerInventory, StoreItem, PurchaseReceipt, PaymentMethod } from './types/store';
import { loadSavedInventory, saveInventory, STORE_ITEMS } from './game/storeData';
import { HUD } from './components/HUD';
import { MiniMap } from './components/MiniMap';
import { ControlsOverlay } from './components/ControlsOverlay';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { StoreModal } from './components/StoreModal';
import { PaymentModal } from './components/PaymentModal';
import { RiddleModal } from './components/RiddleModal';
import { HelpAndTutorialModal } from './components/HelpAndTutorialModal';
import { WallCarving } from './game/riddles';
import { sound } from './audio/soundSystem';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<KarnakGameEngine | null>(null);

  const [nearbyCarving, setNearbyCarving] = useState<WallCarving | null>(null);
  const [activeRiddleCarving, setActiveRiddleCarving] = useState<WallCarving | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpModalTab, setHelpModalTab] = useState<'tutorial' | 'controls' | 'riddles' | 'glasses'>('tutorial');

  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    coins: 0,
    keysCollected: 0,
    totalKeys: 4,
    score: 0,
    torchLit: true,
    hasPharaohTreasure: false,
    stealthThreat: 'hidden',
  });

  const [inventory, setInventory] = useState<PlayerInventory>(() => loadSavedInventory());
  const [shadowCloakSeconds, setShadowCloakSeconds] = useState(0);
  const [magnetSeconds, setMagnetSeconds] = useState(0);

  const [showStore, setShowStore] = useState(false);
  const [storeTab, setStoreTab] = useState<'all' | 'currency' | 'perk' | 'skin' | 'bundle' | 'subscription' | 'receipts'>('all');
  const [selectedItemToBuy, setSelectedItemToBuy] = useState<StoreItem | null>(null);
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PaymentMethod>('google_pay');

  const [gameState, setGameState] = useState<GameState>('playing');
  const [message, setMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('follow');
  const [glassesMode, setGlassesMode] = useState<GlassesMode>('off');
  const [mazeData, setMazeData] = useState<KarnakMazeData | null>(null);

  // Initialize Three.js Game Engine once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    let msgTimeout: NodeJS.Timeout;

    const engine = new KarnakGameEngine(canvasMountRef.current, {
      onStatsChange: (newStats) => {
        setStats(newStats);
      },
      onGameStateChange: (newState) => {
        setGameState(newState);
      },
      onMessage: (msg) => {
        setMessage(msg);
        clearTimeout(msgTimeout);
        if (msg) {
          msgTimeout = setTimeout(() => {
            setMessage(null);
          }, 4500);
        }
      },
      onInventoryChange: (inv) => {
        setInventory(inv);
      },
      onGlassesModeChange: (mode) => {
        setGlassesMode(mode);
      },
      onOpenStore: (tab) => {
        setStoreTab(tab as any || 'all');
        setShowStore(true);
      },
      onToggleMiniMap: () => {
        setShowMap((prev) => !prev);
      },
      onNearbyCarvingChange: (carving) => {
        setNearbyCarving(carving);
      },
      onInspectCarving: (carving) => {
        setActiveRiddleCarving(carving);
      },
      onOpenHelpAndTutorial: (tab) => {
        setHelpModalTab(tab || 'tutorial');
        setShowHelpModal(true);
      },
      onTimersChange: (cloakSec, magnetSec) => {
        setShadowCloakSeconds(cloakSec);
        setMagnetSeconds(magnetSec);
      },
    });

    engineRef.current = engine;
    setMazeData(engine.getMazeData());

    const handleKeyMap = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setShowMap((prev) => !prev);
      }
      if (e.code === 'KeyB' || e.code === 'KeyP') {
        setShowStore((prev) => !prev);
      }
      if (e.code === 'KeyH' || e.key === '?') {
        setHelpModalTab('tutorial');
        setShowHelpModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyMap);

    return () => {
      window.removeEventListener('keydown', handleKeyMap);
      clearTimeout(msgTimeout);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.setMute(nextMute);
  }, [isMuted]);

  const handleToggleTorch = useCallback(() => {
    engineRef.current?.toggleTorch();
  }, []);

  const handleJump = useCallback(() => {
    engineRef.current?.triggerJump();
  }, []);

  const handleRoll = useCallback(() => {
    engineRef.current?.triggerRoll();
  }, []);

  const handleInteract = useCallback(() => {
    engineRef.current?.triggerInteract();
  }, []);

  const handleSprintToggle = useCallback((sprinting: boolean) => {
    engineRef.current?.setSprinting(sprinting);
  }, []);

  const handleVirtualMove = useCallback((vx: number, vy: number) => {
    engineRef.current?.setVirtualMovement(vx, vy);
  }, []);

  const handleSetCameraMode = useCallback((mode: CameraMode) => {
    setCameraMode(mode);
    engineRef.current?.setCameraMode(mode);
  }, []);

  const handleSetGlassesMode = useCallback((mode: GlassesMode) => {
    setGlassesMode(mode);
    engineRef.current?.setGlassesMode(mode);
  }, []);

  const handleCycleGlasses = useCallback(() => {
    if (engineRef.current) {
      const nextMode = engineRef.current.cycleGlassesMode();
      setGlassesMode(nextMode);
    }
  }, []);

  const handleReset = useCallback(() => {
    engineRef.current?.resetGame();
  }, []);

  const getPlayerPos = useCallback((): THREE.Vector3 => {
    return engineRef.current ? engineRef.current.getPlayerPosition() : new THREE.Vector3();
  }, []);

  const getPlayerAngle = useCallback((): number => {
    return engineRef.current ? engineRef.current.getPlayerAngle() : 0;
  }, []);

  const getMummies = useCallback(() => {
    return engineRef.current ? engineRef.current.getMummies() : [];
  }, []);

  const handleActivateCloak = useCallback(() => {
    engineRef.current?.activateShadowCloak();
    if (engineRef.current) {
      setInventory(engineRef.current.getInventory());
      setShadowCloakSeconds(engineRef.current.getShadowCloakSeconds());
    }
  }, []);

  const handleActivateSolar = useCallback(() => {
    engineRef.current?.activateSolarBlast();
    if (engineRef.current) {
      setInventory(engineRef.current.getInventory());
    }
  }, []);

  const handleActivateMagnet = useCallback(() => {
    engineRef.current?.activateMagnet();
    if (engineRef.current) {
      setInventory(engineRef.current.getInventory());
      setMagnetSeconds(engineRef.current.getMagnetSeconds());
    }
  }, []);

  const handleOpenStore = useCallback(
    (initialTab: 'all' | 'currency' | 'perk' | 'skin' | 'bundle' | 'subscription' | 'receipts' = 'all') => {
      setStoreTab(initialTab);
      setShowStore(true);
    },
    []
  );

  const handleOpenHelpAndTutorial = useCallback(
    (tab: 'tutorial' | 'controls' | 'riddles' | 'glasses' = 'tutorial') => {
      setHelpModalTab(tab);
      setShowHelpModal(true);
    },
    []
  );

  const handleInspectNearbyCarving = useCallback(() => {
    engineRef.current?.inspectNearbyCarving();
  }, []);

  const handleToggleMap = useCallback(() => {
    setShowMap((prev) => !prev);
  }, []);

  const handleCloseMap = useCallback(() => {
    setShowMap(false);
  }, []);

  const handleCloseStore = useCallback(() => {
    setShowStore(false);
  }, []);

  const handleClosePayment = useCallback(() => {
    setSelectedItemToBuy(null);
  }, []);

  const handleCloseRiddle = useCallback(() => {
    setActiveRiddleCarving(null);
  }, []);

  const handleCloseHelp = useCallback(() => {
    setShowHelpModal(false);
  }, []);

  const handleContinueExplore = useCallback(() => {
    setGameState('playing');
  }, []);

  const handleSwitchToGoldPack = useCallback(() => {
    setSelectedItemToBuy(null);
    handleOpenStore('currency');
  }, [handleOpenStore]);

  const handleOpenRiddlesFromCarving = useCallback(() => {
    setActiveRiddleCarving(null);
    handleOpenHelpAndTutorial('riddles');
  }, [handleOpenHelpAndTutorial]);

  const handleSelectItemToBuy = useCallback((item: StoreItem, preferredMethod?: PaymentMethod) => {
    setSelectedItemToBuy(item);
    if (preferredMethod) {
      setPreferredPaymentMethod(preferredMethod);
    } else {
      setPreferredPaymentMethod('google_pay');
    }
  }, []);

  const handleEquipSkin = useCallback((skinId: 'default' | 'ra_sun' | 'lapis_priestess') => {
    setInventory((prev) => {
      const next: PlayerInventory = {
        ...prev,
        equippedSkin: skinId,
      };
      saveInventory(next);
      engineRef.current?.setInventory(next);
      return next;
    });
    engineRef.current?.setSkin(skinId);
    sound.playPowerUpActivate();
    setMessage(`Equipped ${skinId === 'ra_sun' ? 'Ra Sun Armor' : skinId === 'lapis_priestess' ? 'Lapis Priestess Vestments' : 'Royal Linen'}!`);
  }, []);

  const handleCancelSubscription = useCallback(() => {
    setInventory((prev) => {
      const next: PlayerInventory = {
        ...prev,
        subscriptionCancelled: true,
        subscriptionCancellationDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      saveInventory(next);
      engineRef.current?.setInventory(next);
      return next;
    });
    sound.playPurchaseSuccess();
    setMessage('Subscription cancelled per Google Play Policy. Benefits remain active until end of current cycle.');
  }, []);

  const handleResumeSubscription = useCallback(() => {
    setInventory((prev) => {
      const next: PlayerInventory = {
        ...prev,
        isSubscribed: true,
        subscriptionCancelled: false,
        subscriptionRenewalDate: '2026-11-20',
      };
      saveInventory(next);
      engineRef.current?.setInventory(next);
      return next;
    });
    sound.playPurchaseSuccess();
    setMessage('VIP Subscription Resumed! Automatic renewal restored.');
  }, []);

  const handlePurchaseSuccess = useCallback(
    (receipt: PurchaseReceipt) => {
      if (!selectedItemToBuy) return;
      const rewards = selectedItemToBuy.rewards;

      sound.playPurchaseSuccess();

      // If paid via in-game gold
      if (receipt.paymentMethod === 'gold' && receipt.amountGold) {
        engineRef.current?.deductCoins(receipt.amountGold);
      }

      // If rewarded gold
      if (rewards.coins) {
        engineRef.current?.addCoins(rewards.coins);
      }

      setInventory((prev) => {
        const nextUnlockedSkins = rewards.skinId && !prev.unlockedSkins.includes(rewards.skinId)
          ? [...prev.unlockedSkins, rewards.skinId]
          : prev.unlockedSkins;

        const nextEquippedSkin = rewards.skinId || prev.equippedSkin;

        const next: PlayerInventory = {
          ...prev,
          reviveCharms: prev.reviveCharms + (rewards.reviveCharms || 0),
          shadowCloakCharges: prev.shadowCloakCharges + (rewards.shadowCloakSeconds || 0),
          solarBlastCharges: prev.solarBlastCharges + (rewards.solarBlasts || 0),
          magnetCharges: prev.magnetCharges + (rewards.magnetCharges || 0),
          hasSpeedBoost: prev.hasSpeedBoost || !!rewards.permanentSpeedBoost,
          hasRelicCompass: prev.hasRelicCompass || !!rewards.hasRelicCompass,
          unlockedSkins: nextUnlockedSkins,
          equippedSkin: nextEquippedSkin,
          isSubscribed: prev.isSubscribed || !!rewards.isSubscription,
          subscriptionCancelled: rewards.isSubscription ? false : prev.subscriptionCancelled,
          subscriptionRenewalDate: rewards.isSubscription ? '2026-11-20' : prev.subscriptionRenewalDate,
          purchasedBundleIds: prev.purchasedBundleIds.includes(selectedItemToBuy.id)
            ? prev.purchasedBundleIds
            : [...prev.purchasedBundleIds, selectedItemToBuy.id],
          orderHistory: [receipt, ...(prev.orderHistory || [])],
        };

        saveInventory(next);
        engineRef.current?.setInventory(next);
        return next;
      });

      // If purchased during game over, resurrect immediately on the spot!
      if (gameState === 'gameover' && (rewards.reviveCharms || selectedItemToBuy.id.includes('revive'))) {
        engineRef.current?.resurrectOnTheSpot();
      }

      setMessage(`Order ${receipt.orderId} Confirmed! ${selectedItemToBuy.name} unlocked!`);
    },
    [selectedItemToBuy, gameState]
  );

  const handleUseReviveCharmFromDeath = useCallback(() => {
    if (inventory.reviveCharms > 0) {
      setInventory((prev) => {
        const next = { ...prev, reviveCharms: prev.reviveCharms - 1 };
        saveInventory(next);
        engineRef.current?.setInventory(next);
        return next;
      });
      engineRef.current?.resurrectOnTheSpot();
    }
  }, [inventory.reviveCharms]);

  const handleQuickBuyReviveUSD = useCallback(() => {
    const singleRevive = STORE_ITEMS.find((i) => i.id === 'perk_revive_single') || STORE_ITEMS[4];
    setSelectedItemToBuy(singleRevive);
    setPreferredPaymentMethod('google_pay');
  }, []);

  const handleReviveWithGold = useCallback(() => {
    if (stats.coins >= 300) {
      engineRef.current?.deductCoins(300);
      engineRef.current?.resurrectOnTheSpot();
    }
  }, [stats.coins]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-stone-950 font-sans text-stone-100 select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 h-full w-full" />

      {/* VR Headset Center Divider Line for Side-by-Side Viewing */}
      {glassesMode === 'vr_sbs' && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-black/80 z-10 shadow-[0_0_10px_black]" />
      )}

      {/* HUD Bar (Top layer) */}
      <HUD
        stats={stats}
        inventory={inventory}
        glassesMode={glassesMode}
        shadowCloakSeconds={shadowCloakSeconds}
        magnetSeconds={magnetSeconds}
        message={message}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onToggleTorch={handleToggleTorch}
        onToggleMap={handleToggleMap}
        onCycleGlasses={handleCycleGlasses}
        onOpenStore={handleOpenStore}
        onActivateCloak={handleActivateCloak}
        onActivateSolar={handleActivateSolar}
        onActivateMagnet={handleActivateMagnet}
        onOpenHelpAndTutorial={handleOpenHelpAndTutorial}
        showMap={showMap}
      />

      {/* Minimap modal */}
      {showMap && (
        <MiniMap
          mazeData={mazeData}
          getPlayerPos={getPlayerPos}
          getPlayerAngle={getPlayerAngle}
          getMummies={getMummies}
          stats={stats}
          onClose={handleCloseMap}
        />
      )}

      {/* Royal Karnak Bazaar Store Modal (with Google Play Subscriptions & Cancellation) */}
      {showStore && (
        <StoreModal
          inventory={inventory}
          coins={stats.coins}
          initialTab={storeTab}
          onSelectItemToBuy={handleSelectItemToBuy}
          onEquipSkin={handleEquipSkin}
          onCancelSubscription={handleCancelSubscription}
          onResumeSubscription={handleResumeSubscription}
          onClose={handleCloseStore}
        />
      )}

      {/* Payment Checkout Modal */}
      {selectedItemToBuy && (
        <PaymentModal
          item={selectedItemToBuy}
          currentGold={stats.coins}
          initialMethod={preferredPaymentMethod}
          onSuccess={handlePurchaseSuccess}
          onClose={handleClosePayment}
          onSwitchToGoldPack={handleSwitchToGoldPack}
        />
      )}

      {/* Collapsible Bottom Control Dock & Mobile Action Buttons (with D-Pad & 3D glasses switcher) */}
      <ControlsOverlay
        cameraMode={cameraMode}
        glassesMode={glassesMode}
        onSetCameraMode={handleSetCameraMode}
        onSetGlassesMode={handleSetGlassesMode}
        onToggleTorch={handleToggleTorch}
        torchLit={stats.torchLit}
        onJump={handleJump}
        onRoll={handleRoll}
        onInteract={handleInteract}
        onSprintToggle={handleSprintToggle}
        onVirtualMove={handleVirtualMove}
        onReset={handleReset}
        nearbyCarving={nearbyCarving}
        onOpenHelpAndTutorial={handleOpenHelpAndTutorial}
      />

      {/* Ancient Hieroglyphic Carving & Cryptic Riddle Modal */}
      {activeRiddleCarving && (
        <RiddleModal
          carving={activeRiddleCarving}
          onClose={handleCloseRiddle}
          onOpenTutorial={handleOpenRiddlesFromCarving}
        />
      )}

      {/* Accessible Help & Interactive Tutorial Modal */}
      {showHelpModal && (
        <HelpAndTutorialModal
          initialTab={helpModalTab}
          onClose={handleCloseHelp}
        />
      )}

      {/* Victory Celebration Modal */}
      {gameState === 'victory' && (
        <VictoryModal
          stats={stats}
          onRestart={handleReset}
          onContinueExplore={handleContinueExplore}
        />
      )}

      {/* Game Over Respawn & Instant Resurrect Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={stats}
          inventory={inventory}
          onUseReviveCharm={handleUseReviveCharmFromDeath}
          onQuickBuyReviveUSD={handleQuickBuyReviveUSD}
          onReviveWithGold={handleReviveWithGold}
          onRespawn={handleReset}
        />
      )}
    </div>
  );
}
