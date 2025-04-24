/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'my-custom-font': ['inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

