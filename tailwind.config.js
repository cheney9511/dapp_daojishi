/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00D4FF',
        'neon-green': '#00FF88',
        'neon-purple': '#8B5CF6',
        'dark-bg': '#0A0E27',
        'card-bg': '#1A1F3A',
      },
      animation: {
        'glow': 'glow 2.5s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'spin-reverse': 'spin-reverse 15s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 8px rgba(0, 212, 255, 0.6), 0 0 15px rgba(0, 212, 255, 0.4), 0 0 25px rgba(0, 212, 255, 0.2)' },
          '100%': { 'box-shadow': '0 0 20px rgba(0, 212, 255, 0.9), 0 0 35px rgba(0, 212, 255, 0.6), 0 0 50px rgba(0, 212, 255, 0.3)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(0, 243, 255, 0.5))' },
          '50%': { opacity: '0.8', filter: 'brightness(1)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
