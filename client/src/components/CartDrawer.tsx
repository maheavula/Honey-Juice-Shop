import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeFromCart, totalPaise, totalItems } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckoutClick = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const freeDeliveryThresholdPaise = 50000; // ₹500
  const progressPercent = Math.min(100, (totalPaise / freeDeliveryThresholdPaise) * 100);
  const remainingForFreeDelivery = freeDeliveryThresholdPaise - totalPaise;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-out drawer panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-obsidian-900 border-l border-honey-500/20 shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-honey-500/10 text-honey-400 border border-honey-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-stone-100">
                Artisanal Cart
              </h2>
              <p className="text-xs text-stone-400">
                {totalItems} {totalItems === 1 ? 'bottle' : 'bottles'} selected
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress */}
        <div className="px-5 py-3 bg-obsidian-950/60 border-b border-stone-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            {remainingForFreeDelivery > 0 ? (
              <span className="text-stone-300">
                Add <span className="font-semibold text-honey-400">{formatCurrency(remainingForFreeDelivery)}</span> for Free Cold-Chain Delivery
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                🎉 You unlocked Free Express Delivery!
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-honey-500 to-citrus-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-16 h-16 rounded-full bg-obsidian-800 flex items-center justify-center text-stone-600 mb-4 border border-stone-700">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-display text-lg font-medium text-stone-200 mb-1">Your cart is empty</h3>
              <p className="text-xs text-stone-400 max-w-xs mb-6">
                Explore our cold-pressed juices and wild forest honey infusions.
              </p>
              <button
                onClick={closeDrawer}
                className="px-5 py-2.5 rounded-xl bg-honey-500 text-stone-950 font-semibold text-sm hover:bg-honey-400 transition-colors shadow-lg shadow-honey-950"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            items.map(({ juice, quantity }) => (
              <div
                key={juice.id}
                className="flex gap-3.5 p-3.5 rounded-xl bg-obsidian-850 border border-stone-800/80 backdrop-blur-md"
              >
                {/* Thumb */}
                <img
                  src={juice.imageUrl}
                  alt={juice.name}
                  className="w-16 h-16 rounded-lg object-cover bg-stone-950 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80';
                  }}
                />

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-medium text-sm text-stone-200 line-clamp-1">
                        {juice.name}
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        {juice.volumeMl}ml • {formatCurrency(juice.price)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(juice.id)}
                      className="text-stone-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Line Total */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 bg-obsidian-950 rounded-lg p-1 border border-stone-800">
                      <button
                        onClick={() => updateQuantity(juice.id, quantity - 1)}
                        className="p-1 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-2 min-w-[20px] text-center text-stone-200">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(juice.id, quantity + 1)}
                        disabled={quantity >= juice.stock}
                        className={`p-1 rounded transition-colors ${
                          quantity >= juice.stock
                            ? 'text-stone-600 cursor-not-allowed'
                            : 'text-stone-400 hover:text-white hover:bg-stone-800'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-semibold text-sm text-honey-400">
                      {formatCurrency(juice.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 bg-obsidian-950 border-t border-stone-800/80 space-y-4">
            <div className="space-y-1.5 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span className="text-stone-200">{formatCurrency(totalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Artisanal Eco-Glass Bottle Deposit</span>
                <span className="text-emerald-400">Free (₹0.00)</span>
              </div>
              <div className="flex justify-between">
                <span>Cold-Chain Shipping</span>
                <span>
                  {remainingForFreeDelivery <= 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    formatCurrency(4900)
                  )}
                </span>
              </div>
              <div className="border-t border-stone-800 pt-2 flex justify-between text-base font-bold text-stone-100">
                <span>Total Amount</span>
                <span className="text-honey-400">
                  {formatCurrency(
                    totalPaise + (remainingForFreeDelivery <= 0 ? 0 : 4900)
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-honey-500 to-citrus-500 hover:from-honey-400 hover:to-citrus-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-honey-950/60 transition-all duration-200 active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-honey-500" />
              <span>100% Cold-Pressed • No Preservatives • Raw Honey</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
