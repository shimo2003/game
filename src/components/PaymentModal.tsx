import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  X,
  Coins,
  Sparkles,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { PaymentMethod, PurchaseReceipt, StoreItem } from '../types/store';

interface PaymentModalProps {
  item: StoreItem;
  currentGold: number;
  initialMethod?: PaymentMethod;
  onSuccess: (receipt: PurchaseReceipt) => void;
  onClose: () => void;
  onSwitchToGoldPack?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = React.memo(({
  item,
  currentGold,
  initialMethod = 'google_pay',
  onSuccess,
  onClose,
  onSwitchToGoldPack,
}) => {
  const [method, setMethod] = useState<PaymentMethod>(
    item.priceGold && currentGold >= item.priceGold && initialMethod === 'gold'
      ? 'gold'
      : initialMethod === 'gold' && (!item.priceGold || currentGold < (item.priceGold ?? 0))
      ? 'google_pay'
      : initialMethod
  );

  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('742');
  const [cardholderName, setCardholderName] = useState('Queen Avatara');
  const [paypalEmail, setPaypalEmail] = useState('explorer@karnak-tomb.eg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const hasEnoughGold = item.priceGold !== undefined && currentGold >= item.priceGold;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setCardExpiry(val);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const orderReceipt: PurchaseReceipt = {
        orderId: `KRNK-${Math.floor(100000 + Math.random() * 900000)}`,
        itemId: item.id,
        itemName: item.name,
        amountUSD: method === 'gold' ? 0 : item.priceUSD,
        amountGold: method === 'gold' ? item.priceGold : undefined,
        paymentMethod: method,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cardLast4: method === 'card' ? (cardNumber.replace(/\s+/g, '').slice(-4) || '8912') : undefined,
        isSubscription: item.category === 'subscription',
        subscriptionStatus: item.category === 'subscription' ? 'active' : undefined,
      };

      setIsProcessing(false);
      setReceipt(orderReceipt);
      onSuccess(orderReceipt);
    }, 1100);
  };

  const copyOrder = () => {
    if (!receipt) return;
    navigator.clipboard?.writeText(receipt.orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 md:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-amber-500/70 bg-stone-950 p-5 md:p-6 text-stone-100 shadow-[0_0_50px_rgba(217,119,6,0.25)]">
        {/* Close Button */}
        {!receipt && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-amber-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Content: Success Receipt vs Payment Options */}
        {receipt ? (
          <div className="flex flex-col items-center text-center py-2">
            <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-950/70 text-emerald-400 shadow-xl">
              <CheckCircle2 className="h-9 w-9 animate-scale-in" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-300 animate-spin" />
            </div>

            <h3 className="text-xl font-black text-amber-300 uppercase tracking-wide">
              Payment Confirmed!
            </h3>
            <p className="mt-1 text-xs text-stone-300">
              Your purchase was successfully authorized and delivered to Queen Avatara.
            </p>

            {/* Official Order Receipt */}
            <div className="mt-4 w-full rounded-2xl border border-amber-500/30 bg-stone-900/90 p-4 text-xs text-stone-300 space-y-2.5 text-left">
              <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                <span className="text-stone-400">Order ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-300">{receipt.orderId}</span>
                  <button
                    onClick={copyOrder}
                    title="Copy Order ID"
                    className="text-stone-400 hover:text-amber-200"
                  >
                    {copiedOrderId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Item Purchased:</span>
                <span className="font-bold text-stone-100">{receipt.itemName}</span>
              </div>

              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {receipt.paymentMethod === 'gold'
                    ? `${receipt.amountGold} Karnak Gold Drachmas`
                    : `$${receipt.amountUSD.toFixed(2)} USD`}
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Payment Gateway:</span>
                <span className="font-medium text-stone-200 capitalize">
                  {receipt.paymentMethod === 'google_pay' && 'Google Pay (1-Tap Fast)'}
                  {receipt.paymentMethod === 'apple_pay' && 'Apple Pay (Biometric)'}
                  {receipt.paymentMethod === 'card' && `Credit Card (•••• ${receipt.cardLast4})`}
                  {receipt.paymentMethod === 'paypal' && 'PayPal Express'}
                  {receipt.paymentMethod === 'gold' && 'Karnak Treasury Gold'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-stone-400">Delivery Status:</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Instant Fulfilled & Active</span>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 py-3 text-sm font-black text-stone-950 shadow-xl hover:brightness-110 transition-transform active:scale-95"
            >
              Equip & Return to Karnak Maze
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/30 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Royal Karnak Secure Checkout</span>
              </div>
              <h3 className="text-lg font-black text-stone-100">{item.name}</h3>
              <p className="mt-0.5 text-xs text-stone-400 line-clamp-1">{item.description}</p>

              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-black text-amber-300">
                  ${item.priceUSD.toFixed(2)}
                </span>
                <span className="text-xs text-stone-400">USD</span>

                {item.priceGold !== undefined && (
                  <>
                    <span className="text-stone-500 font-bold">OR</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-yellow-300 bg-yellow-950/60 px-2.5 py-0.5 rounded-lg border border-yellow-500/40">
                      <Coins className="h-3.5 w-3.5 text-yellow-400" />
                      <span>{item.priceGold} Gold</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* 1. Google Pay */}
                <button
                  type="button"
                  onClick={() => setMethod('google_pay')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    method === 'google_pay'
                      ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="font-black text-sm tracking-tight text-white">GPay</span>
                  <span className="text-[11px]">Google Pay</span>
                </button>

                {/* 2. Apple Pay */}
                <button
                  type="button"
                  onClick={() => setMethod('apple_pay')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    method === 'apple_pay'
                      ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="text-[11px]">Apple Pay</span>
                </button>

                {/* 3. Credit / Debit Card */}
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    method === 'card'
                      ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[11px]">Card</span>
                </button>

                {/* 4. PayPal */}
                <button
                  type="button"
                  onClick={() => setMethod('paypal')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    method === 'paypal'
                      ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="font-bold text-sky-400">P</span>
                  <span className="text-[11px]">PayPal</span>
                </button>

                {/* 5. In-Game Gold Coins (if item offers gold price) */}
                {item.priceGold !== undefined && (
                  <button
                    type="button"
                    onClick={() => setMethod('gold')}
                    className={`col-span-2 sm:col-span-2 flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      method === 'gold'
                        ? 'border-yellow-400 bg-yellow-500/25 text-yellow-200 shadow-md ring-1 ring-yellow-400/50'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span>Pay with In-Game Gold ({item.priceGold} Coins)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Method Details Card */}
            {method === 'google_pay' && (
              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5 text-xs font-bold text-stone-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Google Pay 1-Tap Biometric Protected</span>
                </div>
                <p className="text-xs text-stone-400 mb-2">
                  Authenticated via your active Google Play Account. Zero credit card entry needed.
                </p>
                <div className="text-[11px] font-mono text-amber-400/90 bg-stone-950/70 p-2 rounded-xl border border-stone-800">
                  Account: shimo2003@gmail.com • Saved GPay Card (•••• 8912)
                </div>
              </div>
            )}

            {method === 'apple_pay' && (
              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5 text-xs font-bold text-stone-200">
                  <Smartphone className="h-4 w-4 text-cyan-400" />
                  <span>Apple Pay Simulated Sheet</span>
                </div>
                <p className="text-xs text-stone-400 mb-2">
                  Double-click side button or confirm with Face ID / Touch ID to complete.
                </p>
                <div className="text-[11px] font-mono text-stone-300 bg-stone-950/70 p-2 rounded-xl border border-stone-800">
                  Apple Cash / Wallet Card (•••• 3319) • Queen Avatara
                </div>
              </div>
            )}

            {method === 'paypal' && (
              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 mb-4 text-xs">
                <label className="block text-[11px] text-stone-400 mb-1">PayPal Account Email</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-400 focus:outline-none"
                  placeholder="explorer@karnak-tomb.eg"
                />
                <p className="mt-1.5 text-[10px] text-stone-400">
                  Express 1-click checkout with Buyer Protection.
                </p>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3 mb-4 rounded-2xl border border-stone-800 bg-stone-900/40 p-3.5 text-xs">
                {/* Visual Card Preview */}
                <div className="relative h-28 w-full rounded-xl bg-gradient-to-tr from-amber-900/60 via-stone-900 to-amber-700/40 p-3.5 border border-amber-500/30 shadow-inner flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-7 rounded bg-amber-400/70 border border-amber-300" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-300">
                      Royal Vault Pass
                    </span>
                  </div>
                  <div className="font-mono text-sm tracking-widest text-amber-100">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-300">
                    <span className="uppercase">{cardholderName || 'CARDHOLDER'}</span>
                    <span>EXP: {cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-amber-400 focus:outline-none"
                    placeholder="Queen Avatara"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 font-mono text-stone-100 focus:border-amber-400 focus:outline-none"
                    placeholder="4532 0000 0000 8912"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 font-mono text-stone-100 focus:border-amber-400 focus:outline-none"
                      placeholder="08/28"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.substring(0, 4))}
                      className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 font-mono text-stone-100 focus:border-amber-400 focus:outline-none"
                      placeholder="742"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'gold' && (
              <div className="rounded-2xl border border-yellow-500/40 bg-stone-900/60 p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2 text-xs font-bold text-yellow-300">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span>Karnak Treasury Payment</span>
                </div>
                <div className="flex justify-around items-center rounded-xl bg-stone-950 p-3 text-xs mb-3 border border-stone-800">
                  <div>
                    <span className="block text-[10px] text-stone-400">Current Gold:</span>
                    <span className="font-bold text-yellow-300">{currentGold} Coins</span>
                  </div>
                  <div className="text-stone-600">➔</div>
                  <div>
                    <span className="block text-[10px] text-stone-400">Item Cost:</span>
                    <span className="font-bold text-amber-400">-{item.priceGold ?? 0} Coins</span>
                  </div>
                </div>

                {!hasEnoughGold && (
                  <div className="text-xs text-red-400 mb-2">
                    ⚠️ You need {(item.priceGold ?? 0) - currentGold} more gold!
                    {onSwitchToGoldPack && (
                      <button
                        onClick={onSwitchToGoldPack}
                        className="ml-2 font-bold underline text-amber-300 hover:text-amber-200"
                      >
                        Buy Gold Pack
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Authorize / Pay Button */}
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing || (method === 'gold' && !hasEnoughGold)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 py-3 text-sm font-black text-stone-950 shadow-xl hover:brightness-110 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-950 border-t-transparent" />
                  <span>Verifying & Authorizing...</span>
                </>
              ) : method === 'gold' ? (
                <>
                  <Coins className="h-4 w-4" />
                  <span>Confirm & Deduct {item.priceGold} Gold</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>
                    Pay ${item.priceUSD.toFixed(2)} USD via{' '}
                    {method === 'google_pay'
                      ? 'Google Pay'
                      : method === 'apple_pay'
                      ? 'Apple Pay'
                      : method === 'paypal'
                      ? 'PayPal'
                      : 'Card'}
                  </span>
                </>
              )}
            </button>

            {/* Trust Footer */}
            <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-stone-400">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>256-Bit SSL Encrypted</span>
              </span>
              <span>•</span>
              <span>PCI-DSS Level 1</span>
              <span>•</span>
              <span>Instant Digital Delivery</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
