/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme Colors
        dark: {
          bg: '#0D0D0D',
          accent: '#557373',
        },
        light: {
          bg: '#DFE5F3',
          accent: '#557373',
        },
        // Additional Neutrals
        white: '#FFFFFF',
        charcoal: '#111111',
        slateDark: '#1A1A1A',
        surfaceLight: '#2A2A2A',
        neutralGrey: '#E2E2E2',
        mutedGrey: '#B6B6B6',
        borderGrey: '#9A9A9A',
        // Semantic Colors
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        info: '#3882F6',
      },
      borderRadius: {
        'xl': '20px',
        'lg': '16px',
        'md': '12px',
        'sm': '8px',
      },
      boxShadow: {
        'dark-soft': '0 10px 30px rgba(0,0,0,0.08)',
        'light-soft': '0 20px 60px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        display: ['Manrope', 'Satoshi', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
