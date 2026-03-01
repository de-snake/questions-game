import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        blush: '#FFE4E1',
        lavender: '#E6E6FA',
        sage: '#C8D5BB',
        peach: '#FFDAB9',
        muted: '#8B8B8B',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
