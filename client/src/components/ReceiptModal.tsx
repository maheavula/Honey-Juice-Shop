import React from 'react';
import { X, CheckCircle2, Clock, Truck, Package, XCircle, MapPin, Receipt, ShieldCheck } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return 1;
      case 'dispatched':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="max-w-xl w-full rounded-2xl bg-obsidian-900 border border-honey-500/25 p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-stone-800">
          <div className="p-3 rounded-2xl bg-honey-500/10 text-honey-400 border border-honey-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-xl text-stone-100">
                Artisanal Order Receipt
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-obsidian-950 border border-honey-500/30 text-honey-300">
                {order.id}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Fulfillment Timeline */}
        <div className="mb-6 p-4 rounded-xl bg-obsidian-950/80 border border-stone-800/80">
          <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-4">
            Fulfillment Lifecycle
          </div>

          {isCancelled ? (
            <div className="flex items-center gap-2.5 text-rose-400 text-sm font-medium p-3 rounded-lg bg-rose-950/30 border border-rose-800/50">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>This order was cancelled and refunded.</span>
            </div>
          ) : (
            <div className="relative flex items-center justify-between">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-stone-800 -z-0">
                <div
                  className="h-full bg-honey-500 transition-all duration-500"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
                  }}
                />
              </div>

              {/* Step 1: Processing */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= 1
                      ? 'bg-honey-500 border-honey-400 text-stone-950'
                      : 'bg-obsidian-900 border-stone-700 text-stone-500'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-stone-300">Cold Blending</span>
              </div>

              {/* Step 2: Dispatched */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= 2
                      ? 'bg-honey-500 border-honey-400 text-stone-950'
                      : 'bg-obsidian-900 border-stone-700 text-stone-500'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-stone-300">Cold-Chain Enroute</span>
              </div>

              {/* Step 3: Delivered */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= 3
                      ? 'bg-botanical-500 border-botanical-400 text-stone-950'
                      : 'bg-obsidian-900 border-stone-700 text-stone-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-stone-300">Delivered</span>
              </div>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
            Bottles & Items
          </div>
          <div className="divide-y divide-stone-800/80 rounded-xl bg-obsidian-950 border border-stone-800 p-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-stone-200">{item.name}</div>
                  <div className="text-xs text-stone-400">
                    {item.quantity} × {formatCurrency(item.price)}
                  </div>
                </div>
                <div className="font-semibold text-honey-400">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
          <div className="p-3.5 rounded-xl bg-obsidian-950 border border-stone-800">
            <div className="text-stone-400 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-honey-400" />
              <span className="font-semibold text-stone-300">Delivery Destination</span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              {order.deliveryAddress.street}<br />
              {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-obsidian-950 border border-stone-800 flex flex-col justify-between">
            <div>
              <div className="text-stone-400 font-semibold mb-1">Payment Method</div>
              <div className="text-stone-200 font-medium">{order.paymentMethod}</div>
            </div>
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-sm font-bold">
              <span className="text-stone-400">Total Paid:</span>
              <span className="text-honey-400 text-base">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-800 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-stone-400">
            <ShieldCheck className="w-4 h-4 text-honey-400" />
            <span>Artisanal Quality Guaranteed</span>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-stone-700 text-stone-200 transition-colors"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
