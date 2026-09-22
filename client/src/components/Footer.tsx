import React from 'react';
import { Sparkles, Leaf, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-honey-500/15 bg-obsidian-950 text-stone-400">
      {/* Artisanal Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-stone-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-honey-500/10 text-honey-400 border border-honey-500/20 flex-shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-stone-200 mb-1">100% Raw Forest Honey</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Unpasteurized, unprocessed multifloral and acacia honey harvested sustainably from pristine Himalayan & Western Ghat forests.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-citrus-500/10 text-citrus-400 border border-citrus-500/20 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-stone-200 mb-1">Zero-Heat Cold Pressed</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Hydraulic press technology extracts living enzymes, antioxidants, and pure raw taste with zero added water or sugar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-botanical-500/10 text-botanical-400 border border-botanical-500/20 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-stone-200 mb-1">Cold-Chain Express</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Bottled in UV-protective dark amber glass and dispatched in insulated chill packs to preserve freshness at 4°C.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-stone-300">Honey Juice Shop</span>
          <span>•</span>
          <span>© 2026 Artisanal Boutique D2C</span>
        </div>
      </div>
    </footer>
  );
};
