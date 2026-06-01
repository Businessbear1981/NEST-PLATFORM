import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // NEST brand palette
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
        // shadcn semantic tokens — wired to V2 OKLCH CSS variables in globals.css
        background:    'var(--background)',
        foreground:    'var(--foreground)',
        card:          'var(--card)',
        'card-foreground':        'var(--card-foreground)',
        popover:       'var(--popover)',
        'popover-foreground':     'var(--popover-foreground)',
        primary:       'var(--primary)',
        'primary-foreground':     'var(--primary-foreground)',
        secondary:     'var(--secondary)',
        'secondary-foreground':   'var(--secondary-foreground)',
        muted:         'var(--muted)',
        'muted-foreground':       'var(--muted-foreground)',
        accent:        'var(--accent)',
        'accent-foreground':      'var(--accent-foreground)',
        destructive:   'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border:        'var(--border)',
        input:         'var(--input)',
        ring:          'var(--ring)',
        chart: {
          '1': 'var(--chart-1)', '2': 'var(--chart-2)', '3': 'var(--chart-3)',
          '4': 'var(--chart-4)', '5': 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT:                'var(--sidebar)',
          foreground:             'var(--sidebar-foreground)',
          primary:                'var(--sidebar-primary)',
          'primary-foreground':   'var(--sidebar-primary-foreground)',
          accent:                 'var(--sidebar-accent)',
          'accent-foreground':    'var(--sidebar-accent-foreground)',
          border:                 'var(--sidebar-border)',
          ring:                   'var(--sidebar-ring)',
        },
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
