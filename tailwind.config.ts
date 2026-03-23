import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        voca: {
          bg:       { DEFAULT: '#0D0D14', card: '#16162A', section: '#1E1E3A', elevated: '#222244' },
          accent:   { cyan: '#00E5FF', magenta: '#E040FB', purple: '#7C4DFF' },
          text:     { DEFAULT: '#F0F0F8', sub: '#8888AA', muted: '#7C7C9C' }, // WCAG AA (#555570 -> #7C7C9C)
          border:   { subtle: '#2A2A4A' },
          tone:     { pink: '#FF6B9D', blue: '#4FC3F7' },
          semantic: { success: '#69F0AE', warning: '#FFD740', error: '#FF5252' },
        }
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #00E5FF 0%, #7C4DFF 50%, #E040FB 100%)',
        'gradient-card': 'linear-gradient(90deg, #00E5FF, #E040FB)',
      },
      boxShadow: {
        'glow-cyan':    '0 0 12px rgba(0,229,255,0.15)',
        'glow-magenta': '0 0 12px rgba(224,64,251,0.15)',
        'glow-blue':    '0 0 6px rgba(79,195,247,0.4)',
      },
      fontFamily: {
        chord: ["var(--font-chord)", 'monospace'],
      }
    },
  },
  plugins: [],
}
export default config
