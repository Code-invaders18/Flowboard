/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#4f46e5', hover: '#4338ca', soft: '#eef2ff', muted: '#e0e7ff' },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          sunken: '#f1f5f9',
          sidebar: '#f1f5f9',
          overlay: 'rgb(15 23 42 / 0.4)',
        },
        border: { DEFAULT: '#e2e8f0', strong: '#cbd5e1' },
        text: { DEFAULT: '#0f172a', muted: '#64748b', inverse: '#ffffff' },
        danger: { DEFAULT: '#dc2626', hover: '#b91c1c', soft: '#fef2f2', muted: '#fee2e2' },
        success: { DEFAULT: '#16a34a', soft: '#f0fdf4', muted: '#dcfce7' },
        priority: {
          'urgent-bg': '#fee2e2',
          'urgent-text': '#b91c1c',
          'high-bg': '#ffedd5',
          'high-text': '#c2410c',
          'normal-bg': '#dbeafe',
          'normal-text': '#1d4ed8',
          'low-bg': '#e2e8f0',
          'low-text': '#475569',
          'none-bg': '#f1f5f9',
          'none-text': '#94a3b8',
        },
        status: {
          'todo-bg': '#e2e8f0',
          'todo-text': '#334155',
          'in_progress-bg': '#dbeafe',
          'in_progress-text': '#1e40af',
          'review-bg': '#ede9fe',
          'review-text': '#5b21b6',
          'done-bg': '#dcfce7',
          'done-text': '#166534',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '0.5rem',
        control: '0.375rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.08), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        drawer: '-8px 0 24px -4px rgb(15 23 42 / 0.18)',
      },
    },
  },
  plugins: [],
};
