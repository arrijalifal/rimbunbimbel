import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'green-dark': '#1a4731',
        'green-mid': '#2d6a4f',
        'green-sage': '#74a892',
        'green-light': '#b7e4c7',
        'green-pale': '#edf7f0',
      },
    },
  },
  plugins: [],
};

export default config;