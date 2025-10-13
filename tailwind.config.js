// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#305CDE", // custom blue
        primaryBlack: "#222222", // custom purple
      },
    },
  },
  plugins: [],
};
