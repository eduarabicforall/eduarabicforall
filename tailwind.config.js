/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#070A14',
        'bg-2': '#0B1020',
        panel: 'rgba(255,255,255,0.035)',
        'panel-2': 'rgba(255,255,255,0.06)',
        ink: '#F3F5FA',
        'ink-soft': '#A2AABD',
        'ink-faint': '#6B7488',
        primary: '#2FC49F',
        'primary-soft': '#1C6D5C',
        gold: '#F0B429',
        violet: '#B9A7F0',
        'ea-border': 'rgba(255,255,255,0.09)',
        'ea-border-soft': 'rgba(255,255,255,0.055)',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        pjs: ['"Plus Jakarta Sans"', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
      },
      borderRadius: {
        'ea': '20px',
      },
      boxShadow: {
        'ea-card': '0 40px 90px -40px rgba(0,0,0,0.7)',
      },
      animation: {
        'ea-fade': 'eaFade 0.6s ease both',
        'ea-float': 'eaFloat 6s ease-in-out infinite',
        'ea-float-7': 'eaFloat 7s ease-in-out infinite',
      },
      keyframes: {
        eaFade: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'none' },
        },
        eaFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
