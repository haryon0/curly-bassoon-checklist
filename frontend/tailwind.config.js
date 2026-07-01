/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'samara-primary': '#324720',
        'samara-accent': '#D4A648',
        'samara-bg': '#FCFAF5',
        'samara-text': '#1F1B16',
        'samara-text-secondary': '#6B6259',
        'samara-border': '#EDE5D2',
      },
      backgroundColor: {
        DEFAULT: '#FCFAF5',
      },
      textColor: {
        DEFAULT: '#1F1B16',
      },
      borderColor: {
        DEFAULT: '#EDE5D2',
      },
      fontFamily: {
        sans: ['Aptos', 'Inter', 'system-ui', 'sans-serif'],
        'material-symbols': ['Material Symbols Rounded'],
      },
    },
  },
  plugins: [],
};
