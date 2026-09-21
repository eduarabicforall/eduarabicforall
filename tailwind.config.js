/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#FFFFFF',
          ink: '#14161C',
          inkSoft: '#5B6472',
          inkFaint: '#8B93A3',
        },
        app: {
          bg: 'var(--app-bg)',
          outer: 'var(--app-outer)',
          ink: 'var(--app-ink)',
          inkSoft: 'var(--app-ink-soft)',
          inkFaint: 'var(--app-ink-faint)',
          border: 'var(--app-border)',
          panel: 'var(--app-panel)',
          panel2: 'var(--app-panel2)',
          surface: 'var(--app-surface)',
        },
        primary: {
          DEFAULT: '#3D7DD8',
          soft: '#2A5A96',
        },
        gold: '#C69443',
        violet: '#B9A7F0',
        danger: '#f06868',
      },
      fontFamily: {
        // Poppins for all Latin text; Amiri is listed as a fallback so any
        // Arabic outside an explicit font-amiri element still renders in it.
        poppins: ['Poppins', 'Amiri', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
      },
      borderRadius: {
        pill: '100px',
      },
    },
  },
  plugins: [],
}
