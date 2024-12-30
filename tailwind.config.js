/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
        'blob-spin': "blob-spin 7s infinite",  // Added a spinning variant
        'blob-reverse': "blob 7s infinite reverse",  // Added a reverse variant
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(50px, -50px) scale(1.2)", // Increased movement and scale
          },
          "66%": {
            transform: "translate(-30px, 30px) scale(0.8)", // Increased movement and scale variation
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        'blob-spin': {  // Added new spinning blob animation
          "0%": {
            transform: "translate(0px, 0px) scale(1) rotate(0deg)",
          },
          "33%": {
            transform: "translate(50px, -50px) scale(1.2) rotate(120deg)",
          },
          "66%": {
            transform: "translate(-30px, 30px) scale(0.8) rotate(240deg)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1) rotate(360deg)",
          },
        },
      },
    },
  },
  plugins: [],
};