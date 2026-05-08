import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6b9d',
          dark: '#e55a8a',
          light: '#ff9ff3',
        },
        love: {
          bg: '#fff5f7',
          'bg-alt': '#fff0f3',
          border: '#ffd6e0',
        },
      },
      borderRadius: {
        card: '12px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
