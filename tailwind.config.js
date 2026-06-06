export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blu: {
          // Light mode: vivid blue
          primary: 'var(--blu-primary)',
          dark:    'var(--blu-dark)',
          light:   'var(--blu-light)',
          accent:  '#FFD700',
        },
        brand: { 600: '#16a34a' }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
