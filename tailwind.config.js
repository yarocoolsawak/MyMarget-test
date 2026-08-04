/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4e54a3',
          'primary-hover': '#42478b',
          'primary-subtle': '#edeef6',
          secondary: '#27aae1',
          'secondary-hover': '#2191bf',
          'secondary-subtle': '#e9f7fc',
          ai: '#6876fe',
          'ai-subtle': '#e8e6ff',
          pinmall: '#7967f7',
        },
        text: {
          title: '#232649',
          body: '#475569',
          caption: '#8c8c8c',
          disabled: '#bfbfbf',
        },
        status: {
          success: '#7cd885',
          'success-bg': '#edfaed',
          'success-text': '#43c23f',
          warning: '#ffd439',
          'warning-bg': '#fff4ec',
          'warning-text': '#ff9040',
          error: '#ff574f',
          'error-bg': '#feeeed',
          'error-text': '#f35048',
        },
        ai: {
          ticket: '#43aeff',
          'order-hybrid': '#fe7e2f',
          revenue: '#36ce4f',
          cost: '#ffc933',
        }
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'button': '0px 4px 4px 0px rgba(0, 0, 0, 0.10)',
        'button-hover': '2px 2px 4px 0px rgba(78, 84, 163, 0.30)',
        'focus-hover': '0px 0px 4px 0px rgba(42, 171, 225, 0.30)',
        'card': '2px 2px 8px 0px rgba(67, 80, 255, 0.12)',
        'card-hover': '2px 2px 12px 0px rgba(67, 80, 255, 0.24)',
        'dropdown': '0px 4px 8px 0px rgba(0, 0, 0, 0.14)',
        'modal': '0px 8px 16px 0px rgba(0, 0, 0, 0.16)',
      },
      backgroundImage: {
        'gradient-my-ai': 'linear-gradient(41deg, #6876fe 0%, #43c0ff 100%)',
      }
    },
    fontFamily: {
      sans: ['Sarabun', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
    }
  },
  plugins: [],
}
