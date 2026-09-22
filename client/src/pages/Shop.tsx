import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, SlidersHorizontal, RefreshCw, Leaf } from 'lucide-react';
import { juicesApi, systemApi } from '../services/api';
import { Juice } from '../types';
import { SpatialCard } from '../components/SpatialCard';

export const Shop: React.FC = () => {
  const [juices, setJuices] = useState<Juice[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [onlyOrganic, setOnlyOrganic] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await juicesApi.getJuices({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        sortBy,
        isOrganic: onlyOrganic ? true : undefined
      });

      if (res.success && res.juices) {
        setJuices(res.juices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch system info for categories list
    systemApi.getInfo().then((res) => {
      if (res.supportedCategories) {
        setCategories(['All', ...res.supportedCategories]);
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy, onlyOrganic]);

  return (
    <div className="space-y-10">
      {/* Artisanal Hero Showcase */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border border-honey-500/20 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-honey-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-citrus-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-honey-500/15 text-honey-400 border border-honey-500/30 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artisanal Small-Batch Cleanses & Tonics</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-stone-100 leading-tight mb-4">
            Pure Cold-Pressed Flavors Infused with <span className="gold-gradient-text">Raw Forest Honey</span>.
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
            Zero heat, zero pasteurization, zero added sugar. Every recipe is blended fresh with hand-picked seasonal fruits and pure unprocessed honey harvested sustainably.
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-1.5 text-stone-300">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>100% Certified Organic</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-honey-400" />
              <span>350ml Glass Bottles</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-citrus-400" />
              <span>Cold-Chain Express Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Live Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by fruit (mango, ginger, apple...)"
              className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500"
            />
          </div>

          {/* Sort & Organic toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-900 border border-stone-800 text-xs font-medium cursor-pointer hover:border-honey-500/30 transition-colors">
              <input
                type="checkbox"
                checked={onlyOrganic}
                onChange={(e) => setOnlyOrganic(e.target.checked)}
                className="rounded accent-honey-500"
              />
              <span className={onlyOrganic ? 'text-emerald-400 font-semibold' : 'text-stone-300'}>
                Organic Only
              </span>
            </label>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-stone-800 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-honey-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-stone-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-obsidian-900 text-stone-200">Newest Arrivals</option>
                <option value="price_asc" className="bg-obsidian-900 text-stone-200">Price: Low to High</option>
                <option value="price_desc" className="bg-obsidian-900 text-stone-200">Price: High to Low</option>
                <option value="rating" className="bg-obsidian-900 text-stone-200">Highest Rated</option>
                <option value="name" className="bg-obsidian-900 text-stone-200">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-honey-500 to-amber-600 text-stone-950 shadow-md shadow-honey-950 font-bold'
                  : 'bg-obsidian-900 text-stone-400 border border-stone-800 hover:text-stone-100 hover:border-honey-500/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Juices Grid */}
      <section>
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-honey-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-xs text-stone-400">Harvesting fresh catalog recipes...</p>
          </div>
        ) : juices.length === 0 ? (
          <div className="text-center py-20 bg-obsidian-900/50 rounded-3xl border border-stone-800/80 p-8">
            <p className="font-display text-xl text-stone-300 mb-2">No juices match your search</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
              Try adjusting your fruit search query or category filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setOnlyOrganic(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-honey-500 text-stone-950 font-semibold text-xs hover:bg-honey-400 transition-colors shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {juices.map((juice) => (
              <SpatialCard key={juice.id} juice={juice} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
