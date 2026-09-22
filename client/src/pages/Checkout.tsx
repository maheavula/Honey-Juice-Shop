import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  MapPin,
  Lock,
  Smartphone,
  Building2,
  Check,
  User,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Order } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { HoneyBottleLogo } from '../components/HoneyBottleLogo';

export const Checkout: React.FC = () => {
  const { items, totalPaise, totalItems, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // User details (Prefilled from user profile)
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');

  // Payment method selection
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');

  // Payment Details (NOT prefilled — user must enter them)
  // UPI
  const [upiId, setUpiId] = useState('');

  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // NetBanking
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [netbankingCustomerId, setNetbankingCustomerId] = useState('');

  // COD
  const [codConfirmed, setCodConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.address) {
        setStreet(user.address.street || '');
        setCity(user.address.city || '');
        setState(user.address.state || 'Karnataka');
        setPostalCode(user.address.postalCode || '');
      }
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-honey-400">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-3xl bg-obsidian-900 border border-honey-500/20">
        <div className="w-12 h-12 mx-auto mb-4 p-2 rounded-2xl bg-obsidian-950 border border-honey-500/30 flex items-center justify-center">
          <HoneyBottleLogo className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-stone-100 mb-2">
          Sign In to Complete Checkout
        </h2>
        <p className="text-xs text-stone-400 mb-6 leading-relaxed">
          Please log in or create an artisanal boutique account to track orders and finalize your cold-chain delivery.
        </p>
        <Link
          to="/login"
          className="inline-block w-full py-3 rounded-xl bg-honey-500 text-stone-950 font-bold text-sm hover:bg-honey-400 transition-colors shadow-lg"
        >
          Sign In / Register
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-3xl bg-obsidian-900 border border-stone-800">
        <div className="w-12 h-12 mx-auto mb-3 p-2 rounded-2xl bg-obsidian-950 border border-honey-500/20 flex items-center justify-center">
          <HoneyBottleLogo className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-stone-100 mb-2">
          Your Artisanal Cart is Empty
        </h2>
        <p className="text-xs text-stone-400 mb-6">
          Add some fresh cold-pressed blends to proceed to checkout.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-honey-500 text-stone-950 font-bold text-xs hover:bg-honey-400 transition-colors"
        >
          Browse Juices
        </Link>
      </div>
    );
  }

  const freeDeliveryThresholdPaise = 50000;
  const deliveryFeePaise = totalPaise >= freeDeliveryThresholdPaise ? 0 : 4900;
  const finalTotalPaise = totalPaise + deliveryFeePaise;

  // Formatting helpers for Card inputs
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(raw);
  };

  const handleUpiChipClick = (handle: string) => {
    const prefix = upiId.split('@')[0] || '';
    setUpiId(`${prefix}${handle}`);
  };

  const detectCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('6') || clean.startsWith('35')) return 'RuPay';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'Amex';
    return null;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Address & Name
    if (!fullName.trim()) {
      showToast('Please provide the recipient full name.', 'warning', 'Name Required');
      return;
    }
    if (!street.trim() || !city.trim() || !postalCode.trim()) {
      showToast('Please provide a complete delivery destination.', 'warning', 'Address Incomplete');
      return;
    }

    // 2. Validate Payment details based on selected method
    let finalPaymentDescription = '';

    if (selectedMethod === 'upi') {
      const cleanUpi = upiId.trim();
      if (!cleanUpi || !cleanUpi.includes('@') || cleanUpi.length < 5) {
        showToast('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)', 'warning', 'UPI Details Required');
        return;
      }
      finalPaymentDescription = `UPI: ${cleanUpi}`;
    } else if (selectedMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        showToast('Please enter a valid 16-digit card number.', 'warning', 'Card Number Required');
        return;
      }
      if (!cardHolder.trim()) {
        showToast('Please enter the name printed on the card.', 'warning', 'Cardholder Name Required');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        showToast('Please enter card expiry date (MM/YY).', 'warning', 'Expiry Date Required');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        showToast('Please enter the 3 or 4 digit CVV/CVC code.', 'warning', 'CVV Required');
        return;
      }
      const brand = detectCardBrand() || 'Card';
      finalPaymentDescription = `${brand} (ending in ${cleanCard.slice(-4)}) - ${cardHolder.trim()}`;
    } else if (selectedMethod === 'netbanking') {
      if (!netbankingCustomerId.trim()) {
        showToast('Please enter your Customer ID / NetBanking Username.', 'warning', 'NetBanking ID Required');
        return;
      }
      finalPaymentDescription = `NetBanking: ${selectedBank} (User: ${netbankingCustomerId.trim()})`;
    } else if (selectedMethod === 'cod') {
      if (!codConfirmed) {
        showToast('Please confirm doorstep payment agreement for cold-chain dispatch.', 'warning', 'COD Confirmation Required');
        return;
      }
      finalPaymentDescription = 'Cash / Doorstep QR on Cold-Chain Delivery';
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          juiceId: i.juice.id,
          quantity: i.quantity
        })),
        deliveryAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim()
        },
        paymentMethod: finalPaymentDescription
      };

      const res = await ordersApi.checkout(payload);
      if (res.success && res.order) {
        showToast(
          `Order ${res.order.id} verified & placed successfully! Preparing cold-chain dispatch.`,
          'success',
          'Payment Confirmed'
        );
        clearCart();
        setCompletedOrder(res.order);
      } else {
        showToast(res.error || 'Checkout failed. Please check stock.', 'error', 'Checkout Error');
      }
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-honey-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Menu</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>End-to-End Encrypted Cold-Chain Checkout</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Address & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer & Delivery Address */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-stone-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800/80">
              <div className="p-2 rounded-xl bg-honey-500/15 text-honey-400 border border-honey-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base text-stone-100">
                  1. Delivery Details
                </h3>
                <p className="text-[11px] text-stone-400">
                  Recipient contact & cold-chain destination (prefilled from profile)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  Recipient Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohan Patel"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  Street & Apartment / Villa *
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 45 Green Park, 4th Cross"
                  className="w-full glass-input rounded-xl p-3 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full glass-input rounded-xl p-3 text-xs"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full glass-input rounded-xl p-3 text-xs"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="560025"
                    className="w-full glass-input rounded-xl p-3 text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Payment Method with Input Details */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-stone-800 space-y-5 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800/80">
              <div className="p-2 rounded-xl bg-citrus-500/15 text-citrus-400 border border-citrus-500/20">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base text-stone-100">
                  2. Payment Method & Verification
                </h3>
                <p className="text-[11px] text-stone-400">
                  Select your method and complete the payment credentials below
                </p>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'upi' as const, label: 'UPI Instant', icon: Smartphone },
                { id: 'card' as const, label: 'Card Payment', icon: CreditCard },
                { id: 'netbanking' as const, label: 'NetBanking', icon: Building2 },
                { id: 'cod' as const, label: 'Doorstep COD', icon: Truck }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-honey-500/15 border-honey-500 text-honey-300 shadow-md shadow-honey-950 font-bold'
                        : 'bg-obsidian-950/70 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-honey-400' : 'text-stone-400'}`} />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Form Area Based on Selected Method */}
            <div className="p-4 rounded-xl bg-obsidian-950 border border-stone-800/90 space-y-4">
              {/* --- UPI METHOD --- */}
              {selectedMethod === 'upi' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-honey-400" />
                      Enter Virtual Payment Address (UPI ID)
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">Instant 0% Fee</span>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                      className="w-full glass-input rounded-xl p-3 text-xs font-mono"
                    />
                  </div>

                  {/* Quick Handle Chips */}
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1.5">
                      Quick Provider Handles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['@okhdfcbank', '@okaxis', '@okicici', '@oksbi', '@paytm', '@ybl'].map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => handleUpiChipClick(handle)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-obsidian-900 text-stone-300 border border-stone-700/60 hover:border-honey-500/50 hover:text-honey-300 font-mono transition-colors"
                        >
                          {handle}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-honey-500/5 border border-honey-500/15 text-[11px] text-stone-400">
                    <Info className="w-4 h-4 text-honey-400 flex-shrink-0" />
                    <span>A simulated payment request will be verified instantly upon confirmation.</span>
                  </div>
                </div>
              )}

              {/* --- CARD METHOD --- */}
              {selectedMethod === 'card' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-honey-400" />
                      Credit / Debit Card Details
                    </span>
                    {detectCardBrand() && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-honey-500/20 text-honey-300 border border-honey-500/30">
                        {detectCardBrand()}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4532 •••• •••• 8921"
                      className="w-full glass-input rounded-xl p-3 text-xs font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name as printed on card"
                      className="w-full glass-input rounded-xl p-3 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        maxLength={5}
                        className="w-full glass-input rounded-xl p-3 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                        CVV / CVC *
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full glass-input rounded-xl p-3 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-bit SSL encrypted tokenization simulation.</span>
                  </div>
                </div>
              )}

              {/* --- NETBANKING METHOD --- */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-honey-400" />
                      Select Bank & Customer Authentication
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      Select Financial Institution *
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full glass-input rounded-xl p-3 text-xs bg-obsidian-950 cursor-pointer"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      Customer ID / NetBanking Username *
                    </label>
                    <input
                      type="text"
                      value={netbankingCustomerId}
                      onChange={(e) => setNetbankingCustomerId(e.target.value)}
                      placeholder="e.g. 84930219"
                      className="w-full glass-input rounded-xl p-3 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* --- CASH ON DELIVERY (COD) --- */}
              {selectedMethod === 'cod' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-stone-200 text-xs font-semibold">
                    <Truck className="w-4 h-4 text-honey-400" />
                    <span>Cold-Chain Doorstep Handover</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Verify the insulated temperature seal (4°C) upon arrival. You can pay using cash or scan the dynamic UPI QR code with the delivery executive.
                  </p>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-obsidian-900 border border-stone-800 cursor-pointer hover:border-honey-500/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={codConfirmed}
                      onChange={(e) => setCodConfirmed(e.target.checked)}
                      className="rounded accent-honey-500"
                    />
                    <span className="text-xs text-stone-300 font-medium">
                      I confirm to pay <span className="font-bold text-honey-400">{formatCurrency(finalTotalPaise)}</span> at delivery.
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-honey-500/20 space-y-4 shadow-xl">
            <h3 className="font-display font-bold text-base text-stone-100 pb-3 border-b border-stone-800">
              Order Summary ({totalItems} items)
            </h3>

            {/* Items list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map(({ juice, quantity }) => (
                <div key={juice.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={juice.imageUrl}
                      alt={juice.name}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-950 flex-shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-medium text-stone-200 truncate block">
                        {juice.name}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {quantity} × {formatCurrency(juice.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-honey-400 flex-shrink-0">
                    {formatCurrency(juice.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Calculations */}
            <div className="pt-4 border-t border-stone-800 space-y-2 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-200">{formatCurrency(totalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Eco Glass Bottle Deposit</span>
                <span className="text-emerald-400">₹0.00 (Complimentary)</span>
              </div>
              <div className="flex justify-between">
                <span>Cold-Chain Insulated Shipping</span>
                <span>
                  {deliveryFeePaise === 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    formatCurrency(deliveryFeePaise)
                  )}
                </span>
              </div>
              <div className="border-t border-stone-800 pt-3 flex justify-between text-base font-bold text-stone-100">
                <span>Total Amount</span>
                <span className="text-honey-400 text-lg">{formatCurrency(finalTotalPaise)}</span>
              </div>
            </div>

            {/* Submit / Pay Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-honey-500 to-amber-600 hover:from-honey-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-honey-950 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Verifying & Confirming...'
                  : `Confirm & Pay ${formatCurrency(finalTotalPaise)}`}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Completed Order Receipt Modal */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => {
            setCompletedOrder(null);
            navigate('/my-orders');
          }}
        />
      )}
    </div>
  );
};
