/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          from: '#1e3a8a', // Deep Navy / Royal Blue
          to: '#0f172a',   // Dark Slate Blue
          active: '#2563eb', // Bright Royal Blue
          card: '#1e40af',  // Card Blue
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          soft: '#eff6ff',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        bg: '#F8FAFC',
        border: '#E2E8F0',
        kpi: {
          room: '#eff6ff',
          tenant: '#f0fdf4',
          finance: '#fefce8',
          maintenance: '#fff1f2',
        },
        accent: {
          green: '#10B981',
          blue: '#2563eb',
          amber: '#D97706',
          pink: '#DB2777',
        },
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Prompt', 'IBM Plex Sans Thai', 'Noto Sans Thai', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],
        handwriting: ['Mali', 'Itim', 'cursive'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'sub': '10px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05)',
        'hover': '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
