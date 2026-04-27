import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        appbg: '#f4f4f4',
        headerbg: '#e8e8e8',
        btnbg: '#f9f9f9',
        btnhover: '#e2e2e2',
        bordercol: '#cccccc',
        vphead: '#e0e0e0',
        vpbg: '#ffffff',
        brand: '#333333',
        modalbg: '#ffffff',
        modalinput: '#ffffff',
        modalactive: '#e6e6e6',
        modaldivider: '#dddddd',
        modalborder: '#cccccc',
        modalring: '#333333',
        mutedsize: '#666666',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
