import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, ShieldCheck, RefreshCw, Sparkles, UserX, UserCheck, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { User, UserStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers();
      if (res.success && res.customers) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer: User) => {
    const nextStatus: UserStatus = customer.status === 'active' ? 'suspended' : 'active';
    setUpdatingId(customer.id);
    try {
      const res = await adminApi.updateCustomerStatus(customer.id, nextStatus);
      if (res.success && res.customer) {
        showToast(
          res.message || `Customer account has been ${nextStatus}.`,
          nextStatus === 'suspended' ? 'warning' : 'success',
          'Account Status Updated'
        );
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? { ...c, status: nextStatus } : c))
        );
      } else {
        showToast(res.error || 'Failed to update customer status', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
            Customer Directory & Access Control
          </h1>
          <p className="text-xs text-stone-400">
            Manage buyer registrations and enforce real-time account suspensions
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="self-start flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-900 border border-stone-800 text-xs font-semibold text-stone-300 hover:text-honey-400 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Security Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-obsidian-900/90 border border-honey-500/20 text-xs text-stone-300">
        <AlertTriangle className="w-5 h-5 text-honey-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-honey-300">
            Security Enforcement Rule:
          </span>
          <p className="text-stone-400 leading-relaxed">
            When a customer account is suspended, the backend immediately purges and invalidates all issued session identifiers from <code className="text-honey-400 bg-obsidian-950 px-1 py-0.5 rounded">runtime.json</code>, preventing further unauthorized API operations.
          </p>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-honey-400">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 bg-obsidian-900/50 rounded-2xl border border-stone-800 p-8 text-xs text-stone-400">
          No registered customer accounts found.
        </div>
      ) : (
        <div className="rounded-2xl bg-obsidian-900 border border-stone-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-obsidian-950/80 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Delivery Address</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-obsidian-850/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-honey-500/15 text-honey-300 font-bold text-xs flex items-center justify-center border border-honey-500/20">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-200 text-sm">{c.name}</div>
                          <div className="text-[11px] font-mono text-stone-500">{c.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-stone-300 font-medium">{c.email}</div>
                      <div className="text-[11px] text-stone-500">{c.phone || 'No phone provided'}</div>
                    </td>

                    <td className="p-4 text-stone-400 max-w-xs">
                      {c.address ? (
                        <div>
                          {c.address.street && <div>{c.address.street}</div>}
                          <div className="text-[11px] text-stone-500">
                            {c.address.city}, {c.address.state} {c.address.postalCode}
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-600 italic">No saved address</span>
                      )}
                    </td>

                    <td className="p-4 text-stone-400">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${
                          c.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {c.status === 'active' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Suspended</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        disabled={updatingId === c.id}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                          c.status === 'active'
                            ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60'
                            : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                        }`}
                      >
                        {c.status === 'active' ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
