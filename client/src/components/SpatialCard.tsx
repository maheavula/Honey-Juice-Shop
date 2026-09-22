import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Sparkles, AlertCircle } from 'lucide-react';
import { Juice } from '../types';
import { FruitBadge } from './FruitBadge';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface SpatialCardProps {
  juice: Juice;
}

export const SpatialCard: React.FC<SpatialCardProps> = ({ juice }) => {
  const { addToCart } = useCart();
  const isOutOfStock = juice.stock <= 0;
  const isLowStock = juice.stock > 0 && juice.stock <= 10;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-obsidian-900/80 border border-honey-500/15 backdrop-blur-xl overflow-hidden shadow-spatial-card transition-all duration-300 hover:border-honey-500/40 hover:-translate-y-1.5 hover:shadow-amber-glow">
      {/* Image Container */}
      <Link to={`/juice/${juice.id}`} className="relative block aspect-[4/3] overflow-hidden bg-obsidian-950">
        <img
          src={juice.imageUrl}
          alt={juice.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Fallback image if external URL fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-obsidian-900/90 text-honey-400 border border-honey-500/30 backdrop-blur-md">
            {juice.category}
          </span>
          {juice.isOrganic && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-botanical-500/20 text-botanical-300 border border-botanical-500/40 backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              100% Organic
            </span>
          )}
        </div>

        {/* Volume tag */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-black/60 text-stone-300 border border-white/10 backdrop-blur-md">
            {juice.volumeMl} ml
          </span>
        </div>
      </Link>

      {/* Content Details */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/juice/${juice.id}`} className="hover:text-honey-400 transition-colors">
            <h3 className="font-display font-semibold text-lg text-stone-100 line-clamp-1">
              {juice.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-honey-400 text-xs font-semibold flex-shrink-0 bg-honey-500/10 px-2 py-0.5 rounded-full border border-honey-500/20">
            <Star className="w-3.5 h-3.5 fill-honey-400 text-honey-400" />
            <span>{juice.averageRating ? juice.averageRating.toFixed(1) : 'New'}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-stone-400 text-xs line-clamp-2 mb-3">
          {juice.description}
        </p>

        {/* Fruits / Ingredients Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {juice.fruits.map((fruit, idx) => (
            <FruitBadge key={idx} name={fruit} />
          ))}
        </div>

        {/* Footer info: Stock + Price + Add to Cart */}
        <div className="mt-auto pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-honey-400">
              {formatCurrency(juice.price)}
            </div>
            <div className="text-[11px] font-medium flex items-center gap-1">
              {isOutOfStock ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Out of stock
                </span>
              ) : isLowStock ? (
                <span className="text-citrus-400">Only {juice.stock} bottles left</span>
              ) : (
                <span className="text-emerald-400">In stock ({juice.stock})</span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(juice, 1)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
              isOutOfStock
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700/50'
                : 'bg-gradient-to-r from-honey-500 to-amber-600 text-stone-950 font-bold hover:from-honey-400 hover:to-amber-500 shadow-md shadow-honey-900/30 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
