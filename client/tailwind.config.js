/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#FAF8F5',
          card: '#FFFFFF',
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#FFE66D',
          dark: '#2D3436',
          muted: '#636E72',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        comic: ['Comic Sans MS', 'Chalkboard SE', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
