module.exports = {
  purge: ["./page/*.pug"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#3fbaeb",
          DEFAULT: "#0fa9e6",
          dark: "#0c87b8",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
