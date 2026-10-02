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
        velo: {
          navy: '#1b3b6f',
          deep: '#0f2444',
          gold: '#f39c12',
          amber: '#e67e22',
          surface: '#f8fafc',
          card: '#ffffff',
          slate: '#0f172a',
        },
        brand: {
          50: '#f0f5fc',
          100: '#e1ecf8',
          200: '#c3daf1',
          300: '#95bee7',
          400: '#5f9cd9',
          500: '#204682',
          600: '#1b3b6f',
          700: '#152f58',
          800: '#0f2444',
          900: '#0a172c',
          950: '#060e1c',
        },
        navy: {
          800: '#152f58',
          900: '#0f2444',
          950: '#081426',
        },
        accent: {
          purple: '#6366f1',
          amber: '#f39c12',
          gold: '#f39c12',
          orange: '#e67e22',
          rose: '#f43f5e',
          cyan: '#06b6d4',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(243, 156, 18, 0.25)',
      }
    },
  },
  plugins: [],
}
