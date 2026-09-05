/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#070A14',
          ink: '#F3F5FA',
          inkSoft: '#A2AABD',
          inkFaint: '#6B7488',
          primary: '#2FC49F',
          primarySoft: '#1C6D5C',
          gold: '#F0B429',
          violet: '#B9A7F0',
          danger: '#f06868',
          border: 'rgba(255,255,255,.09)',
          panel: 'rgba(255,255,255,.035)',
          panel2: 'rgba(255,255,255,.06)',
        },
        light: {
          bg: '#FFFFFF',
          ink: '#14161C',
          inkSoft: '#5B6472',
          inkFaint: '#8B93A3',
        },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '100px',
      },
    },
  },
  plugins: [],
}
