/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#070605',
          900: '#0F0D0B',
          850: '#15120E',
          800: '#1C1813',
          700: '#28231C',
          600: '#3D362C',
        },
        honey: {
          50: '#FFFDF5',
          100: '#FEF9E7',
          200: '#FDEEC4',
          300: '#FCDF96',
          400: '#FBC658',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        citrus: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        botanical: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glass-glow': '0 0 25px -5px rgba(245, 158, 11, 0.15)',
        'amber-glow': '0 0 35px -5px rgba(217, 119, 6, 0.25)',
        'spatial-card': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 2px 1px rgba(245, 158, 11, 0.1)',
      }
    },
  },
  plugins: [],
}
