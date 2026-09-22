import React from 'react';

interface HoneyBottleLogoProps {
  className?: string;
  size?: number;
}

export const HoneyBottleLogo: React.FC<HoneyBottleLogoProps> = ({ className = "w-6 h-6", size }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Bottle Cap / Cork */}
      <rect x="24" y="4" width="16" height="7" rx="2.5" fill="#D97706" stroke="#F59E0B" strokeWidth="1.5" />
      <rect x="26" y="2" width="12" height="3" rx="1.5" fill="#FBBF24" />
      
      {/* Bottle Neck */}
      <path d="M25 11H39V18C39 20 42 22 45 25L48 28C51 31 52 35 52 39V52C52 56.4183 48.4183 60 44 60H20C15.5817 60 12 56.4183 12 52V39C12 35 13 31 16 28L19 25C22 22 25 20 25 18V11Z" fill="#1A1510" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Golden Honey Liquid */}
      <path d="M14 42C14 37 16 33 18 30L21 27C23 25 25 23 26 23C28 26 31 27 34 25C37 23 40 26 43 25C44 26 46 28 47 30L49 33C50 36 50 39 50 42V52C50 55.3137 47.3137 58 44 58H20C16.6863 58 14 55.3137 14 52V42Z" fill="url(#honeyGradient)" />
      
      {/* Honeycomb Crest / Drop Symbol on Bottle */}
      <path d="M32 34L37 37V43L32 46L27 43V37L32 34Z" fill="#78350F" stroke="#FEF3C7" strokeWidth="1.2" />
      <path d="M32 36.5C32 36.5 30 39 30 40.5C30 41.6 30.9 42.5 32 42.5C33.1 42.5 34 41.6 34 40.5C34 39 32 36.5 32 36.5Z" fill="#FBBF24" />

      {/* Glass Bottle Highlights & Reflections */}
      <path d="M17 32C15.5 35 15 40 15 45V51" stroke="#FEF9E7" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M21 16V13" stroke="#FEF9E7" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="honeyGradient" x1="32" y1="23" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
    </svg>
  );
};
