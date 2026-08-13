/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0D',
        surface: '#161618',
        'surface-alt': '#1E1E21',
        border: '#2A2A2E',
        'text-primary': '#F5F5F0',
        'text-secondary': '#A3A3AA',
        'text-muted': '#6B6B72',
        primary: '#8B5CF6',
        'primary-pressed': '#7C3AED',
        secondary: '#B4F42A',
        danger: '#F5484B',

        // light mode counterparts, prefix usage: className="bg-bg-light dark:bg-bg"
        'bg-light': '#FAFAF8',
        'surface-light': '#FFFFFF',
        'surface-alt-light': '#F0F0EE',
        'border-light': '#E4E4E2',
        'text-primary-light': '#121214',
        'text-secondary-light': '#5B5B62',
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
    },
  },
  plugins: [],
};