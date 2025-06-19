/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans these files for Tailwind classes
  ],
  theme: {
    extend: {
      colors: {
        // Your Defined Palette
        'brand-silver-lake-blue': '#6290C3',
        'brand-citrine': '#F3DE2C',
        'brand-space-cadet': '#1A1B41', // Used as primary dark background/text
        'brand-avocado': '#5C8001',    // Used as primary accent
        'brand-avocado-dark': '#4A6801',
        'brand-xanthous': '#FBB02D', // Used as secondary accent/stars
        // Added neutrals based on dark theme need
        'brand-white': '#FFFFFF',
        'brand-offwhite': '#F8F8F8',
        'brand-light-gray': '#E0E0E0',
        'brand-medium-gray': '#A0A0A0', // Lighter gray for secondary text on dark bg
        'brand-dark-gray': '#333333',  // For subtle elements on dark bg
        'brand-text-light': '#EAEAEA', // Primary light text
        'brand-text-muted': '#B0B0B0', // Muted light text
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Roboto Slab', ...defaultTheme.fontFamily.serif], // Example serif for headings
      },
      backgroundImage: {
        // Define background images placeholders
        'hero-pattern': "url('/images/LandingPageBackGround.JPG')", // Replace with actual paths
        'inspiration-pattern': "url('/images/TagpoponganLocationCard.jpg')",
      },
      keyframes: { // Add keyframes directly here
        'zoom-pan': {
          '0%': { backgroundSize: '110%', backgroundPosition: '50% 50%' },
          '100%': { backgroundSize: '100%', backgroundPosition: '55% 50%' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: { // Define animations using keyframes
        'zoom-pan': 'zoom-pan 20s ease-in-out infinite alternate',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards', // 'forwards' keeps the final state
      },
    },
  },
  
  plugins: [],
}