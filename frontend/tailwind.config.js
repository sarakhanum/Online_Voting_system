/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 35px 120px rgba(99, 102, 241, 0.18)',
      },
    },
  },
  plugins: [],
};
