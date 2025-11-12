/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EEF2FF',
          100: '#EAEFFF',
          300: '#C7C6FF',
          700: '#3730A3',
        },
        accent: {
          DEFAULT: '#F59E0B',
          100: '#FEF3C7',
          700: '#B45309',
        },
        background: '#F9FAFB',
        surface: '#FFFFFF',
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        full: '2rem',
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.02)',
        'soft-md': '0 6px 18px rgba(16,24,40,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
