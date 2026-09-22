import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Package,
  Wine,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Juice, Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<Juice[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDashboard();
      if (res.success && res.stats) {
        setStats(res.stats);
        setLowStockItems(res.lowStockItems || []);
        setRecentOrders(res.recentOrders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-honey-400">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
            Executive Analytics & Operations
          </h1>
          <p className="text-xs text-stone-400">
            Realtime performance metrics powered by atomic runtime.json
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="self-start flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-900 border border-stone-800 text-xs font-semibold text-stone-300 hover:text-honey-400 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-honey-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-honey-500/15 text-honey-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-honey-400">
            {formatCurrency(stats?.totalRevenuePaise || 0)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Across {stats?.totalOrders || 0} customer orders
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-citrus-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Orders Processed
            </span>
            <div className="p-2 rounded-xl bg-citrus-500/15 text-citrus-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-100">
            {stats?.totalOrders || 0}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {stats?.completedOrdersCount || 0} successfully delivered
          </div>
        </div>

        {/* Active Customers */}
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-botanical-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Active Customers
            </span>
            <div className="p-2 rounded-xl bg-botanical-500/15 text-botanical-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-100">
            {stats?.activeCustomers || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {stats?.suspendedCustomers || 0} accounts suspended
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-amber-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Stock Warnings
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {(stats?.outOfStockCount || 0) + (stats?.lowStockCount || 0)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {stats?.outOfStockCount || 0} out of stock, {stats?.lowStockCount || 0} low
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert Table + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Low Stock Table */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-obsidian-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Wine className="w-4 h-4 text-honey-400" />
              <h3 className="font-display font-semibold text-base text-stone-100">
                Inventory Stock Alerts
              </h3>
            </div>
            <Link
              to="/admin/juices"
              className="text-xs font-semibold text-honey-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              All juice SKUs have healthy inventory levels (&gt; 10 units).
            </div>
          ) : (
            <div className="divide-y divide-stone-800">
              {lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-950"
                    />
                    <div>
                      <div className="font-semibold text-stone-200">{item.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{item.id}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.stock === 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-obsidian-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-citrus-400" />
              <h3 className="font-display font-semibold text-base text-stone-100">
                Recent Order Pipeline
              </h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-honey-400 hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-800">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-200">{order.id}</span>
                      <span className="text-stone-400 font-medium">({order.customerName || 'Customer'})</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-honey-400 mb-0.5">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
