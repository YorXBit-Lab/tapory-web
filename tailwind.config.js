/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },

      fontSize: {
        xs:   ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',   { lineHeight: '1rem' }],
        sm:   ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',      { lineHeight: '1.25rem' }],
        base: ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',        { lineHeight: '1.5rem' }],
        lg:   ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',     { lineHeight: '1.75rem' }],
        xl:   ['clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',      { lineHeight: '1.75rem' }],
        '2xl':['clamp(1.5rem, 1.3rem + 1vw, 2rem)',            { lineHeight: '2rem' }],
        '3xl':['clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',    { lineHeight: '2.25rem' }],
        '4xl':['clamp(2.25rem, 1.75rem + 2.5vw, 3rem)',        { lineHeight: '2.5rem' }],
        '5xl':['clamp(3rem, 2rem + 5vw, 4rem)',                { lineHeight: '1' }],
      },

      zIndex: {
        dropdown: '1000',
        sticky:   '1020',
        modal:    '1050',
        tooltip:  '1070',
      },
    },
  },
  plugins: [],
};

export default config;
