/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        ground: '#000000',
        surface: '#111111',
        raised: '#2a2a2a',
        active: '#222222',
        border: '#1a1a1a',
        rule: '#161616',
        control: '#444444',
        text: '#ffffff',
        muted: '#b4b4b4',
        faint: '#949494',
        accent: '#c6f24e',
        positive: '#c6f24e',
        negative: '#e5484d',
        warning: '#e5a93b',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', '"SFMono-Regular"', '"Cascadia Code"', 'monospace'],
      },
      fontSize: {
        'title': '20px',
        'section': '16px',
        'kpi': '24px',
        'body': '14px',
        'small': '13px',
      },
      borderRadius: {
        card: '20px',
        control: '999px',
      },
      spacing: {
        'pad': '22px',
        'gutter': '29px',
        'gap': '14px',
        'card-pad': '22px',
        'nav-row': '34px',
      },
    },
  },
  plugins: [],
}
