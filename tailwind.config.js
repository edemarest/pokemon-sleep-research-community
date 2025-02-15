module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#E6D7C3", // Soft pastel brown (Notebook background)
        card: "#FDFBF6", // Creamy white (Notebook pages)
        accentGreen: "#A3D9A5", // Soft pastel green
        accentBlue: "#8EC5FC", // Soft pastel blue
        accentYellow: "#F8D49D", // Warm Pokémon yellow
        textDark: "#5D4037", // Dark brown for text (Readable, Ink-like)
        pastelPink: "#d48ac2",
      },
      fontFamily: {
        title: ["Fredoka One", "Baloo Paaji 2", "sans-serif"], // Playful & Pokémon-like
        body: ["Quicksand", "Nunito", "Kalam", "sans-serif"], // Notebook casual style
      },
    },
  },
  plugins: [],
};
