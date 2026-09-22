import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { ordersApi } from '../services/api';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ReceiptModal } from '../components/ReceiptModal';
import { useAuth } from '../context/AuthContext';

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getMyOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-honey-500/15 text-honey-400 border border-honey-500/30">
            <Clock className="w-3.5 h-3.5" />
            Cold Blending
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-citrus-500/15 text-citrus-400 border border-citrus-500/30">
            <Truck className="w-3.5 h-3.5" />
            Dispatched (Cold-Chain)
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-botanical-500/15 text-botanical-300 border border-botanical-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-honey-400">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-3xl bg-obsidian-900 border border-honey-500/20">
        <Package className="w-10 h-10 text-honey-400 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-stone-100 mb-2">
          Track Your Artisanal Deliveries
        </h2>
        <p className="text-xs text-stone-400 mb-6 leading-relaxed">
          Sign in to access your complete purchase history, delivery receipts, and batch freshness timelines.
        </p>
        <Link
          to="/login"
          className="inline-block w-full py-3 rounded-xl bg-honey-500 text-stone-950 font-bold text-sm hover:bg-honey-400 transition-colors shadow-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
            My Order History
          </h1>
          <p className="text-xs text-stone-400">
            View delivery status and full receipts
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 text-stone-400 hover:text-honey-400 rounded-xl bg-obsidian-900 border border-stone-800 transition-colors"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-obsidian-900/50 rounded-3xl border border-stone-800 p-8">
          <Package className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold text-stone-200 mb-1">
            No orders placed yet
          </h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto mb-6">
            Explore our cold-pressed wellness elixirs and honey infusions.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-honey-500 text-stone-950 font-bold text-xs hover:bg-honey-400 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-2xl bg-obsidian-900 border border-stone-800/80 hover:border-honey-500/30 transition-all duration-200 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800/80">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-honey-400 bg-honey-500/10 px-2.5 py-1 rounded-lg border border-honey-500/20">
                    {order.id}
                  </span>
                  <span className="text-xs text-stone-400">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Items summary */}
              <div className="divide-y divide-stone-800/60">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="text-stone-400">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400">Total Paid: </span>
                  <span className="font-bold text-sm text-honey-400">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-obsidian-950 text-xs font-semibold text-honey-300 border border-honey-500/20 hover:bg-honey-500/15 hover:border-honey-500/40 transition-colors"
                >
                  <span>View Receipt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
