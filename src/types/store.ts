export type PaymentMethod = 'google_pay' | 'apple_pay' | 'card' | 'paypal' | 'gold';

export interface StoreItem {
  id: string;
  name: string;
  category: 'currency' | 'perk' | 'skin' | 'bundle' | 'subscription';
  priceUSD: number;
  priceGold?: number; // Optional in-game gold drachmas price
  billingPeriod?: 'month' | 'one_time';
  description: string;
  icon: string;
  badge?: string;
  rewards: {
    coins?: number;
    reviveCharms?: number;
    shadowCloakSeconds?: number;
    solarBlasts?: number;
    magnetCharges?: number;
    permanentSpeedBoost?: boolean;
    hasRelicCompass?: boolean;
    skinId?: 'default' | 'ra_sun' | 'lapis_priestess';
    isSubscription?: boolean;
  };
}

export interface PlayerInventory {
  reviveCharms: number;
  shadowCloakCharges: number;
  solarBlastCharges: number;
  magnetCharges: number;
  hasSpeedBoost: boolean;
  hasRelicCompass: boolean;
  equippedSkin: 'default' | 'ra_sun' | 'lapis_priestess';
  unlockedSkins: string[];
  purchasedBundleIds: string[];
  orderHistory: PurchaseReceipt[];
  // Google Play Subscriptions Compliance
  isSubscribed?: boolean;
  subscriptionTier?: string;
  subscriptionRenewalDate?: string;
  subscriptionPriceUSD?: number;
  subscriptionCancelled?: boolean;
  subscriptionCancellationDate?: string;
}

export interface PurchaseReceipt {
  orderId: string;
  itemId: string;
  itemName: string;
  amountUSD: number;
  amountGold?: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  cardLast4?: string;
  isSubscription?: boolean;
  subscriptionStatus?: 'active' | 'cancelled';
}
