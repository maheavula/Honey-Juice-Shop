import React, { useEffect, useState } from 'react';
import { X, Server, Database, Clock, RefreshCw, Cpu } from 'lucide-react';
import { systemApi } from '../services/api';
import { SystemHealth, SystemInfo } from '../types';

export const SystemHealthWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [hRes, iRes] = await Promise.all([systemApi.getHealth(), systemApi.getInfo()]);
      if (hRes.status) setHealth(hRes as any);
      if (iRes.store) setInfo(iRes as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="max-w-lg w-full rounded-2xl bg-obsidian-900 border border-honey-500/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-honey-500/15 text-honey-400 border border-honey-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-stone-100">
              Runtime & Persistence Diagnostics
            </h3>
            <p className="text-xs text-stone-400">
              Realtime status of single-file atomic persistence engine
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-honey-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-xs text-stone-300">Querying /api/system endpoints...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-stone-800">
                <div className="text-stone-400 flex items-center gap-1.5 mb-1">
                  <Database className="w-3.5 h-3.5 text-honey-400" />
                  <span>State Engine</span>
                </div>
                <div className="text-stone-200 font-semibold truncate">data/runtime.json</div>
                <div className="text-[11px] text-emerald-400 mt-1">✓ Atomic Swap Active</div>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-stone-800">
                <div className="text-stone-400 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-honey-400" />
                  <span>Server Uptime</span>
                </div>
                <div className="text-stone-200 font-semibold">{health?.uptime || '—'}</div>
                <div className="text-[11px] text-stone-400 mt-1">Node.js Express v22</div>
              </div>
            </div>

            {/* Storage Metric Breakdown */}
            <div className="p-4 rounded-xl bg-obsidian-950 border border-honey-500/20 space-y-2">
              <div className="text-xs font-semibold text-honey-300 uppercase tracking-wider mb-2">
                Persistent Entities in Memory & JSON
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-obsidian-900 border border-stone-800">
                  <div className="text-stone-400 text-[11px]">Juice SKUs</div>
                  <div className="text-base font-bold text-honey-400">
                    {health?.storage?.juiceCount ?? 0}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-obsidian-900 border border-stone-800">
                  <div className="text-stone-400 text-[11px]">Accounts</div>
                  <div className="text-base font-bold text-amber-400">
                    {health?.storage?.userCount ?? 0}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-obsidian-900 border border-stone-800">
                  <div className="text-stone-400 text-[11px]">Orders</div>
                  <div className="text-base font-bold text-citrus-400">
                    {health?.storage?.orderCount ?? 0}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-obsidian-900 border border-stone-800">
                  <div className="text-stone-400 text-[11px]">Sessions</div>
                  <div className="text-base font-bold text-botanical-400">
                    {health?.storage?.activeSessions ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-800 pt-3">
              <span>Currency: {info?.currency} ({info?.currencySymbol})</span>
              <span>Mode: {info?.operatingMode}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
