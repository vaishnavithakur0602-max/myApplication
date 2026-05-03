/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B1F3A', mid: '#0D2438' },
        green: {
          primary: '#2D6A4F',
          light: '#A8D5BA',
          mint: '#C8E6D4',
          bg: '#DCFCE7',
        },
        offwhite: '#F7F9F8',
        surface: '#F3F4F1',
        border: '#E2E4DF',
        amber: { border: '#92400E', bg: '#FEF3C7' },
        red: { border: '#991B1B', bg: '#FEE2E2' },
        blue: { bg: '#EFF6FF', text: '#1E3A5F' },
        gold: '#C9A84C',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        dm: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
