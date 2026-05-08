import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        love: {
          bg: 'var(--color-bg)',
          'bg-alt': 'var(--color-bg-alt)',
          border: 'var(--color-border)',
          card: 'var(--color-card)',
          text: 'var(--color-text)',
          'text-light': 'var(--color-text-light)',
          'text-muted': 'var(--color-text-muted)',
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
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease',
        float: 'float 6s ease-in-out infinite',
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
