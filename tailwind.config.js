module.exports = {
  purge: ["./page/*.pug"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        brand: {
          Pippin: "#FFE3E3",
          Lola: "#E4D8DC",
          Ghost: "#C9CCD5",
          Nepal: "#93B5C6",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
