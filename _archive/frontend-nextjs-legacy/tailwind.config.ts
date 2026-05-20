import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nest-void':    '#030A06',
        'nest-forest':  '#0D2218',
        'nest-green':   '#1E4A2E',
        'nest-pine':    '#2D6B3D',
        'nest-navy':    '#060E1A',
        'nest-gold':    '#C4A048',
        'nest-gold-hi': '#E8C87A',
        'nest-sage':    '#7A9A82',
        'nest-moss':    '#2D4A35',
        'nest-cream':   '#EDE8DC',
      },
      fontFamily: {
        serif:  ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:   ['var(--font-space)', 'system-ui', 'sans-serif'],
        mono:   ['var(--font-mono)', 'monospace'],
        space:  ['var(--font-space)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
