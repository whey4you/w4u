import type { Config } from 'tailwindcss';

const brandBlue = {
  50: '#f0f7ff',
  100: '#e0effe',
  200: '#bae0fd',
  DEFAULT: '#0056d2',
  500: '#0056d2',
  600: '#0047b3',
  700: '#00388f',
};

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          canvas: '#f5f5f7',
          card: '#ffffff',
          dark: '#1d1d1f',
          subhead: '#86868b',
          blue: brandBlue.DEFAULT,
          'blue-hover': brandBlue[600],
          border: 'rgba(0, 0, 0, 0.08)',
        },
        brand: brandBlue,
        blue: {
          500: brandBlue[500],
          600: brandBlue[600],
          700: brandBlue[700],
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
