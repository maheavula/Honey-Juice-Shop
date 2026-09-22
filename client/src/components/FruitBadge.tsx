import React from 'react';

interface FruitBadgeProps {
  name: string;
}

export const FruitBadge: React.FC<FruitBadgeProps> = ({ name }) => {
  const getFruitColor = (fruitName: string) => {
    const lower = fruitName.toLowerCase();
    if (lower.includes('mango') || lower.includes('pineapple') || lower.includes('turmeric')) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
    if (lower.includes('honey') || lower.includes('acacia')) {
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    }
    if (lower.includes('orange') || lower.includes('grapefruit') || lower.includes('citrus')) {
      return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    }
    if (lower.includes('spinach') || lower.includes('apple') || lower.includes('celery') || lower.includes('mint')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    if (lower.includes('berry') || lower.includes('strawberry') || lower.includes('pomegranate') || lower.includes('raspberry')) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
    return 'bg-stone-800/80 text-stone-300 border-stone-700/50';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md transition-colors ${getFruitColor(
        name
      )}`}
    >
      {name}
    </span>
  );
};
