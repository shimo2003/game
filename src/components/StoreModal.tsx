import React, { useState } from 'react';
import {
  Coins,
  Shield,
  Flame,
  Zap,
  Sun,
  X,
  Sparkles,
  Check,
  ShoppingBag,
  Magnet,
  Compass,
  Shirt,
  Receipt,
  Plus,
  Crown,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { PlayerInventory, StoreItem, PaymentMethod } from '../types/store';
import { STORE_ITEMS } from '../game/storeData';

interface StoreModalProps {
  inventory: PlayerInventory;
  coins: number;
  initialTab?: 'all' | 'currency' | 'perk' | 'skin' | 'bundle' | 'subscription' | 'receipts';
  onSelectItemToBuy: (item: StoreItem, preferredMethod?: PaymentMethod) => void;
  onEquipSkin: (skinId: 'default' | 'ra_sun' | 'lapis_priestess') => void;
  onCancelSubscription?: () => void;
  onResumeSubscription?: () => void;
  onClose: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = React.memo(({
  inventory,
  coins,
  initialTab = 'all',
  onSelectItemToBuy,
  onEquipSkin,
  onCancelSubscription,
  onResumeSubscription,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'currency' | 'perk' | 'skin' | 'bundle' | 'subscription' | 'receipts'>(
    initialTab
  );

  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('Found all treasures');

  const filteredItems = STORE_ITEMS.filter((item) => {
    if (activeTab === 'all') return item.category !== 'subscription';
    if (activeTab === 'receipts' || activeTab === 'subscription') return false;
    return item.category === activeTab;
  });

  const vipSubscriptionItem = STORE_ITEMS.find((i) => i.id === 'sub_royal_vip');

  const renderItemIcon = (icon: string) => {
    switch (icon) {
      case 'coins':
      case 'treasure':
      case 'vault':
        return <Coins className="h-6 w-6 text-yellow-400" />;
      case 'ankh':
        return <Shield className="h-6 w-6 text-emerald-400" />;
      case 'cloak':
        return <Flame className="h-6 w-6 text-amber-400" />;
      case 'sun':
        return <Sun className="h-6 w-6 text-yellow-300" />;
      case 'magnet':
        return <Magnet className="h-6 w-6 text-red-400" />;
      case 'sandals':
        return <Zap className="h-6 w-6 text-cyan-400" />;
      case 'compass':
        return <Compass className="h-6 w-6 text-emerald-400" />;
      case 'skin_gold':
        return <Sparkles className="h-6 w-6 text-amber-300" />;
      case 'skin_blue':
        return <Shirt className="h-6 w-6 text-sky-400" />;
      case 'crown_vip':
      case 'vip':
      default:
        return <Crown className="h-6 w-6 text-amber-300" />;
    }
  };

  const isSkinUnlocked = (skinId?: string) => {
    if (!skinId) return false;
    return inventory.unlockedSkins.includes(skinId);
  };

  const handleConfirmCancel = () => {
    onCancelSubscription?.();
    setShowCancelConfirmModal(false);
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 md:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-amber-500/70 bg-stone-950 shadow-[0_0_60px_rgba(217,119,6,0.3)] text-stone-100">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 px-5 md:px-6 py-3.5 bg-stone-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/60 bg-gradient-to-br from-amber-500/30 to-yellow-600/30 text-amber-300 shadow-md">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-amber-300">
                  The Royal Karnak Bazaar
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                  Google Play Verified
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Official In-App Purchases, VIP Subscriptions, Outfits & Policy-Compliant Billing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-amber-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Inventory Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 bg-stone-950/95 px-5 md:px-6 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-3 md:gap-5">
            {/* Coins with quick + button */}
            <div className="flex items-center gap-1.5 text-yellow-300 font-bold bg-yellow-950/40 px-2.5 py-1 rounded-xl border border-yellow-500/30">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span>{coins} Gold</span>
              <button
                onClick={() => setActiveTab('currency')}
                title="Buy more gold coins"
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-stone-950 hover:bg-amber-400 transition-transform active:scale-90"
              >
                <Plus className="h-3 w-3 stroke-[3]" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>{inventory.reviveCharms} Revives</span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>{inventory.shadowCloakCharges} Cloaks</span>
            </div>

            <div className="flex items-center gap-1.5 text-yellow-300 font-medium">
              <Sun className="h-3.5 w-3.5 text-yellow-400" />
              <span>{inventory.solarBlastCharges} Blasts</span>
            </div>

            <div className="flex items-center gap-1.5 text-red-300 font-medium">
              <Magnet className="h-3.5 w-3.5 text-red-400" />
              <span>{inventory.magnetCharges} Magnets</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {inventory.isSubscribed && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/50">
                <Crown className="h-3 w-3 text-amber-400" />
                <span>VIP Member</span>
              </span>
            )}
            {inventory.hasSpeedBoost && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/40">
                <Zap className="h-3 w-3" />
                <span>+40% Sprint</span>
              </span>
            )}
            {inventory.hasRelicCompass && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                <Compass className="h-3 w-3" />
                <span>Compass</span>
              </span>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-stone-800 px-5 md:px-6 py-2 bg-stone-900/40 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Items' },
              { id: 'subscription', label: 'VIP Pass & Subscriptions 👑' },
              { id: 'currency', label: 'Gold Packs (IAP)' },
              { id: 'perk', label: 'Power-Ups' },
              { id: 'skin', label: 'Outfits & Skins' },
              { id: 'bundle', label: 'Lifetime Bundles' },
              { id: 'receipts', label: `My Orders (${inventory.orderHistory?.length || 0})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* 1. VIP Pass & Subscription Tab (Google Play Policy Compliant) */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-stone-900/80 to-amber-950/30 p-5 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400 bg-amber-500/20 text-amber-300 shadow-md">
                      <Crown className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-amber-300">
                          Pharaoh’s Royal VIP Membership
                        </h3>
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                          $4.99 / month
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 mt-0.5">
                        Recurring monthly subscription. Unlocks daily gold, unlimited revives, the Ra Sun Armor, and speed boosts.
                      </p>
                    </div>
                  </div>

                  {/* Subscription Status Badge */}
                  <div className="flex items-center gap-2">
                    {inventory.isSubscribed ? (
                      inventory.subscriptionCancelled ? (
                        <div className="rounded-xl border border-amber-500/40 bg-amber-950/60 px-3 py-1.5 text-right">
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            Status: Cancelled
                          </div>
                          <div className="text-xs text-stone-300">
                            Active until Nov 20, 2026
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-right">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" />
                            Active Subscription
                          </div>
                          <div className="text-xs text-stone-300">
                            Renews: Nov 20, 2026
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-1.5 text-right">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Status: Inactive
                        </div>
                        <div className="text-xs text-stone-300">
                          Not currently subscribed
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* VIP Perks Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 border-t border-amber-500/20 pt-4 text-xs">
                  <div className="flex items-center gap-2 rounded-xl bg-stone-900/60 p-2 text-stone-200">
                    <Coins className="h-4 w-4 text-yellow-400 shrink-0" />
                    <span>1,000 Gold Monthly</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-900/60 p-2 text-stone-200">
                    <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>5 Sacred Ankh Revives</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-900/60 p-2 text-stone-200">
                    <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Ra Sun-Goddess Skin</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-900/60 p-2 text-stone-200">
                    <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>+40% Sprint Speed</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-900/60 p-2 text-stone-200">
                    <Compass className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Sacred Relic Compass</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-900/60 p-2 text-stone-200">
                    <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>100% Ad-Free VIP</span>
                  </div>
                </div>

                {/* Subscription Action Buttons (Cancel Subscription & Resubscribe) */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-amber-500/20 pt-4">
                  {inventory.isSubscribed ? (
                    inventory.subscriptionCancelled ? (
                      <>
                        <div className="text-xs text-stone-400">
                          Your subscription is set to expire on <strong className="text-stone-200">November 20, 2026</strong>. You will not be billed again.
                        </div>
                        <button
                          onClick={onResumeSubscription}
                          className="flex items-center gap-2 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-xs font-black text-stone-950 shadow-md hover:brightness-110 active:scale-95"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Resume Subscription ($4.99/mo)</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-xs text-stone-400">
                          Next billing cycle: <strong className="text-amber-300">November 20, 2026 ($4.99)</strong>. Cancel anytime with no penalty.
                        </div>
                        {/* Prominent CANCEL SUBSCRIPTION button per Google Policy */}
                        <button
                          onClick={() => setShowCancelConfirmModal(true)}
                          className="flex items-center gap-2 rounded-xl border border-red-500/60 bg-red-950/40 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-900/50 hover:border-red-400 transition-colors shadow-md active:scale-95"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                          <span>Cancel Subscription</span>
                        </button>
                      </>
                    )
                  ) : (
                    <>
                      <div className="text-xs text-stone-400">
                        Subscribe now via Google Play. Recurring $4.99 billed monthly. Cancel anytime in 1-click.
                      </div>
                      <button
                        onClick={() => {
                          if (vipSubscriptionItem) {
                            onSelectItemToBuy(vipSubscriptionItem, 'google_pay');
                          }
                        }}
                        className="flex items-center gap-2 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2.5 text-xs font-black text-stone-950 shadow-lg hover:brightness-110 active:scale-95"
                      >
                        <Crown className="h-4 w-4" />
                        <span>Subscribe for $4.99/mo</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Official Google Play Policy Disclosure Card */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-4 text-xs text-stone-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Google Play Subscription Policy Compliance</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-400">
                  In accordance with Google Play Developer Policies and consumer digital subscription protection standards:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-stone-400">
                  <li>
                    <strong>Transparent Billing:</strong> Subscription fees are charged to your Google Account upon purchase confirmation and will automatically renew each month unless cancelled at least 24 hours prior to the cycle end.
                  </li>
                  <li>
                    <strong>Immediate One-Click Cancellation:</strong> You can cancel your subscription at any time using the <em>Cancel Subscription</em> button above or via Google Play &gt; Subscriptions.
                  </li>
                  <li>
                    <strong>Retained Benefits:</strong> When you cancel, you will continue to have full access to all VIP perks, gold bonuses, and armor until the end of your prepaid period. No cancellation penalties or fees apply.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. Order History & Receipts View */}
          {activeTab === 'receipts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-amber-400" />
                  <span>Purchases & Digital Receipts History</span>
                </h3>
                <span className="text-xs text-stone-400">
                  {inventory.orderHistory?.length || 0} Total Orders
                </span>
              </div>

              {(!inventory.orderHistory || inventory.orderHistory.length === 0) ? (
                <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-8 text-center text-stone-400">
                  <ShoppingBag className="mx-auto h-10 w-10 text-stone-600 mb-2" />
                  <p className="text-sm font-bold text-stone-300">No purchases yet</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Your completed In-App Purchases, Google Pay transactions, and Gold trades will appear here with official order receipts.
                  </p>
                  <button
                    onClick={() => setActiveTab('currency')}
                    className="mt-4 rounded-xl border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
                  >
                    Browse Gold Packs
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {inventory.orderHistory.map((rec) => (
                    <div
                      key={rec.orderId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/70 p-4 gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-300">{rec.orderId}</span>
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            Completed
                          </span>
                        </div>
                        <div className="font-bold text-stone-200">{rec.itemName}</div>
                        <div className="text-[11px] text-stone-400">
                          {rec.timestamp} • Via {rec.paymentMethod.toUpperCase()}
                          {rec.cardLast4 ? ` (•••• ${rec.cardLast4})` : ''}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-amber-400">
                          {rec.amountGold !== undefined && rec.amountGold > 0
                            ? `${rec.amountGold} Gold`
                            : `$${rec.amountUSD.toFixed(2)} USD`}
                        </div>
                        <span className="text-[10px] text-stone-400">Official Receipt</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Item Catalog Grid (All / Currency / Perks / Skins / Bundles) */}
          {activeTab !== 'receipts' && activeTab !== 'subscription' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const unlocked = isSkinUnlocked(item.rewards.skinId);
                const isEquipped = item.rewards.skinId && inventory.equippedSkin === item.rewards.skinId;

                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900/50 p-4 transition-all duration-200 hover:border-amber-500/50 hover:bg-stone-900/80 shadow-lg"
                  >
                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-3 right-3 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-stone-950 p-2 shadow-inner">
                          {renderItemIcon(item.icon)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-100 pr-16">{item.name}</h4>
                          <span className="text-[11px] uppercase tracking-wider text-amber-400/80">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 leading-relaxed min-h-[36px]">
                        {item.description}
                      </p>
                    </div>

                    {/* Actions and Pricing */}
                    <div className="mt-4 flex items-center justify-between border-t border-stone-800 pt-3">
                      <div>
                        <div className="text-base font-black text-amber-300">
                          ${item.priceUSD.toFixed(2)}
                          <span className="text-[10px] text-stone-400 font-normal ml-1">USD</span>
                        </div>
                        {item.priceGold && (
                          <div className="text-[11px] text-yellow-400 font-medium">
                            or {item.priceGold} Gold Drachmas
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.category === 'skin' && unlocked ? (
                          isEquipped ? (
                            <span className="flex items-center gap-1 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                              <Check className="h-3.5 w-3.5" />
                              Equipped
                            </span>
                          ) : (
                            <button
                              onClick={() => onEquipSkin(item.rewards.skinId as any)}
                              className="rounded-xl border border-amber-400/50 bg-stone-800 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
                            >
                              Equip Outfit
                            </button>
                          )
                        ) : (
                          <>
                            {item.priceGold && (
                              <button
                                onClick={() => onSelectItemToBuy(item, 'gold')}
                                disabled={coins < item.priceGold}
                                className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                                  coins >= item.priceGold
                                    ? 'border border-yellow-500/60 bg-yellow-950/40 text-yellow-300 hover:bg-yellow-900/60'
                                    : 'border border-stone-800 bg-stone-900 text-stone-600 cursor-not-allowed'
                                }`}
                              >
                                {item.priceGold} Gold
                              </button>
                            )}

                            <button
                              onClick={() => onSelectItemToBuy(item, 'google_pay')}
                              className="rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1.5 text-xs font-black text-stone-950 shadow-md hover:brightness-110 active:scale-95 transition-all"
                            >
                              Buy ${item.priceUSD.toFixed(2)}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Cancel Subscription (Google Play Policy Compliant) */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-red-500/70 bg-stone-950 p-6 shadow-2xl text-stone-200">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-black text-red-300 uppercase tracking-wide">
                Cancel VIP Subscription?
              </h3>
            </div>

            <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
              <p>
                In compliance with <strong>Google Play Subscription Policies</strong>, canceling will stop all future automatic recurring charges immediately.
              </p>

              <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-3 text-[11px] text-amber-200/90">
                ✦ <strong>You keep all VIP perks until November 20, 2026:</strong> Your Ra Sun Armor, extra speed, and compass remain active through the end of your current cycle. No cancellation fees will be billed.
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-stone-400">
                  Reason for canceling (optional):
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-stone-200 focus:border-amber-400 focus:outline-none"
                >
                  <option value="Finished the maze">Completed all temple levels</option>
                  <option value="Too expensive">Looking for a different plan</option>
                  <option value="Taking a break">Taking a temporary break</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirmModal(false)}
                className="rounded-xl border border-stone-700 bg-stone-900 px-4 py-2 text-xs font-bold text-stone-300 hover:text-white"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleConfirmCancel}
                className="rounded-xl border border-red-500 bg-red-600/80 px-4 py-2 text-xs font-black text-white hover:bg-red-500 active:scale-95 shadow-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
