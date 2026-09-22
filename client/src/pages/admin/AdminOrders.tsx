import React, { useEffect, useState } from 'react';
import { PackageCheck, Clock, Truck, CheckCircle2, XCircle, Sparkles, RefreshCw, Search, Eye } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ReceiptModal } from '../../components/ReceiptModal';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders();
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
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await adminApi.updateOrderStatus(orderId, newStatus);
      if (res.success && res.order) {
        showToast(`Order ${orderId} moved to "${newStatus}"`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        showToast(res.error || 'Failed to update status', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(search.toLowerCase())) ||
      o.deliveryAddress.city.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
            Fulfillment & Order Pipeline
          </h1>
          <p className="text-xs text-stone-400">
            Manage cold-chain dispatch, tracking stages, and customer receipts
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-900 border border-stone-800 text-xs font-semibold text-stone-300 hover:text-honey-400 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Buyer, or City..."
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['all', 'processing', 'dispatched', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? 'bg-honey-500 text-stone-950 font-bold'
                  : 'bg-obsidian-900 text-stone-400 border border-stone-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-honey-400">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-obsidian-900/50 rounded-2xl border border-stone-800 p-8 text-xs text-stone-400">
          No orders match the current criteria.
        </div>
      ) : (
        <div className="rounded-2xl bg-obsidian-900 border border-stone-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-obsidian-950/80 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-obsidian-850/60 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-honey-400 text-sm">
                        {order.id}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-stone-200">
                        {order.customerName || 'Customer'}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {order.deliveryAddress.city}, {order.deliveryAddress.state}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5 max-w-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-stone-300 text-[11px] truncate">
                            {item.quantity} × {item.name}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 font-bold text-honey-400 text-sm">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        disabled={updatingId === order.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none border transition-colors cursor-pointer ${
                          order.status === 'processing'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : order.status === 'dispatched'
                            ? 'bg-citrus-500/15 text-citrus-300 border-citrus-500/30'
                            : order.status === 'delivered'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        <option value="processing" className="bg-obsidian-900 text-stone-200">Processing</option>
                        <option value="dispatched" className="bg-obsidian-900 text-stone-200">Dispatched</option>
                        <option value="delivered" className="bg-obsidian-900 text-stone-200">Delivered</option>
                        <option value="cancelled" className="bg-obsidian-900 text-stone-200">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="p-2 rounded-lg bg-obsidian-950 border border-stone-800 text-stone-300 hover:text-honey-400 hover:border-honey-500/40 transition-colors"
                        title="View Full Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
};
